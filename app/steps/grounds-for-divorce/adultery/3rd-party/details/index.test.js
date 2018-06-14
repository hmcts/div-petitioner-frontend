const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/3rd-party/details';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Adultery3rdPartyDetails;
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

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = {
        reasonForDivorceAdultery3rdPartyFirstName: 'firstname',
        reasonForDivorceAdultery3rdPartyLastName: 'lastname'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.Adultery3rdPartyAddress);
    });
  });

  describe('Watched session values', () => {
    it('removes values if reasonForDivorceAdulteryWishToName is set to no', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdultery3rdPartyFirstName: 'firstname',
        reasonForDivorceAdultery3rdPartyLastName: 'lastname'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('No');
      expect(typeof newSession.reasonForDivorceAdultery3rdPartyFirstName)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdultery3rdPartyLastName)
        .to.equal('undefined');
    });

    it('does not remove values if reasonForDivorceAdulteryWishToName is set to yes', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'No',
        reasonForDivorceAdultery3rdPartyFirstName: 'firstname',
        reasonForDivorceAdultery3rdPartyLastName: 'lastname'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('Yes');
      expect(newSession.reasonForDivorceAdultery3rdPartyFirstName)
        .to.equal(previousSession.reasonForDivorceAdultery3rdPartyFirstName);
      expect(newSession.reasonForDivorceAdultery3rdPartyLastName)
        .to.equal(previousSession.reasonForDivorceAdultery3rdPartyLastName);
    });

    it('removes values if reasonForDivorceAdulteryWishToName is deleted', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdultery3rdPartyFirstName: 'firstname',
        reasonForDivorceAdultery3rdPartyLastName: 'lastname'
      };

      const session = clone(previousSession);
      delete session.reasonForDivorceAdulteryWishToName;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdulteryWishToName)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdultery3rdPartyFirstName)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdultery3rdPartyLastName)
        .to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders adulterer names', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'reasonForDivorceAdultery3rdPartyFirstName',
        'reasonForDivorceAdultery3rdPartyLastName'
      ];

      const context = {
        reasonForDivorceAdultery3rdPartyFirstName: 'firstname',
        reasonForDivorceAdultery3rdPartyLastName: 'lastname'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
