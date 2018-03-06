const CONF = require('config');
const packageJson = require('package.json');
const manifest = require('manifest.json');

const assetPath = `/public/${manifest.STATIC_ASSET_PATH}/`;

module.exports = (req, res, next) => {
  res.locals.asset_path = assetPath;
  res.locals.session = req.session;
  res.locals.serviceName = CONF.serviceName;
  res.locals.googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;
  res.locals.cookieText = CONF.cookieText;
  res.locals.releaseVersion = `v${packageJson.version}`;

  //  update this to reflect new data structure
  //  even though locals is an appalling way of doing things
  res.locals.husbandOrWife = function husbandOrWife() {
    if (req.session.divorceWho !== 'wife' && req.session.divorceWho !== 'husband') {
      return 'husband/wife';
    }

    return req.session.divorceWho;
  };
  next();
};
