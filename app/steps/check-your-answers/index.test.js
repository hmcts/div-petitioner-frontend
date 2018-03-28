const co = require('co');
const request = require('supertest');
const server = require('app');
const { testContent, testExistence, testRedirect, testNonExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const { mockSession } = require('test/fixtures');
const clone = require('lodash').cloneDeep;
const { expect, sinon } = require('test/util/chai');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');

const modulePath = 'app/steps/check-your-answers';

const content = require(`${modulePath}/content`);
const commonContent = require('app/content/common');

const contentStrings = content.resources.en.translation.content;

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.CheckYourAnswers;
  });

  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });

  describe('content', () => {
    let session = {};

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
        'dontNavigateAwayNotAppliedForFees',
        'titleSoFar'
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

  describe('content', () => {
    let session = {};

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
  });

  describe('help with fees refference number exists', () => {
    let session = {};
    beforeEach(done => {
      session = clone(mockSession);
      session.helpWithFeesReferenceNumber = 'HWF-A1B-23C';
      session.helpWithFeesNeedHelp = 'Yes';
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testNonExistence(done, agent, underTest,
        contentStrings.dontNavigateAwayNotAppliedForFees, session);
    });
  });

  describe('help with fees refference number exists', () => {
    let session = {};
    beforeEach(done => {
      session = clone(mockSession);
      delete session.helpWithFeesReferenceNumber;
      session.helpWithFeesNeedHelp = 'No';
      delete session.helpWithFeesAppliedForFees;
      withSession(done, agent, session);
    });
    it('renders the correct dynamic text', done => {
      testExistence(done, agent, underTest,
        contentStrings.dontNavigateAwayNotAppliedForFees, session);
    });
  });

  describe('prayer section', () => {
    beforeEach(done => {
      const session = clone(mockSession);
      withSession(done, agent, session);
    });

    describe('Check your answers confirm prayer dynamic text financial orders only', () => {
      let session = {};

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
      let session = {};

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
      let session = {};

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
      let session = {};

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
      let session = {};

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
      let session = {};

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
      let session = {};

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
      let session = {};

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

  describe('success', () => {
    beforeEach(() => {
      featureTogglesMock.stub();
    });

    afterEach(() => {
      featureTogglesMock.restore();
    });

    it('redirects to submit step', done => {
      const context = { confirmPrayer: 'Yes' };
      testRedirect(done, agent, underTest, context, s.steps.Submit);
    });
  });

  describe('getStepCtx', () => {
    it('gets properties defined by step from the session', done => {
      co(function* generator() {
        const step = {
          properties: {
            property1: null,
            property2: null
          },
          interceptor: ctx => {
            return ctx;
          }
        };

        const session = {
          property1: 'value1',
          property2: 'value2',
          property3: 'value3'
        };

        const ctx = yield underTest.getStepCtx(step, session);

        expect(ctx.property1).to.equal(session.property1);
        expect(ctx.property2).to.equal(session.property2);

        done();
      });
    });
  });

  describe('getStepCheckYourAnswersTemplate', () => {
    let session = {}, ctx = {}, step = {}, fields = {};

    beforeEach(() => {
      session = { chicken: 'gangnam style', initialised: true };

      ctx = {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      };

      fields = { one: 1, two: 2 };

      step = {
        // getStepCtx: sinon.stub().returns(ctx),
        interceptor: sinon.stub().returns(ctx),
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
    let session = {}, ctx = {}, step1 = {}, step2 = {}, fields = {};

    beforeEach(() => {
      session = { chicken: 'gangnam style', initialised: true };

      ctx = {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      };

      fields = { one: 1, two: 2 };

      const stepDefaults = {
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
        next: () => {}, // eslint-disable-line no-empty-function
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

    it('renderes templates for all complete', done => {
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
        expect(underTest.nextStepUrl).to.equal('/step2');
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
        expect(underTest.nextStepUrl).to.equal('/step1');
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
});
