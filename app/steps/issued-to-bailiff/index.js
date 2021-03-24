const Step = require('app/core/steps/Step');
const { getDownloadableFiles } = require('../../core/utils/viewHelper');

module.exports = class SentToBailiff extends Step {
  get url() {
    return '/issued-to-bailiff';
  }

  interceptor(ctx, session) {
    session.downloadableFiles = this.getDownloadableFiles(session);
    return ctx;
  }

  getDownloadableFiles(session) {
    return getDownloadableFiles(session);
  }
};
