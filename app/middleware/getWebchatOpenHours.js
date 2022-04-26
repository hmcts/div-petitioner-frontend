const https = require('https');
const parseBool = require('app/core/utils/parseBool');
const CONF = require('config');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

// Convert string to title case
const toTitleCase = str => {
  // eslint-disable-next-line arrow-body-style
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
};

// Convert time to 12hr, short format
const to12Hr = str => {
  return new Date(`1970-01-01T${str}`).toLocaleTimeString([], { hour: 'numeric', hour12: 'true' });
};

// Default message
const antennaWebchatHours = '<p>Web chat is currently closed. Please try again later.  Alternatively, contact us using one of the ways below.</p>';

// Validate cell values
const validateCellValues = (cells, rowNum) => {
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const day = toTitleCase(cells.dayOfWeek);
  const from = to12Hr(cells.from);
  const until = to12Hr(cells.until);
  const validation = [
    validDays.includes(day.toLowerCase()),
    from !== 'Invalid Date',
    until !== 'Invalid Date'
  ];
  if (validation.includes(false)) {
    let errorMessage = `

              ==========================================================================================
                getWebchatOpenHours: Invalid Data within JSON Response
                ------------------------------------------------------`;

    if (validation[0] === false) {
      errorMessage += `
                Expected Day Format: Full Day Name. ie, MONDAY, TUESDAY, SATURDAY.  Case Insensitive.
                Got Day On Row[${rowNum}] As: ${cells.dayOfWeek}`;
    }
    if (validation[1] === false) {
      errorMessage += `
                Expected 24hr Time Format: HH:MM:SS
                Got From Time On Row[${rowNum}] As: ${cells.from}`;
    }
    if (validation[2] === false) {
      errorMessage += `
                Expected 24hr Time Format: HH:MM:SS
                Got Until Time On Row[${rowNum}] As: ${cells.until}`;
    }
    errorMessage += `
              ==========================================================================================
              `;
    logger.info(errorMessage);
    return false;
  }
  return { day, from, until };
};

// Parse JSON response from webchat openinghours call into html table
const parseOpenHoursToHtml = (open, htmlStr, idx = 0) => {
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
  const hCells = {
    day: `${head.start}Day${head.end}`,
    from: `${head.start}From${head.end}`,
    until: `${head.start}Until${head.end}`
  };
  hCells.fullRow = `${row.start}${hCells.day}${hCells.from}${hCells.until}${row.end}`;
  const table = {
    start: `<table><caption style="display: none">Divorce Web Chat Opening Hours</caption>${hCells.fullRow}`,
    end: '</table>'
  };
  let html = htmlStr;
  let i = idx;
  if (i === 0) {
    html = table.start;
  }
  const cellVals = validateCellValues(open[i], i);
  if (!cellVals) {
    return false;
  }
  const day = cell.start + cellVals.day + cell.end;
  const from = cell.start + cellVals.from + cell.end;
  const until = cell.start + cellVals.until + cell.end;
  const newRow = row.start + day + from + until + row.end;
  html += newRow;
  if (i < open.length - 1) {
    i += 1;
    return parseOpenHoursToHtml(open, html, i);
  }
  html += table.end;
  return html;
};

// Validate returned json data
const validateJSONData = responseData => {
  let parsedData = '';
  try {
    parsedData = JSON.parse(responseData).daysOfWeekOpen;
  } catch (error) {
    logger.info(`

              ==========================================================================================
                getWebchatOpenHours: Error JSON Parsing responseData
                ------------------------------------------------------
                ${error}
              ==========================================================================================
              `);
    return false;
  }

  const schema = {
    type: 'array',
    maxItems: 7,
    items: {
      type: 'object',
      properties: {
        dayOfWeek: { type: 'string' },
        from: { type: 'string' },
        until: { type: 'string' }
      },
      required: ['dayOfWeek', 'from', 'until'],
      additionalProperties: false
    }
  };
  const validate = ajv.compile(schema);

  const valid = validate(parsedData);

  if (!valid) {
    logger.info(`

              ==========================================================================================
                getWebchatOpenHours: AJV JSON Validation Error
                ------------------------------------------------------
                ${ajv.errorsText(validate.errors)}
              ==========================================================================================
              `);
    return false;
  }

  logger.info(`

              ==========================================================================================
                getWebchatOpenHours: Parsed JSON Data Format is Valid
                ------------------------------------------------------
                ${JSON.stringify(parsedData)}
              ==========================================================================================
              `);
  return parsedData;
};

// Prefix html table with message text
const formatOpenHoursMessage = responseData => {
  const prefix = '<p>Web chat is now closed. Please come back during the following hours:</p>';
  const suffix = '<p>Alternatively, contact us using one of the ways below.</p>';
  let htmlStr = antennaWebchatHours;

  const parsedData = validateJSONData(responseData);
  if (parsedData) {
    const table = parseOpenHoursToHtml(parsedData);
    if (table) {
      htmlStr = prefix + table + suffix;
    }
  }

  return htmlStr;
};

// Get webchat opening hours for div
const getOpeningHours = (req, res, next) => {
  // Skip if feature toggle is false
  logger.info(`antenaWebchatAvailabilityToggle: ${CONF.features.antennaWebchatAvailabilityToggle}`);
  if (!parseBool(CONF.features.antennaWebchatAvailabilityToggle)) {
    logger.info(`

              ==========================================================================================
                SKIPPING WEBCHAT AVAILABILITY HOURS MIDDLEWARE
              ==========================================================================================
              `);
    return next();
  }

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
      res.locals.antennaWebchat_hours = formatOpenHoursMessage(d);
      logger.info(`

              ==========================================================================================
                getWebchatOpenHours: Got webchat opening hours
                -------------------------
                ${res.locals.antennaWebchat_hours}
              ==========================================================================================
      `);
      return next();
    });
  });

  // If unable to get webchat openinghours, log error and return alternative message.
  getWebchatHours.on('error', er => {
    res.locals.antennaWebchat_hours = antennaWebchatHours;
    logger.info(`

              ==========================================================================================
                getWebchatOpenHours: Error getting webchat opening hours:
                ------------------------------------
                ${er}
                ------------------------------------
                ${res.locals.antennaWebchat_hours}
              ==========================================================================================
    `);
    return next();
  });
  getWebchatHours.end();
  https.globalAgent.options.rejectUnauthorized = true;
};

module.exports = { getOpeningHours };
