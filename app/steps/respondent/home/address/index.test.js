const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/respondent/home/address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentHomeAddress;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('redirects to the next page', done => {
      const context = {
        addressType: 'postcode',
        addressConfirmed: 'true',
        address: ['address', '1', 'ea1 eaf'],
        postcode: 'ea1 eaf',
        postcodeError: false
      };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceUseHomeAddress);
    });
  });

  describe('Watched session values', () => {
    it('removes respondentHomeAddress if respondentKnowsHomeAddress is changed and respondentKnowsHomeAddress is no', () => {
      const previousSession = {
        respondentKnowsHomeAddress: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.respondentKnowsHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentHomeAddress).to.equal('undefined');
    });

    it('remove respondentHomeAddress if respondentKnowsHomeAddress is changed', () => {
      const previousSession = {
        respondentKnowsHomeAddress: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      delete session.respondentKnowsHomeAddress;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentHomeAddress).to.equal('undefined');
    });
  });
});
