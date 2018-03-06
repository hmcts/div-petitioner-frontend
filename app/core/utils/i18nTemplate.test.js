const fs = require('fs');
const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/core/utils/i18nTemplate';
const i18nTemplate = require(modulePath);

describe(modulePath, () => {
  const callbackStub = sinon.spy();
  let base = '';
  const options = { fileExtension: 'html' };
  let req = { headers: { 'accept-language': 'en' } };

  before(() => {
    sinon.stub(fs, 'readdirSync')
      .returns(['foobar.html', 'some-other.html', 'some-cy.html', 'some-en.html', 'some.html']);
  });

  afterEach(() => {
    fs.readdirSync.reset();
    callbackStub.reset();
  });

  after(() => {
    fs.readdirSync.restore();
  });

  it('returns a view with a preferred language if exists', () => {
    // Arrange
    req = { headers: { 'accept-language': 'en-GB;q=0.8,cy-GB;q=0.9' } };
    base = 'some';
    const middleware = i18nTemplate(options)(base, callbackStub);
    // Act.
    middleware(req);
    // Assert.
    expect(callbackStub.getCall(0).args[0]).to.equal(`${base}-cy`);
  });

  it('returns a view with the second preferred language if exists', () => {
    // Arrange
    req = { headers: { 'accept-language': 'en-GB;q=0.8,cy-GB;q=0.5' } };
    base = 'some';
    fs.readdirSync.returns(['foobar.html', 'some-other.html', 'some-cy.html', 'some.html']);
    const middleware = i18nTemplate(options)(base, callbackStub);
    // Act.
    middleware(req);
    // Assert.
    expect(callbackStub.getCall(0).args[0]).to.equal(`${base}-cy`);
  });

  it('returns the default view when templates do not exist in any preferred languages', () => {
    // Arrange
    req = { headers: { 'accept-language': 'fr,de-DE;q=0.5' } };
    base = 'some';
    fs.readdirSync.returns(['foobar.html', 'some-other.html', 'some.html']);
    const middleware = i18nTemplate(options)(base, callbackStub);
    // Act.
    middleware(req);
    // Assert.
    expect(callbackStub.getCall(0).args[0]).to.equal(base);
  });
});
