const co = require('co');
const requireDir = require('require-directory');
const { expect } = require('test/util/chai');
const express = require('express');
const request = require('supertest');

const Step = require('app/core/Step');

const statusCode = require('app/core/utils/statusCode');

const fixtures = requireDir(module, `${__dirname}/fixtures`);

class True extends Step {
  get url() {
    return '/true';
  }
}

class NoImplementationErrorsStep extends Step {}

const withStep = (StepClass, test) => {
  const otherSteps = { True: new True() };
  const step = new StepClass(otherSteps, null, null, {});
  return test(step);
};

const mustImplementError = func => {
  return `Steps must override #${func}`;
};

describe('app/core/Step', () => {
  withStep(NoImplementationErrorsStep, step => {
    it('#url throws an error if not implemented', () => {
      expect(() => {
        return step.url;
      }).to.throw(mustImplementError('url'));
    });

    it('#nextStep throws an error if not implmented', () => {
      expect(() => {
        return step.nextStep;
      }).to.throw(mustImplementError('nextStep'));
    });

    it('#template throws an error if #templatePath is not implemented', () => {
      const noTemplateError = `Step ${step.name} has no template file in it's resource folder`;
      expect(() => {
        return step.template;
      }).to.throw(noTemplateError);
    });
  });

  describe('#generateContent()', () => {
    it('should throw an error if no content file is provided', done => {
      co(function* generator() {
        const step = new Step({}, 'screening-questions', null);

        try {
          yield step.generateContent({}, {});
        } catch (error) {
          expect(error.message)
            .to.equal('Step Step has no content.json in it\'s resource folder');
        }
      }).then(done, done);
    });

    it('should return the correctly interpolated content', done => {
      co(function* generator() {
        const step = new Step({}, 'screening-questions', null, fixtures.content.interpolate);

        const ctx = { divorceWho: 'Husband' };
        const session = { 'screening-questions': { respondent: 'Other person' } };

        const content = yield step.generateContent(ctx, session);

        expect(content).to.deep.equal({
          question: 'Do you have an address for your Husband?',
          answer: 'Yes, I do have an address for my Other person'
        });
      }).then(done, done);
    });
  });

  describe('#generateFields()', () => {
    it('should map the ctx to the fields structure required by the templates', done => {
      co(function* generator() {
        const step = new Step({}, 'screening-questions', null);
        const ctx = { divorceWho: 'Husband', respondent: 'Other person' };
        const fields = yield step.generateFields(ctx, {});

        expect(fields).to.deep.equal({
          divorceWho: { value: 'Husband', error: false },
          respondent: { value: 'Other person', error: false }
        });
      }).then(done, done);
    });
  });

  describe('#mapErrorsToFields()', () => {
    it('should map the ctx to the fields structure required by the templates', done => {
      co(function* generator() {
        const step = new Step({}, 'screening-questions', null);
        const errors = [
          { param: 'divorceWho', msg: 'Not my husband' },
          { param: 'generic', msg: 'An error' }
        ];
        const fields = {
          divorceWho: { value: 'Husband', error: false },
          respondent: { value: 'Other person', error: false }
        };

        const fieldsWithErrors = yield step.mapErrorsToFields(errors, fields);
        expect(fieldsWithErrors).to.deep.equal({
          divorceWho: { value: 'Husband', error: true, errorMessage: 'Not my husband' },
          respondent: { value: 'Other person', error: false },
          generic: { error: true, errorMessage: 'An error' }
        });
      }).then(done, done);
    });
  });

  describe('#router', () => {
    const step = new class extends Step {
      get url() {
        return '/step';
      }
    }();
    it('returns an express router', () => {
      expect(step.router).to.be.a('function');
      expect(step.router).itself.to.respondTo('use');
      expect(step.router).itself.to.respondTo('get');
      expect(step.router).itself.to.respondTo('post');
    });
    it('memoises the router', () => {
      expect(step.router).to.eql(step.router);
    });
    it('throws an error if url is not implemented', () => {
      const newStep = new Step();
      expect(() => {
        return newStep.router;
      }).to.throw(mustImplementError('url'));
    });
    it('binds the handler function to the current url', done => {
      const newStep = new class extends Step {
        get url() {
          return '/step';
        }
        handler(req, res) {
          res.status(statusCode.OK).json({ status: 'ok', url: this.url });
        }
      }();
      const app = express();
      app.use(newStep.router);

      request(app)
        .get(newStep.url)
        .expect(statusCode.OK, { status: 'ok', url: newStep.url }, done);
    });
  });
  describe('#middleware', () => {
    it('are executed before the request handler', done => {
      const fooAdder = (req, res, next) => {
        req.foo = 'Foo';
        next();
      };

      const step = new class extends Step {
        get middleware() {
          return [fooAdder];
        }
        get url() {
          return '/step';
        }
        handler(req, res) {
          res.status(statusCode.OK).json({ foo: req.foo });
        }
      }();
      const app = express();
      app.use(step.router);

      request(app)
        .get(step.url)
        .expect(statusCode.OK, { foo: 'Foo' }, done);
    });
    it('are bound to the current step', done => {
      const step = new class extends Step {
        scopedMiddleware(req, res, next) {
          req.stepUrl = this.url;
          next();
        }
        get middleware() {
          return [this.scopedMiddleware];
        }
        get url() {
          return '/step';
        }
        handler(req, res) {
          res.status(statusCode.OK).json({ url: req.stepUrl });
        }
      }();
      const app = express();
      app.use(step.router);

      request(app)
        .get(step.url)
        .expect(statusCode.OK, { url: '/step' }, done);
    });
  });
});
