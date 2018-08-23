const { cloneDeep, get, reduce, groupBy, forEach } = require('lodash');
const ValidationStep = require('app/core/steps/ValidationStep');
const nunjucks = require('nunjucks');
const logger = require('app/services/logger').logger(__filename);
const CONF = require('config');
const statusCodes = require('http-status-codes');
const submissionService = require('app/services/submission');
const sessionBlacklistedAttributes = require('app/resources/sessionBlacklistedAttributes');
const courtsAllocation = require('app/services/courtsAllocation');
const ga = require('app/services/ga');
const addressHelpers = require('../../components/AddressLookupStep/helpers/addressHelpers');

const maximumNumberOfSteps = 500;

module.exports = class CheckYourAnswers extends ValidationStep {
  get url() {
    return '/check-your-answers';
  }

  next(ctx, session) {
    if (session.helpWithFeesNeedHelp === 'Yes') {
      return this.steps.DoneAndSubmitted;
    }
    return this.steps.PayOnline;
  }

  * getRequest(req, res) {
    if (CONF.features.redirectToApplicationSubmitted && req.session.caseSubmitted) {
      return res.redirect(this.steps.ApplicationSubmitted.url);
    }
    return yield super.getRequest(req, res);
  }

  * postRequest(req, res) {
    // test to see if user has clicked submit button. The form could have been submitted
    // by clicking on save and close button
    const { body } = req;
    const hasBeenPostedWithoutSubmitButton = body && !body.hasOwnProperty('submit');

    if (hasBeenPostedWithoutSubmitButton) {
      return yield super.postRequest(req, res);
    }

    const { session } = req;
    const ctx = yield this.parseCtx(req);

    //  then test whether the request is valid
    const [isValid] = this.validate(ctx, session);

    if (isValid) {
      // apply ctx to session (this adds confirmPrayer to session before submission)
      req.session = this.applyCtxToSession(ctx, session);
      // if application is valid submit it
      return this.submitApplication(req, res);
    }

    return yield super.postRequest(req, res);
  }

  * interceptor(ctx, session) {
    const confirmPrayer = ctx.confirmPrayer;

    //  set the ctx to the current session then update with the current ctx
    const clonedCtx = cloneDeep(session);
    clonedCtx.confirmPrayer = confirmPrayer;

    // generate and order CYA templates
    const templates = yield this.getNextTemplates(this.steps.Start, clonedCtx);
    clonedCtx.stepTemplates = this.orderTemplatesBasedOnArray(
      this.checkYourAnswersSectionOrder, templates
    );

    const hasNextStep = clonedCtx.nextStepUrl !== this.url || session.saveAndResumeUrl;
    // set url to `continue application` button
    clonedCtx.nextStepUrl = hasNextStep ? session.saveAndResumeUrl || clonedCtx.nextStepUrl : undefined; // eslint-disable-line no-undefined

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
    let stepCtx = this.getStepCtx(step, session);

    // run the step interceptor
    stepCtx = yield step.interceptor(stepCtx, session);

    // ensure step is valid
    const [isValid] = step.validate(stepCtx, session);
    if (!isValid) {
      return;
    }

    stepCtx = step.checkYourAnswersInterceptor(stepCtx, session);

    const checkYourAnswersContent = this.generateContent(
      stepCtx, session
    );

    // generate content
    const content = step.generateContent(stepCtx, session);
    const checkYourAnswersSpecificContent = step.generateCheckYourAnswersContent( // eslint-disable-line max-len
      stepCtx, session
    );
    Object.assign(
      content,
      checkYourAnswersSpecificContent,
      checkYourAnswersContent,
      { url: step.url }
    );

    // generate fields
    const fields = step.generateFields(stepCtx, session);

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
        logger.warn({
          message: 'Session when application attempted to render same template more than once',
          session
        });
      }
      return templates;
    }

    previousQuestionsRendered.push(step.url);

    // save the next steps url for use with the `continue application` button
    session.nextStepUrl = step.url;

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
      let nextStepCtx = this.getStepCtx(step, session);
      // run the step interceptor - some next step logic is created in the interceptor
      // eslint-disable-next-line no-warning-comments
      // TODO: this can be removed when all nextStep logic is moved to next function
      nextStepCtx = yield step.interceptor(nextStepCtx, session);

      nextStep = step.next(nextStepCtx, session);
    } catch (error) {
      //
    }

    if (nextStep === this) {
      delete session.nextStepUrl;
    }

    // if next step and next step is not check your answers
    if (nextStep && nextStep !== this) {
      if (previousQuestionsRendered.length > maximumNumberOfSteps) {
        logger.error('Application has entered a never ending loop. Stop attempting to build CYA template and return answers up until this point');
        if (CONF.deployment_env !== 'prod') {
          logger.error({
            message: 'Session when stopped never ending loop',
            session
          });
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

  submitApplication(req, res) {
    if (req.session.submissionStarted) {
      res.redirect(this.steps.ApplicationSubmitted.url);
      return;
    }

    // Fail early if the request is not in the right format.
    const { cookies } = req;

    if (!cookies || !cookies['connect.sid']) {
      logger.error('Malformed request to Submit step');
      const step = this.steps.Error400;
      const content = step.generateContent();
      res.status(statusCodes.BAD_REQUEST);
      res.render(step.template, { content });
      return;
    }

    req.session = req.session || {};

    // add all missing addressBaseUK fields
    forEach(req.session, element => {
      if (element && typeof element === 'object' && element.selectAddressIndex >= 0 && element.addresses && element.addresses.length > 0 && !element.addressBaseUK) {
        element.addressBaseUK = addressHelpers
          .buildAddressBaseUk(element.addresses[element
            .selectAddressIndex]);
      }
    }
    );

    // Load courts data into session and select court automatically.
    req.session.court = CONF.commonProps.court;
    req.session.courts = courtsAllocation.allocateCourt();
    ga.trackEvent('Court_Allocation', 'Allocated_court', req.session.courts, 1);

    // Get user token.
    let authToken = '';
    if (CONF.features.idam) {
      authToken = req.cookies['__auth-token'];
    }

    // We blacklist a few session keys which are internal to the application and
    // are not needed for the submission.
    const payload = sessionBlacklistedAttributes.reduce((acc, item) => {
      delete acc[item];
      return acc;
    }, Object.assign({}, req.session));
    const submission = submissionService.setup();

    req.session.submissionStarted = true;

    submission.submit(authToken, payload)
      .then(response => {
        // Check for errors.
        if (response && response.error) {
          throw Object.assign({}, { message: `Error in transformation response, ${JSON.stringify(response)}` });
        }
        if (response && !response.caseId) {
          throw Object.assign({}, { message: `Case ID missing in transformation response, ${JSON.stringify(response)}` });
        }
        delete req.session.submissionStarted;
        // Store the resulting case identifier in session for later use.
        req.session.caseId = response.caseId;
        req.session.caseSubmitted = true;
        res.redirect(this.next(null, req.session).url);
      })
      .catch(error => {
        delete req.session.submissionStarted;
        logger.error(`Error during submission step: ${JSON.stringify(error)}`);
        res.redirect('/generic-error');
      });
  }
};
