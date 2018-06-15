const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/petitioner/changed-name';
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PetitionerChangedNamed;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('content', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });

  describe('errors', () => {
    it('renders errors for missing required context', done => {
      const context = {};

      const onlyKeys = ['petitionerNameDifferentToMarriageCertificate'];

      testErrors(done, agent, underTest, context, content, 'required', onlyKeys);
    });

    it('renders errors if petitionerNameDifferentToMarriageCertificate is Yes and no other context entered', done => {
      const context = { petitionerNameDifferentToMarriageCertificate: 'Yes' };

      const onlyKeys = ['petitionerNameChangedHow'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys);
    });
  });

  describe('success', () => {
    it('redirects to the next page if petitionerNameDifferentToMarriageCertificate is No', done => {
      const context = { petitionerNameDifferentToMarriageCertificate: 'No' };

      const nextStep = s.steps.PetitionerContactDetails;

      testRedirect(done, agent, underTest, context, nextStep);
    });

    it('redirects to the next page if petitionerNameDifferentToMarriageCertificate is Yes and petitionerNameChangedHow answered', done => {
      const context = {
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        petitionerNameChangedHow: ['marriageCertificate']
      };

      const nextStep = s.steps.PetitionerContactDetails;

      testRedirect(done, agent, underTest, context, nextStep);
    });

    it('redirects to the next page if petitionerNameDifferentToMarriageCertificate is Yes and petitionerNameChangedHow and petitionerNameChangedHowOtherDetails answered', done => {
      const context = {
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        petitionerNameChangedHow: ['marriageCertificate'],
        petitionerNameChangedHowOtherDetails: 'details...'
      };

      const nextStep = s.steps.PetitionerContactDetails;

      testRedirect(done, agent, underTest, context, nextStep);
    });
  });

  describe('Watched session values', () => {
    it('removes petitionerNameChangedHow if petitionerNameDifferentToMarriageCertificate is No', () => {
      const previousSession = {
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        petitionerNameChangedHow: ['marriageCertificate']
      };

      const session = clone(previousSession);
      session.petitionerNameDifferentToMarriageCertificate = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.petitionerNameChangedHow).to.equal('undefined');
    });

    it('does not remove petitionerNameChangedHow if petitionerNameDifferentToMarriageCertificate is Yes', () => {
      const previousSession = {
        petitionerNameDifferentToMarriageCertificate: 'No',
        petitionerNameChangedHow: ['marriageCertificate']
      };

      const session = clone(previousSession);
      session.petitionerNameDifferentToMarriageCertificate = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.petitionerNameChangedHow)
        .to.equal(previousSession.petitionerNameChangedHow);
    });

    it('removes petitionerNameChangedHowOtherDetails if petitionerNameDifferentToMarriageCertificate is No', () => {
      const previousSession = {
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        petitionerNameChangedHowOtherDetails: 'details...'
      };

      const session = clone(previousSession);
      session.petitionerNameDifferentToMarriageCertificate = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.petitionerNameChangedHowOtherDetails)
        .to.equal('undefined');
    });

    it('does not remove petitionerNameChangedHowOtherDetails if petitionerNameDifferentToMarriageCertificate is Yes', () => {
      const previousSession = {
        petitionerNameDifferentToMarriageCertificate: 'No',
        petitionerNameChangedHowOtherDetails: 'details...'
      };

      const session = clone(previousSession);
      session.petitionerNameDifferentToMarriageCertificate = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.petitionerNameChangedHowOtherDetails)
        .to.equal(previousSession.petitionerNameChangedHowOtherDetails);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when petitionerNameDifferentToMarriageCertificate is no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['petitionerNameDifferentToMarriageCertificate'];

      const context = { petitionerNameDifferentToMarriageCertificate: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when petitionerNameDifferentToMarriageCertificate is yes and all selected', done => {
      const contentToExist = [
        'question',
        'nameChangeProof',
        'marriageCertificate',
        'deedPoll',
        'other',
        'howChangeName'
      ];

      const valuesToExist = [
        'petitionerNameDifferentToMarriageCertificate',
        'petitionerNameChangedHowOtherDetails'
      ];

      const context = {
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        petitionerNameChangedHow: ['marriageCertificate', 'deedPoll', 'other'],
        petitionerNameChangedHowOtherDetails: 'details...'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('does not render details if not entered', done => {
      const contentToNotExist = ['howChangeName'];

      const valuesToNotExist = ['petitionerNameChangedHowOtherDetails'];

      const context = {
        petitionerNameDifferentToMarriageCertificate: 'Yes',
        petitionerNameChangedHow: ['marriageCertificate', 'deedPoll', 'other']
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });
  });
});
