const { cloneDeep, get, reduce, groupBy } = require('lodash');
const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const nunjucks = require('nunjucks');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const CONF = require('config');

const maximumNumberOfSteps = 500;

module.exports = class CheckYourAnswers extends ValidationStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/check-your-answers';
  }

  get nextStep() {
    return this.steps.Submit;
  }

  * interceptor(ctx, session) {
    //  confirmPrayer and requestMethod are set by parseRequest prior to this call
    // const requestMethod = ctx.requestMethod;
    const confirmPrayer = ctx.confirmPrayer;

    //  set the ctx to the current session then update with the current ctx
    const clonedCtx = cloneDeep(session);
    clonedCtx.confirmPrayer = confirmPrayer;

    // generate and order CYA templates
    const templates = yield this.getNextTemplates(this.steps.Start, clonedCtx);
    clonedCtx.stepTemplates = this.orderTemplatesBasedOnArray(
      this.checkYourAnswersSectionOrder, templates
    );

    const hasNextStep = this.nextStepUrl !== this.url || session.saveAndResumeUrl;
    // set url to `continue application` button
    clonedCtx.nextStepUrl = hasNextStep ? session.saveAndResumeUrl || this.nextStepUrl : undefined; // eslint-disable-line no-undefined

    if (session.saveAndResumeUrl) {
      delete session.saveAndResumeUrl;
    }

    return clonedCtx;
  }

  // the order in which the check your answers section should be shown
  get checkYourAnswersSectionOrder() {
    return [
      'about-your-marriage',
      'jurisdiction',
      'petitioner-respondent',
      'about-divorce',
      'pay'
    ];
  }

  parseRequest(req) {
    const ctx = super.parseRequest(req);

    // if confirmPrayer has no value, set it to false
    ctx.confirmPrayer = ctx.confirmPrayer || false;

    ctx.requestMethod = req.method.toLowerCase();

    const isPost = ctx.requestMethod === 'post';

    // always set confirmPrayer to false on entering the page
    if (!isPost) {
      ctx.confirmPrayer = false;
    }

    return ctx;
  }

  getStepCtx(step, session = {}) {
    let ctx = {};

    // schemaScope is used for addresses
    if (step.schemaScope) {
      ctx = cloneDeep(get(session, step.schemaScope, {}));
    } else {
      const stepProperties = step.properties ? Object.keys(step.properties) : {};
      ctx = reduce(stepProperties, (context, key) => {
        context[key] = get(session, key);
        return context;
      }, {});
    }

    return ctx;
  }

  * getStepCheckYourAnswersTemplate(step, session) {
    // generate the context for the step
    let stepCtx = yield this.getStepCtx(step, session);

    // run the step interceptor
    stepCtx = yield step.interceptor(stepCtx, session);

    // ensure step is valid
    const [isValid] = yield step.validate(stepCtx, session);
    if (!isValid) {
      return;
    }

    stepCtx = yield step.checkYourAnswersInterceptor(stepCtx, session);

    const checkYourAnswersContent = yield this.generateContent(
      stepCtx, session
    );

    // generate content
    const content = yield step.generateContent(stepCtx, session);
    const checkYourAnswersSpecificContent = yield step.generateCheckYourAnswersContent( // eslint-disable-line max-len
      stepCtx, session
    );
    Object.assign(
      content,
      checkYourAnswersSpecificContent,
      checkYourAnswersContent,
      { url: step.url }
    );

    // generate fields
    const fields = yield step.generateFields(stepCtx, session);

    // ensure there are some fields to show
    if (Object.keys(fields).length) {
      // render check your answers templates
      const html = nunjucks.render(
        step.checkYourAnswersTemplate, { content, fields, session }
      );

      // push template into array to render in cya template
      // use the root url to catogorize the template
      return { // eslint-disable-line consistent-return
        category: step.url.split('/')[1],
        html
      };
    }
  }

  orderTemplatesBasedOnArray(baseArray, objectToOrder) {
    // group templates by the category
    const objectToOrderOrdered = groupBy(objectToOrder, stepTemplate => {
      return stepTemplate.category;
    });

    const sortedTemplates = baseArray.reduce((templates, section) => {
      templates[section] = objectToOrderOrdered[section];
      delete objectToOrderOrdered[section];
      return templates;
    }, {});

    // append any missed categories. e.g. if we dont have the section 'about-your-marriage'
    // in our checkYourAnswersSectionOrder then add it to end of the list
    Object.assign(sortedTemplates, objectToOrderOrdered);

    return sortedTemplates;
  }

  // recursive function to generate array of CYA templates
  * getNextTemplates(step, session, previousQuestionsRendered = []) { // eslint-disable-line complexity
    let templates = [];

    // Do not render the same template more than once
    // if the application is attempting to render question more than once 
    // we know user has not completed the questions and can show answered
    // questions up to this point
    if (previousQuestionsRendered.includes(step.url)) {
      logger.warn('Application is attempting to render the same template more than once');
      if (CONF.deployment_env !== 'prod') {
        logger.warn(`Session when application attempted to render same template more than once ${JSON.stringify(session)}`);
      }
      return templates;
    }

    previousQuestionsRendered.push(step.url);

    // save the next steps url for use with the `continue application` button
    this.nextStepUrl = step.url;

    // ensure step has a template to render i.e. screening questions dont have CYA templates
    if (step.checkYourAnswersTemplate) {
      const stepTemplate = yield this.getStepCheckYourAnswersTemplate(
        step, session
      );
      if (stepTemplate) {
        templates.push(stepTemplate);
      } else {
        // template failed to create, step must be incomplete so stop loop here
        return templates;
      }
    }

    let nextStep; // eslint-disable-line init-declarations

    // Put catch here because 'next' function throws
    // error if step doesn't have valid next step
    try {
      let nextStepCtx = yield this.getStepCtx(step, session);
      // run the step interceptor - some next step logic is created in the interceptor
      // eslint-disable-next-line no-warning-comments
      // TODO: this can be removed when all nextStep logic is moved to next function
      nextStepCtx = yield step.interceptor(nextStepCtx, session);

      nextStep = step.next(nextStepCtx, session);
    } catch (error) {
      //
    }

    if (nextStep === this) {
      delete this.nextStepUrl;
    }

    // if next step and next step is not check your answers
    if (nextStep && nextStep !== this) {
      if (previousQuestionsRendered.length > maximumNumberOfSteps) {
        logger.error('Application has entered a never ending loop. Stop attempting to build CYA template and return answers up until this point');
        if (CONF.deployment_env !== 'prod') {
          logger.error(`Session when stopped never ending loop ${JSON.stringify(session)}`);
        }
        return templates;
      }

      const getNextTemplates = yield this.getNextTemplates(
        nextStep,
        session,
        previousQuestionsRendered
      );
      templates = [...templates, ...getNextTemplates];
    }

    return templates;
  }
};
