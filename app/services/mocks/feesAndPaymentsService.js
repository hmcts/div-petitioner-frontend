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

module.exports = { get, mockFeeResponse };