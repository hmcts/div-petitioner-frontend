const { filter } = require('lodash');

module.exports = {

  interceptor(ctx) {
    if (ctx.addressType === 'manual') {
      delete ctx.selectAddressIndex;
      delete ctx.addresses;
    }
    return ctx;
  },


  prepareErrors(ctx, errors) {
    let errorList = errors;
    errorList = filter(errorList, error => {
      return error.param === 'addressManual';
    });

    return errorList;
  },


  action(ctx) {
    if (ctx.addressManual && ctx.addressManual.length) {
      ctx.address = ctx.addressManual
        .split(/\r?\n/)
        .map(line => {
          return line.trim();
        })
        .filter(x => {
          return Boolean(x);
        });
    }

    return ctx;
  }
};
