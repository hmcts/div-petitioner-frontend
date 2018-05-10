const { expect, sinon } = require('test/util/chai');
const sinonStubPromise = require('sinon-stub-promise');
const co = require('co');
const statusCode = require('app/core/utils/statusCode');

sinonStubPromise(sinon);

const modulePath = 'app/core/errorHandler';

const errorHandler = require(modulePath);

const req = {};
let steps = {}, res = {}, expressHandler = {};

describe(modulePath, () => {
  beforeEach(() => {
    steps = {
      Error404: {
        generateContent: sinon.stub().returns(co(sinon.stub())),
        template: sinon.stub()
      }
    };

    res = {
      render: sinon.stub(),
      status: sinon.stub()
    };
  });

  it('returns curried function', () => {
    expressHandler = errorHandler(steps);
    expect(typeof expressHandler).to.eql('function');
  });

  describe('executes expressHandler', () => {
    beforeEach(done => {
      expressHandler = errorHandler(steps);
      expressHandler(req, res).then(done, done);
    });

    it('set status to 404', () => {
      expect(res.status.called).to.eql(true);
      expect(res.status.calledWith(statusCode.NOT_FOUND)).to.eql(true);
    });

    it('template was rendered', () => {
      expect(steps.Error404.generateContent.called).to.eql(true);
      expect(res.render.called).to.eql(true);
    });
  });
});
