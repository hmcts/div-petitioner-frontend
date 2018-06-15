const request = require('supertest');
const { testContent, testCYATemplate, testExistenceCYA, testErrors, testRedirect, testExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const { clone } = require('lodash');
const { mockSession } = require('test/fixtures');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/petitioner/correspondence/use-home-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PetitionerCorrespondence;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    beforeEach(done => {
      withSession(done, agent, mockSession);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders the previously selected address', done => {
      testExistence(done, agent, underTest, 'Landor Road');
    });

    it('redirects to the petitioner confidential page', done => {
      const context = { petitionerCorrespondenceUseHomeAddress: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.LiveTogether);
    });

    it('redirects to the petitioner correspondence address page', done => {
      const context = { petitionerCorrespondenceUseHomeAddress: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerCorrespondenceAddress);
    });
  });

  describe('success', () => {
    beforeEach(done => {
      const session = clone(mockSession);
      delete session.petitionerCorrespondenceUseHomeAddress;

      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });
  });

  describe('Watched session values', () => {
    it('removes petitionerCorrespondenceUseHomeAddress and petitionerCorrespondenceAddress if petitionerHomeAddress changes and petitionerCorrespondenceUseHomeAddress is yes', () => {
      const previousSession = {
        petitionerCorrespondenceUseHomeAddress: 'Yes',
        petitionerCorrespondenceAddress: ['Address 1', 'Address 2', 'Postcode'],
        petitionerHomeAddress: ['Address 1', 'Address 2', 'Postcode']
      };

      const session = clone(previousSession);
      session.petitionerHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.petitionerCorrespondenceAddress)
        .to.equal('undefined');
      expect(typeof newSession.petitionerCorrespondenceUseHomeAddress)
        .to.equal('undefined');
    });

    it('does not remove petitionerCorrespondenceUseHomeAddress and petitionerCorrespondenceAddress if petitionerHomeAddress changes and petitionerCorrespondenceUseHomeAddress is no', () => {
      const previousSession = {
        petitionerCorrespondenceUseHomeAddress: 'No',
        petitionerCorrespondenceAddress: ['Address 1', 'Address 2', 'Postcode'],
        petitionerHomeAddress: ['Address 1', 'Address 2', 'Postcode']
      };

      const session = clone(previousSession);
      session.petitionerHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.petitionerCorrespondenceAddress)
        .to.equal(previousSession.petitionerCorrespondenceAddress);
      expect(newSession.petitionerCorrespondenceUseHomeAddress)
        .to.equal(previousSession.petitionerCorrespondenceUseHomeAddress);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when petitionerCorrespondenceUseHomeAddress is yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'petitionerHomeAddress',
        'petitionerCorrespondenceUseHomeAddress'
      ];

      const context = { petitionerCorrespondenceUseHomeAddress: 'Yes' };

      const session = { petitionerHomeAddress: { address: ['line 1', 'line 2', 'line 2'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when petitionerCorrespondenceUseHomeAddress is no', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'petitionerHomeAddress',
        'petitionerCorrespondenceUseHomeAddress'
      ];

      const context = { petitionerCorrespondenceUseHomeAddress: 'No' };

      const session = { petitionerHomeAddress: { address: ['line 1', 'line 2', 'line 2'] } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('render when petitionerCorrespondenceAddress no available', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['petitionerCorrespondenceUseHomeAddress'];

      const context = { petitionerCorrespondenceUseHomeAddress: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
