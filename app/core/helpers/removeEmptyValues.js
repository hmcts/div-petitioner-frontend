const { reduce } = require('lodash');

//  html forms post emtpy values as body.param = '', we need to strip these out
//  of the data that we validate as json schema required fields
//  expect the field to be absent
const removeEmptyValues = ctx => {
  return reduce(ctx, (acc, v, k) => {
    const afterTrim = (v && typeof v === 'string') ? v.trim() : v;
    if (afterTrim !== '') {
      acc[k] = afterTrim;
    }
    return acc;
  }, {});
};

module.exports = removeEmptyValues;
