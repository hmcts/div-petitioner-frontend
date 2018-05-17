const mockFeeResponse = {
  code: 'FEE0002',
  description: 'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.',
  version: 4,
  fee_amount: 550.00
};

const get = () => {
  return new Promise(resolve => {
    resolve(mockFeeResponse);
  });
};

module.exports = { get, mockFeeResponse };