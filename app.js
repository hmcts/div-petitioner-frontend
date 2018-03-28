require('dotenv').config();
const CONF = require('config');
const path = require('path');
const https = require('https');
const fs = require('fs');
const express = require('express');
const nunjucks = require('express-nunjucks');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const requireDir = require('require-directory');
const cookieParser = require('cookie-parser');
const sessions = require('app/middleware/sessions');
const rateLimiter = require('app/services/rateLimiter');
const initSteps = require('app/core/initSteps');
const siteGraph = require('app/core/siteGraph');
const errorHandler = require('app/core/errorHandler');
const manifest = require('manifest.json');
const helmet = require('helmet');
const csurf = require('csurf');
const { fetchToggles } = require('@hmcts/div-feature-toggle-client')({
  env: process.env.NODE_ENV,
  featureToggleApiUrl: process.env.FEATURE_TOGGLE_API_URL || CONF.services.featureToggleApiUrl
});
const i18nTemplate = require('app/core/utils/i18nTemplate')({
  viewDirectory: './app/views/',
  fileExtension: 'html'
});
const statusCode = require('app/core/utils/statusCode');
const logging = require('@hmcts/nodejs-logging');
const events = require('events');

// Prevent node warnings re: MaxListenersExceededWarning
events.EventEmitter.defaultMaxListeners = Infinity;

const stepDefinitions = requireDir(module, `${__dirname}/app/steps`, { exclude: /\.test\.|client.js|_sections/ });
const middleware = requireDir(module, `${__dirname}/app/middleware`, { exclude: /\.test\./ });
const healthcheck = require('app/services/healthcheck');
const featureToggleList = require('app/services/featureToggleList');
const nunjucksFilters = require('app/filters/nunjucks');

const PORT = process.env.HTTP_PORT || CONF.http.port;

const logger = logging.getLogger(__filename);

exports.init = () => {
  const app = express();

  app.use(helmet());

  logging.config({
    microservice: CONF.appName,
    team: CONF.project,
    environment: CONF.environment
  });
  app.use(logging.express.accessLogger());

  // content security policy to allow only assets from same domain
  app.use(helmet.contentSecurityPolicy({
    directives: {
      fontSrc: ['\'self\' data:'],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'www.google-analytics.com', 'hmctspiwik.useconnect.co.uk'],
      connectSrc: ['\'self\''],
      mediaSrc: ['\'self\''],
      frameSrc: ['\'none\''],
      imgSrc: ['\'self\'', 'www.google-analytics.com', 'hmctspiwik.useconnect.co.uk']
    }
  }));
  // http public key pinning
  app.use(helmet.hpkp({
    maxAge: CONF.ssl.hpkp.maxAge,
    sha256s: CONF.ssl.hpkp.sha256s.split(',')
  }));

  // Referrer policy for helmet
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

  //  Elements refers to icon folder instead of images folder
  //  moved here to make it at start of middleware as recommended in docs
  app.use(favicon(path.join(__dirname, 'public', manifest.STATIC_ASSET_PATH, 'images', 'favicon.ico')));

  // Application settings
  app.set('view engine', 'html');
  app.set('views', [
    `${__dirname}/app/steps`,
    `${__dirname}/app/components`,
    `${__dirname}/app/views`,
    `${__dirname}/node_modules/govuk_template_jinja/views/layouts/`
  ]);


  const isDev = app.get('env') === 'development';

  nunjucks(app, {
    autoescape: true,
    watch: isDev,
    noCache: isDev,
    filters: nunjucksFilters
  });

  // Disallow search index idexing
  app.use((req, res, next) => {
    // Setting headers stops pages being indexed even if indexed pages link to them.
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
    next();
  });

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });

  // Middleware to serve static assets
  app.use('/public', express.static(`${__dirname}/public`));

  // Parsing cookies for the stored encrypted session key
  app.use(cookieParser());

  // Support for parsing data in POSTs
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.set('trust proxy', 1);
  app.use(sessions.prod());
  if (process.env.NODE_ENV === 'production') {
    app.use(rateLimiter(app));
  }

  app.use(middleware.locals);

  app.use(csurf(), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      logger.error('csrf error has occurred');
      logger.debug(error);
      res.redirect('/generic-error');
    } else {
      next();
    }
  });

  const feature = name => {
    const hasConfigFlag = typeof CONF.features[name] === 'undefined' ? 'other' : 'default config';
    const origin = process.env[name] ? 'process env' : hasConfigFlag;

    return {
      feature: name,
      defaultState: process.env[name] || CONF.features[name],
      origin
    };
  };
  app.use(fetchToggles({
    features: [
      feature('idam'),
      feature('fullPaymentEventDataSubmission')
    ]
  }));
  app.use(healthcheck);
  app.use(featureToggleList);

  app.use(middleware.commonContent);

  //  redirect root
  app.get('/', (req, res) => {
    res.redirect('/index');
  });

  //  register steps with the express app
  const steps = initSteps(app, stepDefinitions);

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing') {
    //  site graph
    app.get('/graph', (req, res) => {
      const graph = siteGraph(steps);
      res.json(graph);
    });

    //  quick way to update a session.
    //  useful to set the app into an
    //  initial state for testing
    app.post('/session', (req, res) => {
      Object.assign(req.session, req.body);

      res.sendStatus(statusCode.OK);
    });
    app.get('/session', (req, res) => {
      res.writeHead(statusCode.OK, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(req.session));
    });
  }

  app.get('/cookie', i18nTemplate('cookie', (view, req, res) => {
    res.render(view, {});
  }));

  app.get('/cookie-error', i18nTemplate('cookie-error', (view, req, res) => {
    res.render(view, {});
  }));

  if (process.env.NODE_ENV !== 'testing') {
    app.use(errorHandler(steps));
  }

  let http = {};
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing') {
    const sslDirectory = path.join(__dirname, 'app', 'resources', 'localhost-ssl');

    const sslOptions = {
      key: fs.readFileSync(path.join(sslDirectory, 'localhost.key')),
      cert: fs.readFileSync(path.join(sslDirectory, 'localhost.crt'))
    };

    const server = https.createServer(sslOptions, app);

    http = server.listen(PORT);
  } else {
    http = app.listen(PORT);
  }

  process.emit('application-log', {
    level: 'INFO',
    message: 'divorce-application-started',
    fields: { host: `https://localhost:${PORT}` }
  });

  return { app, http, steps };
};
