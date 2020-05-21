const co = require('co');
const { filter } = require('lodash');
const request = require('supertest');
const { expect } = require('test/util/chai');
const server = require('app');
const validator = require('html-validator');

const maxHtmlValidationRetries = 3;
const htmlValidationTimeout = 5000;

let s = {};
let agent = {};

s = server.init();
agent = request.agent(s.app);

// Build the map to ignore checks which do not generate any HTML
const keysToIgnore = [
  'AdulteryDetails',
  'AdulteryWhen',
  'AdulteryWhere',
  'AdulteryWishToName',
  'Adultery3rdPartyDetails',
  'Adultery3rdPartyAddress',
  'Authenticated',
  'CardPaymentStatus',
  'CheckYourAnswers',
  'DesertionAgree',
  'DesertionDate',
  'DesertionDetails',
  'FinancialArrangements',
  'GovPayStub',
  'Graph',
  'NeedHelpWithFees',
  'ReasonForDivorce',
  'ScreeningQuestionsFinancialRemedy',
  'ScreeningQuestionsMarriageBroken',
  'ScreeningQuestionsMarriageCertificate',
  'ScreeningQuestionsRespondentAddress',
  'SeparationDate',
  'Submit',
  'UnreasonableBehaviour',
  'WithFees'
].reduce(function (res, key) {
  res[key] = true;
  return res;
}, {});

/* eslint-disable */
// FIXME - Ignored errors (temporarily)
const excludeErrors = [
  'Attribute “src” not allowed on element “image” at this point.',
  'Element “image” is missing required attribute “height”.',
  'Element “image” is missing required attribute “width”.'
];
/* eslint-enable */
const filteredErrors = r => {
  return !excludeErrors.includes(r.message);
};

/* eslint-disable */
// FIXME - Ignored errors (temporarily)
const excludeWarnings = [
  'The “type” attribute is unnecessary for JavaScript resources.',
  'The “banner” role is unnecessary for element “header”.',
  'The “main” role is unnecessary for element “main”.',
  'The “contentinfo” role is unnecessary for element “footer”.',
  'The “complementary” role is unnecessary for element “aside”.',
  'The “navigation” role is unnecessary for element “nav”.',
  'The “button” role is unnecessary for element “button”.',
  'Possible misuse of “aria-label”. (If you disagree with this warning, file an issue report or send e-mail to www-validator@w3.org.)'
];
/* eslint-enable */
const filteredWarnings = r => {
  return !excludeWarnings.includes(r.message);
};

const getHTMLValidationResults = step => {
  let rejected = false;

  return new Promise((resolve, reject) => {
    co(function* generator() {
      const res = yield agent.get(step.url);
      const html = res.text;
      let results = [];

      const validationResults = yield validator({
        data: html
      });

      if (validationResults && validationResults.length) {
        results = JSON.parse(validationResults);
      }

      if (!rejected) {
        resolve(results);
      }
    });

    setTimeout((error) => {
      rejected = true;
      reject(error);
    }, htmlValidationTimeout);
  });
};

const testHtml = (step) => {
  let results = {};

  describe(`Validate html for the page ${step.name}`, function() {

    before(function(done) {
      let retries = 0;

      const getValidationResults = () => {
        getHTMLValidationResults(step)
          .then(res => {
            results = res;
            done();
          })
          .catch(() => {
            if(retries < maxHtmlValidationRetries) {
              // there was an error when validating the html, try again
              retries++;
              getValidationResults();
            } else {
              throw new Error('Unable to valiate HTML');
            }
          });
      };

      getValidationResults();
    });

    it('should not have any html errors', () => {
      const errors = filter(results, (r) => r.type === 'error')
        .filter(filteredErrors);

      expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
    });

    it('should not have any html warnings', () => {
      const warnings = filter(results, (r) => r.type === 'info')
        .filter(filteredWarnings);

      expect(warnings.length).to.equal(0, JSON.stringify(warnings, null, 2));
    });
  });
};

for (let stepKey in s.steps) {
  // If step is to be ignored - continue
  if (keysToIgnore[stepKey]) continue;

  testHtml(s.steps[stepKey]);
}