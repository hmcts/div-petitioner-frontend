const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/living-arrangements/last-lived-together/at-petitioner-home-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.LastLivedTogether;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'husband',
        petitionerHomeAddress: {
          address: [
            '80 Landor Road',
            'London',
            'SW9 9PE'
          ]
        }
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required', [], session);
    });

    it('redirects to RespondentHomeAddress when Yes is selected', done => {
      const context = { livingArrangementsLastLivedTogether: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentHomeAddressIsKnown);
    });

    it('redirects to LastLivedTogetherAddress when No is selected', done => {
      const context = { livingArrangementsLastLivedTogether: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.LastLivedTogetherAddress);
    });

    it('redirects to RespondentHomeAddress when No is selected', done => {
      const context = { livingArrangementsLastLivedTogether: 'Never' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentHomeAddressIsKnown);
    });
  });

  describe('Watched session values', () => {
    it('removes livingArrangementsLastLivedTogether if livingArrangementsLiveTogether is changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLiveTogether: 'Yes'
      };

      const session = clone(previousSession);
      delete session.livingArrangementsLastLivedTogether;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.livingArrangementsLastLivedTogether)
        .to.equal('undefined');
    });

    it('does not remove livingArrangementsLastLivedTogether if livingArrangementsLiveTogether is not changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLiveTogether: 'Yes'
      };

      const session = clone(previousSession);
      session.livingArrangementsLastLivedTogether = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.livingArrangementsLiveTogether)
        .to.equal(previousSession.livingArrangementsLiveTogether);
    });

    it('removes livingArrangementsLastLivedTogether & livingArrangementsLastLivedTogetherAddress if petitionerHomeAddress is changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLastLivedTogetherAddress: 'Yes',
        petitionerHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.petitionerHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.livingArrangementsLastLivedTogether)
        .to.equal('undefined');
      expect(typeof newSession.livingArrangementsLastLivedTogetherAddress)
        .to.equal('undefined');
    });

    it('does not remove livingArrangementsLastLivedTogether & livingArrangementsLastLivedTogetherAddress if petitionerHomeAddress is not changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLastLivedTogetherAddress: 'Yes',
        petitionerHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.petitionerHomeAddress = ['Address 1', 'Address 2', 'Address 3'];

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.livingArrangementsLastLivedTogether)
        .to.equal(previousSession.livingArrangementsLastLivedTogether);
      expect(newSession.livingArrangementsLastLivedTogetherAddress)
        .to.equal(previousSession.livingArrangementsLastLivedTogetherAddress);
    });
  });

  describe('Check Your Answers', () => {
    const testAddress = ['Address line 1', 'Address line 2', 'Address line 3', 'Postcode'];

    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when livingArrangementsLastLivedTogether is yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'petitionerHomeAddress',
        'livingArrangementsLastLivedTogether'
      ];

      const context = {
        petitionerHomeAddress: testAddress,
        livingArrangementsLastLivedTogether: 'Yes'
      };

      const session = { petitionerHomeAddress: { address: testAddress } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when livingArrangementsLastLivedTogether is no', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'petitionerHomeAddress',
        'livingArrangementsLastLivedTogether'
      ];

      const context = {
        petitionerHomeAddress: testAddress,
        livingArrangementsLastLivedTogether: 'No'
      };

      const session = { petitionerHomeAddress: { address: testAddress } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when livingArrangementsLastLivedTogether is never', done => {
      const contentToExist = ['question'];

      const valuesToExist = [
        'petitionerHomeAddress',
        'livingArrangementsLastLivedTogether'
      ];

      const context = {
        petitionerHomeAddress: testAddress,
        livingArrangementsLastLivedTogether: 'Never'
      };

      const session = { petitionerHomeAddress: { address: testAddress } };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('does not render petitionerHomeAddress if its not in session', done => {
      const contentToNotExist = [];

      const valuesToNotExist = ['petitionerHomeAddress'];

      const context = {
        petitionerHomeAddress: testAddress,
        livingArrangementsLastLivedTogether: 'Yes'
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });
  });
});
