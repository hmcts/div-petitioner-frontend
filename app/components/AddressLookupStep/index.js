const requireDirectory = require('require-directory');
const { get, set, merge, unset, forEach } = require('lodash');
const ValidationStep = require('app/core/ValidationStep');
const fs = require('fs');

const addressContent = require('./content');
const schema = require('./schema');


const addressTypes = requireDirectory(module, 'addressTypes', { exclude: /.test.js/ });

module.exports = class AddressLookupStep extends ValidationStep {
  constructor(steps, section, templatePath, content) {
    const mergedContent = merge({}, addressContent, content);
    let addressTemplatePath = 'AddressLookupStep';

    const path = `app/steps/${templatePath}/template.html`;
    if (fs.existsSync(path)) {
      addressTemplatePath = templatePath;
    }

    super(steps, section, addressTemplatePath, mergedContent, schema);
  }

  get urlToBind() {
    return `${this.url}/:addressType*?`;
  }

  * interceptor(ctx, session) {
    if (ctx.selectAddressIndex) {
      set(session, `${this.schemaScope}.selectAddressIndex`, ctx.selectAddressIndex);
    }

    if (ctx.searchPostcode && ctx.searchPostcode !== 'false') {
      unset(session, `${this.schemaScope}`);
    }

    // save address type directly to session

    if (ctx.addressType) {
      set(session, `${this.schemaScope}.addressType`, ctx.addressType);
    } else {
      ctx.addressType = get(session, `${this.schemaScope}.addressType`) || 'postcode';
    }

    // remove old address type data

    if (ctx.addressType !== 'postcode') {
      session.postcodeLookup = {};
      unset(session, `${this.schemaScope}.postcode`);
      unset(session, `${this.schemaScope}.selectAddressIndex`);
      forEach(session[this.schemaScope], (v, k) => {
        if (/^addressLine[0-9]$/.test(k)) {
          delete ctx[k];
        }
      });
    }

    if (ctx.addressType !== 'manual') {
      unset(session, `${this.schemaScope}.addressManual`);
    }

    let newCtx = ctx;
    try {
      newCtx = yield addressTypes[ctx.addressType].interceptor(ctx, session);
      newCtx.url = this.url;
    } catch (error) {
      throw error;
    }

    return newCtx;
  }


  * validate(ctx) {
    let [isValid, errors] = yield super.validate(ctx); // eslint-disable-line prefer-const

    if (!isValid) {
      try {
        errors = yield addressTypes[ctx.addressType].prepareErrors(ctx, errors);
      } catch (error) {
        throw error;
      }
    }

    return [isValid, errors];
  }


  * action(ctx, session) {
    let newCtx = ctx;
    try {
      newCtx = yield addressTypes[ctx.addressType].action(ctx, session);
    } catch (error) {
      throw error;
    }

    return [newCtx, session];
  }

  checkYourAnswersInterceptor(ctx) {
    ctx.address = ctx.address || [];

    return { address: ctx.address.join('<br/>') };
  }
};
