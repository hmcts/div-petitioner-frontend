const request = require('supertest');
const {
  testContent, testRedirect, testCYATemplate, testExistenceCYA,
  testNoneExistenceCYA, testValidation
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/marriage/about-your-marriage-certificate';

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
    underTest = s.steps.AboutYourMarriageCertificate;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('About your marriage certificate step content', () => {
    const session = {};

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content,
        session, ['cyaCertifiedTranslation']);
    });
  });

  describe('About your marriage certificate step errors', () => {
    it('renders errors for missing certificate in English context', done => {
      const context = {};
      testValidation(done, agent, underTest, context,
        content, ['certificateInEnglish.required']);
    });

    it('renders errors for missing certified translation context', done => {
      const context = { certificateInEnglish: 'No' };

      testValidation(done, agent, underTest, context,
        content, ['certifiedTranslation.required']);
    });
  });

  describe('Marriage certificate language routing', () => {
    it('Redirects to correct page when marriage certificate is in English', done => {
      const context = { certificateInEnglish: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.ForeignCertificate);
    });

    it('redirects to the correct page when certificate not in english but certified translation', done => {
      const context = {
        certificateInEnglish: 'No',
        certifiedTranslation: 'Yes'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.ForeignCertificate);
    });

    it('redirects to the correct page when certificate not in english and no certified translation', done => {
      const context = {
        certificateInEnglish: 'No',
        certifiedTranslation: 'No'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitNoCertificateTranslated);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders certificateInEnglish', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['certificateInEnglish'];

      const context = { certificateInEnglish: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('If certificate is in English does not render certified translation', done => {
      const contentToNotExist = ['cyaCertifiedTranslation'];

      const context = { certificateInEnglish: 'Yes' };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, [], context);
    });

    it('renders certifiedTranslation', done => {
      const contentToExist = [ 'cyaCertifiedTranslation' ];

      const valuesToExist = [
        'certificateInEnglish',
        'certifiedTranslation'
      ];

      const context = {
        certificateInEnglish: 'No',
        certifiedTranslation: 'Yes'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });

  describe('Watched session values', () => {
    it('removes certificateInEnglish and certifiedTranslation if marriedInUk is yes', () => {
      const previousSession = {
        certificateInEnglish: 'No',
        certifiedTranslation: 'Yes'
      };

      const session = clone(previousSession);
      session.marriedInUk = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.certificateInEnglish).to.equal('undefined');
      expect(typeof newSession.certifiedTranslation).to.equal('undefined');
    });

    it('does not remove certificateInEnglish and certifiedTranslation if marriedInUk is no', () => {
      const previousSession = {
        certificateInEnglish: 'No',
        certifiedTranslation: 'Yes'
      };

      const session = clone(previousSession);
      session.marriedInUk = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.certificateInEnglish)
        .to.equal(previousSession.certificateInEnglish);
      expect(newSession.certifiedTranslation)
        .to.equal(previousSession.certifiedTranslation);
    });

    it('removes certifiedTranslation if certificateInEnglish is yes', () => {
      const previousSession = { certifiedTranslation: 'Yes' };

      const session = clone(previousSession);
      session.certificateInEnglish = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.certifiedTranslation).to.equal('undefined');
    });

    it('does not remove certifiedTranslation if certificateInEnglish is no', () => {
      const previousSession = { certifiedTranslation: 'Yes' };

      const session = clone(previousSession);
      session.certificateInEnglish = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.certifiedTranslation)
        .to.equal(previousSession.certifiedTranslation);
    });
  });
});
