require('dotenv').config();
const CONF = require('config');
const path = require('path');
const https = require('https');
const fs = require('fs');
const express = require('express');
const nunjucks = require('nunjucks');
const expressNunjucks = require('express-nunjucks');
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
const hpkp = require('hpkp');
const csurf = require('csurf');
const i18nTemplate = require('app/core/utils/i18nTemplate')({
  viewDirectory: './app/views/',
  fileExtension: 'html'
});
const httpStatus = require('http-status-codes');
const logging = require('app/services/logger');
const events = require('events');
const idam = require('app/services/idam');
const signOutRoute = require('app/routes/sign-out');
const parseBool = require('app/core/utils/parseBool');

// Prevent node warnings re: MaxListenersExceededWarning
events.EventEmitter.defaultMaxListeners = Infinity;

const stepDefinitions = requireDir(module, `${__dirname}/app/steps`, { exclude: /\.test\.|client.js|_sections/ });
const middleware = requireDir(module, `${__dirname}/app/middleware`, { exclude: /\.test\./ });
const healthcheck = require('app/services/healthcheck');
const nunjucksFilters = require('app/filters/nunjucks');

const PORT = CONF.http.port;

const logger = logging.logger(__filename);

exports.init = listenForConnections => {
  const app = express();

  app.use(helmet());

  app.use(logging.accessLogger());

  // content security policy to allow only assets from same domain
  app.use(helmet.contentSecurityPolicy({
    directives: {
      fontSrc: ['\'self\' data:'],
      scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'www.google-analytics.com',
        'hmctspiwik.useconnect.co.uk',
        'vcc-eu4.8x8.com',
        'vcc-eu4b.8x8.com'
      ],
      connectSrc: ['\'self\''],
      mediaSrc: ['\'self\''],
      frameSrc: [
        '\'none\'',
        'vcc-eu4.8x8.com',
        'vcc-eu4b.8x8.com'
      ],
      imgSrc: [
        '\'self\'',
        'www.google-analytics.com',
        'hmctspiwik.useconnect.co.uk',
        'vcc-eu4.8x8.com',
        'vcc-eu4b.8x8.com'
      ]
    }
  }));
  // http public key pinning
  app.use(hpkp({
    maxAge: CONF.ssl.hpkp.maxAge,
    sha256s: CONF.ssl.hpkp.sha256s.split(',')
  }));

  // Referrer policy for helmet
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

  //  Elements refers to icon folder instead of images folder
  //  moved here to make it at start of middleware as recommended in docs
  app.use(favicon(path.join(__dirname, 'public', manifest.STATIC_ASSET_PATH, 'images', 'favicon.ico')));

  app.use('/assets', express.static(path.join(__dirname, '/node_modules/govuk-frontend/assets')));

  // Application settings
  app.set('view engine', 'html');
  app.set('views', [
    `${__dirname}/app/steps`,
    `${__dirname}/app/components`,
    `${__dirname}/app/views`,
    `${__dirname}/node_modules/govuk-frontend`,
    `${__dirname}/node_modules/govuk-frontend/components`
  ]);


  const isDev = app.get('env') === 'development';

  expressNunjucks(app, {
    autoescape: true,
    watch: isDev,
    noCache: isDev,
    filters: nunjucksFilters,
    loader: nunjucks.FileSystemLoader,
    globals: {
      webchat: CONF.services.webchat,
      features: { webchat: parseBool(CONF.features.webchat) }
    }
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
  app.use('/webchat', express.static(`${__dirname}/node_modules/@hmcts/ctsc-web-chat/assets`));

  // Parsing cookies for the stored encrypted session key
  app.use(cookieParser());

  // Support for parsing data in POSTs
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Get user details from idam, sets req.idam.userDetails
  app.use(idam.userDetails());

  app.set('trust proxy', 1);
  app.use(sessions.prod());

  if (parseBool(CONF.rateLimiter.enabled)) {
    app.use(rateLimiter(app));
  }

  app.use(middleware.locals);

  app.use(csurf(), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      logger.errorWithReq(req, 'csrf_error', 'csrf error has occurred', error.message);
      res.redirect('/generic-error');
    } else {
      next();
    }
  });

  healthcheck.setup(app);

  app.use(middleware.commonContent);

  //  redirect root
  app.get('/', (req, res) => {
    res.redirect('/index');
  });

  // sign out route
  signOutRoute(app);

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

      res.sendStatus(httpStatus.OK);
    });
    app.get('/session', (req, res) => {
      res.writeHead(httpStatus.OK, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(req.session));
    });
  }

  app.get('/cookie', i18nTemplate('cookie', (view, req, res) => {
    res.render(view, {});
  }));

  app.get('/cookie-error', i18nTemplate('cookie-error', (view, req, res) => {
    res.render(view, {});
  }));

  // 1px image used for tracking
  app.get('/noJS.png', (req, res) => {
    res.send('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
  });

  if (CONF.environment !== 'testing') {
    // redirect user if page not found
    app.use((req, res) => {
      logger.errorWithReq(req, 'not_found', 'User attempted to view a page that was not found', req.originalUrl);
      steps.Error404.handler(req, res);
    });
  }

  let http = {};
  if (listenForConnections) {
    if (CONF.environment === 'development' || CONF.environment === 'testing' || CONF.environment === 'aat') {
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
