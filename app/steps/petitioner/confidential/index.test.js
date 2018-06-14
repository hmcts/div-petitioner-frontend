const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/petitioner/confidential';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PetitionerConfidential;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    beforeEach(done => {
      const session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });
    it('renders the content from the content file', done => {
      const session = { divorceWho: 'wife' };
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      const session = { divorceWho: 'wife' };

      testErrors(done, agent, underTest, context, content, 'required', [], session);
    });

    it('redirects to the next page', done => {
      const context = { petitionerContactDetailsConfidential: 'keep' };

      testRedirect(done, agent, underTest, context, s.steps.MarriageNames);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when petitionerContactDetailsConfidential is keep', done => {
      const contentToExist = [
        'question',
        'keep'
      ];

      const valuesToExist = [];

      const context = {
        petitionerContactDetailsConfidential: 'keep',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when petitionerContactDetailsConfidential is share', done => {
      const contentToExist = [
        'question',
        'share'
      ];

      const valuesToExist = [];

      const context = {
        petitionerContactDetailsConfidential: 'share',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
