const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/respondent/correspondence/address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentCorrespondenceAddress;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('redirects to the next page', done => {
      const context = {
        addressType: 'postcode',
        addressConfirmed: 'true',
        address: ['address', '1', 'ea1 eaf'],
        postcode: 'ea1 eaf',
        postcodeError: false
      };

      testRedirect(done, agent, underTest, context, s.steps.ReasonForDivorce);
    });
  });
});
