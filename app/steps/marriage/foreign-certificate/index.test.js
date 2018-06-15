const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/marriage/foreign-certificate';

const content = require(`${modulePath}/content`);

const { clone } = require('lodash');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ForeignCertificate;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('Content with marriage certificate in English', () => {
    let session = {};

    beforeEach(done => {
      session = { certificateInEnglish: 'Yes' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session, ['placeOfMarriageTranslation', 'wordsOfTranslation']);
    });
  });

  describe('Content with marriage certificate in a foreign language', () => {
    let session = {};

    beforeEach(done => {
      session = { certificateInEnglish: 'No' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session, ['placeOfMarriage']);
    });
  });

  describe('sucess', () => {
    let session = {};

    beforeEach(done => {
      session = {};

      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      const onlyKeys = [
        'countryName',
        'placeOfMarriage'
      ];

      testErrors(done, agent, underTest, context,
        content, 'required', onlyKeys, session);
    });
  });
  describe('success', () => {
    it('redirects to Habitual Residence page', done => {
      const context = {
        countryName: 'Canada',
        placeOfMarriage: 'Quebec'
      };

      const nextStep = s.steps.JurisdictionHabitualResidence;

      testRedirect(done, agent, underTest, context, nextStep);
    });
  });

  describe('Check Your Answers', () => {
    let session = {};

    beforeEach(done => {
      session = { certificateInEnglish: 'Yes' };
      withSession(done, agent, session);
    });

    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders the country name and place of marriage from marriage certificate', done => {
      const contentToExist = [
        'placeOfMarriageFromCertificate',
        'countryName'
      ];

      const valuesToExist = [
        'placeOfMarriage',
        'countryName'
      ];

      const context = {
        countryName: 'Canada',
        placeOfMarriage: 'Quebec'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('Does not render country name and place of marriage from translation', done => {
      const contentToNotExist = ['placeOfMarriageFromTranslation'];

      const valuesToNotExist = [];

      const context = {
        countryName: 'Canada',
        placeOfMarriage: 'Quebec'
      };

      testNoneExistenceCYA(done, underTest, content, contentToNotExist,
        valuesToNotExist, context, session);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the country name and place of marriage from certified translation', done => {
      const contentToExist = [
        'placeOfMarriageFromTranslation',
        'countryName'
      ];

      const valuesToExist = [
        'placeOfMarriage',
        'countryName'
      ];

      const context = {
        countryName: 'Canada',
        placeOfMarriage: 'Quebec'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('Does not render country name and place of marriage from marriage certificate', done => {
      const contentToNotExist = ['placeOfMarriageFromCertificate'];

      const valuesToNotExist = [];

      const context = {
        countryName: 'Canada',
        placeOfMarriage: 'Quebec'
      };

      testNoneExistenceCYA(done, underTest, content, contentToNotExist,
        valuesToNotExist, context);
    });
  });

  describe('Watched session values', () => {
    it('removes countryName and placeOfMarriage if marriedInUk is yes', () => {
      const previousSession = {
        countryName: 'Australia',
        placeOfMarriage: 'Some Registry Office'
      };

      const session = clone(previousSession);
      session.marriedInUk = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.countryName).to.equal('undefined');
      expect(typeof newSession.placeOfMarriage).to.equal('undefined');
    });
    it('does not remove countryName and placeOfMarriage if marriedInUk is no', () => {
      const previousSession = {
        countryName: 'Australia',
        placeOfMarriage: 'Some Registry Office'
      };

      const session = clone(previousSession);
      session.marriedInUk = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.countryName).to.equal(previousSession.countryName);
      expect(newSession.placeOfMarriage)
        .to.equal(previousSession.placeOfMarriage);
    });
  });
});
