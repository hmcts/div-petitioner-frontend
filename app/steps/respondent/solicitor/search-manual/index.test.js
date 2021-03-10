const request = require('supertest');
const { testContent, testErrors, testRedirect } = require('test/util/assertions');
const server = require('app');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');
const { expect } = require('test/util/chai');
const co = require('co');

const modulePath = 'app/steps/respondent/solicitor/search-manual';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentSolicitorSearchManual;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context,
        content, 'required', [], session);
    });

    it('redirects to ReasonForDivorce when mandatory fields are filled', done => {
      const context = {
        respondentSolicitorName: 'Solicitor name',
        respondentSolicitorAddressManual: 'Solicitor address'
      };

      testRedirect(done, agent, underTest, context, s.steps.ReasonForDivorce);
    });
  });

  describe('#interceptor', () => {
    it('should convert address of type array to string type for display', done => {
      co(function* generator() {
        const session = {
          respondentSolicitorAddress: {
            address: [
              'line 1',
              'line 2',
              'line 3'
            ]
          }
        };

        yield underTest.interceptor({}, session);

        expect(session).to.deep.equal({
          respondentSolicitorAddress: {
            address: [
              'line 1',
              'line 2',
              'line 3'
            ]
          },
          respondentSolicitorAddressManual: 'line 1\nline 2\nline 3'
        });
      }).then(done, done);
    });
  });

  describe('#action', () => {
    it('should copy address to an array', done => {
      co(function* generator() {
        const ctx = {
          respondentSolicitorAddressManual: 'line 1\r\nline 2\r\nline 3'
        };
        const session = {};

        yield underTest.action(ctx, session);

        expect(session).to.deep.equal({
          respondentSolicitorAddress: {
            address: [
              'line 1',
              'line 2',
              'line 3'
            ]
          }
        });
      }).then(done, done);
    });
  });
});
