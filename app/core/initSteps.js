const { curry, forEach } = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const steps = {};

module.exports = (app, stepDefinitions) => {
  // attach steps to locals
  app.use((req, res, next) => {
    res.locals.steps = steps;
    next();
  });

  const initStep = curry((modulePathParam, def, k) => {
    const modulePath = modulePathParam ? `${modulePathParam}/${k}` : k;

    if (typeof def.index === 'function') {
      let section = modulePath.split('/');
      section.pop();
      section = section.join('.');

      try {
        const s = new def.index(
          steps, section, modulePath, def.content, def.schema
        );
        app.use(s.router);
        steps[s.name] = s;
      } catch (error) {
        logger.errorWithReq(null, 'init_step_error', 'Failed to initialise step', error.message, section, modulePath);
        throw error;
      }
    } else {
      forEach(def, initStep(modulePath));
    }
  });

  forEach(stepDefinitions, initStep(null));

  return steps;
};
