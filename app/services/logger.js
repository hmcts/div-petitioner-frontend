const logging = require('@hmcts/nodejs-logging');
const idam = require('app/services/idam');

const idamUserIdFromReq = args => {
  let idamUserId = 'unknown';
  args.forEach(arg => {
    if (typeof arg === 'object' && arg.hasOwnProperty('idam')) {
      const uid = idam.userId(arg);
      if (uid) {
        idamUserId = uid;
      }
    }
  });
  return idamUserId;
};

const addUserIdToMessage = args => {
  const idamUserId = idamUserIdFromReq(args);
  const idamUserIdString = `IDAM UID:${idamUserId}`;

  if (typeof args[0] === 'object' && args[0].hasOwnProperty('message')) {
    args[0].message = `${idamUserIdString} - ${args[0].message}`;
  } else {
    args[0] = `${idamUserIdString} - ${args[0]}`;
  }

  // remove the request object
  const argsWithoutReqObject = args.filter(arg => {
    return arg && !arg.hasOwnProperty('method');
  });

  return argsWithoutReqObject;
};

const logger = name => {
  const loggerInstance = logging.Logger.getLogger(name);

  return {
    log: (...args) => {
      const newArgs = addUserIdToMessage(args);
      loggerInstance.log(...newArgs);
    },
    info: (...args) => {
      const newArgs = addUserIdToMessage(args);
      loggerInstance.info(...newArgs);
    },
    warn: (...args) => {
      const newArgs = addUserIdToMessage(args);
      loggerInstance.warn(...newArgs);
    },
    error: (...args) => {
      const newArgs = addUserIdToMessage(args);
      loggerInstance.error(...newArgs);
    }
  };
};

const accessLogger = () => {
  return logging.Express.accessLogger({
    formatter: (req, res) => {
      const url = req.originalUrl || req.url;
      const message = `"${req.method} ${url} HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}" ${res.statusCode}`;
      const args = addUserIdToMessage([message, req]);
      return args[0];
    }
  });
};

module.exports = {
  logger,
  accessLogger,
  idamUserIdFromReq,
  addUserIdToMessage
};
