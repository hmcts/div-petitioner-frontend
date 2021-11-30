const feeTypes = require('app/services/feeTypes');

const mockFeeResponse = (feeType = '') => {
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
      amount: 110
    };
  } else if (feeType === feeTypes.appWithoutNoticeFee) {
    return {
      feeCode: 'FEE0228',
      version: 1,
      amount: 53
    };
  }

  return {
    feeCode: 'FEE0002',
    version: 4,
    amount: 593
  };
};


const getFee = feeType => {
  return new Promise(resolve => {
    resolve(mockFeeResponse(feeType));
  });
};


module.exports = { getFee, mockFeeResponse };
