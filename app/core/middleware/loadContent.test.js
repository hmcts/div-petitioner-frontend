const { expect } = require('test/util/chai');
const loadContent = require('app/core/middleware/loadContent');
const commonContent = require('app/middleware/commonContent');

const test = (step, block) => {
  const req = {};
  const res = { locals: {} };
  const next = () => {
    block(req, res);
  };
  commonContent(req, res, () => {
    loadContent.bind(step)(req, res, next);
  });
};

const contentBlock = content => {
  return { resources: { en: { translation: { content } } } };
};

describe('loadContent middleware', () => {
  it('loads content from the step in to i18n', done => {
    const step = { content: contentBlock({ foo: 'foo is Foo' }) };
    test(step, req => {
      expect(req.i18n.t('foo')).to.eq('foo is Foo');
      done();
    });
  });
  it('does not error when no content is provided', done => {
    const step = {};
    test(step, req => {
      expect(req.i18n.t('bar')).to.eq('bar');
      done();
    });
  });
});
