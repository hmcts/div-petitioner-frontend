const modulePath = 'app/services/documentHandler.js';

const { expect, sinon } = require('test/util/chai');
const underTest = require(modulePath);

describe(modulePath, () => {
  it('returns `initDocumentHandlerFor` function so it can be added to the app`s routes', () => {
    expect(underTest.hasOwnProperty('initDocumentHandlerFor'));
  });
  it('adds route to app', () => {
    const app = { use: sinon.stub() };
    underTest.initDocumentHandlerFor(app);
    expect(app.use.calledOnce).to.eql(true);
  });
});
