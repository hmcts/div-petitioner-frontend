const Step = require('app/core/steps/Step');
const config = require('config');
const buildnoml = require('app/steps/sitemap/buildnoml');
const siteGraph = require('app/core/helpers/siteGraph');

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

    return Object.assign(
      {},
      ctx,
      { graphData },
      { graph },
    );
  }

  getRequest(req, res) {
    if (config.showSitemap) {
      return super
        .getRequest(req, res);
    }

    return res.redirect(this.steps.Error404.url);
  }
};
