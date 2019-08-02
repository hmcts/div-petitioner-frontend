const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testCYATemplate, testExistenceCYA
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/jurisdiction/residual';
const { withSession } = require('test/util/setup');
const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionResidual;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('when P and R were same sex when got married', () => {
    let session = {};

    beforeEach(done => {
      session = { marriageIsSameSexCouple: 'Yes', divorceWho: 'wife' };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = ['residualTextOposite1', 'residualTextOposite2', 'residualTextOposite3'];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });


  describe('when P and R were oposite sex when got married', () => {
    let session = {};

    beforeEach(done => {
      session = { marriageIsSameSexCouple: 'No', divorceWho: 'wife' };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'residualTextSame1', 'residualTextSame2', 'residualTextSame3',
        'residualTextSameConHead', 'residualTextSameCon1', 'residualTextSameCon2',
        'residualTextSameCon3'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });


  describe('success', () => {
    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = { residualJurisdictionEligible: 'Yes' };
      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionConnectionSummary);
    });

    it('redirects to the exit page', done => {
      const context = { residualJurisdictionEligible: 'No' };

      testRedirect(done, agent, underTest, context, s.steps.ExitNoConnections);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when residualJurisdictionEligible is Yes', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['residualJurisdictionEligible'];

      const context = { residualJurisdictionEligible: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when residualJurisdictionEligible is No', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['residualJurisdictionEligible'];

      const context = { residualJurisdictionEligible: 'No' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });
  });
});
