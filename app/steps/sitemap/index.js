const Step = require('app/core/steps/Step');
const CONF = require('config');
const buildnoml = require('app/steps/sitemap/buildnoml');
const siteGraph = require('app/core/helpers/siteGraph');

const PORT = process.env.PORT || process.env.HTTP_PORT || CONF.http.port;

module.exports = class Graph extends Step {
  get url() {
    return '/sitemap';
  }

  get nextStep() {
    return null;
  }

  interceptor(ctx) {
    const graphData = JSON.stringify(siteGraph(this.steps));
    const graph = JSON.stringify(buildnoml(JSON.parse(graphData)));

    return {
      ...ctx,
      graphData,
      graph,
    };
  }
};
