const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/setIdamDetailsToSessionMiddleware';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};
const userDetails = {
  email: 'email@email.com',
  id: 'user.id'
};
const validSession = { expires: 1111 };

describe(modulePath, () => {
  beforeEach(() => {
    req = {};
    res = {};
    next = sinon.stub();
  });

  it('returns early if no valid session', () => {
    req.session = {};
    req.idam = { userDetails };
    underTest.setIdamUserDetails(req, res, next);

    expect(next.calledOnce).to.eql(true);
    expect(req.session).to.eql({});
  });

  it('returns early if no idam user details', () => {
    req.session = validSession;
    underTest.setIdamUserDetails(req, res, next);

    expect(next.calledOnce).to.eql(true);
    expect(req.session).to.eql(validSession);
  });

  it('does not update session.petitionerEmail if no email in idam user details', () => {
    req.session = validSession;
    req.idam = { name: 'test name' };
    underTest.setIdamUserDetails(req, res, next);

    expect(next.calledOnce).to.eql(true);
    expect(req.session).to.eql(validSession);
  });

  it('does not update session.petitionerEmail if session.email already set', () => {
    const sessionWithEmailAlreadySet = Object.assign(
      { petitionerEmail: 'emailAreadySet@email.com' },
      validSession
    );
    req.session = sessionWithEmailAlreadySet;
    req.idam = { userDetails };
    underTest.setIdamUserDetails(req, res, next);

    expect(next.calledOnce).to.eql(true);
    expect(req.session).to.eql(sessionWithEmailAlreadySet);
  });

  it('sets the session.petitionerEmail with email returned from idam', () => {
    req.session = validSession;
    req.idam = { userDetails };
    underTest.setIdamUserDetails(req, res, next);

    const sessionShouldBe = Object.assign(
      { petitionerEmail: userDetails.email },
      validSession
    );
    expect(next.calledOnce).to.eql(true);
    expect(req.session).to.eql(sessionShouldBe);
  });
});
