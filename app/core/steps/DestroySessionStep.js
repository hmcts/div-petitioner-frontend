const Step = require('./Step');
const idam = require('app/services/idam');

module.exports = class DestroySessionStep extends Step {
  * interceptor(ctx, session) {
    yield new Promise((resolve, reject) => {
      session.destroy(error => {
        return error ? reject(error) : resolve();
      });
    });

    return ctx;
  }

  get middleware() {
    return [idam.logout()];
  }
};
