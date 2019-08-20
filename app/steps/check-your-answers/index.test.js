const co = require('co');
const request = require('supertest');
const server = require('app');
const { testContent, testExistence, testNonExistence, testCustom, getSession } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const { mockSession } = require('test/fixtures');
const clone = require('lodash').cloneDeep;
const { expect, sinon } = require('test/util/chai');
const idamMock = require('test/mocks/idam');
const featureToggleConfig = require('test/util/featureToggles');
const submission = require('app/services/submission');
const statusCodes = require('http-status-codes');
const ga = require('app/services/ga');
const ExitStep = require('app/core/steps/ExitStep');

const modulePath = 'app/steps/check-your-answers';

const content = require(`${modulePath}/content`);
const commonContent = require('app/content/common');
const { removeStaleData } = require('app/core/helpers/staleDataManager');

const contentStrings = content.resources.en.translation.content;

let s = {};
let agent = {};
let underTest = {};
let session = {};
let req = {};
let res = {};
let fields = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.CheckYourAnswers;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('content', () => {
    beforeEach(done => {
      session = clone(mockSession);
      withSession(done, agent, session);
    });

    it('renders the CYA pages with a complete application ( provided by mock session )', done => {
      const ignoredContent = [
        'continueApplication',
        'confirmDissolve',
        'confirmDissolvePayRespondent',
        'confirmDissolvePayCoRespondent',
        'confirmDissolvePayBoth',
        'confirmDissolveFinancial',
        'confirmDissolvePayRespondentFinancial',
        'confirmDissolvePayCoRespondentFinancial',
        'confirmDissolvePayBothFinancial',
        'submitPayWarning',
        'submitAndPay',
        'titleSoFar',
        'warning'
      ];

      testContent(done, agent, underTest, content, session, ignoredContent);
    });

    it('shows save and close button', done => {
      testExistence(done, agent, underTest,
        commonContent.resources.en.translation.saveAndClose, session);
    });

    it('shows delete application button', done => {
      testExistence(done, agent, underTest,
        content.resources.en.translation.content.deleteApplciation, session);
    });
  });

  describe('content headers', () => {
    beforeEach(done => {
      session = clone(mockSession);
      withSession(done, agent, session);
    });

    it('does not show missing header', done => {
      testNonExistence(done, agent, underTest,
        '<h2 class="govuk-heading-m"></h2>', session);
    });
    it('should show header', done => {
      testExistence(done, agent, underTest,
        content.resources.en.translation.content.jurisdiction, session);
    });
  });

  describe('content', () => {
    beforeEach(done => {
      session = clone(mockSession);
      session.saveAndResumeUrl = '/some-next-step-url';
      withSession(done, agent, session);
    });

    it('renders the continue application button with url set in saveAndResumeUrl', done => {
      testExistence(done, agent, underTest, '/some-next-step-url', session);
    });

    it('removes saveAndResumeUrl in interceptor', done => {
      co(function* generator() {
        yield underTest.interceptor(session, session);
        expect(session.hasOwnProperty('saveAndResumeUrl')).to.eql(false);
      }).then(done, done);
    });

    it('each "Change" link has a aria-label attached to it with some content', done => {
      testCustom(done, agent, underTest, [], response => {
        // Assert.
        const text = response.text;
        const found = text.match(/<a[^>]*>([^<]+)<\/a>/g);
        const testForLabel = link => {
          const isChangeLink = link.indexOf(`>${contentStrings.change}<`) !== -1;
          if (isChangeLink) {
            expect(link.indexOf('aria-label') !== -1, `${link} is missing an aria label`).to.eql(true);
          }
        };
        found.forEach(testForLabel);
      });
    });
  });

  describe('help with fees reference number exists', () => {
    beforeEach(done => {
      session = clone(mockSession);
      session.helpWithFeesReferenceNumber = 'HWF-A1B-23C';
      session.helpWithFeesNeedHelp = 'Yes';
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testExistence(done, agent, underTest,
        contentStrings.submitOnline, session);
    });
  });

  describe('help with fees reference number exists', () => {
    beforeEach(done => {
      session = clone(mockSession);
      session.helpWithFeesReferenceNumber = 'HWF-A1B-23C';
      session.helpWithFeesNeedHelp = 'Yes';
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testNonExistence(done, agent, underTest,
        contentStrings.submitPayWarning, session);
    });
  });

  describe('help with fees reference number does not exists warning', () => {
    beforeEach(done => {
      session = clone(mockSession);
      delete session.helpWithFeesReferenceNumber;
      session.helpWithFeesNeedHelp = 'No';
      delete session.helpWithFeesAppliedForFees;
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testExistence(done, agent, underTest,
        contentStrings.submitPayWarning, session);
    });
  });

  describe('help with fees reference number does not exists payment', () => {
    beforeEach(done => {
      session = clone(mockSession);
      delete session.helpWithFeesReferenceNumber;
      session.helpWithFeesNeedHelp = 'No';
      delete session.helpWithFeesAppliedForFees;
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testExistence(done, agent, underTest,
        contentStrings.submitAndPay, session);
    });
  });

  describe('help with fees reference number does not exist', () => {
    beforeEach(done => {
      session = clone(mockSession);
      session.helpWithFeesReferenceNumber = '';
      session.helpWithFeesNeedHelp = 'Yes';
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testExistence(done, agent, underTest, 'Yes', session);
    });
  });

  describe('prayer section', () => {
    beforeEach(done => {
      session = clone(mockSession);
      withSession(done, agent, session);
    });

    describe('Check your answers confirm prayer dynamic text financial orders only', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes'
        session.claimsCosts = 'No';

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolveFinancial, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text for claiming from both parties only', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes' and claimCostsFrom is ["respondent", "correspondent"]
        session.financialOrder = 'No';

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayBoth, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text for claiming from respondent only', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes' and claimCostsFrom is ["respondent", "correspondent"]
        session.financialOrder = 'No';
        session.claimsCostsFrom = ['respondent'];

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayRespondent, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text for claiming from co-respondent only', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes' and claimCostsFrom is ["respondent", "correspondent"]
        session.financialOrder = 'No';
        session.claimsCostsFrom = ['correspondent'];

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayCoRespondent, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text for claiming from both parties with financial claim', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes' and claimCostsFrom is ["respondent", "correspondent"]

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayBothFinancial, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text for claiming from respondent with financial', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes' and claimCostsFrom is ["respondent", "correspondent"]
        session.claimsCostsFrom = ['respondent'];

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayRespondentFinancial, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text for claiming from co-respondent with financial', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes' and claimCostsFrom is ["respondent", "correspondent"]
        session.claimsCostsFrom = ['correspondent'];

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayCoRespondentFinancial, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });
    });

    describe('Check your answers confirm prayer dynamic text neither claim costs nor financial order', () => {
      beforeEach(done => {
        session = clone(mockSession);
        //  default is claimCosts = 'Yes' and financialOrder = 'Yes'
        session.claimsCosts = 'No';
        session.financialOrder = 'No';

        withSession(done, agent, session);
      });

      it('renders the correct dynamic text', done => {
        testExistence(done, agent, underTest,
          contentStrings.confirmDissolve, session);
      });

      it('does not render the default dynamic text', done => {
        testNonExistence(done, agent, underTest,
          contentStrings.confirmDissolvePayFinancial, session);
      });
    });
  });

  describe('getStepCheckYourAnswersTemplate', () => {
    let ctx = {}, step = {};

    beforeEach(() => {
      session = { chicken: 'gangnam style', initialised: true };

      ctx = {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      };

      fields = { one: 1, two: 2 };

      step = {
        interceptor: sinon.stub().returns(ctx),
        populateWithPreExistingData: sinon.stub().returns(ctx),
        checkYourAnswersInterceptor: sinon.stub().returns(ctx),
        validate: sinon.stub().returns([true, []]),
        generateContent: sinon.stub().returns(content),
        generateCheckYourAnswersContent: sinon.stub().returns(content),
        generateFields: sinon.stub().returns(fields),
        mapErrorsToFields: sinon.stub().returns(fields),
        checkYourAnswersTemplate: `${__dirname}/../../views/common/components/defaultCheckYouAnswersTemplate.html`,
        parseRequest: sinon.stub().returns(ctx),
        section: 'test',
        url: '/test',
        template: 'template',
        properties: {
          prop1: 'prop1',
          prop2: 'prop2',
          prop3: 'prop3'
        }
      };
    });

    it('intercepts the step ctx', done => {
      co(function* generator() {
        yield underTest.getStepCheckYourAnswersTemplate(step, session);
        expect(step.interceptor.calledOnce).to.equal(true);
        done();
      });
    });

    it('generates specific step content using generateCheckYourAnswersContent', done => {
      co(function* generator() {
        yield underTest.getStepCheckYourAnswersTemplate(step, session);
        expect(step.generateCheckYourAnswersContent.calledOnce).to.equal(true);
        done();
      });
    });

    it('validates the step', done => {
      co(function* generator() {
        yield underTest.getStepCheckYourAnswersTemplate(step, session);
        expect(step.validate.calledOnce).to.equal(true);
        done();
      });
    });

    it('checkYourAnswersInterceptor for the step', done => {
      co(function* generator() {
        yield underTest.getStepCheckYourAnswersTemplate(step, session);
        expect(step.checkYourAnswersInterceptor.calledOnce).to.equal(true);
        done();
      });
    });

    it('generateContent for the step', done => {
      co(function* generator() {
        yield underTest.getStepCheckYourAnswersTemplate(step, session);
        expect(step.generateContent.calledOnce).to.equal(true);
        done();
      });
    });

    it('generateFields for the step', done => {
      co(function* generator() {
        yield underTest.getStepCheckYourAnswersTemplate(step, session);
        expect(step.generateFields.calledOnce).to.equal(true);
        done();
      });
    });

    it('returns html for the step', done => {
      co(function* generator() {
        const template = yield underTest.getStepCheckYourAnswersTemplate(
          step, session
        );
        expect(template.html.length).to.not.equal(0);
        done();
      });
    });
  });

  describe('orderTemplatesBasedOnSectionOrder', () => {
    const baseArray = [
      '1',
      '2',
      '3',
      '4'
    ];

    const objectToOrder = {
      4: { category: '4' },
      2: { category: '2' },
      1: { category: '1' },
      3: { category: '3' },
      5: { category: '5' }
    };

    it('sorts array based on a base array', () => {
      const newObject = underTest.orderTemplatesBasedOnArray(
        baseArray, objectToOrder
      );
      const newObjectKeys = Object.keys(newObject);
      expect(newObjectKeys[0]).to.equal('1');
      expect(newObjectKeys[1]).to.equal('2');
      expect(newObjectKeys[2]).to.equal('3');
      expect(newObjectKeys[3]).to.equal('4');
    });

    it('adds extra objects not in base array to the end', () => {
      const newObject = underTest.orderTemplatesBasedOnArray(
        baseArray, objectToOrder
      );
      const newObjectKeys = Object.keys(newObject);
      expect(newObjectKeys[4]).to.equal('5');
    });
  });

  describe('getNextTemplates', () => {
    let ctx = {}, step1 = {}, step2 = {};

    beforeEach(() => {
      session = { chicken: 'gangnam style', initialised: true };

      ctx = {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      };

      fields = { one: 1, two: 2 };

      const stepDefaults = {
        populateWithPreExistingData: sinon.stub().returns(ctx),
        interceptor: sinon.stub().returns(ctx),
        checkYourAnswersInterceptor: sinon.stub().returns(ctx),
        validate: sinon.stub().returns([true, []]),
        generateContent: sinon.stub().returns(content),
        generateCheckYourAnswersContent: sinon.stub().returns(content),
        generateFields: sinon.stub().returns(fields),
        checkYourAnswersTemplate: `${__dirname}/../../views/common/components/defaultCheckYouAnswersTemplate.html`,
        url: '/test',
        name: '',
        template: 'template',
        next: () => { }, // eslint-disable-line no-empty-function
        properties: {
          prop1: 'prop1',
          prop2: 'prop2',
          prop3: 'prop3'
        }
      };

      step2 = Object.assign({}, stepDefaults, {
        url: '/step2',
        name: 'step2'
      });
      step1 = Object.assign({}, stepDefaults, {
        next: () => {
          return step2;
        },
        name: 'step1',
        url: '/step1'
      });
    });

    it('renders templates for all complete', done => {
      co(function* generator() {
        const templates = yield underTest.getNextTemplates(step1, session);
        const TWO_TEMPLATES = 2;
        expect(templates.length).to.equal(TWO_TEMPLATES);
        done();
      });
    });

    it('sets the next step url', done => {
      co(function* generator() {
        yield underTest.getNextTemplates(step1, session);
        expect(session.nextStepUrl).to.equal('/step2');
        done();
      });
    });

    it('does not render template for steps without a checkYourAnswersTemplate', done => {
      co(function* generator() {
        step2 = Object.assign(
          {}, step2, { checkYourAnswersTemplate: '' }
        );

        const templates = yield underTest.getNextTemplates(step1, session);
        expect(templates.length).to.equal(1);
        done();
      });
    });

    it('renders templates for valid steps', done => {
      co(function* generator() {
        step2 = Object.assign(
          {}, step2, { validate: sinon.stub().returns([false, []]) }
        );

        const templates = yield underTest.getNextTemplates(step1, session);
        expect(templates.length).to.equal(1);
        done();
      });
    });

    it('sets the next step url to be last invalid step', done => {
      co(function* generator() {
        step1 = Object.assign(
          {}, step1, { validate: sinon.stub().returns([false, []]) }
        );

        yield underTest.getNextTemplates(step1, session);
        expect(session.nextStepUrl).to.equal('/step1');
        done();
      });
    });

    it('removes the next step url if the last step is an exit step', done => {
      step2 = new ExitStep();
      step2.checkYourAnswersTemplate = `${__dirname}/../../views/common/components/defaultCheckYouAnswersTemplate.html`;

      co(function* generator() {
        const templates = yield underTest.getNextTemplates(step1, session);
        expect(templates.length).to.equal(1);
        done();
      });
    });

    it('renders the correct title', done => {
      testExistence(done, agent, underTest, contentStrings.titleSoFar, session);
    });

    it('renders the correct continue button', done => {
      testExistence(done, agent, underTest,
        contentStrings.continueApplication, session);
    });

    it('only allow template to be rendered once', done => {
      // create loop, step 1 redirects to step 2 and step 2 redirects to step 1
      step2.next = () => {
        return step1;
      };
      co(function* generator() {
        const templates = yield underTest.getNextTemplates(step1, session);
        const two = 2;
        expect(templates.length).to.equal(two);
        done();
      });
    });

    it('stops looking for templates if has generated 501', done => {
      const FIVE_HUNDRED_AND_ONE_TEMPLATES = 501;
      const five = 5;
      let count = five;
      step2.next = () => {
        count += 1;
        step2.url = `/step${count}`;
        return step1;
      };
      step1.next = () => {
        count += 1;
        step1.url = `/step${count}`;
        return step2;
      };
      co(function* generator() {
        const templates = yield underTest.getNextTemplates(step1, session);
        expect(templates.length).to.equal(FIVE_HUNDRED_AND_ONE_TEMPLATES);
        done();
      });
    });
  });

  describe('#postRequest', () => {
    beforeEach(() => {
      req = { body: {}, method: 'POST', session: {}, headers: {} };
      res = {
        redirect: sinon.stub(),
        sendStatus: sinon.stub()
      };

      sinon.stub(underTest, 'validate').returns([true]);
      sinon.stub(underTest, 'submitApplication');
    });

    afterEach(() => {
      underTest.submitApplication.restore();
      underTest.validate.restore();
    });

    context('submission test', () => {
      beforeEach(() => {
        sinon.stub(underTest, 'parseCtx').resolves();
      });

      afterEach(() => {
        underTest.parseCtx.restore();
      });

      it('does not submit application if submit button not clicked', done => {
        co(function* generator() {
          yield underTest.postRequest(req, res);
          expect(underTest.parseCtx.calledOnce).to.equal(true);
          expect(underTest.validate.calledOnce).to.equal(true);
          expect(underTest.submitApplication.called).to.equal(false);
          done();
        });
      });

      it('runs submit application if submission is valid', done => {
        co(function* generator() {
          req.body.submit = true;
          yield underTest.postRequest(req, res);
          expect(underTest.parseCtx.calledOnce).to.equal(true);
          expect(underTest.validate.calledOnce).to.equal(true);
          expect(underTest.submitApplication.calledOnce).to.equal(true);
          done();
        });
      });

      it('does not submit application if invalid', done => {
        co(function* generator() {
          req.body.submit = true;
          underTest.validate.returns([false]);
          yield underTest.postRequest(req, res);
          expect(underTest.parseCtx.calledTwice).to.equal(true);
          expect(underTest.validate.calledTwice).to.equal(true);
          expect(underTest.submitApplication.called).to.equal(false);
          done();
        });
      });
    });

    context('session test', () => {
      it('sets confirmPrayer to Yes when set in the ctx', done => {
        co(function* generator() {
          req.body.submit = true;
          req.body.confirmPrayer = 'Yes';
          yield underTest.postRequest(req, res);
          expect(req.session.confirmPrayer).to.equal('Yes');
          done();
        });
      });
    });
  });

  describe('#submitApplication', () => {
    let submit = {};
    let postBody = {};

    const allocatedCourt = {
      courtId: 'randomlyAllocatedCourt',
      identifiableCentreName: 'Courts and Tribunals Service Centre',
      serviceCentreName: 'Courts and Tribunals Service Centre',
      divorceCentre: 'East Midlands Regional Divorce Centre',
      poBox: 'PO Box 10447',
      courtCity: 'Nottingham',
      postCode: 'NG2 9QN',
      openingHours: 'Telephone Enquiries from: 8.30am to 5pm',
      email: 'contactdivorce@justice.gov.uk',
      phoneNumber: '0300 303 0642',
      siteId: 'AA07'
    };

    beforeEach(done => {
      submit = sinon.stub().resolves({
        error: null,
        status: 'success',
        caseId: '1234567890',
        allocatedCourt
      });
      sinon.stub(submission, 'setup').returns({ submit });
      sinon.stub(ga, 'trackEvent');

      postBody = {
        submit: true,
        confirmPrayer: 'Yes'
      };

      session = {
        question1: 'Yes',
        confirmPrayer: 'Yes',
        submit: true,
        cookie: {},
        expires: Date.now(),
        reasonForDivorce: 'unreasonable-behaviour'
      };
      withSession(done, agent, session);
    });

    afterEach(() => {
      ga.trackEvent.restore();
      submission.setup.restore();
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
      it('redirects to ApplicationSubmitted if submission submitted twice', done => {
        testCustom(done, agent, underTest, [], response => {
          expect(response.res.headers.location)
            .to.equal(s.steps.ApplicationSubmitted.url);
        }, 'post', true, postBody);
      });
    });

    it('loads court data from config and selects one automatically', done => {
      const testSession = () => {
        getSession(agent)
          .then(sess => {
            expect(sess.allocatedCourt).to.be.eql(allocatedCourt);
          })
          .then(done, done);
      };

      testCustom(testSession, agent, underTest, [], () => {
        // do nothing
      }, 'post', true, postBody);
    });

    it('google anayltics is called', done => {
      // Act.
      testCustom(done, agent, underTest, [], () => {
        // Assert.
        expect(ga.trackEvent.calledOnce)
          .to.equal(true);
      }, 'post', true, postBody);
    });

    it('redirects to error page when submission request fails', done => {
      // Arrange.
      submit.rejects();
      // Act.
      testCustom(done, agent, underTest, [], response => {
        // Assert.
        expect(response.status).to.equal(statusCodes.MOVED_TEMPORARILY);
        expect(response.headers.location).to.equal('/generic-error');
      }, 'post', true, postBody);
    });

    context('Idam is turned ON', () => {
      it('uses the token of the logged in user', done => {
        // Arrange.
        const userCookie = ['__auth-token=auth.token', 'connect.sid=abc'];
        // Act.
        const featureTest = featureToggleConfig
          .when('idam', true, testCustom, agent, underTest, userCookie, () => {
            // Assert.
            expect(submit.calledOnce).to.equal(true);
            expect(submit.args[0][1]).to.eql('auth.token');
          }, 'post', true, postBody);
        featureTest(done);
      });
    });

    context('Idam is turned OFF', () => {
      it('uses an empty token for the mocks', done => {
        // Act.
        const featureTest = featureToggleConfig
          .when('idam', false, testCustom, agent, underTest, [], () => {
            // Assert.
            expect(submit.calledOnce).to.equal(true);
            expect(submit.args[0][1]).to.eql('');
          }, 'post', true, postBody);
        featureTest(done);
      });
    });

    context('submission was successful and petitioner applied for help with fees', () => {
      beforeEach(done => {
        const newSession = clone(session);
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
        }, 'post', true, postBody);
      });
    });

    context('submission was successful and petitioner did not apply for help with fees', () => {
      it('redirects to Pay Online page', done => {
        // Act.
        testCustom(done, agent, underTest, [], response => {
          // Assert.
          expect(response.res.statusCode)
            .to.equal(statusCodes.MOVED_TEMPORARILY);
          expect(response.res.headers.location)
            .to.equal(s.steps.PayOnline.url);
        }, 'post', true, postBody);
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
        }, 'post', true, postBody);
      });
    });
  });

  describe('#update AddressBaseUK', () => {
    let submit = {};
    let postBody = {};

    beforeEach(done => {
      submit = sinon.stub().resolves({
        error: null,
        status: 'success',
        caseId: '1234567890'
      });
      sinon.stub(submission, 'setup').returns({ submit });
      sinon.stub(ga, 'trackEvent');

      postBody = {
        submit: true,
        confirmPrayer: 'Yes'
      };

      session = {
        question1: 'Yes',
        confirmPrayer: 'Yes',
        submit: true,
        cookie: {},
        expires: Date.now(),
        petitionerHomeAddress: {
          addressType: 'postcode',
          selectAddressIndex: 0,
          addresses: [
            {
              DPA: {
                UPRN: '100021861927',
                UDPRN: '23903073',
                ADDRESS: '80, LANDOR ROAD, LONDON, SW9 9PE',
                BUILDING_NUMBER: '80',
                THOROUGHFARE_NAME: 'LANDOR ROAD',
                POST_TOWN: 'LONDON',
                POSTCODE: 'SW9 9PE',
                RPC: '1',
                X_COORDINATE: 530318,
                Y_COORDINATE: 175759,
                STATUS: 'APPROVED',
                LOGICAL_STATUS_CODE: '1',
                CLASSIFICATION_CODE: 'P',
                CLASSIFICATION_CODE_DESCRIPTION: 'Parent Shell',
                LOCAL_CUSTODIAN_CODE: 5660,
                LOCAL_CUSTODIAN_CODE_DESCRIPTION: 'LAMBETH',
                POSTAL_ADDRESS_CODE: 'D',
                POSTAL_ADDRESS_CODE_DESCRIPTION: 'A record which is linked to PAF',
                BLPU_STATE_CODE_DESCRIPTION: 'Unknown/Not applicable',
                TOPOGRAPHY_LAYER_TOID: 'osgb1000005560798',
                LAST_UPDATE_DATE: '10/02/2016',
                ENTRY_DATE: '19/03/2001',
                LANGUAGE: 'EN',
                MATCH: 1,
                MATCH_DESCRIPTION: 'EXACT'
              }
            }
          ],
          validPostcode: true,
          postcodeError: false,
          url: '/petitioner-respondent/address',
          formattedAddress: {
            whereabouts: ['80 Landor Road', 'London', 'SW9 9PE'],
            postcode: 'SW9 9PE'
          }
        }
      };
      withSession(done, agent, session);
    });

    afterEach(() => {
      ga.trackEvent.restore();
      submission.setup.restore();
    });

    it('Missing addressBaseUK field is added if an address has been selected', done => {
      const expectAddressBaseUK = {
        addressLine1: '80 LANDOR ROAD',
        addressLine2: '',
        addressLine3: '',
        postCode: 'SW9 9PE',
        postTown: 'LONDON',
        county: '',
        country: 'UK'
      };

      const testSession = () => {
        getSession(agent)
          .then(sess => {
            expect(sess.petitionerHomeAddress.addressBaseUK)
              .to.eql(expectAddressBaseUK);
          })
          .then(done, done);
      };

      testCustom(testSession, agent, underTest, [], response => {
        expect(response.res.headers.location)
          .to.equal(s.steps.ApplicationSubmitted.url);
      },
      'post', true, postBody);
    });
  });

  describe('#isSkippable', () => {
    it('Ensure we visit the check-your-answers page even if a statement of truth was saved to the draft', done => {
      expect(underTest.isSkippable).to.equal(false);
      done();
    });
  });

  describe('Watched session values', () => {
    const thisStepFields = ['confirmPrayer'];

    it('removes confirmPrayer field on load', () => {
      const previousSession = { confirmPrayer: 'Yes' };
      session = clone(previousSession);
      delete session.confirmPrayer;

      const newSession = removeStaleData(previousSession, session);

      thisStepFields.forEach(property => {
        expect(newSession).not.to.have.property(property);
      });
    });
  });
});
