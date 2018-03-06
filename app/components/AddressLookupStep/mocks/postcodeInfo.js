/* eslint-disable no-magic-numbers */

const resultN42SW = require('./responses/n42sw.json');
const resultSw99pe = require('./responses/sw99pe.json');

module.exports = {
  lookupPostcode(postcode = '') {
    const transformedPostcode = postcode.toLowerCase().replace(/\s/g, '');

    let addresses = [];

    switch (transformedPostcode) {
    case 'invalid':
      return { valid: false };

    case 'throws':
      throw new Error('postcodeInfo client failed');

    case 'error':
      return { error: 'Error finding addresses' };

    case 'n42sw':
      addresses = resultN42SW;
      break;

    default:
      addresses = resultSw99pe;
      break;
    }

    return { valid: true, error: false, addresses };
  }
};
