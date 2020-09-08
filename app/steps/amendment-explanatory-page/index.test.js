const request = require('supertest');
const { testContent, testExistence, testCustom } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const { expect, sinon } = require('test/util/chai');
const mockAwaitingAmendSession = require('test/fixtures/mockAwaitingAmendSession');
const mockAmendedSession = require('test/fixtures/mockAmendedSession');
const submission = require('app/services/submission');

const modulePath = 'app/steps/amendment-explanatory-page';

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
    postBody = {
      submit: true
    };
  });

  afterEach(() => {
    session = {};
    postBody = {};
  });

  describe('renders content', () => {
    beforeEach(done => {
      const oneSecond = 1000;
      session = mockAwaitingAmendSession;
      session.expires = Date.now() + oneSecond;
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('renders the content from the content file', done => {
      const exclude = [
        'files.respondentAnswers',
        'files.coRespondentAnswers',
        'files.certificateOfEntitlement',
        'files.costsOrder',
        'files.dnAnswers',
        'files.clarificationDnRefusalOrder',
        'files.rejectionDnRefusalOrder',
        'files.deemedAsServedGranted',
        'files.dispenseWithServiceGranted',
        'files.DeemedServiceRefused',
        'files.DispenseWithServiceRefused'
      ];
      testContent(done, agent, underTest, content, session, exclude);
    });

    it('displays link for `How To Respond`', done => {
      testExistence(done, agent, underTest,
        contentStrings.howToRespondLink);
    });
  });

  describe('renders document', () => {
    const amendSession = mockAwaitingAmendSession;

    beforeEach(done => {
      session.d8 = [
        {
          id: '401ab79e-34cb-4570-9f2f-4cf9357m4st3r',
          createdBy: 0,
          createdOn: null,
          lastModifiedBy: 0,
          modifiedOn: null,
          fileName: 'd8petition1554740111371638.pdf',
          // eslint-disable-next-line max-len
          fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/30acaa2f-84d7-4e27-adb3-69551560113f',
          mimeType: null,
          status: null
        },
        {
          id: '401ab79e-34cb-4570-9f2f-4cf9357m4st3r',
          createdBy: 0,
          createdOn: null,
          lastModifiedBy: 0,
          modifiedOn: null,
          fileName: 'somethingNotD81554740111371638.pdf',
          // eslint-disable-next-line max-len
          fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/30acaa2f-84d7-4e27-adb3-69551560113f',
          mimeType: null,
          status: null
        }
      ];
      withSession(done, agent, amendSession);
    });

    afterEach(() => {
      session = {};
    });

    it('returns the correct file', () => {
      const fileTypes = underTest.getDownloadableFiles(session).map(file => {
        return file.type;
      });

      expect(fileTypes).to.eql(['dpetition']); // for d8petition. Numbers are removed from file type by document handler
    });
  });

  describe('Awaiting amends info', () => {
    beforeEach(done => {
      const oneSecond = 1000;
      session = mockAwaitingAmendSession;
      session.expires = Date.now() + oneSecond;
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('should contains main heading', done => {
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
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara4, { divorceWho: 'wife' });
    });
  });

  describe('should display service center info', () => {
    const amendSession = mockAwaitingAmendSession;
    const serviceCentre = amendSession.court.serviceCentre;

    beforeEach(done => {
      withSession(done, agent, amendSession);
    });

    afterEach(() => {
      session = {};
    });

    it('contains serviceCentre court e-mail once', done => {
      testCustom(done, agent, underTest, [], response => {
        const timesEmailShouldAppearOnPage = 1;
        const emailOccurrencesInPage = response.text.match(new RegExp(serviceCentre.email, 'g')).length;
        expect(emailOccurrencesInPage).to.equal(timesEmailShouldAppearOnPage);
      });
    });

    it('contains serviceCentre phone number', done => {
      testExistence(done, agent, underTest, serviceCentre.phoneNumber);
    });

    it('contains serviceCentre opening hours', done => {
      testExistence(done, agent, underTest, serviceCentre.openingHours);
    });
  });

  describe('#postRequest', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      req = {
        body: {},
        method: 'POST',
        session: { featureToggles: {}, state: 'AwaitingAmendCase', caseId: '123' },
        cookies: { '__auth-token': 'fake.token' },
        headers: {}
      };
      res = {
        redirect: sinon.stub(),
        sendStatus: sinon.stub()
      };

      sinon.stub(underTest, 'submitApplication');
    });

    afterEach(() => {
      req = {};
      res = {};
      underTest.submitApplication.restore();
    });

    it('redirects to base path when submitted without button', done => {
      postBody = {};
      testCustom(done, agent, underTest, [], response => {
        expect(response.res.headers.location).to.equal(BASE_PATH);
      }, 'post', true, postBody);
    });

    it('runs submit application if submission is valid', async () => {
      req.body.submit = true;
      await underTest.postRequest(req, res);
      expect(underTest.submitApplication.calledOnce).to.equal(true);
    });

    it('does not submit application if invalid', async () => {
      await underTest.postRequest(req, res);
      expect(underTest.submitApplication.called).to.equal(false);
    });

    it('return required properties from old session', () => {
      Object.assign(req.session, {
        csrfSecret: 'csrfSecret',
        fetchedDraft: true,
        expires: Date.now(),
        someOther: 'someOther',
        cookie: 'cookie'
      });

      const values = underTest.getRetainedSessionProperties(req);

      expect(values).to.not.have.property('someOther');
      expect(values).to.have.all.keys('csrfSecret', 'fetchedDraft', 'expires', 'cookie', 'featureToggles');
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
        cookies: { '__auth-token': 'fake.token' },
        headers: {}
      };
      res = {
        redirect: sinon.stub(),
        sendStatus: sinon.stub()
      };
      amend = sinon.stub().resolves(mockAmendedSession);
      sinon.stub(submission, 'setup').returns({ amend });
    });

    afterEach(() => {
      req = {};
      res = {};
      submission.setup.restore();
    });

    it('when continue button is clicked should call submitApplication', async () => {
      const submitApplication = sinon.stub(underTest, 'submitApplication');
      req.body.submit = true;

      await underTest.postRequest(req, res);

      sinon.assert.calledOnce(submitApplication);
      underTest.submitApplication.restore();
    });

    it('when continue button is clicked should request amend and redirect to Index', done => {
      testCustom(done, agent, underTest, [], response => {
        expect(amend.calledOnce).to.equal(true);
        expect(response.res.headers.location).to.equal(appInstance.steps.Index.url);
      }, 'post', true, postBody);
    });

    it('when continue button is clicked and request to amend returns an error should redirect to generic error page', done => {
      amend.rejects();

      testCustom(done, agent, underTest, [], response => {
        expect(amend.calledOnce).to.equal(true);
        expect(response.res.headers.location).to.equal(appInstance.steps.GenericError.url);
      }, 'post', true, postBody);
    });
  });
});
