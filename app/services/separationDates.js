const moment = require('moment');

const constants = {
  two: '2',
  five: '5',
  sep2yrs: 'separation-2-years',
  sep5yrs: 'separation-5-years',
  dateFormat: 'DD MMMM YYYY',
  six: '6',
  seven: '7',
  // Moment defaults year to 1970
  zeroYear: '1970'
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

const getDateBeforeSepYears = session => {
  return moment().subtract(getSepYears(session), 'years');
};

const getMostRecentSeparationDate = session => {
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
  const dateBeforeSepYears = getDateBeforeSepYears(session);
  const timeTogether = moment(
    dateBeforeSepYears.diff(
      moment(getMostRecentSeparationDate(session)))
  ).toObject();
  if (timeTogether.years > constants.zeroYear || timeTogether.months > constants.six) {
    return getReferenceDate(session);
  }
  let permittedSepTime = '';
  if (timeTogether.months > 0) {
    permittedSepTime = `${timeTogether.months} months`;
  }
  if (timeTogether.date / constants.seven >= 1) {
    permittedSepTime = `${`${permittedSepTime}, ${Math.trunc(timeTogether.date / constants.seven)}`} weeks`;
  }
  if (timeTogether.date % constants.seven > 0) {
    permittedSepTime = `${permittedSepTime + (timeTogether.date % constants.seven)} days`;
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