const moment = require('moment');

const constants = {
  two: '2',
  five: '5',
  sep2yrs: 'separation-2-years',
  sep5yrs: 'separation-5-years',
  desertion: 'desertion',
  dateFormat: 'DD MMMM YYYY',
  six: '6',
  seven: '7',
  // Moment defaults year to 1970
  zeroYear: '1970'
};

const getSepYears = session => {
  let sepYears = constants.two;
  if (session.reasonForDivorce === constants.sep5yrs) {
    sepYears = constants.five;
  }
  return sepYears;
};

const getDateBeforeSepYears = session => {
  return moment().subtract(getSepYears(session), 'years');
};

const getMostRecentSeparationDate = session => {
  if (session.reasonForDivorce === constants.desertion) {
    return session.reasonForDivorceDesertionDate;
  }
  if (moment(session.reasonForDivorceDecisionDate) > moment(session.reasonForDivorceLivingApartDate)) {
    return session.reasonForDivorceDecisionDate;
  }
  return session.reasonForDivorceLivingApartDate;
};

const getLivingTogetherMonths = session => {
  return getDateBeforeSepYears(session).diff(moment(getMostRecentSeparationDate(session)), 'months');
};

const getLivingTogetherWeeks = session => {
  return getDateBeforeSepYears(session).diff(moment(getMostRecentSeparationDate(session)), 'weeks');
};

const getLivingTogetherDays = session => {
  return getDateBeforeSepYears(session).diff(moment(getMostRecentSeparationDate(session)), 'days');
};

const getLiveTogetherPeriodRemainingDays = session => {
  return getLivingTogetherDays(session) % constants.seven;
};

const getReferenceDate = session => {
  return moment().subtract(getSepYears(session), 'years')
    .subtract(constants.six, 'months')
    .format('DD MMMM YYYY');
};

const formattedMostRecentSepDate = session => {
  return moment(
    getMostRecentSeparationDate(session)
  ).format(constants.dateFormat);
};

const getSeparationTimeTogetherPermitted = session => {
  const timeTogetherMonths = getLivingTogetherMonths(session);
  const timeTogetherWeeks = getLivingTogetherWeeks(session);
  const timeTogetherDays = getLivingTogetherDays(session) % constants.seven;

  if (timeTogetherMonths >= constants.six) {
    return '6 months';
  }
  let permittedSepTime = '';
  if (timeTogetherWeeks === 1) {
    permittedSepTime = `${timeTogetherWeeks} week`;
  } else if (timeTogetherWeeks > 1) {
    permittedSepTime = `${timeTogetherWeeks} weeks`;
  }
  if (timeTogetherWeeks > 0 && timeTogetherDays > 0) {
    permittedSepTime = `${permittedSepTime} and `;
  }
  if (timeTogetherDays === 1) {
    permittedSepTime = `${`${permittedSepTime}${timeTogetherDays}`} day`;
  } else if (timeTogetherDays > 1) {
    permittedSepTime = `${`${permittedSepTime}${timeTogetherDays}`} days`;
  }
  return permittedSepTime;
};

module.exports = {
  getSepYears,
  getDateBeforeSepYears,
  getLivingTogetherMonths,
  getLivingTogetherWeeks,
  getLivingTogetherDays,
  getLiveTogetherPeriodRemainingDays,
  getReferenceDate,
  getMostRecentSeparationDate,
  formattedMostRecentSepDate,
  getSeparationTimeTogetherPermitted
};
