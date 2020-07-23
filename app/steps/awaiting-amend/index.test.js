const request = require('supertest');
const { testContent, testExistence, testCustom } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const co = require('co');
const { expect, sinon } = require('test/util/chai');
const mockAwaitingAmendSession = require('test/fixtures/mockAwaitingAmendSession');
const submission = require('app/services/submission');
const stepsHelper = require('app/core/helpers/steps');

const modulePath = 'app/steps/awaiting-amend';

const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;

let appInstance = {};
let agent = {};
let underTest = {};

const BASE_PATH = '/';
let session = {};
let postBody = {};

describe(modulePath, () => {
  beforeEach(() => {
    appInstance = server.init();
    agent = request.agent(appInstance.app);
    underTest = appInstance.steps.AwaitingAmend;
  });

  afterEach(() => {
    session = {};
    postBody = {};
  });

  describe('renders content', () => {
    const amendSession = mockAwaitingAmendSession;

    beforeEach(done => {
      const oneSecond = 1000;
      session.expires = Date.now() + oneSecond;
      withSession(done, agent, amendSession);
    });

    afterEach(() => {
      session = {};
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, amendSession);
    });
  });

  describe('should show awaiting amends info', () => {
    it('contains main heading', done => {
      testExistence(done, agent, underTest, contentStrings.mainHeading);
    });

    it('contains paragraph 1', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara1);
    });

    it('contains paragraph 2', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara2);
    });

    it('contains paragraph 3', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara3);
    });

    it('contains paragraph 4', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara4);
    });
  });

  describe('should display allocated court info', () => {
    const amendSession = mockAwaitingAmendSession;
    const allocatedCourt = amendSession.court.serviceCentre;

    beforeEach(done => {
      withSession(done, agent, amendSession);
    });

    afterEach(() => {
      session = {};
    });

    it('contains allocated court e-mail once', done => {
      testCustom(done, agent, underTest, [], response => {
        const timesEmailShouldAppearOnPage = 1;
        const emailOccurrencesInPage = response.text.match(new RegExp(allocatedCourt.email, 'g')).length;
        expect(emailOccurrencesInPage).to.equal(timesEmailShouldAppearOnPage);
      });
    });

    it('contains allocated court phone number', done => {
      testExistence(done, agent, underTest, allocatedCourt.phoneNumber);
    });

    it('contains allocated court opening hours', done => {
      testExistence(done, agent, underTest, allocatedCourt.openingHours);
    });
  });

  describe('#submitApplication', () => {
    beforeEach(done => {
      session = {
        submissionStarted: true,
        state: 'AwaitingAmendCase',
        submit: true,
        cookie: {},
        expires: Date.now()
      };
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('redirects to base path when duplicate submission', done => {
      testCustom(done, agent, underTest, [], response => {
        expect(response.res.headers.location).to.equal(BASE_PATH);
      }, 'post', true, postBody);
    });
  });

  describe('#submitApplication', () => {
    let req = {};
    let res = {};
    let amend = {};

    beforeEach(() => {
      req = {
        body: {},
        method: 'POST',
        session: { featureToggles: {}, submit: true, state: 'AwaitingAmendCase', caseId: '123' },
        cookies: { '__auth-token': 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjEyMzQ1Njc4OTAiLCJpZCI6IjEwIn0.sX3u4V8vPF6brlIfF6-k5JxZNI_Yjz__kfHnG9MyOu4' },
        headers: {}
      };
      res = {
        redirect: sinon.stub(),
        sendStatus: sinon.stub()
      };
      amend = sinon.stub().resolves({
        error: null,
        status: 'success',
        caseId: '1234567890'
      });
      sinon.stub(submission, 'setup').returns({ amend });
      sinon.stub(stepsHelper, 'findNextUnAnsweredStep').returns(appInstance.steps.WithFees);
    });

    afterEach(() => {
      req = {};
      res = {};
      submission.setup.restore();
      stepsHelper.findNextUnAnsweredStep.restore();
    });

    it('when continue button is clicked should call submitApplication', done => {
      co(function* generator() {
        const submitApplication = sinon.stub(underTest, 'submitApplication');
        req.body.submit = true;
        yield underTest.postRequest(req, res);
        sinon.assert.calledOnce(submitApplication);
        underTest.submitApplication.restore();
        done();
      });
    });
  });
});
