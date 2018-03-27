module.exports = {
  /**
   * Mock to return a created payment response.
   *
   * @returns {Object}
   */
  create: () => {
    return new Promise(resolve => {
      resolve({
        id: '1',
        amount: 55000,
        status: 'created',
        external_reference: '123',
        reference: 'a65-f836-4f61-a628-727199ef6c20',
        date_created: 1519116121848,
        _links: { next_url: { href: '/pay/gov-pay-stub' } }
      });
    });
  },

  /**
   * Controlled mock to return payment response.
   *
   * @param {*} _ Skipped
   * @param {*} _a Skipped
   * @param {*} _b Skipped
   * @param {boolean} [outcome=false] Set this to true to return a success payment.
   *
   * @returns {Object}
   */
  query: (_, _a, _b, outcome = false) => {
    return new Promise(resolve => {
      resolve({
        id: '1',
        amount: 55000,
        status: outcome === true ? 'success' : 'failed',
        reference: 'a65-f836-4f61-a628-727199ef6c20',
        date_created: 1519116121853,
        _links: {}
      });
    });
  }
};
