const request = require('supertest');
const {
  testContent,
  testCYATemplate,
  testExistenceCYA,
  testNoneExistenceCYA,
  testErrors,
  testRedirect,
  testExistence
} = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');
const forEach = require('mocha-each');

const modulePath = 'app/steps/respondent/correspondence/use-home-address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentCorrespondenceUseHomeAddress;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        respondentHomeAddress: {
          address: [
            '82',
            'Landor Road',
            'SW9 9PE'
          ]
        }
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'featureToggleRespSol.question',
        'featureToggleRespSol.correspondence',
        'featureToggleRespSol.theirAddress',
        'featureToggleRespSol.solicitorAddress',
        'featureToggleRespSol.anotherAddress',
        'featureToggleRespSol.needToKnowSolFirm'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders the content from the content file (feature toggle respondent solicitor on)', done => {
      const excludeKeys = [
        'correspondence',
        'yes',
        'no',
        'featureToggleRespSol.needToKnowSolFirm'
      ];

      underTest.setRespSolToggle = ctx => {
        ctx.isRespSolToggleOn = true;
      };


      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to ReasonForDivorce when Yes is selected', done => {
      const context = { respondentCorrespondenceUseHomeAddress: 'Yes' };

      testRedirect(done, agent, underTest, context, s.steps.ReasonForDivorce);
    });

    it('redirects to RespondentCorrespondenceAddress when No is selected', done => {
      const context = { respondentCorrespondenceUseHomeAddress: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceAddress);
    });

    it('redirects to RespondentSolicitorDetails when Solicitor is selected', done => {
      const context = { respondentCorrespondenceUseHomeAddress: 'Solicitor' };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentCorrespondenceSolicitorSearch);
    });
  });

  describe('when respondent lives at same address', () => {
    let session = {};

    beforeEach(done => {
      session = {
        livingArrangementsLiveTogether: 'Yes',
        petitionerHomeAddress: { address: ['a', 'place', 'in', 'the', 'when respondent lives at same address'] }
      };
      withSession(done, agent, session);
    });

    it('redirects to the RespondentCorrespondenceUseHomeAddress', done => {
      testExistence(done, agent, underTest,
        'when respondent lives at same address');
    });
  });

  describe('when respondent home address is known', () => {
    let session = {};

    beforeEach(done => {
      session = { respondentHomeAddress: { address: ['a', 'place', 'in', 'the', 'when respondent home address is known'] } };
      withSession(done, agent, session);
    });
  });

  describe('Watched session values', () => {
    it('removes respondentCorrespondenceUseHomeAddress if respondentHomeAddress is changed', () => {
      const previousSession = {
        respondentCorrespondenceUseHomeAddress: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.respondentHomeAddress = ['Address 1', 'Address 2'];

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceUseHomeAddress)
        .to.equal('undefined');
    });

    it('remove respondentCorrespondenceUseHomeAddress if respondentHomeAddress is changed', () => {
      const previousSession = {
        respondentCorrespondenceUseHomeAddress: 'Yes',
        respondentHomeAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      delete session.respondentHomeAddress;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceUseHomeAddress)
        .to.equal('undefined');
    });

    it('remove respondentCorrespondenceAddress if respondentCorrespondenceUseHomeAddress is changed and is not yes', () => {
      const previousSession = {
        respondentCorrespondenceUseHomeAddress: 'Yes',
        respondentCorrespondenceAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.respondentHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.respondentCorrespondenceAddress)
        .to.equal('undefined');
    });
  });

  describe('Where papers are sent', () => {
    const getSolicitorContent = (session, option) => {
      return content.resources[session.language].translation.content.featureToggleRespSol[option];
    };

    forEach([
      ['Yes', 'theirAddress'],
      ['No', 'anotherAddress'],
      ['Solicitor', 'solicitorAddress']
    ])
      .it('should set the correct value when users option is %s', (useHomeAddress, contentOption) => {
        const ctx = {
          isRespSolToggleOn: true,
          respondentCorrespondenceUseHomeAddress: useHomeAddress
        };
        const session = { language: 'en' };

        underTest.setRespondentCorrespondenceDisplayAnswer(ctx, session);

        // eslint-disable-next-line no-unused-expressions
        expect(ctx.respondentCorrespondenceWherePaperSent).not.to.be.undefined;
        expect(ctx.respondentCorrespondenceWherePaperSent).to.equal(getSolicitorContent(session, contentOption));
      });
  });

  context('Check Your Answers', () => {
    describe('Check Your Answers - Default', () => {
      it('should render the cya template', done => {
        testCYATemplate(done, underTest);
      });

      it('should render when respondentCorrespondenceUseHomeAddress is yes', done => {
        const contentToExist = [
          'question',
          'yes'
        ];

        const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];
        const context = {
          respondentCorrespondenceUseHomeAddress: 'Yes'
        };
        const session = {
          divorceWho: 'wife',
          livingArrangementsLastLivedTogetherAddress: {
            address: ['line 1', 'line 2', 'line 3', 'postcode']
          }
        };

        testExistenceCYA(done, underTest, content,
          contentToExist, valuesToExist, context, session);
      });

      it('should render when respondentCorrespondenceUseHomeAddress is no', done => {
        const contentToExist = [
          'question',
          'no'
        ];

        const valuesToExist = ['livingArrangementsLastLivedTogetherAddress'];
        const context = {
          respondentCorrespondenceUseHomeAddress: 'No'
        };
        const session = {
          divorceWho: 'wife',
          livingArrangementsLastLivedTogetherAddress: {
            address: ['line 1', 'line 2', 'line 3', 'postcode']
          }

        };

        testExistenceCYA(done, underTest, content,
          contentToExist, valuesToExist, context, session);
      });
    });

    describe('Check Your Answers - Feature Toggle', () => {
      forEach([
        ['Solicitor', 'Their solicitor\'s address'],
        ['Yes', 'Their address'],
        ['No', 'Another address']
      ])
        .it('should render correct response for where papers are sent when respondentCorrespondenceUseHomeAddress is %s',
          (useHomeAddress, wherePaperSent, done) => {
            const contentToExist = ['featureToggleRespSol.question'];
            const valuesToExist = ['respondentCorrespondenceWherePaperSent'];
            const context = {
              isRespSolToggleOn: true,
              respondentCorrespondenceUseHomeAddress: useHomeAddress,
              respondentCorrespondenceWherePaperSent: wherePaperSent
            };
            const session = {
              divorceWho: 'wife',
              language: 'en'
            };

            testExistenceCYA(done, underTest, content,
              contentToExist, valuesToExist, context, session);
          });

      it('should not render respondentCorrespondenceWherePaperSent if toggle is off', done => {
        const contentToNotExist = [];
        const valuesToNotExist = ['respondentCorrespondenceWherePaperSent'];
        const context = {
          isRespSolToggleOn: false
        };

        testNoneExistenceCYA(done, underTest, content,
          contentToNotExist, valuesToNotExist, context);
      });
    });
  });
});
