module.exports = (bool = '') => {
  return String(bool) === 'true' || bool === 1;
};
