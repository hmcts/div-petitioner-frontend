const truthies = ['true', '1', 'yes', 'y'];

const parseBool = (bool = '') => {
  if (truthies.includes(String(bool).toLowerCase())) {
    return true;
  }
  return false;
};

module.exports = parseBool;
