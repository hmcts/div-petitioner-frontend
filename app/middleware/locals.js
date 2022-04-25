const CONF = require('config');
const packageJson = require('package.json');
const manifest = require('manifest.json');
const https = require('https');

const assetPath = `/public/${manifest.STATIC_ASSET_PATH}/`;

const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

let openHours = '';
// Get webchat opening hours for div
const getOpeningHours = () => {
  // Convert string to title case
  const toTitleCase = str => {
    // eslint-disable-next-line arrow-body-style
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
  };
  // Convert time to 12hr, short format
  const to12Hr = str => {
    return new Date(`1970-01-01T${str}`).toLocaleTimeString([], { hour: 'numeric', hour12: 'true' });
  };
  // Parse JSON response from webchat openinghours call into html table
  const parseOpenHoursToText = (open, htmlStr, idx = 0) => {
    const cell = {
      start: '<td style="padding-right: 25px;">',
      end: '</td>'
    };
    const row = {
      start: '<tr>',
      end: '</tr>'
    };
    const head = {
      start: '<th style="text-align: left; padding-right: 25px">',
      end: '</th>'
    };
    const headers = {
      day: `${head.start}Day${head.end}`,
      from: `${head.start}From${head.end}`,
      until: `${head.start}Until${head.end}`
    };
    const table = {
      start: `<table>${row.start}${headers.day}${headers.from}${headers.until}${row.end}`,
      end: '</table>'
    };
    let html = htmlStr;
    let i = idx;
    if (i === 0) {
      html = table.start;
    }
    const day = cell.start + toTitleCase(open[i].dayOfWeek) + cell.end;
    const from = cell.start + to12Hr(open[i].from) + cell.end;
    const until = cell.start + to12Hr(open[i].until) + cell.end;
    const newRow = row.start + day + from + until + row.end;
    html += newRow;
    if (i < open.length - 1) {
      i += 1;
      return parseOpenHoursToText(open, html, i);
    }
    html += table.end;
    return html;
  };
  // rejectUnauthorized required for this request only.
  // WebChat server has an incomplete cert chain.
  https.globalAgent.options.rejectUnauthorized = false;
  // Set options for https.request
  const hoursOptions = {
    hostname: 'webchat.ctsc.hmcts.net',
    path: '/openinghours/v1/callcentreservice/Divorce',
    method: 'GET'
  };
  // Get opening hours for webchat for div, parse into html table and pass to templates via nunjucks
  const getWebchatHours = https.request(hoursOptions, response => {
    response.on('data', d => {
      openHours = `<p>Web chat is now closed. Please come back during the following hours:</p>${parseOpenHoursToText(JSON.parse(d).daysOfWeekOpen)}<p>Alternatively, contact us using one of the ways below.</p>`;
      logger.info(`

              ==========================================================================================
                Got webchat opening hours
                -------------------------
                ${openHours}
              ==========================================================================================
      `);
    });
  });
  // If unable to get webchat openinghours, log error and return alternative message.
  getWebchatHours.on('error', er => {
    openHours = '<p>Web chat is currently closed. Please try again later.  Alternatively, contact us using one of the ways below.</p>';
    logger.info(`

              ==========================================================================================
                Error getting webchat opening hours:
                ------------------------------------
                ${er}
                ------------------------------------
                ${openHours}
              ==========================================================================================
    `);
  });
  getWebchatHours.end();
  https.globalAgent.options.rejectUnauthorized = true;
};
getOpeningHours();

module.exports = (req, res, next) => {
  res.locals.asset_path = assetPath;
  res.locals.session = req.session;
  res.locals.serviceName = CONF.serviceName;
  res.locals.googleAnalyticsId = CONF.google_analytics.propertyId;
  res.locals.cookieText = CONF.cookieText;
  res.locals.releaseVersion = `v${packageJson.version}`;
  res.locals.antennaWebchat_hours = openHours;

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
