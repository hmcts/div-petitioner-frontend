const co = require('co');
const request = require('supertest');
const a11y = require('test/util/a11y');
const { expect } = require('test/util/chai');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
let healthCheckStub = { setup: () => { return; } };
let csurfStub = () => {
  return (req, res, next) => {
    req.csrfToken = () => { return 'stubToken'; };
    next();
  };
};
const server = proxyquire('app', { 'app/services/healthcheck': healthCheckStub, 'csurf': csurfStub });
const idamMock = require('test/mocks/idam');
const ValidationStep = require('app/core/steps/ValidationStep');

let s = server.init();
let agent = request.agent(s.app);
let excludeSteps = [
  'PayByCard',
  'CardPaymentStatus',
  'GovPayStub',
  'Submit'
];

// Ignored Errors
const excludedErrors = [
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.F92,ARIA4',
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail'
];
const filteredErrors = r => {
  return !excludedErrors.includes(r.code);
};

// Ignored Warnings
const excludedWarnings = [
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs',
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Abs',
  'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.BgImage',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48',
  'WCAG2AA.Principle1.Guideline1_3.1_3_1_A.G141'
];
const filteredWarnings = r => {
  return !excludedWarnings.includes(r.code);
};

for (let stepKey in s.steps) {

  if (!excludeSteps.includes(stepKey)) {

    (function(step) {

      let results;

      describe(`GET Requests - Verify accessibility for the page ${step.name}`, () => {

        before((done) => {
          idamMock.stub();

          co(function* generator() {

            results = yield a11y(agent.get(step.url).url);

          }).then(done, done);
        });

        after(() => {
          idamMock.restore();
        });

        it('should not generate any errors', () => {

          const errors = results
            .filter((res) => res.type === 'error')
            .filter(filteredErrors)
            .filter((err) =>
              !step.ignorePa11yErrors.includes(err.code)
            );

          expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
        });

        it('should not generate any warnings', () => {

          const warnings = results
            .filter((res) => res.type === 'warning')
            .filter(filteredWarnings)
            .filter((warn) =>
              !step.ignorePa11yWarnings.includes(warn.code)
            );

          expect(warnings.length).to.equal(0, JSON.stringify(warnings, null, 2));
        });

      });

      if (step instanceof ValidationStep) {

        describe(`POST Requests - Verify accessibility for the page ${step.name}`, () => {

          before((done) => {
            idamMock.stub();
            co(function* generator() {

              results = yield a11y(agent.get(step.url).url, 'POST');

            }).then(done, done);
          });

          after(() => {
            idamMock.restore();
          });

          it('should not generate any errors', () => {

            const errors = results
              .filter((res) => res.type === 'error')
              .filter(filteredErrors)
              .filter((err) =>
                !step.ignorePa11yErrors.includes(err.code)
              );

            expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
          });

          it('should not generate any warnings', () => {

            const warnings = results
              .filter((res) => res.type === 'warning')
              .filter(filteredWarnings)
              .filter((warn) =>
                !step.ignorePa11yWarnings.includes(warn.code)
              );

            expect(warnings.length).to.equal(0, JSON.stringify(warnings, null, 2));
          });

        });

      }


    })(s.steps[stepKey]);

  }
}