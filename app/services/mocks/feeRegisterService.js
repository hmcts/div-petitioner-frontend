const mockFeeResponse = {
  code: 'X0165',
  description: 'Filing an application for a divorce, nullity or civil partnership dissolution – fees order 1.2.',
  version: 1,
  fee_amount: 123.00
};

const get = () => {
  return new Promise(resolve => {
    resolve(mockFeeResponse);
  });
};

module.exports = { get, mockFeeResponse };