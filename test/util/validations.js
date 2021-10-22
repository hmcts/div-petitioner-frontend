const validations = require('app/services/validations');

function stubReq({ body } = {}) {
  const req = {
    body: body || {},
    query: {},
    params: {},
    param: name => {
      return this.params[name];
    }
  };
  validations(req, {}, () => {});
  return req;
}

module.exports = {
  stubReq
};
