const co = require('co');
const requireDir = require('require-directory');
const { expect, sinon } = require('test/util/chai');
const express = require('express');
const request = require('supertest');
const statusCodes = require('http-status-codes');

const modulePath = 'app/core/steps/Step';

const Step = require(modulePath);

const fixtures = requireDir(module, `${__dirname}/../fixtures`);

class True extends Step {
  get url() {
    return '/true';
  }
}

const withStep = (StepClass, test) => {
  const otherSteps = { True: new True() };
  const step = new StepClass(otherSteps, null, null, {});
  return test(step);
};

describe(modulePath, () => {
  withStep(Step, step => {
    it('#url is null if not implemented', () => {
      expect(step.url)
        .to.equal(null);
    });

    it('#nextStep returns null if not implmented', () => {
      expect(step.nextStep)
        .to.equal(null);
    });

    it('#template returns null if #templatePath is not implemented', () => {
      expect(step.template)
        .to.equal(null);
    });

    it('#template returns string if templatePath defined', () => {
      const templatePath = 'path/to/template';
      step.templatePath = templatePath;
      expect(step.template).to.eql(`${templatePath}/template`);
      step.templatePath = undefined; // eslint-disable-line no-undefined
    });

    it('#ignorePa11yErrors returns an array', () => {
      expect(step.ignorePa11yErrors).to.eql([]);
    });

    it('#ignorePa11yWarnings returns an array', () => {
      expect(step.ignorePa11yWarnings).to.eql([]);
    });

    it('#fields returns an array', () => {
      expect(step.fields).to.eql([]);
    });

    it('#next returns value of #nextStep', () => {
      expect(step.nextStep)
        .to.equal(null);
    });

    it('#applyCtxToSession assigns content of first argument to the second argument', () => {
      const object1 = { foo: 'foo' };
      const object2 = { bar: 'bar' };
      expect(step.applyCtxToSession(object1, object2))
        .to.eql(Object.assign(object2, object1));
    });

    it('#populateWithPreExistingData gets data from session that belongs to the step', () => {
      const session = {
        foo: 'foo',
        boo: 'boo',
        bar: 'bar'
      };
      const ctxShouldEql = {
        foo: session.foo,
        bar: session.bar
      };
      step.properties = { foo: {}, bar: {} };
      const ctx = step.populateWithPreExistingData(session);
      expect(ctx).to.eql(ctxShouldEql);
      step.properties = undefined; // eslint-disable-line no-undefined
    });

    it('#interceptor returns first argument', () => {
      const ctx = {
        foo: 'foo',
        boo: 'boo',
        bar: 'bar'
      };
      expect(step.interceptor(ctx)).to.eql(ctx);
    });

    it('#validate returns array where first result is true and second an array', () => {
      expect(step.validate()).to.eql([true, []]);
    });

    it('#action returns two arguments as an array', () => {
      expect(step.action('ctx', 'session')).to.eql(['ctx', 'session']);
    });
  });

  describe('#generateContent()', () => {
    it('should throw an error if no content file is provided', () => {
      const step = new Step({}, 'screening-questions', null);
      expect(() => {
        step.generateContent({}, {});
      })
        .to.throw('Step Step has no content.json in it\'s resource folder');
    });

    it('should return the correctly interpolated content', () => {
      const step = new Step({}, 'screening-questions', null, fixtures.content.interpolate);

      const ctx = { divorceWho: 'Husband' };
      const session = { 'screening-questions': { respondent: 'Other person' } };

      const content = step.generateContent(ctx, session);

      expect(content).to.deep.equal({
        question: 'Do you have an address for your Husband?',
        answer: 'Yes, I do have an address for my Other person'
      });
    });
  });

  describe('#generateFields()', () => {
    it('should map the ctx to the fields structure required by the templates', () => {
      const step = new Step({}, 'screening-questions', null);
      const ctx = { divorceWho: 'Husband', respondent: 'Other person' };
      const fields = step.generateFields(ctx, {});

      expect(fields).to.deep.equal({
        divorceWho: { value: 'Husband', error: false },
        respondent: { value: 'Other person', error: false }
      });
    });
  });

  describe('#mapErrorsToFields()', () => {
    it('should map the ctx to the fields structure required by the templates', () => {
      const step = new Step({}, 'screening-questions', null);
      const errors = [
        { param: 'divorceWho', msg: 'Not my husband' },
        { param: 'generic', msg: 'An error' }
      ];
      const fields = {
        divorceWho: { value: 'Husband', error: false },
        respondent: { value: 'Other person', error: false }
      };

      const fieldsWithErrors = step.mapErrorsToFields(errors, fields);
      expect(fieldsWithErrors).to.deep.equal({
        divorceWho: { value: 'Husband', error: true, errorMessage: 'Not my husband' },
        respondent: { value: 'Other person', error: false },
        generic: { error: true, errorMessage: 'An error' }
      });
    });
  });

  describe('#getRequest', () => {
    let stepInstance = {};
    let req = {};
    let res = {};
    const templatePath = 'a/template/path';
    const content = { resources: { en: { translation: { content: { test: 'test' } } } } };
    beforeEach(done => {
      req = {
        session: {
          foo: 'foo',
          bar: 'bar',
          boo: 'boo'
        }
      };
      res = {
        locals: {},
        render: sinon.stub()
      };
      withStep(Step, step => {
        stepInstance = step;
        stepInstance.templatePath = templatePath;
        stepInstance.content = content;
        stepInstance.properties = { foo: {}, bar: {} };
        sinon.spy(stepInstance, 'populateWithPreExistingData');
        sinon.spy(stepInstance, 'generateContent');
        sinon.spy(stepInstance, 'interceptor');
        sinon.spy(stepInstance, 'generateFields');
        sinon.spy(stepInstance, 'preResponse');
        done();
      });
    });
    afterEach(() => {
      stepInstance.populateWithPreExistingData.restore();
      stepInstance.generateContent.restore();
      stepInstance.interceptor.restore();
      stepInstance.generateFields.restore();
      stepInstance.preResponse.restore();
    });
    it('renders the template successfully', done => {
      co(function* generator() {
        yield stepInstance.getRequest(req, res);
        expect(stepInstance.populateWithPreExistingData.calledOnce)
          .to.eql(true);
        expect(stepInstance.interceptor.calledOnce).to.eql(true);
        expect(stepInstance.generateContent.calledOnce).to.eql(true);
        expect(stepInstance.generateFields.calledOnce).to.eql(true);
        expect(stepInstance.preResponse.calledOnce).to.eql(true);
        expect(res.render.calledOnce).to.eql(true);
        expect(res.render.calledWith(`${templatePath}/template`)).to.eql(true);
      }).then(done, done);
    });
    it('sets session, content and fields to locals', done => {
      co(function* generator() {
        yield stepInstance.getRequest(req, res);
        expect(res.locals.session).to.eql(req.session);
        expect(Object.keys(res.locals.fields)).to.eql(['foo', 'bar']);
        expect(res.locals.content).to.eql({ test: 'content.test' });
      }).then(done, done);
    });
    it('does not set fields to locals if fields already set', done => {
      co(function* generator() {
        res.locals.fields = {};
        yield stepInstance.getRequest(req, res);
        expect(stepInstance.generateFields.called).to.eql(false);
        expect(res.locals.fields).to.eql({});
      }).then(done, done);
    });
  });

  describe('#postRequest', () => {
    let stepInstance = {};
    const req = { headers: {} };
    let res = {};
    beforeEach(done => {
      withStep(Step, step => {
        stepInstance = step;
        res = { sendStatus: sinon.stub() };
        done();
      });
    });
    it('does nothing if res.headersSent is true', done => {
      res.headersSent = true;
      co(function* generator() {
        yield stepInstance.postRequest(req, res);
        expect(res.sendStatus.called).to.eql(false);
      }).then(done, done);
    });
    it('sends status if res.headersSent is false', done => {
      res.headersSent = false;
      co(function* generator() {
        yield stepInstance.postRequest(req, res);
        expect(res.sendStatus.called).to.eql(true);
        expect(res.sendStatus.calledWith(statusCodes.METHOD_NOT_ALLOWED))
          .to.eql(true);
      }).then(done, done);
    });
  });

  describe('#handler', () => {
    let stepInstance = {};
    let req = {};
    let res = {};
    let postRequestStub = {};
    let getRequestStub = {};
    let next = {};
    beforeEach(done => {
      withStep(Step, step => {
        stepInstance = step;
        res = {
          redirect: sinon.stub(),
          status: sinon.stub()
        };
        req = {};
        postRequestStub = sinon.stub();
        stepInstance.postRequest = postRequestStub;
        getRequestStub = sinon.stub();
        stepInstance.getRequest = getRequestStub;
        next = sinon.stub();
        done();
      });
    });
    it('calls postRequest if method is post', done => {
      req.method = 'Post';
      postRequestStub.resolves();
      stepInstance.handler(req, res, next);
      setImmediate(() => {
        expect(stepInstance.postRequest.called).to.eql(true);
        expect(stepInstance.getRequest.called).to.eql(false);
        expect(next.called).to.eql(true);
        done();
      });
    });
    it('redirects to error page if postRequest throws an error', done => {
      req.method = 'Post';
      postRequestStub = function* () {
        const error = new Error('error');
        error.stack = {};
        throw error;
      };
      stepInstance.postRequest = postRequestStub;
      const spy = sinon.spy(stepInstance, 'postRequest');

      stepInstance.handler(req, res, next);
      setImmediate(() => {
        expect(spy.called).to.eql(true);
        expect(next.called).to.eql(false);
        expect(res.redirect.called).to.eql(true);
        expect(res.redirect.calledWith('/generic-error')).to.eql(true);
        expect(res.status.called).to.eql(true);
        expect(res.status.calledWith(statusCodes.INTERNAL_SERVER_ERROR))
          .to.eql(true);
        done();
      });
    });
    it('calls getRequest if method is post', done => {
      req.method = 'Get';
      getRequestStub.resolves();
      stepInstance.handler(req, res, next);
      setImmediate(() => {
        expect(stepInstance.getRequest.called).to.eql(true);
        expect(stepInstance.postRequest.called).to.eql(false);
        expect(next.called).to.eql(true);
        done();
      });
    });
    it('redirects to error page if getRequest throws an error', done => {
      req.method = 'Get';
      getRequestStub = function* () {
        throw new Error('error');
      };
      stepInstance.getRequest = getRequestStub;
      const spy = sinon.spy(stepInstance, 'getRequest');

      stepInstance.handler(req, res, next);
      setImmediate(() => {
        expect(spy.called).to.eql(true);
        expect(next.called).to.eql(false);
        expect(res.redirect.called).to.eql(true);
        expect(res.redirect.calledWith('/generic-error')).to.eql(true);
        expect(res.status.called).to.eql(true);
        expect(res.status.calledWith(statusCodes.INTERNAL_SERVER_ERROR))
          .to.eql(true);
        done();
      });
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
    it('returns null if url is not implemented', () => {
      const newStep = new Step();

      expect(newStep.router)
        .to.equal(null);
    });
    it('binds the handler function to the current url', done => {
      const newStep = new class extends Step {
        get url() {
          return '/step';
        }
        handler(req, res) {
          res.status(statusCodes.OK).json({ status: 'ok', url: this.url });
        }
      }();
      const app = express();
      app.use(newStep.router);

      request(app)
        .get(newStep.url)
        .expect(statusCodes.OK, { status: 'ok', url: newStep.url }, done);
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
          res.status(statusCodes.OK).json({ foo: req.foo });
        }
      }();
      const app = express();
      app.use(step.router);

      request(app)
        .get(step.url)
        .expect(statusCodes.OK, { foo: 'Foo' }, done);
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
          res.status(statusCodes.OK).json({ url: req.stepUrl });
        }
      }();
      const app = express();
      app.use(step.router);

      request(app)
        .get(step.url)
        .expect(statusCodes.OK, { url: '/step' }, done);
    });
  });
  describe('#postMiddleware', () => {
    it('are executed before the request handler', done => {
      const two = 2;
      const postMiddleware = sinon.stub().callsArgWith(two);

      const step = new class extends Step {
        get postMiddleware() {
          return [postMiddleware];
        }
        get url() {
          return '/step';
        }
        handler(req, res, next) {
          res.status(statusCodes.OK).send();
          next();
        }
      }();
      const app = express();
      app.use(step.router);

      request(app)
        .get(step.url)
        .then(() => {
          expect(postMiddleware.called).to.eql(true);
          done();
        });
    });
    it('are bound to the current step', done => {
      let url = '';
      const step = new class extends Step {
        scopedMiddleware(req, res, next) {
          url = this.url;
          next();
        }
        get postMiddleware() {
          return [this.scopedMiddleware];
        }
        get url() {
          return '/step';
        }
        handler(req, res, next) {
          res.status(statusCodes.OK).send();
          next();
        }
      }();
      const app = express();
      app.use(step.router);

      request(app)
        .get(step.url)
        .then(() => {
          expect(url).to.eql(step.url);
          done();
        });
    });
  });
});
