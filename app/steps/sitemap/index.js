const superagent = require('superagent');
const Step = require('app/core/Step');
const CONF = require('config');
const buildnoml = require('app/steps/sitemap/buildnoml');
const runStepHandler = require('app/core/handler/runStepHandler');

const PORT = process.env.PORT || process.env.HTTP_PORT || CONF.http.port;

const url = `https://localhost:${PORT}/graph`;

module.exports = class Graph extends Step {
  get url() {
    return '/sitemap';
  }
  get nextStep() {
    return null;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  * interceptor(ctx) {
    const { text } = yield superagent.get(url);

    ctx.graphData = text;
    ctx.graph = JSON.stringify(buildnoml(JSON.parse(text)));

    return ctx;
  }
};
