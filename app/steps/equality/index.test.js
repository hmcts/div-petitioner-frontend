const { expect, sinon } = require('test/util/chai');
const Equality = require('app/steps/equality/index');
const CONF = require('config');

const modulePath = 'app/steps/equality';
const equality = new Equality({}, '', null);

describe(modulePath, () => {
  describe('url', () => {
    it('returns the correct url', () => {
      expect(equality.url).to.equal('/equality-and-diversity');
    });
  });

  describe('handler', () => {
    let req = {};
    const res = {};
    const pcqUrl = CONF.services.equalityAndDiversity.url;

    beforeEach(() => {
      req = {
        headers: { host: 'localhost' },
        session: {
          petitionerPcqId: 'pcqId-abc123',
          petitionerEmail: 'test+test@test.com',
          language: 'en'
        }
      };
      res.redirect = sinon.spy();
    });

    it('returns the correct url', () => {
      equality.handler(req, res);
      expect(res.redirect.getCall(0).args[0]).to.satisfy(str => {
        return str.startsWith(`${pcqUrl}/service-endpoint?serviceId=DIVORCE&actor=PETITIONER&pcqId=pcqId-abc123&partyId=test%2Btest%40test.com&returnUrl=localhost/check-your-answers&language=en&token=`);
      });
    });
  });
});
