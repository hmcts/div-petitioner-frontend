const request = require('supertest');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { testContent, testRedirect } = require('test/util/assertions');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/pay/by-phone-self';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PayByPhoneSelf;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('redirects to the next page', done => {
      testRedirect(done, agent, underTest, {}, s.steps.CheckYourAnswers);
    });

    it('returns enabledAfterSubmission', () => {
      expect(underTest.enabledAfterSubmission).to.equal(true);
    });
  });
});
