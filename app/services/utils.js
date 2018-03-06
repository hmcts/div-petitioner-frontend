const dateEmpty = function(day, month, year) {
  return (day === '' && month === '' && year === '') || (!day && !month && !year);
};

const partialDate = function(day, month, year) {
  return (day === '' || month === '' || year === '') || (!day || !month || !year);
};

module.exports = {
  dateEmpty,
  partialDate
};
