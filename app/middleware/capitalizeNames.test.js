const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/middleware/capitalizeNames';
const underTest = require(modulePath);

let req = {};
let res = {};
let next = {};

const nameDetails = {
  petitionerFirstName: 'petitioner first o\'martin o-neil',
  petitionerLastName: 'petitioner last o\'martin o-neil',
  respondentFirstName: 'respondent first o\'martin o-neil',
  respondentLastName: 'respondent last o\'martin o-neil',
  reasonForDivorceAdultery3rdPartyFirstName: 'adultery first o\'martin o-neil',
  reasonForDivorceAdultery3rdPartyLastName: 'adultery last o\'martin o-neil'
};

const expectedNameDetails = {
  petitionerFirstName: 'Petitioner First O\'Martin O-Neil',
  petitionerLastName: 'Petitioner Last O\'Martin O-Neil',
  respondentFirstName: 'Respondent First O\'Martin O-Neil',
  respondentLastName: 'Respondent Last O\'Martin O-Neil',
  reasonForDivorceAdultery3rdPartyFirstName: 'Adultery First O\'Martin O-Neil',
  reasonForDivorceAdultery3rdPartyLastName: 'Adultery Last O\'Martin O-Neil'
};

describe(modulePath, () => {
  beforeEach(() => {
    req = {};
    res = {};
    next = sinon.stub();
  });

  it('capitalizes names', () => {
    req.session = {};
    req.session = nameDetails;
    underTest(req, res, next);

    expect(next.calledOnce).to.eql(true);
    expect(req.session).to.eql(expectedNameDetails);
  });
});
