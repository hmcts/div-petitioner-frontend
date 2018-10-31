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
const siteGraph = require('app/core/helpers/siteGraph');
const manifest = require('manifest.json');
const helmet = require('helmet');
const csurf = require('csurf');
const i18nTemplate = require('app/core/utils/i18nTemplate')({
  viewDirectory: './app/views/',
  fileExtension: 'html'
});
const statusCode = require('app/core/utils/statusCode');
const logging = require('app/services/logger');
const events = require('events');
const idam = require('app/services/idam');

// Prevent node warnings re: MaxListenersExceededWarning
events.EventEmitter.defaultMaxListeners = Infinity;

const stepDefinitions = requireDir(module, `${__dirname}/app/steps`, { exclude: /\.test\.|client.js|_sections/ });
const middleware = requireDir(module, `${__dirname}/app/middleware`, { exclude: /\.test\./ });
const healthcheck = require('app/services/healthcheck');
const nunjucksFilters = require('app/filters/nunjucks');

const PORT = CONF.http.port || CONF.http.porttactical;

const logger = logging.logger(__filename);

exports.init = listenForConnections => {
  const app = express();

  app.use(helmet());

  app.use(logging.accessLogger());

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

  // Get user details from idam, sets req.idam.userDetails
  app.use(idam.userDetails());

  app.set('trust proxy', 1);
  app.use(sessions.prod());

  if (CONF.rateLimiter.enabled) {
    app.use(rateLimiter(app));
  }

  app.use(middleware.locals);

  app.use(csurf(), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      logger.error('csrf error has occurred', req);
      logger.info(error);
      res.redirect('/generic-error');
    } else {
      next();
    }
  });

  app.use(healthcheck);

  app.use(middleware.commonContent);

  //  redirect root
  app.get('/', (req, res) => {
    res.redirect('/index');
  });

  //  register steps with the express app
  const steps = initSteps(app, stepDefinitions);

  if (CONF.deployment_env !== 'prod') {
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

  if (CONF.environment !== 'testing') {
    // redirect user if page not found
    app.use((req, res) => {
      logger.error(`User attempted to view a page that was not found: ${req.originalUrl}`);
      steps.Error404.handler(req, res);
    });
  }

  let http = {};
  if (listenForConnections) {
    if (CONF.environment === 'development' || CONF.environment === 'testing') {
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
  }

  process.emit('application-log', {
    level: 'INFO',
    message: 'divorce-application-started',
    fields: { host: `https://localhost:${PORT}` }
  });

  return { app, http, steps };
};
