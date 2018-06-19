const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/marriage/husband-or-wife';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.MarriageHusbandOrWife;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', 'divorceWho');
    });

    it('redirects to the next page', done => {
      const context = {
        divorceWho: 'wife',
        marriageIsSameSexCouple: 'No'
      };

      testRedirect(done, agent, underTest, context, s.steps.MarriageDate);
    });

    it('redirects to the next page', done => {
      const context = {
        divorceWho: 'husband',
        marriageIsSameSexCouple: 'No'
      };

      testRedirect(done, agent, underTest, context, s.steps.MarriageDate);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders the divorceWho wife', done => {
      const contentToExist = ['wife'];

      const valuesToExist = ['divorceWho'];

      const context = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders the divorceWho husband', done => {
      const contentToExist = ['husband'];

      const valuesToExist = ['divorceWho'];

      const context = { divorceWho: 'husband' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders marriageIsSameSexCouple if answered yes', done => {
      const contentToExist = [
        'marriageIsSameSexCoupleText',
        'Yes'
      ];

      const valuesToExist = [];

      const context = { marriageIsSameSexCouple: 'Yes' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('does not render marriageIsSameSexCouple if answered', done => {
      const contentToNotExist = [
        'marriageIsSameSexCoupleText',
        'No'
      ];

      const valuesToNotExist = [];

      const context = { marriageIsSameSexCouple: 'No' };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });
  });
});
