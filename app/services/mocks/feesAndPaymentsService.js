const feeTypes = {
  applicationFee: 'petition-issue-fee',
  amendFee: 'amend-fee'
};

const mockFeeResponse = (feeType = '') => {
  if (feeType === feeTypes.amendFee) {
    return {
      feeCode: 'FEE0269',
      version: 1,
      amount: 95
    };
  }
  return {
    feeCode: 'FEE0002',
    version: 4,
    amount: 550
  };
};


const getFee = feeType => {
  return new Promise(resolve => {
    resolve(mockFeeResponse(feeType));
  });
};


module.exports = { getFee, mockFeeResponse };