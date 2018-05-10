const { find } = require('lodash');
const Step = require('./Step');
const ValidationStep = require('./ValidationStep');

module.exports = class OptionStep extends ValidationStep {
  next(pathData) {
    let error; // eslint-disable-line init-declarations
    let val; // eslint-disable-line init-declarations
    const path = [];

    const f = (v, k) => {
      if (!pathData.hasOwnProperty(k)) {
        return false;
      }

      path.push(k, pathData[k]);

      if (v[pathData[k]] instanceof Step) {
        val = v[pathData[k]];

        return true;
      } else if (typeof v[pathData[k]] === 'object') {
        return find(v[pathData[k]], f);
      }

      error = new ReferenceError(`Step ${this.name} has no valid next Step class at this.nextStep.${path.join('.')}`);
      return false;
    };

    find(this.nextStep, f);

    if (error && !val) {
      throw error;
    }

    return val;
  }
  get middleware() {
    return super.middleware;
  }
};
