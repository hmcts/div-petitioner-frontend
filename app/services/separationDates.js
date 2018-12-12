const moment = require('moment');

const constants = {
  two: '2',
  five: '5',
  sep2yrs: 'separation-2-years',
  sep5yrs: 'separation-5-years',
  dateFormat: 'DD MMMM YYYY',
  six: '6',
  seven: '7'
};

const getSepYears = session => {
  let sepYears = '0';
  if (session.reasonForDivorce === constants.sep2yrs) {
    sepYears = constants.two;
  } else if (session.reasonForDivorce === constants.sep5yrs) {
    sepYears = constants.five;
  }
  return sepYears;
};

const getPermittedSepDate = session => {
  return moment().subtract(getSepYears(session), 'years');
};

const getMostRecentSeparationDate = session => {
  if (moment(session.reasonForDivorceDecisionDate) > moment(session.reasonForDivorceLivingApartDate)) {
    return session.reasonForDivorceDecisionDate;
  }
  return session.reasonForDivorceLivingApartDate;
};

const getLivingTogetherMonths = session => {
  return moment(getPermittedSepDate(session)).diff(moment(getMostRecentSeparationDate(session)), 'months');
};

const getLivingTogetherWeeks = session => {
  return moment(getPermittedSepDate(session)).diff(moment(getMostRecentSeparationDate(session)), 'weeks');
};

const getLivingTogetherDays = session => {
  return moment(getPermittedSepDate(session)).diff(moment(getMostRecentSeparationDate(session)), 'days');
};

const getLiveTogetherPeriodRemainingDays = session => {
  return getLivingTogetherDays(session) % constants.seven;
};

const getSepStartDate = session => {
  return moment().subtract(getSepYears(session), 'years')
    .subtract(constants.six, 'months')
    .format('DD MMMM YYYY');
};

const formattedMostRecentSepDate = session => {
    return moment(getMostRecentSeparationDate(session)).format(constants.dateFormat); // eslint-disable-line 
};


module.exports = {
  getSepYears,
  getPermittedSepDate,
  getLivingTogetherMonths,
  getLivingTogetherWeeks,
  getLivingTogetherDays,
  getLiveTogetherPeriodRemainingDays,
  getSepStartDate,
  getMostRecentSeparationDate,
  formattedMostRecentSepDate
};
