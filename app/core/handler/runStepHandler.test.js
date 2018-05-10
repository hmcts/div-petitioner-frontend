const co = require('co');
const { expect, sinon } = require('test/util/chai');
const mockedClient = require('app/services/mocks/transformationServiceClient');

const modulePath = 'app/core/handler/runStepHandler';
const underTest = require(modulePath);

//  need to move this so common is loaded at runtime into the app
//  will make it easier to test once core files are moved out into
//  their own repo

let session = {};
let req = {};
let res = {};
let ctx = {};
let errors = [];
let fields = {};
let content = {};
let step = {};

describe(modulePath, () => {
  beforeEach(() => {
    session = { chicken: 'gangnam style', initialised: true };

    req = {
      session,
      body: {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      },
      query: {},
      get: () => {
        return '/test';
      },
      method: 'POST',
      sessionID: 'qwertyuiop'
    };

    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
      sendStatus: sinon.stub()
    };

    ctx = {
      prop1: 'prop1',
      prop2: 'prop2',
      prop3: 'prop3'
    };

    errors = [{ one: 1 }, { two: 2 }];

    fields = { one: 1, two: 2 };

    content = { text: 'text' };

    step = {
      interceptor: sinon.stub().returns(ctx),
      validate: sinon.stub().returns([true, []]),
      generateContent: sinon.stub().returns(content),
      generateFields: sinon.stub().returns(fields),
      mapErrorsToFields: sinon.stub().returns(fields),
      action: sinon.stub().returns([ctx, req.session]),
      parseRequest: sinon.stub().returns(ctx),
      section: 'test',
      url: '/test',
      template: 'template',
      properties: {
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      },
      next: () => {
        return { url: '/next', section: 'test' };
      },
      steps: {
        CheckYourAnswers: { url: '/check-your-answers' },
        ExitApplicationSaved: { url: '/exit/application-saved' }
      },
      fields: []
    };
  });

  describe('success', () => {
    describe('a valid form submission step', () => {
      beforeEach(done => {
        co(function* generator() {
          yield underTest(step, req, res);
        }).then(done, done);
      });

      it('should call step.interceptor with the ctx and session', () => {
        expect(step.interceptor.calledWith(ctx, session)).to.equal(true);
      });

      it('should call step.validate with the ctx and session', () => {
        expect(step.validate.calledWith(ctx, session)).to.equal(true);
      });

      it('should call step.action with the ctx and session', () => {
        expect(step.action.calledWith(ctx, session)).to.equal(true);
      });

      it('should call res.redirect with the next step.url', () => {
        expect(res.redirect.calledWith(step.next().url)).to.equal(true);
      });


      it('should not call step.generateContent', () => {
        expect(step.generateContent.callCount).to.equal(0);
      });

      it('should not call step.generateFields', () => {
        expect(step.generateFields.callCount).to.equal(0);
      });

      it('should not call step.mapErrorsToFields', () => {
        expect(step.mapErrorsToFields.callCount).to.equal(0);
      });

      it('should not call res.render', () => {
        expect(res.render.callCount).to.equal(0);
      });

      it('should set the req.session correctly', () => {
        expect(req.session)
          .to.deep.equal(Object.assign(req.session, { [step.section]: ctx }));
      });
    });

    describe('a valid form submission step with a nested section path to store data on the session', () => {
      beforeEach(done => {
        co(function* generator() {
          step.section = 'test.section.path';

          yield underTest(step, req, res);
        }).then(done, done);
      });

      it('should set the req.session correctly', () => {
        expect(req.session).to.deep.equal(Object.assign(
          req.session,
          { test: { section: { path: ctx } } }
        ));
      });
    });

    describe('an invalid from submission request', () => {
      beforeEach(done => {
        co(function* generator() {
          step.validate = sinon.stub().returns([false, errors]);

          yield underTest(step, req, res);
        }).then(done, done);
      });

      it('should call step.interceptor with the ctx and session', () => {
        expect(step.interceptor.calledWith(ctx, req.session)).to.equal(true);
      });

      it('should call step.validate with the ctx and session', () => {
        expect(step.validate.calledWith(ctx, req.session)).to.equal(true);
      });

      it('should call step.generateContent with the ctx and session', () => {
        expect(step.generateContent.calledWith(ctx, req.session))
          .to.equal(true);
      });

      it('should call step.generateFields with the ctx and session', () => {
        expect(step.generateFields.calledWith(ctx, req.session)).to.equal(true);
      });

      it('should call step.mapErrorsToFields with the errors and fields', () => {
        expect(step.mapErrorsToFields.calledWith(errors, fields))
          .to.equal(true);
      });

      it('should call res.render with the content fields and errors', () => {
        expect(res.render.calledWith(
          step.template, { content, errors, fields, session: req.session }
        )).to.equal(true);
      });

      it('should not call step.action', () => {
        expect(step.action.callCount).to.equal(0);
      });

      it('should not call res.redirect', () => {
        expect(res.redirect.callCount).to.equal(0);
      });

      it('should set the req.session correctly', () => {
        expect(req.session).to.deep.equal(req.session);
      });
    });

    describe('a get request from a different referer', () => {
      beforeEach(done => {
        co(function* generator() {
          req.get = () => {
            return '/different';
          };
          req.method = 'GET';


          yield underTest(step, req, res);
        }).then(done, done);
      });

      it('should call step.interceptor with the ctx and session', () => {
        expect(step.interceptor.calledWith(ctx, req.session)).to.equal(true);
      });

      it('should call step.generateContent with the ctx and session', () => {
        expect(step.generateContent.calledWith(ctx, req.session))
          .to.equal(true);
      });

      it('should call step.generateFields with the ctx and session', () => {
        expect(step.generateFields.calledWith(ctx, req.session)).to.equal(true);
      });

      it('should call res.render with the content and fields', () => {
        expect(res.render.calledWith(
          step.template, { content, fields, session: req.session }
        )).to.equal(true);
      });


      it('should not call step.validate', () => {
        expect(step.validate.callCount).to.equal(0);
      });

      it('should not call step.mapErrorsToFields', () => {
        expect(step.mapErrorsToFields.callCount).to.equal(0);
      });

      it('should not call step.action', () => {
        expect(step.action.callCount).to.equal(0);
      });

      it('should not call res.redirect', () => {
        expect(res.redirect.callCount).to.equal(0);
      });

      it('should set the req.session correctly', () => {
        expect(req.session).to.deep.equal(req.session);
      });
    });
  });

  describe('saves partially entered data to draft store if save and close clicked', () => {
    beforeEach(done => {
      req.body.saveAndClose = true;
      session.expires = '10/10/3000';
      session.cookie = 'cookie';
      session.sessionKey = 'sessionKey';
      sinon.stub(mockedClient, 'saveToDraftStore');
      mockedClient.saveToDraftStore.resolves();
      co(function* generator() {
        yield underTest(step, req, res);
      }).then(done, done);
    });
    afterEach(() => {
      mockedClient.saveToDraftStore.restore();
    });
    it('parses the ctx correctly and saves to draft store', () => {
      expect(step.interceptor.calledWith(ctx, session)).to.equal(true);
      expect(step.action.calledWith(ctx, session)).to.equal(true);
      expect(mockedClient.saveToDraftStore.calledOnce).to.equal(true);
      expect(res.redirect.calledWith('/exit/application-saved')).to.equal(true);
    });
    it('expects current url to be added so CYA knows what url to return too', () => {
      const dataSentToDraftStore = {
        chicken: 'gangnam style',
        initialised: true,
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3',
        saveAndResumeUrl: '/test'
      };
      expect(mockedClient.saveToDraftStore.calledOnce).to.equal(true);
      expect(mockedClient.saveToDraftStore.calledWith('', dataSentToDraftStore)).to.equal(true);
    });
    it('expects the save to drafts store function to me called with sendEmail true', () => {
      const dataSentToDraftStore = {
        chicken: 'gangnam style',
        initialised: true,
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3',
        saveAndResumeUrl: '/test'
      };
      const sendEmail = true;
      expect(mockedClient.saveToDraftStore.calledWith('', dataSentToDraftStore, sendEmail)).to.equal(true);
    });
  });

  describe('throws error if saving partially entered data to draft store fails', () => {
    beforeEach(done => {
      req.body.saveAndClose = true;
      session.expires = '10/10/3000';
      session.cookie = 'cookie';
      session.sessionKey = 'sessionKey';
      sinon.stub(mockedClient, 'saveToDraftStore');
      mockedClient.saveToDraftStore.rejects();
      co(function* generator() {
        yield underTest(step, req, res);
      }).then(done, done);
    });
    afterEach(() => {
      mockedClient.saveToDraftStore.restore();
    });
    it('parses the ctx correctly and saves to draft store', () => {
      expect(step.interceptor.calledWith(ctx, session)).to.equal(true);
      expect(step.action.calledWith(ctx, session)).to.equal(true);
      expect(mockedClient.saveToDraftStore.calledOnce).to.equal(true);
      expect(res.redirect.calledWith('/generic-error')).to.equal(true);
    });
  });

  describe('save to draft petition store', () => {
    beforeEach(done => {
      session.expires = '10/10/3000';
      session.cookie = 'cookie';
      session.sessionKey = 'sessionKey';
      session.saveAndResumeUrl = 'saveAndResumeUrl';
      sinon.stub(mockedClient, 'saveToDraftStore');
      mockedClient.saveToDraftStore.resolves();
      co(function* generator() {
        yield underTest(step, req, res);
      }).then(done, done);
    });
    afterEach(() => {
      mockedClient.saveToDraftStore.restore();
    });
    it('saves the session to the draft petition store', () => {
      expect(mockedClient.saveToDraftStore.calledOnce).to.equal(true);
    });
    it('removes black listed properties', () => {
      const dataSentToDraftStore = {
        chicken: 'gangnam style',
        initialised: true,
        prop1: 'prop1',
        prop2: 'prop2',
        prop3: 'prop3'
      };
      expect(mockedClient.saveToDraftStore.calledOnce).to.equal(true);
      expect(mockedClient.saveToDraftStore.calledWith('', dataSentToDraftStore)).to.equal(true);
    });
  });
});
