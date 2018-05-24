const co = require('co');
const request = require('supertest');
const a11y = require('test/util/a11y');
const { expect } = require('test/util/chai');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
let healthCheckStub = (req, res, next) => { next(); };
let csurfStub = () => {
  return (req, res, next) => {
    req.csrfToken = () => { return 'stubToken'; };
    next();
  };
};
const server = proxyquire('app', { 'app/services/healthcheck': healthCheckStub, 'csurf': csurfStub });
const idamMock = require('test/mocks/idam');
const ValidationStep = require('app/core/steps/ValidationStep');

idamMock.stub();
let s = server.init();
let agent = request.agent(s.app);
let excludeSteps = [
  'PayByCard',
  'CardPaymentStatus',
  'GovPayStub',
  'Submit'
];
idamMock.restore();

for (let stepKey in s.steps) {

  if (!excludeSteps.includes(stepKey)) {

    (function(step) {

      let results;

      describe(`GET Requests - Verify accessibility for the page ${step.name}`, () => {

        before((done) => {

          co(function* generator() {

            results = yield a11y(agent.get(step.url).url);

          }).then(done, done);
        });

        it('should not generate any errors', () => {

          const errors = results
            .filter((res) => res.type === 'error')
            .filter((err) =>
              !step.ignorePa11yErrors.includes(err.code)
            );

          expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
        });

        it('should not generate any warnings', () => {

          const warnings = results
            .filter((res) => res.type === 'warning')
            .filter((warn) =>
              !step.ignorePa11yWarnings.includes(warn.code)
            );

          expect(warnings.length).to.equal(0, JSON.stringify(warnings, null, 2));
        });

      });

      if (step instanceof ValidationStep) {

        describe(`POST Requests - Verify accessibility for the page ${step.name}`, () => {

          before((done) => {

            co(function* generator() {

              results = yield a11y(agent.get(step.url).url, 'POST');

            }).then(done, done);
          });

          it('should not generate any errors', () => {

            const errors = results
              .filter((res) => res.type === 'error')
              .filter((err) =>
                !step.ignorePa11yErrors.includes(err.code)
              );

            expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));
          });

          it('should not generate any warnings', () => {

            const warnings = results
              .filter((res) => res.type === 'warning')
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