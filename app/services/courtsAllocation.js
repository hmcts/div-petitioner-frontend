const weighted = require('weighted');
const CONF = require('config');

const allocateCourt = () => {
  const options = Object.keys(CONF.commonProps.court)
    .reduce((list, value) => {
      list[value] = Number(CONF.commonProps.court[value].weight);
      return list;
    }, {});

  return weighted.select(options);
};

module.exports = { allocateCourt };