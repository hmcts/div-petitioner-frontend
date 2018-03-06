/* eslint no-console: "off"*/
const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/where';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.AdulteryWhere;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = { reasonForDivorceAdulteryKnowWhere: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.AdulteryWhen);
    });

    it('redirects to the exit page', done => {
      const context = { reasonForDivorceAdulteryKnowWhere: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.AdulteryWhen);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceAdulteryKnowWhere if reasonForDivorceAdulteryWishToName is set to No', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdulteryKnowWhere: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('No');
      expect(typeof newSession.reasonForDivorceAdulteryKnowWhere)
        .to.equal('undefined');
    });

    it('removes reasonForDivorceAdulteryKnowWhere if reasonForDivorceAdulteryWishToName is not defined', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdulteryKnowWhere: 'Yes'
      };

      const session = clone(previousSession);
      delete session.reasonForDivorceAdulteryWishToName;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdulteryWishToName)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdulteryKnowWhere)
        .to.equal('undefined');
    });

    it('it does not remove reasonForDivorceAdulteryKnowWhere if reasonForDivorceAdulteryWishToName is set to Yes', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'No',
        reasonForDivorceAdulteryKnowWhere: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('Yes');
      expect(newSession.reasonForDivorceAdulteryKnowWhere)
        .to.equal(previousSession.reasonForDivorceAdulteryKnowWhere);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders adultery where details', done => {
      const contentToExist = [ 'question' ];

      const valuesToExist = ['reasonForDivorceAdulteryKnowWhere'];

      const context = { reasonForDivorceAdulteryKnowWhere: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
