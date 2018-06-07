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

// Build the map to ingore checks 
// which do not generate any HTML
const keysToIgnore = [
  'Authenticated', 
  'CheckYourAnswers',
  'FinancialArrangements',
  'Adultery3rdPartyAddress',
  'Submit',
  'Start',
  'Graph',
  'Adultery3rdPartyDetails',
  'CardPaymentStatus',
  'ScreeningQuestionsMarriageBroken',
  'ScreeningQuestionsMarriageCertificate',
  'AdulteryDetails',
  'AdulteryWhen',
  'ScreeningQuestionsRespondentAddress',
  'AdulteryWhere',
  'AdulteryWishToName',
  'DesertionAgree',
  'DesertionDetails',
  'DesertionDate',
  'ReasonForDivorce',
  'SeparationDate',
  'UnreasonableBehaviour',
  'NeedHelpWithFees',
  'WithFees',
  'GovPayStub'
].reduce(function (res, key) {
  res[key] = true;
  return res;
}, {});

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

        w3cjs.validate({

          input: res.text,

          callback: (error, res) => {

            //   For debugging, to check if the response returns any HTML
            //   uncomment the next line :
            //   console.log('HTML CODE : ', res.context);

            let errors = filter(res.messages, (r) => r.type === 'error');

            expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));

            done();

          }

        });
      });

      it('should not have any html warnings', (done) => {

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
                'The “navigation” role is unnecessary for element “nav”.'
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