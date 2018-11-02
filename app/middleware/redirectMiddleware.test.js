const { expect, sinon } = require('test/util/chai');
const CONF = require('config');

const modulePath = 'app/middleware/redirectMiddleware';

const redirectMiddleware = require(modulePath);

describe(modulePath, () => {
  let req = {}, res = {}, next = {};

  beforeEach(() => {
    req = { session: {} };
    res = { redirect: sinon.stub() };
    next = sinon.stub();
  });

  it('should call next when there is no state', () => {
    redirectMiddleware.redirectOnCondition(req, res, next);

    expect(next.calledOnce).to.eql(true);
  });

  it('should call next wen there is no session', () => {
    delete req.session;

    redirectMiddleware.redirectOnCondition(req, res, next);

    expect(next.calledOnce).to.eql(true);
  });

  it('should call next when the state is AwaitingPayment', () => {
    req.session.state = 'AwaitingPayment';

    redirectMiddleware.redirectOnCondition(req, res, next);

    expect(next.calledOnce).to.eql(true);
  });

  it('should call redirect to DN if the state is not AwaitingPayment', () => {
    req.session.state = 'AwaitingDecreeNisi';

    redirectMiddleware.redirectOnCondition(req, res, next);

    expect(next.calledOnce).to.eql(false);
    expect(res.redirect.calledWith(CONF.apps.dn.url)).to.eql(true);
  });
});