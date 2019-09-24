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
        amount: 550,
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
        amount: 550,
        status: outcome === true ? 'success' : 'failed',
        reference: 'a65-f836-4f61-a628-727199ef6c20',
        date_created: 1519116121853,
        _links: {}
      });
    });
  },
  /**
   * Controlled mock to return all payments response.
   *
   * @param {*} _ Skipped
   * @param {*} _a Skipped
   * @param {*} _b Skipped
   * @param {boolean} [outcome=false] Set this to true to return a success payment.
   *
   * @returns {Object}
   */
  queryAllPayments: (_, _a, _b, outcome = false) => {
    return new Promise(resolve => {
      resolve(
        {
          payments: [
            {
              amount: 550,
              date_created: '2019-09-10T14:11:47.125+0000',
              date_updated: '2019-09-10T14:17:15.605+0000',
              currency: 'GBP',
              ccd_case_number: '1568124197377724',
              payment_reference: 'RC-1568-1247-0682-3218',
              channel: 'online',
              method: 'card',
              external_provider: 'gov pay',
              status: outcome === true ? 'Success' : 'Failed',
              external_reference: '2lkfor5neonun6u5ji2rr6qdlv',
              site_id: 'AA00',
              service_name: 'Divorce',
              payment_group_reference: '2019-15681247068',
              fees: [
                {
                  id: 91311,
                  code: 'FEE0002',
                  version: '4',
                  volume: 1,
                  calculated_amount: 550,
                  memo_line: 'GOV - App for divorce/nullity of marriage or CP',
                  natural_account_code: '4481102159',
                  ccd_case_number: '1568124197377724',
                  jurisdiction1: 'family',
                  jurisdiction2: 'family court'
                }
              ],
              status_histories: [
                {
                  status: 'Initiated',
                  external_status: 'created',
                  date_created: '2019-09-10T14:11:47.125+0000'
                }
              ]
            }
          ]
        }
      );
    });
  }
};
