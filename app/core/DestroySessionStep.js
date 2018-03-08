const Step = require('./Step');

module.exports = class DestroySessionStep extends Step {
  * interceptor(ctx, session) {
    yield new Promise((resolve, reject) => {
      session.destroy(error => {
        return error ? reject(error) : resolve();
      });
    });

    return ctx;
  }

  get nextStep() {
    return null;
  }

  get middleware() {
    return [];
  }
};
