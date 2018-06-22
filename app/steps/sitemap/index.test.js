const supertest = require('supertest');
const config = require('config');
const server = require('app');
const statusCode = require('app/core/utils/statusCode');

describe(__filename, () => {
  it('renders sitemap when config.showSitemap is true', async () => {
    const { app } = server.init();
    const showSitemap = config.showSitemap;

    config.showSitemap = true;

    await supertest(app)
      .get('/sitemap')
      .expect(statusCode.OK);

    config.showSitemap = showSitemap;
  });

  it('redirects to 404 when config.showSitemap is false', async () => {
    const { app } = server.init();
    const showSitemap = config.showSitemap;
    config.showSitemap = false;

    await supertest(app)
      .get('/sitemap')
      .expect(statusCode.FOUND)
      .expect('Location', '/errors/404');

    config.showSitemap = showSitemap;
  });
});
