/* eslint max-nested-callbacks: ["error", 6] */
const co = require('co');
const requireDir = require('require-directory');
const { expect, sinon } = require('test/util/chai');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { hasSubmitted } = require('app/middleware/submissionMiddleware');
const {
  restoreFromDraftStore,
  saveSessionToDraftStoreAndClose,
  saveSessionToDraftStore,
  saveSessionToDraftStoreAndReply
} = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const Step = require('app/core/steps/Step');
const requestHandler = require('app/core/helpers/parseRequest');
const staleDataManager = require('app/core/helpers/staleDataManager');
const fs = require('fs');

const modulePath = 'app/core/steps/ValidationStep';
const UnderTest = require(modulePath);

const fixtures = requireDir(module, `${__dirname}/../fixtures`);

let underTest = {};

describe(modulePath, () => {
  describe('#middleware', () => {
    it('returns middleware for validation step', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const middleware = [
        idamProtect,
        initSession,
        sessionTimeout,
        restoreFromDraftStore,
        setIdamUserDetails,
        hasSubmitted,
        saveSessionToDraftStoreAndClose
      ];
      expect(underTest.middleware).to.eql(middleware);
    });
  });

  describe('#postMiddleware', () => {
    it('returns postMiddleware for validation step', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const middleware = [
        saveSessionToDraftStore,
        saveSessionToDraftStoreAndReply
      ];
      expect(underTest.postMiddleware).to.eql(middleware);
    });
  });

  describe('#checkYourAnswersInterceptor', () => {
    it('returns first argument', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const firstArgument = 'arg 1';
      expect(underTest.checkYourAnswersInterceptor(firstArgument))
        .to.eql(firstArgument);
    });
  });

  describe('#parseRequest', () => {
    it('should execture parseRequest', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      sinon.stub(requestHandler, 'parse');
      underTest.parseRequest();
      expect(requestHandler.parse.called).to.eql(true);
      requestHandler.parse.restore();
    });
  });

  describe('#next', () => {
    it('calls super function if nextStep is instance of Step', () => {
      const nextStep = new UnderTest({}, 'screening-questions-2', null, fixtures.content.simple, fixtures.schemas.simple);
      class hasNextStep extends Step {
        get url() {
          return '/true:true';
        }
        get nextStep() {
          return nextStep;
        }
      }
      underTest = new hasNextStep({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      expect(underTest.next()).to.eql(nextStep);
    });

    class TrueTrue extends Step {
      get url() {
        return '/true:true';
      }
    }

    class TrueFalse extends Step {
      get url() {
        return '/true:false';
      }
    }

    class FalseTrue extends Step {
      get url() {
        return '/false:true';
      }
    }

    class FalseFalse extends Step {
      get url() {
        return '/false:false';
      }
    }

    class True extends Step {
      get url() {
        return '/true';
      }
    }

    class False extends Step {
      get url() {
        return '/false';
      }
    }

    class ExtendsUnderTest extends UnderTest {
      get url() {
        return '/test';
      }
      get nextStep() {
        return {
          prop1: {
            true: {
              prop2: {
                true: this.steps.TrueTrue,
                false: this.steps.TrueFalse
              }
            },
            false: {
              prop2: {
                true: this.steps.FalseTrue,
                false: this.steps.FalseFalse
              }
            }
          },
          prop3: {
            true: this.steps.True,
            false: this.steps.False
          },
          prop4: { true: this.steps.True },
          prop5: {
            true: this.steps.True,
            false: this.steps.False
          }

        };
      }
    }

    let steps = {};
    let extendsUnderTest = {};

    describe(modulePath, () => {
      beforeEach(() => {
        steps = {
          TrueTrue: new TrueTrue(),
          TrueFalse: new TrueFalse(),
          FalseTrue: new FalseTrue(),
          FalseFalse: new FalseFalse(),
          True: new True(),
          False: new False()
        };

        extendsUnderTest = new ExtendsUnderTest(
          steps, null, null, {}, { properties: {} }
        );
      });

      describe('error', () => {
        it('should throw an error with the correct message', () => {
          delete steps.TrueTrue;

          expect(() => {
            return extendsUnderTest.next({ prop1: true, prop2: true });
          }).to.throw('Step ExtendsUnderTest has no valid next Step class at this.nextStep.prop1.true.prop2.true');
        });
      });

      describe('success', () => {
        describe('a simple single property data structure', () => {
          it('should select the correct Step if the property is true', () => {
            const next = extendsUnderTest.next({ prop3: true });

            expect(next).to.be.instanceof(True);
          });

          it('should select the correct Step if the property is false', () => {
            const next = extendsUnderTest.next({ prop3: false });

            expect(next).to.be.instanceof(False);
          });
        });

        describe('a complex nested multi property data structure', () => {
          it('should select the correct Step if both properties are true', () => {
            const next = extendsUnderTest.next({ prop1: true, prop2: true });

            expect(next).to.be.instanceof(TrueTrue);
          });

          it('should select the correct Step if both properties are false', () => {
            const next = extendsUnderTest.next({ prop1: false, prop2: false });

            expect(next).to.be.instanceof(FalseFalse);
          });

          it('should select the correct Step if property 1 is true and property 2 is false', () => {
            const next = extendsUnderTest.next({ prop1: true, prop2: false });

            expect(next).to.be.instanceof(TrueFalse);
          });

          it('should select the correct Step if property 1 is false and property 2 is true', () => {
            const next = extendsUnderTest.next({ prop1: false, prop2: true });

            expect(next).to.be.instanceof(FalseTrue);
          });
        });

        describe('ignoring a value that doesn\'t exist', () => {
          it('should select the correct Step if property 4 is false and property 5 is true', () => {
            const next = extendsUnderTest.next({ prop4: false, prop5: true });

            expect(next).to.be.instanceof(True);
          });
        });
      });
    });
  });

  describe('#getRequest', () => {
    let req = {};
    let res = {};
    const errors = [{ error: 'error' }];
    const fields = [
      {
        field1: { value: 'value1', error: false },
        field2: { value: 'value2', error: false }
      }
    ];
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
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      underTest.templatePath = templatePath;
      underTest.content = content;
      sinon.stub(underTest, 'validate').returns([false, errors]);
      sinon.stub(underTest, 'generateFields').returns(fields);
      sinon.stub(underTest, 'mapErrorsToFields').returns(fields);
      done();
    });
    afterEach(() => {
      underTest.validate.restore();
      underTest.generateFields.restore();
      underTest.mapErrorsToFields.restore();
    });
    it('does not add any errors or fields to locals', done => {
      co(function* generator() {
        yield underTest.getRequest(req, res);
        expect(underTest.validate.calledOnce).to.eql(false);
        expect(underTest.generateFields.calledOnce).to.eql(true);
        expect(underTest.mapErrorsToFields.calledOnce).to.eql(false);
        expect(res.locals.hasOwnProperty('errors')).to.eql(false);
      }).then(done, done);
    });
    it('adds errors and fields to locals', done => {
      co(function* generator() {
        req.session.flash = { errors: true };
        yield underTest.getRequest(req, res);
        expect(underTest.validate.calledOnce).to.eql(true);
        expect(underTest.generateFields.calledOnce).to.eql(true);
        expect(underTest.mapErrorsToFields.calledOnce).to.eql(true);
        expect(res.locals.errors).to.eql(errors);
        expect(res.locals.fields).to.eql(fields);
      }).then(done, done);
    });
  });

  describe('#postRequest', () => {
    let req = {};
    let res = {};
    const exsistingData = {
      field1: 'value1',
      field2: 'value2'
    };
    const postedData = { field3: 'value3' };
    const nextStepUrl = 'next/step/url';
    const currentStepUrl = 'current/step/url';
    class TestClass extends UnderTest {
      get url() {
        return currentStepUrl;
      }
    }

    beforeEach(done => {
      underTest = new TestClass({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);

      req = {
        session: exsistingData,
        headers: {}
      };
      res = {
        redirect: sinon.stub(),
        headersSent: true
      };

      sinon.stub(underTest, 'populateWithPreExistingData').returns(exsistingData);
      sinon.stub(underTest, 'parseRequest').returns(postedData);
      sinon.spy(underTest, 'interceptor');
      sinon.stub(underTest, 'validate');
      sinon.spy(underTest, 'action');
      sinon.spy(underTest, 'applyCtxToSession');
      sinon.stub(underTest, 'next').returns({ url: nextStepUrl });
      sinon.stub(staleDataManager, 'removeStaleData').returnsArg(1);

      done();
    });
    afterEach(() => {
      underTest.populateWithPreExistingData.restore();
      underTest.parseRequest.restore();
      underTest.interceptor.restore();
      underTest.validate.restore();
      underTest.action.restore();
      underTest.applyCtxToSession.restore();
      underTest.next.restore();
      staleDataManager.removeStaleData.restore();
    });

    context('valid post data', () => {
      beforeEach(() => {
        underTest.validate.returns([true]);
      });
      const sessionShouldBe = Object.assign({}, exsistingData, postedData);

      it('adds the valid posted data to the session', done => {
        co(function* generator() {
          yield underTest.postRequest(req, res);

          expect(underTest.populateWithPreExistingData.calledOnce).to.eql(true);
          expect(underTest.parseRequest.calledOnce).to.eql(true);
          expect(underTest.interceptor.calledOnce).to.eql(true);
          expect(underTest.validate.calledOnce).to.eql(true);
          expect(underTest.action.calledOnce).to.eql(true);
          expect(underTest.applyCtxToSession.calledOnce).to.eql(true);
          expect(underTest.next.calledOnce).to.eql(true);
          expect(res.redirect.calledWith(nextStepUrl)).to.eql(true);

          expect(req.session).to.eql(sessionShouldBe);
        }).then(done, done);
      });
    });

    context('invalid post data', () => {
      beforeEach(() => {
        underTest.validate.returns([false]);
      });
      const sessionShouldBe = Object.assign({}, exsistingData, postedData);

      it('adds the valid posted data to the session', done => {
        co(function* generator() {
          yield underTest.postRequest(req, res);

          expect(underTest.populateWithPreExistingData.calledOnce)
            .to.eql(true);
          expect(underTest.parseRequest.calledOnce).to.eql(true);
          expect(underTest.interceptor.calledOnce).to.eql(true);
          expect(underTest.validate.calledOnce).to.eql(true);
          expect(underTest.action.calledOnce).to.eql(false);
          expect(underTest.applyCtxToSession.calledOnce).to.eql(false);
          expect(underTest.next.calledOnce).to.eql(false);
          expect(res.redirect.calledWith(currentStepUrl)).to.eql(true);

          expect(req.session.hasOwnProperty('flash')).to.eql(true);
          expect(req.session.flash).to.eql({
            errors: true,
            ctx: sessionShouldBe
          });
        }).then(done, done);
      });
    });
  });

  describe('#checkYourAnswersTemplate', () => {
    const templatePath = 'path/to/template';
    const stepCYAPath = `app/steps/${templatePath}/partials/checkYourAnswersTemplate.html`;
    const defualtCYAPath = 'app/views/common/components/defaultCheckYouAnswersTemplate.html';
    beforeEach(() => {
      underTest = new UnderTest({}, 'screening-questions', templatePath, fixtures.content.simple, fixtures.schemas.simple);
      sinon.stub(fs, 'existsSync');
    });
    afterEach(() => {
      fs.existsSync.restore();
    });
    it('returns step CYA template path if file exists', () => {
      fs.existsSync.returns(true);
      expect(underTest.checkYourAnswersTemplate).to.eql(stepCYAPath);
    });
    it('returns default template path if no step CYA file exists', () => {
      fs.existsSync.returns(false);
      expect(underTest.checkYourAnswersTemplate).to.eql(defualtCYAPath);
    });
  });

  describe('#generateCheckYourAnswersContent()', () => {
    it('should throw an error if no content file is provided', () => {
      underTest = new UnderTest({}, 'screening-questions', null, {}, fixtures.schemas.simple);
      expect(() => {
        underTest.generateCheckYourAnswersContent({}, {});
      })
        .to.throw('Step ValidationStep has no content.json in it\'s resource folder');
    });

    it('should return the correctly interpolated content', () => {
      underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
      const content = underTest.generateCheckYourAnswersContent();

      expect(content.hasOwnProperty('question')).to.eql(true);
      expect(content.question).to.eql('Do you have your marriage certificate?');
    });
  });

  describe('#constructor()', () => {
    describe('error', () => {
      it('should throw an error with the correct message if an invalid schema is provided', () => {
        expect(() => {
          return new UnderTest({}, null, null, {}, {});
        }).to.throw('Step ValidationStep has an invalid schema: schema has no properties or oneOf keywords');
      });
    });

    describe('success', () => {
      describe('a simple schema', () => {
        it('should generate the schema properties', () => {
          underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);

          expect(underTest.properties)
            .to.deep.equal(fixtures.schemas.simple.properties);
        });
      });

      describe('a complexish schema', () => {
        it('should generate the schema properties', () => {
          underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.complex, fixtures.schemas.complex);

          expect(underTest.properties).to.deep.equal({
            marriageType: { type: 'string' },
            divorceWho: { type: 'string' }
          });
        });
      });
    });
  });

  describe('#validate()', () => {
    describe('error', () => {
      it('should throw an error if no error messages are provided', done => {
        co(function* generator() {
          underTest = new UnderTest({}, 'screening-questions', null, {}, fixtures.schemas.noMessage);

          let error = false;

          try {
            yield underTest.validate({});
          } catch (validateError) {
            error = validateError;
          }

          expect(error.message).to.equal('Error messages have not been defined for Step ValidationStep in content.json for errors.noMessage');
        }).then(done, done);
      });
    });

    describe('success', () => {
      describe('a simple schema', () => {
        beforeEach(() => {
          underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.simple, fixtures.schemas.simple);
        });

        it('should validate the given data', done => {
          co(function* generator() {
            const [isValid, errors] = yield underTest.validate({ hasMarriageCert: 'Yes' });

            expect(isValid).to.equal(true);
            expect(errors).to.deep.equal([]);
          }).then(done, done);
        });

        it('should validate the given data', done => {
          co(function* generator() {
            const [isValid, errors] = yield underTest.validate({ hasMarriageCert: 'No' });

            expect(isValid).to.equal(true);
            expect(errors).to.deep.equal([]);
          }).then(done, done);
        });

        it('should invalidate the given data', done => {
          co(function* generator() {
            const [isValid] = yield underTest.validate({});

            expect(isValid).to.equal(false);
          }).then(done, done);
        });

        it('should generate the correct error messages for missing required data', done => {
          co(function* generator() {
            const [, errors] = yield underTest.validate({});

            expect(errors).to.deep.equal([{ param: 'hasMarriageCert', msg: fixtures.content.simple.resources.en.translation.errors.hasMarriageCert.required }]);
          }).then(done, done);
        });

        it('should generate the correct error messages for invalid data', done => {
          co(function* generator() {
            const [, errors] = yield underTest.validate({ hasMarriageCert: 'invalid' });

            expect(errors).to.deep.equal([{ param: 'hasMarriageCert', msg: fixtures.content.simple.resources.en.translation.errors.hasMarriageCert.invalid }]);
          }).then(done, done);
        });
      });

      describe('a complex-ish schema', () => {
        beforeEach(() => {
          underTest = new UnderTest({}, 'screening-questions', null, fixtures.content.complex, fixtures.schemas.complex);
        });

        it('should validate the given data', done => {
          co(function* generator() {
            const [isValid, errors] = yield underTest.validate({
              marriageType: 'marriage',
              divorceWho: 'husband'
            });

            expect(isValid).to.equal(true);
            expect(errors).to.deep.equal([]);
          }).then(done, done);
        });

        it('should validate the given data', done => {
          co(function* generator() {
            const [isValid, errors] = yield underTest.validate({
              marriageType: 'same-sex-marriage',
              divorceWho: 'wife'
            });

            expect(isValid).to.equal(true);
            expect(errors).to.deep.equal([]);
          }).then(done, done);
        });

        it('should invalidate the given data', done => {
          co(function* generator() {
            const [isValid] = yield underTest.validate({ divorceWho: 'wife' });

            expect(isValid).to.equal(false);
          }).then(done, done);
        });

        it('should invalidate the given data', done => {
          co(function* generator() {
            const [isValid] = yield underTest.validate({
              marriageType: 'marriage',
              divorceWho: 'former-partner'
            });

            expect(isValid).to.equal(false);
          }).then(done, done);
        });

        it('should invalidate the given data', done => {
          co(function* generator() {
            const [isValid] = yield underTest.validate({});

            expect(isValid).to.equal(false);
          }).then(done, done);
        });

        it('should generate the correct error messages for missing data', done => {
          co(function* generator() {
            const [, errors] = yield underTest.validate({});

            expect(errors).to.deep.equal([
              { param: 'marriageType', msg: fixtures.content.complex.resources.en.translation.errors.marriageType.required },
              { param: 'divorceWho', msg: fixtures.content.complex.resources.en.translation.errors.divorceWho.required }
            ]);
          }).then(done, done);
        });

        it('should generate the correct error messages for invalid data', done => {
          co(function* generator() {
            const [, errors] = yield underTest.validate({
              marriageType: 'que?',
              divorceWho: 'quoi?'
            });

            expect(errors).to.deep.equal([
              { param: 'marriageType', msg: fixtures.content.complex.resources.en.translation.errors.marriageType.invalid },
              { param: 'divorceWho', msg: fixtures.content.complex.resources.en.translation.errors.divorceWho.invalid }
            ]);
          }).then(done, done);
        });
      });
    });
  });
});
