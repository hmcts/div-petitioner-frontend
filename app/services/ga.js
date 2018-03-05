const request = require('request-promise-native');
const config = require('config');

function trackEvent(category, action, label, value) {
  const form = {
    // API Version.
    v: '1',
    // Tracking ID / Property ID.
    tid: config.google_analytics.propertyId,
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: 'Divorce',
    // Event hit type.
    t: 'event',
    // Event category.
    ec: category,
    // Event action.
    ea: action,
    // Event label.
    el: label,
    // Event value.
    ev: value
  };

  return request.post(config.google_analytics.eventTrackingUrl, { form });
}

module.exports = { trackEvent };
