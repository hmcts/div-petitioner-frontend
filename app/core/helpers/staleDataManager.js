let watches = {};

const _watches = () => {
  return watches;
};

const _reset = () => {
  watches = {};
  return watches;
};

const watch = (fields = [], watchCallback) => {
  const watchedFields = Array.isArray(fields) ? fields : [fields];

  watchedFields.forEach(field => {
    if (!watches[field]) {
      watches[field] = [];
    }

    watches[field].push(watchCallback);
  });
};

const executeCallbacksForWatchedFields = (
  fields = [], previousSession, session
) => {
  const remove = (...fieldsToRemove) => {
    fieldsToRemove.forEach(field => {
      if (typeof session[field] === 'undefined') {
        return;
      }

      delete session[field];

      executeCallbacksForWatchedFields([field], previousSession, session);
    });
  };

  const variableHasChanged = (prevVariable, newVariable) => {
    if (typeof prevVariable === 'string' && typeof newVariable === 'string') {
      return prevVariable !== newVariable;
    }
    // if variables are not strings then turn them into strings to compare
    return JSON.stringify(prevVariable) !== JSON.stringify(newVariable);
  };

  fields.forEach(field => {
    // ensure the field we are watching has changed
    if (watches[field] && variableHasChanged(session[field], previousSession[field])) {
      watches[field].forEach(watchCallback => {
        return watchCallback(previousSession, session, remove);
      });
    }
  });

  return session;
};

const removeStaleData = (previousSession = {}, session = {}) => {
  // create array of unique keys from both sessions
  const sessionKeys = Object.keys(previousSession).concat(Object.keys(session));

  // remove duplicate session keys
  const unqiueSessionKeys = [ ...new Set(sessionKeys) ];

  // compare previous and current session to find which fields have changed
  const fieldsThatHaveChanged = unqiueSessionKeys.filter(key => {
    const isFieldUndefined = typeof session[key] === 'undefined';
    return isFieldUndefined || session[key] !== previousSession[key];
  });

  return executeCallbacksForWatchedFields(
    fieldsThatHaveChanged,
    previousSession,
    session
  );
};

module.exports = {
  _watches,
  _reset,
  watch,
  removeStaleData
};