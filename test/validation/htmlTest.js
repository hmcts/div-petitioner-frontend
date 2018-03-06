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

for (let stepKey in s.steps) {

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

          callback: (res) => {

            let errors = filter(res.messages, (r) => r.type === 'error');

            expect(errors.length).to.equal(0, JSON.stringify(errors, null, 2));

            done();
          }
        });
      });

      it('should not have any html warnings', (done) => {

        w3cjs.validate({

          input: res.text,

          callback: (res) => {

            let warnings = filter(res.messages, (r) => r.type === 'info');

            expect(warnings.length).to.equal(0, JSON.stringify(warnings, null, 2));

            done();
          }
        });
      });
    });

  })(s.steps[stepKey]);
}