const { expect } = require('chai').use(require('chai-as-promised'));
const sinon = require('sinon');
const request = require('request-promise-native');

const modulePath = 'app/services/transformationServiceClient';
const underTest = require(modulePath);

describe(modulePath, () => {
  let client = {}, options = {};

  beforeEach(() => {
    options = {
      baseUrl: 'http://base-url:2341',
      draftBaseUrl: 'http://draft-base-url:2341'
    };
    client = underTest.init(options);
    sinon.stub(request, 'post');
    sinon.stub(request, 'get');
    sinon.stub(request, 'put');
  });

  afterEach(() => {
    request.post.restore();
    request.put.restore();
    request.get.restore();
  });

  it('checks for Base URL in options', () => {
    // Arrange.
    const brokenClient = () => {
      return underTest.init({ someHeader: 'foo' });
    };
    // Assert.
    expect(brokenClient).to.throw();
  });

  describe('#submit', () => {
    it('sends the user token and the body along with the request', () => {
      // Arrange.
      const userToken = 'user.token';
      const body = { foo: 'bar' };
      // Act.
      client.submit(userToken, body);
      // Assert.
      expect(request.post.args[0][0]).to.eql({
        uri: `${options.baseUrl}/submit`,
        body,
        headers: { Authorization: `Bearer ${userToken}` },
        json: true
      });
    });
  });

  describe('#update', () => {
    it('sends the user token and the assembled body along with the request', () => {
      // Arrange.
      const userToken = 'user.token';
      const caseId = 'some-case-id';
      const eventData = { foo: 'bar' };
      const eventId = 'some-event-id';
      const body = { eventData, eventId };
      // Act.
      client.update(userToken, caseId, eventData, eventId);
      // Assert.
      expect(request.post.args[0][0]).to.eql({
        uri: `${options.baseUrl}/updateCase/${caseId}`,
        body,
        headers: { Authorization: `Bearer ${userToken}` },
        json: true
      });
    });
  });

  describe('#saveToDraftStore', () => {
    it('sends the user token and the assembled body along with the request', () => {
      // Arrange.
      const userToken = 'user.token';
      const body = { foo: 'bar' };
      // Act.
      client.saveToDraftStore(userToken, body);
      // Assert.
      expect(request.put.args[0][0]).to.eql({
        uri: `${options.draftBaseUrl}`,
        body,
        headers: { Authorization: `Bearer ${userToken}` },
        json: true
      });
    });
    it('appends pertitioner email to uri if send email arguement is true', () => {
      // Arrange.
      const userToken = 'user.token';
      const body = {
        foo: 'bar',
        petitionerEmail: 'test@test.com'
      };
      const petitionerEmail = encodeURIComponent(body.petitionerEmail);
      // Act.
      const sendEmail = true;
      client.saveToDraftStore(userToken, body, sendEmail);
      // Assert.
      expect(request.put.args[0][0]).to.eql({
        uri: `${options.draftBaseUrl}?notificationEmail=${petitionerEmail}`,
        body,
        headers: { Authorization: `Bearer ${userToken}` },
        json: true
      });
    });
  });

  describe('#restoreFromDraftStore', () => {
    it('sends the user token along with the request', () => {
      // Arrange.
      const userToken = 'user.token';
      // Act.
      client.restoreFromDraftStore(userToken);
      // Assert.
      expect(request.get.args[0][0]).to.eql({
        uri: `${options.draftBaseUrl}`,
        headers: { Authorization: `Bearer ${userToken}` },
        json: true
      });
    });
  });
});
