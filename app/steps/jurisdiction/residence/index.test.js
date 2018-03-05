const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/jurisdiction/residence';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionResidence;
  });


  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('Jurisdicion habitual residence', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = { jurisdictionResidence: 'both' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionDomicile);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders residence domicile both', done => {
      const contentToExist = [
        'question',
        'both'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionResidence: 'both',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders residence domicile petitioner', done => {
      const contentToExist = [
        'question',
        'onlyMe'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionResidence: 'petitioner',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders residence domicile respondent', done => {
      const contentToExist = [
        'question',
        'onlyRespondent'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionResidence: 'respondent',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders residence domicile neither', done => {
      const contentToExist = [
        'question',
        'neither'
      ];

      const valuesToExist = [];

      const context = {
        jurisdictionResidence: 'neither',
        divorceWho: 'wife'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
