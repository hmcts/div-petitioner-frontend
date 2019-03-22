/* eslint-disable max-nested-callbacks */
const { expect, sinon } = require('test/util/chai');
const featureToggleConfig = require('test/util/featureToggles');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const parseRequest = require('app/core/helpers/parseRequest');
const server = require('app');
const stepsHelper = require('app/core/helpers/steps');
const co = require('co');

const modulePath = 'app/middleware/draftPetitionStoreMiddleware';

const draftPetitionStoreMiddleware = require(modulePath);

const { saveSessionToDraftStoreAndReply } = draftPetitionStoreMiddleware;

let s = {};
let req = {};
let res = {};
let next = {};
let checkYourAnswersUrl = '';

describe(modulePath, () => {
  before(() => {
    s = server.init();
    checkYourAnswersUrl = s.steps.CheckYourAnswers.url;
  });

  describe('#redirectToCheckYourAnswers', () => {
    beforeEach(() => {
      res = {
        redirect: sinon.stub(),
        locals: { steps: s.steps }
      };
      req = {};
      next = sinon.stub();
    });
    it('redirects to check your answers if current page is not check your answers', () => {
      req = { originalUrl: '/not-cya' };
      draftPetitionStoreMiddleware.redirectToCheckYourAnswers(req, res, next);
      expect(next.called).to.eql(false);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith(checkYourAnswersUrl)).to.eql(true);
    });
    it('runs `next()` if page is already check your answers', () => {
      req = { originalUrl: checkYourAnswersUrl };
      draftPetitionStoreMiddleware.redirectToCheckYourAnswers(req, res, next);
      expect(next.calledOnce).to.eql(true);
      expect(res.redirect.called).to.eql(false);
    });
  });

  describe('#redirectToNextUnansweredQuestion', () => {
    beforeEach(() => {
      res = {
        redirect: sinon.stub(),
        locals: { steps: s.steps }
      };
      req = {};
      next = sinon.stub();
      sinon.stub(stepsHelper, 'findNextUnAnsweredStep').resolves(s.steps.WithFees);
    });

    afterEach(() => {
      stepsHelper.findNextUnAnsweredStep.restore();
    });

    it('redirects to next UnAnsweredStep if url does not equal the next UnAnsweredStep', done => {
      req = { originalUrl: '/not-with-fees-url' };

      co(function* generator() {
        yield draftPetitionStoreMiddleware
          .redirectToNextUnansweredQuestion(req, res, next);

        expect(next.called).to.eql(false);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(res.redirect.calledWith(s.steps.WithFees.url)).to.eql(true);
      }).then(done, done);
    });

    it('runs `next()` if page is already UnAnsweredStep', done => {
      req = { originalUrl: s.steps.WithFees.url };

      co(function* generator() {
        yield draftPetitionStoreMiddleware
          .redirectToNextUnansweredQuestion(req, res, next);

        expect(next.called).to.eql(true);
        expect(res.redirect.calledOnce).to.eql(false);
      }).then(done, done);
    });
  });

  describe('#redirectToNextPage', () => {
    beforeEach(() => {
      res = {
        redirect: sinon.stub(),
        locals: { steps: s.steps }
      };
      req = { query: {} };
      next = sinon.stub();
      sinon.stub(stepsHelper, 'findNextUnAnsweredStep').resolves(s.steps.WithFees);
    });

    afterEach(() => {
      stepsHelper.findNextUnAnsweredStep.restore();
    });

    it('redirects to next UnAnsweredStep if case is an amend case', done => {
      req = {
        originalUrl: '/not-with-fees-url',
        session: { previousCaseId: '1234' }
      };

      co(function* generator() {
        yield draftPetitionStoreMiddleware
          .redirectToNextPage(req, res, next);

        expect(next.called).to.eql(false);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(res.redirect.calledWith(s.steps.WithFees.url)).to.eql(true);
      }).then(done, done);
    });

    it('catches error with #redirectToNextUnansweredQuestion and redirects to CYA', done => {
      stepsHelper.findNextUnAnsweredStep.rejects('Error');
      req = {
        originalUrl: '/not-with-fees-url',
        session: { previousCaseId: '1234' }
      };

      co(function* generator() {
        yield draftPetitionStoreMiddleware
          .redirectToNextPage(req, res, next);

        expect(next.called).to.eql(false);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(res.redirect.calledWith(checkYourAnswersUrl)).to.eql(true);
      }).then(done, done);
    });

    it('redirects to next CYA if no query string has toNextUnansweredPage', () => {
      req = {
        originalUrl: '/not-cya',
        session: {}
      };

      draftPetitionStoreMiddleware.redirectToNextPage(req, res, next);
      expect(next.called).to.eql(false);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith(checkYourAnswersUrl)).to.eql(true);
    });
  });

  describe('#restoreFromDraftStore', () => {
    beforeEach(() => {
      res = {
        redirect: sinon.stub(),
        locals: { steps: s.steps }
      };
      req = {
        cookies: { '__auth-token': 'auth.token' },
        session: { expires: 1 }
      };
      next = sinon.stub();
      sinon.stub(mockedClient, 'restoreFromDraftStore');
    });

    afterEach(() => {
      mockedClient.restoreFromDraftStore.restore();
    });

    context('session restored', () => {
      it('redirect to check your answers page with new session', done => {
        const mockSession = Object.assign(
          { expires: 1 },
          mockedClient.mockSession
        );

        mockedClient.restoreFromDraftStore.resolves(mockSession);

        const test = cleanUp => {
          draftPetitionStoreMiddleware.restoreFromDraftStore(req, res, next);
          // wait for promise to resolve
          setTimeout(() => {
            expect(mockedClient.restoreFromDraftStore.called).to.equal(true);
            expect(res.redirect.calledOnce).to.eql(true);
            expect(res.redirect.calledWith(checkYourAnswersUrl)).to.eql(true);
            expect(req.session).to.eql(mockSession);
            cleanUp();
          }, 1);
        };
        const featureTest = featureToggleConfig.when('idam', true, test);
        featureTest(done);
      });

      it('restore session with blacklisted element, blacklisted elements are filtered', done => {
        const mockSession = Object.assign({
          expires: 1,
          cookie: '',
          sessionKey: '',
          saveAndResumeUrl: '',
          submissionStarted: 'true',
          csrfSecret: 'csrf'
        }, mockedClient.mockSession);

        mockedClient.restoreFromDraftStore.resolves(mockSession);

        const test = cleanUp => {
          draftPetitionStoreMiddleware.restoreFromDraftStore(req, res, next);
          // wait for promise to resolve
          setTimeout(() => {
            expect(mockedClient.restoreFromDraftStore.called).to.equal(true);
            expect(res.redirect.calledOnce).to.eql(true);
            expect(res.redirect.calledWith(checkYourAnswersUrl)).to.eql(true);

            const sessionShouldMatch = Object.assign(
              { expires: 1 },
              mockedClient.mockSession
            );
            expect(req.session).to.eql(sessionShouldMatch);
            cleanUp();
          }, 1);
        };
        const featureTest = featureToggleConfig.when('idam', true, test);
        featureTest(done);
      });

      it('does not attempt to restore if we have already fetched from Draft store', done => {
        req.session = { screenHasMarriageBroken: true, fetchedDraft: true };
        const test = cleanUp => {
          draftPetitionStoreMiddleware.restoreFromDraftStore(req, res, next);
          // wait for promise to resolve
          setTimeout(() => {
            expect(mockedClient.restoreFromDraftStore.called).to.equal(false);
            expect(next.calledOnce).to.eql(true);
            cleanUp();
          }, 1);
        };
        const featureTest = featureToggleConfig.when('idam', true, test);
        featureTest(done);
      });
      it('does not attempt to restore session if no auth token populated', done => {
        req.cookies = {};
        const test = cleanUp => {
          draftPetitionStoreMiddleware.restoreFromDraftStore(req, res, next);
          // wait for promise to resolve
          setTimeout(() => {
            expect(mockedClient.restoreFromDraftStore.called).to.equal(false);
            expect(next.calledOnce).to.eql(true);
            cleanUp();
          }, 1);
        };
        const featureTest = featureToggleConfig.when('idam', true, test);
        featureTest(done);
      });
    });

    it('restores session if mockRestoreSession cookie set', done => {
      req.cookies = { mockRestoreSession: 'true' };
      mockedClient.restoreFromDraftStore.resolves(mockedClient.mockSession);

      co(function* generator() {
        yield draftPetitionStoreMiddleware
          .restoreFromDraftStore(req, res, next);

        expect(mockedClient.restoreFromDraftStore.called).to.equal(true);
        expect(res.redirect.calledOnce).to.eql(true);
        expect(res.redirect.calledWith(checkYourAnswersUrl)).to.eql(true);

        const sessionShouldMatch = Object.assign(
          { expires: 1 },
          mockedClient.mockSession
        );
        expect(req.session).to.eql(sessionShouldMatch);
      }).then(done, done);
    });

    it('saveSessionToDraftStoreAndReply() with save only header', async () => {
      const sandbox = sinon.sandbox.create();
      const parsedRequestBody = { bar: 1 };
      const json = sinon.stub();
      const request = {
        headers: { 'x-save-draft-session-only': true },
        cookies: { '__auth-token': '1234' },
        session: { foo: 1 }
      };
      const response = { status: sandbox.stub().returns({ json }) };

      sandbox
        .stub(parseRequest, 'parse')
        .returns(parsedRequestBody);
      sandbox
        .stub(mockedClient, 'saveToDraftStore')
        .resolves();

      await saveSessionToDraftStoreAndReply(request, response);

      expect(mockedClient.saveToDraftStore.args)
        .to.deep.equal([
          [
            '1234',
            { foo: 1, bar: 1 }
          ]
        ]);

      expect(json.args)
        .to.deep.equal([[{ message: 'ok' }]]);

      sandbox.restore();
    });

    it('saveSessionToDraftStoreAndReply() catches error', async () => {
      const sandbox = sinon.sandbox.create();
      const request = {
        headers: { 'x-save-draft-session-only': true },
        cookies: {},
        session: {}
      };
      const json = sinon.stub();
      const response = { status: sandbox.stub().returns({ json }) };

      sandbox
        .stub(parseRequest, 'parse')
        .returns({});
      sandbox
        .stub(mockedClient, 'saveToDraftStore')
        .rejects({});

      await saveSessionToDraftStoreAndReply(request, response);

      expect(json.args)
        .to.deep.equal([[{ message: 'Error saving session to draft store' }]]);

      sandbox.restore();
    });

    it('saveSessionToDraftStoreAndReply() no save only header', () => {
      const nextFunc = sinon.stub();
      const request = { headers: {} };
      const response = {};

      saveSessionToDraftStoreAndReply(request, response, nextFunc);

      expect(nextFunc.callCount)
        .to.equal(1);
    });
  });
});
