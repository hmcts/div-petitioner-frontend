const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');
const co = require('co');

const modulePath = 'app/steps/living-arrangements/live-together';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.LiveTogether;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'husband' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to RespondentCorrespondenceUseHomeAddress when Yes is selected', done => {
      const context = { livingArrangementsLiveTogether: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceUseHomeAddress);
    });

    it('redirects to LastLivedTogether when No is selected', done => {
      const context = { livingArrangementsLiveTogether: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.LastLivedTogether);
    });
  });

  describe('#action', () => {
    it('should assign petitionerHomeAddress to respondentHomeAddress when livingArrangementsLiveTogether is yes', done => {
      co(function* generator() {
        const ctx = {
          livingArrangementsLiveTogether: 'Yes',
          petitionerHomeAddress: ['Address A', 'Address B', 'Address C']
        };

        const session = { petitionerHomeAddress: ['Address 1', 'Address 2', 'Address 3'] };

        const result = yield underTest.action(ctx, session);

        expect(result).to.deep.equal(
          [
            {
              livingArrangementsLiveTogether: 'Yes',
              petitionerHomeAddress: ['Address A', 'Address B', 'Address C'],
              respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
            }, session
          ]
        );
      }).then(done, done);
    });

    it('should not assign petitionerHomeAddress to respondentHomeAddress when livingArrangementsLiveTogether is no', done => {
      co(function* generator() {
        const ctx = {
          livingArrangementsLiveTogether: 'No',
          petitionerHomeAddress: ['Address A', 'Address B', 'Address C']
        };

        const session = { petitionerHomeAddress: ['Address 1', 'Address 2', 'Address 3'] };

        const result = yield underTest.action(ctx, session);

        expect(result).to.deep.equal([ ctx, session ]);
      }).then(done, done);
    });
  });


  describe('Watched session values', () => {
    it('removes respondentHomeAddress & livingArrangementsLiveTogether if petitionerHomeAddress is changed and livingArrangementsLiveTogether is yes', () => {
      const previousSession = {
        petitionerHomeAddress: ['Address 1', 'Address 2', 'Address 3'],
        livingArrangementsLiveTogether: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.petitionerHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.livingArrangementsLiveTogether)
        .to.equal('undefined');
      expect(typeof newSession.respondentHomeAddress).to.equal('undefined');
    });

    it('does not remove respondentHomeAddress & livingArrangementsLiveTogether if petitionerHomeAddress is changed and livingArrangementsLiveTogether is no', () => {
      const previousSession = {
        petitionerHomeAddress: ['Address 1', 'Address 2', 'Address 3'],
        livingArrangementsLiveTogether: 'No',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.petitionerHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.livingArrangementsLiveTogether)
        .to.equal(previousSession.livingArrangementsLiveTogether);
      expect(newSession.respondentHomeAddress)
        .to.equal(previousSession.respondentHomeAddress);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when livingArrangementsLiveTogether is yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['livingArrangementsLiveTogether'];

      const context = {
        livingArrangementsLiveTogether: 'Yes',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when livingArrangementsLiveTogether is no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['livingArrangementsLiveTogether'];

      const context = {
        livingArrangementsLiveTogether: 'No',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
