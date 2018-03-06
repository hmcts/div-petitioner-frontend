const CONF = require('config');
const request = require('request-promise-native');
const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/services/ga';

const underTest = require(modulePath);

describe(modulePath, () => {
  describe('#trackEvent', () => {
    beforeEach(() => {
      sinon.stub(request, 'post');
    });

    afterEach(() => {
      request.post.restore();
    });

    it('sends tracking event', () => {
      // Arrange.
      const category = 'category';
      const action = 'action';
      const label = 'label';
      const value = 'value';
      // Act.
      underTest.trackEvent(category, action, label, value);
      // Assert.
      const call = request.post.getCall(0);
      const { form } = call.args[1];
      expect(request.post.calledOnce).to.equal(true);
      expect(call.args[0]).to.eql(CONF.google_analytics.eventTrackingUrl);
      expect(form).to.have.property('tid', CONF.google_analytics.propertyId);
      expect(form).to.have.property('ec', category);
      expect(form).to.have.property('ea', action);
      expect(form).to.have.property('el', label);
      expect(form).to.have.property('ev', value);
    });
  });
});
