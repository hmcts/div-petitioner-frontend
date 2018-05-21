/* eslint-disable max-nested-callbacks */

const request = require('supertest');
const statusCodes = require('http-status-codes');
const { cloneDeep } = require('lodash');
const { withSession } = require('test/util/setup');
const idamMock = require('test/mocks/idam');

const { expect, sinon } = require('test/util/chai');
const server = require('app');
const featureTogglesMock = require('test/mocks/featureToggles');
const { testRedirect, testCustom } = require('test/util/assertions');
const submission = require('app/services/submission');

const modulePath = 'app/steps/submit';

let s = {};
let agent = {};
let underTest = {};
let session = {};

describe(modulePath, () => {
  let submit = null;

  beforeEach(() => {
    submit = sinon.stub().resolves({
      error: null,
      status: 'success',
      caseId: '1234567890'
    });
    sinon.stub(submission, 'setup').returns({ submit });

    idamMock.stub();
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Submit;
  });

  afterEach(() => {
    submission.setup.restore();

    s.http.close();
    featureTogglesMock.restore();
    idamMock.restore();
  });

  describe('handler', () => {
    context('get request', () => {
      it('error if is a GET request', done => {
        testRedirect(done, agent, underTest, context,
          s.steps.Error404);
      });
    });

    beforeEach(done => {
      session = {
        question1: 'Yes',
        cookie: {},
        expires: Date.now()
      };
      withSession(done, agent, session);
    });

    it('redirects to error page when submission request fails', done => {
      // Arrange.
      submit.rejects();
      // Act.
      testCustom(done, agent, underTest, [], response => {
        // Assert.
        expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
        expect(response.headers.location).to.equal('/generic-error');
      });
    });

    context('Idam is turned ON', () => {
      it('uses the token of the logged in user', done => {
        // Arrange.
        const userCookie = ['__auth-token=auth.token', 'connect.sid=abc'];
        // Act.
        const featureMock = featureTogglesMock
          .when('idam', true, testCustom, agent, underTest, userCookie, () => {
            // Assert.
            expect(submit.calledOnce).to.equal(true);
            expect(submit.args[0][0]).to.eql('auth.token');
          });
        featureMock(done);
      });
    });

    context('Idam is turned OFF', () => {
      it('uses an empty token for the mocks', done => {
        // Act.
        const featureMock = featureTogglesMock
          .when('idam', false, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(submit.calledOnce).to.equal(true);
            expect(submit.args[0][0]).to.eql('');
          });
        featureMock(done);
      });
    });

    context('submission was successful', () => {
      context('petitioner applied for help with fees', () => {
        beforeEach(done => {
          const newSession = cloneDeep(session);
          newSession.helpWithFeesNeedHelp = 'Yes';

          withSession(done, agent, newSession);
        });

        it('redirects to Pay How page', done => {
          // Act.
          testCustom(done, agent, underTest, [], response => {
            // Assert.
            expect(response.res.statusCode)
              .to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.res.headers.location)
              .to.equal(s.steps.DoneAndSubmitted.url);
          });
        });
      });

      context('petitioner did not apply for help with fees', () => {
        it('redirects to Pay Online page', done => {
          // Act.
          testCustom(done, agent, underTest, [], response => {
            // Assert.
            expect(response.res.statusCode)
              .to.equal(statusCodes.MOVED_TEMPORARILY);
            expect(response.res.headers.location)
              .to.equal(s.steps.PayOnline.url);
          });
        });
      });
    });

    context('submission was not successful', () => {
      it('redirects to the generic error page', done => {
        // Arrange.
        submit.resolves({
          caseId: 0,
          error: 'some error',
          status: 'error'
        });
        // Act.
        testCustom(done, agent, underTest, [], response => {
          // Assert.
          expect(response.res.statusCode)
            .to.equal(statusCodes.MOVED_TEMPORARILY);
          expect(response.res.headers.location)
            .to.equal(s.steps.GenericError.url);
        });
      });
    });

    context('duplicate submission', () => {
      beforeEach(done => {
        session = {
          submissionStarted: true,
          cookie: {},
          expires: Date.now()
        };
        withSession(done, agent, session);
      });
      it('redirects to SubmittedError if submission submitted twice', done => {
        testCustom(done, agent, underTest, [], response => {
          expect(response.res.headers.location)
            .to.equal(s.steps.SubmittedError.url);
        });
      });
    });
  });
});
