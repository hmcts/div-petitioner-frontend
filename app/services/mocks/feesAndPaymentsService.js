const feeTypes = require('app/services/feeTypes');
const config = require('config');
const parseBool = require('app/core/utils/parseBool');

const mockFeeResponse = (feeType = '') => {
  const newFeeWO = 53;
  const oldFeeWO = 50;
  const appWithoutNoticeFee = parseBool(config.features.newFees) ? newFeeWO : oldFeeWO;
  const newFee = 592;
  const oldFee = 550;
  const applicationFee = parseBool(config.features.newFees) ? newFee : oldFee;


  if (feeType === feeTypes.amendFee) {
    return {
      feeCode: 'FEE0269',
      version: 1,
      amount: 95
    };
  } else if (feeType === feeTypes.enforcementFee) {
    return {
      feeCode: 'FEE0448',
      version: 1,
      amount: 45
    };
  } else if (feeType === feeTypes.appWithoutNoticeFee) {
    return {
      feeCode: 'FEE0228',
      version: 1,
      amount: appWithoutNoticeFee
    };
  }

  return {
    feeCode: 'FEE0002',
    version: 4,
    amount: applicationFee
  };
};


const getFee = feeType => {
  return new Promise(resolve => {
    resolve(mockFeeResponse(feeType));
  });
};


module.exports = { getFee, mockFeeResponse };
