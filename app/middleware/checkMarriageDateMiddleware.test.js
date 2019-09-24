const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/checkMarriageDateMiddleware';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};

describe(modulePath, () => {
  beforeEach(() => {
    req = { session: {} };
    res = { redirect: sinon.stub() };
    next = sinon.stub();
  });

  it('redirect to date-of-marriage-certificate page if no date of marriage', () => {
    underTest.checkMarriageDate(req, res, next);

    expect(
      res.redirect.calledWith('/about-your-marriage/date-of-marriage-certificate')
    ).to.equal(true);

    expect(next).to.not.equal(true);
  });

  it('calls next if date of marriage', () => {
    req.session.marriageDate = '10/10/2010';

    underTest.checkMarriageDate(req, res, next);

    expect(
      res.redirect.calledWith('/about-your-marriage/date-of-marriage-certificate')
    ).to.not.equal(true);

    expect(next.calledOnce).to.equal(true);
  });
});