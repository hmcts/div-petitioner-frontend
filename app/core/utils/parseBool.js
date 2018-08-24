module.exports = (bool = '') => {
  return typeof bool === 'string' ? bool.toLowerCase() === 'true' : bool === true;
};