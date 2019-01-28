const mockFeeResponse = {
  feeCode: 'FEE0002',
  version: 4,
  amount: 550.00
};

const get = () => {
  return new Promise(resolve => {
    resolve(mockFeeResponse);
  });
};

const getFee = feeType => {
  return new Promise(resolve => {
    resolve({
      feeCode: feeType,
      version: 1,
      amount: 95.00
    });
  });
};


module.exports = { get, getFee, mockFeeResponse };