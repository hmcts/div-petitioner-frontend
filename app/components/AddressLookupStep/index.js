const requireDirectory = require('require-directory');
const { get, set, merge, unset, forEach, cloneDeep } = require('lodash');
const ValidationStep = require('app/core/steps/ValidationStep');
const fs = require('fs');
const requestHandler = require('app/core/helpers/parseRequest');

const addressContent = require('./content');
const schema = require('./schema');


const addressTypes = requireDirectory(module, 'addressTypes', { exclude: /.test.js/ });


const buildAddressBaseUk = function(selectedAddress) {
  let line1 = `${selectedAddress.organisation_name} ${selectedAddress.department_name} ${selectedAddress.po_box_number}`;
  let line2 = `${selectedAddress.building_name} ${selectedAddress.sub_building_name} ${selectedAddress.building_number} ${selectedAddress.thoroughfare_name}`;
  let line3 = `${selectedAddress.dependent_locality} ${selectedAddress.double_dependent_locality}`;

  if (line1.trim().length === 0) {
    line1 = line2;
    line2 = line3;
    line3 = '';
  }

  const addressBaseUK = {
    addressLine1: line1.replace(' null', ' ').replace('null ', ' ')
      .replace(/ +/g, ' ')
      .trim(),
    addressLine2: line2.replace(' null', ' ').replace('null ', ' ')
      .replace(/ +/g, ' ')
      .trim(),
    addressLine3: line3.replace(' null', ' ').replace('null ', ' ')
      .replace(/ +/g, ' ')
      .trim(),
    postCode: selectedAddress.postcode,
    postTown: selectedAddress.post_town,
    county: '',
    country: 'UK'
  };

  return addressBaseUK;
};

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

  populateWithPreExistingData(session) {
    return cloneDeep(get(session, this.schemaScope, {}));
  }

  applyCtxToSession(ctx, session) {
    if (session.postcodeLookup && session.postcodeLookup.addresses && session.postcodeLookup.selectAddressIndex) {
      ctx.addressBaseUK = buildAddressBaseUk(session.postcodeLookup);
    }
    session[this.schemaScope] = ctx;
    return session;
  }

  get urlToBind() {
    return `${this.url}/:addressType*?`;
  }

  * getRequest(req, res) {
    const { session } = req;

    // get params from url i.e. what addressType
    const postedData = requestHandler.parse(this, req);
    if (postedData && postedData.addressType) {
      set(session, `${this.schemaScope}.addressType`, postedData.addressType);
    }

    return yield super.getRequest(req, res);
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


  validate(ctx) {
    let [isValid, errors] = super.validate(ctx); // eslint-disable-line prefer-const

    if (!isValid) {
      try {
        errors = addressTypes[ctx.addressType].prepareErrors(ctx, errors);
      } catch (error) {
        throw error;
      }
    }

    return [isValid, errors];
  }


  action(ctx, session) {
    let newCtx = ctx;
    try {
      newCtx = addressTypes[ctx.addressType].action(ctx, session);
    } catch (error) {
      throw error;
    }

    return [newCtx, session];
  }

  checkYourAnswersInterceptor(ctx) {
    ctx.address = ctx.address || [];

    return { address: ctx.address.join('<br>') };
  }
};
