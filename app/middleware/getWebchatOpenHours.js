const https = require('https');
const parseBool = require('app/core/utils/parseBool');
const CONF = require('config');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

const config = CONF.webchatAvailability;
// Set options for https.request
const webchatAvailabilityHostName = config.url.hostName;
const webchatAvailabilityPath = `${config.url.path_1}${config.url.version}${config.url.path_2}`;

// Property of response Obj containing relevant JSON data
const webchatAvailabilityResponseProperty = config.format.responseProperty;

// Schema for AJV validation of JSON data
const webchatAvailabilityJSONSchema = config.format.jsonSchema;

// Validate day name values against this array
// Ensure all entries in the array are lowercase
const validDayNames = config.format.validDayNames;

// Default availability <p> text
// Returned when unable to obtain availability data from API call
const webchatAvailabilityDefaultMessage = config.messages.defaultMessage;

// availability prefix/suffix text (availability data is rendered as a table sandwiched between these <p>'s
const webchatAvailabilityPrefixMessage = config.messages.prefixMessage;
// Table rendered here -->
const webchatAvailabilitySuffixMessage = config.messages.suffixMessage;

// Convert day name string to title case
// returns 'Invalid Day' on error
const dayToTitleCase = day => {
  if (validDayNames.includes(day.toLowerCase())) {
    // eslint-disable-next-line arrow-body-style
    return day.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
  }
  return 'Invalid Day';
};

// Convert time to 12hr, short format
// returns 'Invalid Time' on error
const timeTo12Hr = time => {
  let convertedTime = new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', hour12: 'true' });
  convertedTime = convertedTime === 'Invalid Date' ? 'Invalid Time' : convertedTime;
  return convertedTime;
};

// Validate returned json data format
// returns false on error
const validateJSONData = responseData => {
  let parsedData = '';
  try {
    parsedData = JSON.parse(responseData)[webchatAvailabilityResponseProperty];
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

  const validate = ajv.compile(webchatAvailabilityJSONSchema);

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

  const validateNoEmptyValues = (idx = 0) => {
    let i = idx;
    if (parsedData[i].dayOfWeek.length < 1) {
      return false;
    }
    if (parsedData[i].from.length < 1) {
      return false;
    }
    if (parsedData[i].until.length < 1) {
      return false;
    }
    if (i < parsedData.length - 1) {
      i += 1;
      return validateNoEmptyValues(i);
    }
    return true;
  };

  const noEmptyValues = validateNoEmptyValues();

  if (!noEmptyValues) {
    logger.info(`

              ==========================================================================================
                getWebchatOpenHours: Error Parsing JSON Values
                ------------------------------------------------------
                One or more fields contain empty values
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

// Validate cell values
// returns false on error
const validateCellValues = (cells, rowNum) => {
  const day = dayToTitleCase(cells.dayOfWeek);
  const from = timeTo12Hr(cells.from);
  const until = timeTo12Hr(cells.until);
  const validation = [
    day !== 'Invalid Day',
    from !== 'Invalid Time',
    until !== 'Invalid Time'
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

// Parse string to HTML paragraph elem
const parseMessageToParagraph = paraStr => {
  const p = {
    start: '<p>',
    end: '</p>'
  };
  return `${p.start}${paraStr}${p.end}`;
};

// Parse JSON response from webchat openinghours call into html table
// returns false on error
const parseOpenHoursToTable = (openHrsData, htmlStr, idx = 0) => {
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
  const cellVals = validateCellValues(openHrsData[i], i);
  if (!cellVals) {
    return false;
  }
  const day = cell.start + cellVals.day + cell.end;
  const from = cell.start + cellVals.from + cell.end;
  const until = cell.start + cellVals.until + cell.end;
  const newRow = row.start + day + from + until + row.end;
  html += newRow;
  if (i < openHrsData.length - 1) {
    i += 1;
    return parseOpenHoursToTable(openHrsData, html, i);
  }
  html += table.end;
  return html;
};

// Return prefix <p> + <table> + suffix <p>
// returns default message <p> on error
const formatOpenHoursMessage = responseData => {
  const prefix = parseMessageToParagraph(webchatAvailabilityPrefixMessage);
  const suffix = parseMessageToParagraph(webchatAvailabilitySuffixMessage);
  let htmlStr = parseMessageToParagraph(webchatAvailabilityDefaultMessage);
  let table = '';

  const parsedData = validateJSONData(responseData);
  if (parsedData) {
    table = parseOpenHoursToTable(parsedData);
    if (table) {
      htmlStr = prefix + table + suffix;
    }
  }

  return htmlStr;
};

// Get webchat opening hours for div via https.request
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

  // Options for https.request
  const requestOptions = {
    hostname: webchatAvailabilityHostName,
    path: webchatAvailabilityPath,
    method: 'GET'
  };

  // Get opening hours for webchat for div, parse into html table and pass to templates via nunjucks
  const getWebchatHours = https.request(requestOptions, response => {
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
  getWebchatHours.end();
  https.globalAgent.options.rejectUnauthorized = true;

  // If unable to get webchat openinghours, log error and return alternative message.
  getWebchatHours.on('error', er => {
    res.locals.antennaWebchat_hours = parseMessageToParagraph(webchatAvailabilityDefaultMessage);
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
};

module.exports = {
  dayToTitleCase,
  timeTo12Hr,
  validateJSONData,
  validateCellValues,
  parseMessageToParagraph,
  parseOpenHoursToTable,
  formatOpenHoursMessage,
  getOpeningHours
};
