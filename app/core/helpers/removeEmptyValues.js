const { reduce } = require('lodash');

//  html forms post emtpy values as body.param = '', we need to strip these out
//  of the data that we validate as json schema required fields
//  expect the field to be absent
const removeEmptyValues = ctx => {
  return reduce(ctx, (acc, v, k) => {
    if (v !== '') {
      acc[k] = v;
    }
    return acc;
  }, {});
};

module.exports = removeEmptyValues;
