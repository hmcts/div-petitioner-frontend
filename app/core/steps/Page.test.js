// const {expect} = require('test/util/chai');
const Page = require('app/core/steps/Page');
const { request, testApp } = require('test/util/supertest');

const statusCode = require('app/core/utils/statusCode');

describe('app/core/steps/Page', () => {
  it('renders the page on GET', done => {
    const page = new class extends Page {
      get url() {
        return '/my/page';
      }
      get template() {
        return 'page_views/simplePage';
      }
    }();
    const app = testApp();
    app.use(page.router);

    request(app)
      .get(page.url)
      .expect(statusCode.OK, '<h1>Hello, World!</h1>\n', done);
  });

  {
    const page = new class extends Page {
      get url() {
        return '/my/page';
      }
    }();
    const app = testApp();
    app.use(page.router);

    it('returns 405 (method not allowed) on POST', done => {
      request(app).post(page.url)
        .expect(statusCode.METHOD_NOT_ALLOWED, done);
    });
    it('returns 405 (method not allowed) on PUT', done => {
      request(app).put(page.url)
        .expect(statusCode.METHOD_NOT_ALLOWED, done);
    });
    it('returns 405 (method not allowed) on DELETE', done => {
      request(app).delete(page.url)
        .expect(statusCode.METHOD_NOT_ALLOWED, done);
    });
    it('returns 405 (method not allowed) on PATCH', done => {
      request(app).patch(page.url)
        .expect(statusCode.METHOD_NOT_ALLOWED, done);
    });
  }

  it('has access to the session', done => {
    const page = new class extends Page {
      get url() {
        return '/my/page';
      }
      get template() {
        return 'page_views/session';
      }
    }();
    const app = testApp({ foo: 'Foo', bar: 'Bar' });
    app.use(page.router);

    request(app)
      .get(page.url)
      .expect(statusCode.OK, 'Foo Bar\n', done);
  });
});
