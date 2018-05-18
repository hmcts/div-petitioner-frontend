const superagent = require('superagent');
const Step = require('app/core/steps/Step');
const CONF = require('config');
const buildnoml = require('app/steps/sitemap/buildnoml');

const PORT = CONF.http.port || CONF.http.porttactical;

const url = `https://localhost:${PORT}/graph`;

module.exports = class Graph extends Step {
  get url() {
    return '/sitemap';
  }
  get nextStep() {
    return null;
  }

  interceptor(ctx) {
    const { text } = superagent.get(url);

    ctx.graphData = text;
    ctx.graph = JSON.stringify(buildnoml(JSON.parse(text)));

    return ctx;
  }
};
