const { curry } = require('lodash');
const co = require('co');

const statusCode = require('app/core/utils/statusCode');

module.exports = steps => {
  return curry((req, res) => {
    res.status(statusCode.NOT_FOUND);

    const step = steps.Error404;
    return co(function* generator() {
      const content = yield step.generateContent();
      res.render(step.template, { content });
    });
  });
};
