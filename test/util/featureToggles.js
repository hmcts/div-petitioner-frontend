const CONF = require('config');
const { cloneDeep } = require('lodash');

const originalConfig = cloneDeep(CONF);

/**
 * Run a test with one or more features set.
 *
 * @param {string|string[]} features
 * @param {boolean|boolean[]} enabled
 * @param {function} test
 * @param {*} testParameters
 * @returns {function(*)}
 */
function when(features, enabled, test, ...testParameters) {
  const featureList = Array.isArray(features) ? features : [features];
  const valueList = Array.isArray(enabled) ? enabled : [enabled];
  const criteriaDescription = featureList.reduce((accumulator, feature, index) => {
    return accumulator.concat(`${feature} is ${valueList[index] ? 'enabled' : 'disabled'}`);
  }, []);
  this.title = `${this.title} when ${criteriaDescription.join(', ')}`;
  return done => {
    const cleanup = err => {
      featureList.forEach(value => {
        CONF.features[value] = originalConfig.features[value];
      });
      done(err);
    };
    featureList.forEach((value, index) => {
      CONF.features[value] = valueList[index];
    });
    test(cleanup, ...testParameters);
  };
}

module.exports = { when };
