const request = require('supertest');
const { testContent } = require('test/util/assertions');
const server = require('app');

const modulePath = 'app/steps/pay/awaiting-payment-status';
const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.AwaitingPaymentStatus;
  });

  describe('success', () => {
    const session = {};

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });
});
