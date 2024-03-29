const logging = require('@hmcts/nodejs-logging');
const { get } = require('lodash');

const getIdamId = req => {
  const idamId = get(req, 'idam.userDetails.id', 'unknown');
  const caseId = get(req, 'session.caseId', 'unknown');
  return `IDAM ID: ${idamId}, CASE ID: ${caseId}`;
};

const logger = name => {
  const loggerInstance = logging.Logger.getLogger(name);

  return {
    infoWithReq: (req, tag, message, ...args) => {
      loggerInstance.info(getIdamId(req), tag, message, ...args);
    },
    warnWithReq: (req, tag, message, ...args) => {
      loggerInstance.warn(getIdamId(req), tag, message, ...args);
    },
    errorWithReq: (req, tag, message, ...args) => {
      loggerInstance.error(getIdamId(req), tag, message, ...args);
    },
    debugWithReq: (req, tag, message, ...args) => {
      loggerInstance.debug(getIdamId(req), tag, message, ...args);
    }
  };
};

const accessLogger = () => {
  return logging.Express.accessLogger({
    formatter: (req, res) => {
      const url = req.originalUrl || req.url;
      return `${getIdamId(req)} - "${req.method} ${url} HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}" ${res.statusCode}`;
    }
  });
};

module.exports = {
  logger,
  accessLogger
};
