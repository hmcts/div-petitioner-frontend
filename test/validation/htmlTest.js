const w3cjs = require('w3cjs');
const co = require('co');
const { filter } = require('lodash');
const request = require('supertest');
const { expect } = require('test/util/chai');
const server = require('app');

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

for (let stepKey in s.steps) {

// If step is to be ignored - continue
  if (keysToIgnore[stepKey]) continue;

  (function(step) {

    let res;

    describe(`Validate html for the page ${step.name}`, () => {
      before((done) => {
        co(function* generator() {
          res = yield agent.get(step.url);
        }).then(done, done);
      });

      it('should not have any html errors', (done) => {

        if (res.statusCode === 302) {
          // do not validate redirects
          done();
          return;
        }

        w3cjs.validate({
          input: res.text,
          callback: (error, res) => {
            //   For debugging, to check if the response returns any HTML
            //   uncomment the next line :
            //   console.log('HTML CODE : ', res.context);

            if(error) {
              expect(error).to.equal(null, JSON.stringify(error.message, null, 2));
            }

            let errors = filter(res.messages, (r) => r.type === 'error')
              .filter(filteredErrors);

            expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
            done();
          }
        });
      });

      it('should not have any html warnings', (done) => {

        if (res.statusCode === 302) {
          // do not validate redirects
          done();
          return;
        }

        w3cjs.validate({

          input: res.text,

          callback: (error, res) => {
            let warnings = filter(res.messages, (r) => r.type === 'info');
            let filteredWarnings = filter(warnings, (r) =>
            {
              const excluded = [
                'The “type” attribute is unnecessary for JavaScript resources.',
                'The “banner” role is unnecessary for element “header”.',
                'The “main” role is unnecessary for element “main”.',
                'The “contentinfo” role is unnecessary for element “footer”.',
                'The “complementary” role is unnecessary for element “aside”.',
                'The “navigation” role is unnecessary for element “nav”.',
                'The “button” role is unnecessary for element “button”.',
                'Possible misuse of “aria-label”. (If you disagree with this warning, file an issue report or send e-mail to www-validator@w3.org.)'
              ];

              if (excluded.includes(r.message)) {
                return false;
              }

              return true;
            });

            expect(filteredWarnings.length).to.equal(0, JSON.stringify(filteredWarnings, null, 2));

            done();
          }
        });
      });

    });

  })(s.steps[stepKey]);
}