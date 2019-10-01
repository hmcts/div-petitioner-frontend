/* eslint-disable complexity */
const CONF = require('config');
const { filter, forEach, isEqual, isEmpty } = require('lodash');

const postcodeInfo = require('app/services/postcodeInfo');

const token = CONF.services.postcodeInfo.token;
const url = CONF.services.postcodeInfo.url;

//  let not const, so we can mock it in the tests properly
const client = postcodeInfo.client(token, url);

const postcodeLookupClient = token ? client : require('../mocks/postcodeInfo');

const INWARD_CODE_LENGTH = 3;

const formatPostcode = function(postcode = '') {
  //  remove existing whitespace and make everything capitals to match postcode lookup format
  let formattedPostcode = postcode.replace(' ', '').toUpperCase();

  //  postcode is UK always has 3 outward characters, so create space there
  formattedPostcode = `${formattedPostcode.slice(0, formattedPostcode.length - INWARD_CODE_LENGTH)} ${formattedPostcode.slice(formattedPostcode.length - INWARD_CODE_LENGTH, formattedPostcode.length)}`;

  return formattedPostcode;
};

const isEmptyAddress = function(address) {
  return address && isEmpty(filter(address, addr => {
    return !isEmpty(addr);
  }));
};

const addressHelpers = require('../helpers/addressHelpers');

module.exports = {

  * interceptor(ctx, session) {
    session.postcodeLookup = session.postcodeLookup || {};

    const reInstate = ['addresses', 'selectAddressIndex', 'validPostcode', 'postcodeError'];

    reInstate.forEach(name => {
      if (!ctx[name] && session.postcodeLookup[name]) {
        ctx[name] = session.postcodeLookup[name];
      }
    });

    // Use the lookup result from session if it exists.
    if (session.postcodeLookup.addresses) {
      ctx.addresses = session.postcodeLookup.addresses;
    }

    if (ctx.searchPostcode && ctx.searchPostcode !== 'false') {
      /*
              if the user has entered a post code to search on
              call the post code lookup
              and then add the addresses to the ctx ready for render in the select box
            */

      // reset any saved data as the user is starting a new search.
      session.postcodeLookup = {};
      delete ctx.address;
      delete ctx.addresses;
      delete ctx.selectAddressIndex;
      forEach(ctx, (v, k) => {
        if (/^addressLine[0-9]$/.test(k)) {
          delete ctx[k];
        }
      });

      const {
        valid,
        addresses,
        error
      } = yield postcodeLookupClient.lookupPostcode(ctx.postcode);
      if (error) {
        delete ctx.searchPostcode;
        ctx.postcodeError = 'true';
        session.postcodeLookup.postcodeError = 'true';
        return ctx;
      } else if (valid && addresses) {
        // save address for user selection
        ctx.addresses = addresses;
        session.postcodeLookup.addresses = addresses;
      }

      ctx.validPostcode = valid;
      session.postcodeLookup.validPostcode = valid;
    } else if (ctx.selectAddress) {
      /*
              if the user has selected an address from the dropdown
              split the formatted address, attach it to ctx ready to render in an
              address form
            */
      session.postcodeLookup.selectAddressIndex = ctx.selectAddressIndex;

      if (ctx.selectAddressIndex !== '-1' && ctx.addresses && ctx.addresses.length) {
        const address = ctx.addresses[ctx.selectAddressIndex];
        if (address && address.DPA && address.DPA.ADDRESS) {
          ctx.address = addressHelpers.buildConcatenatedAddress(
            ctx.addresses[ctx.selectAddressIndex]);
          ctx.addressBaseUK = addressHelpers.buildAddressBaseUk(
            ctx.addresses[ctx.selectAddressIndex]);
        } else {
          delete ctx.address;
        }
      } else {
        // something was wrong with the selection, remove any data we have regarding the address
        delete ctx.address;
      }
    } else {
      ctx.postcodeError = 'false';
      session.postcodeLookup.postcodeError = 'false';
    }

    /*
          if the user has hit continue, check the address has not been changed
          if so - update it on the ctx
        */
    if (ctx.addressType === 'postcode' && ctx.addressConfirmed === 'true') {
      const address = filter(ctx, (v, k) => {
        return /^addressLine[0-9]$/.test(k);
      });

      if (address.length) {
        ctx.address = isEqual(address, ctx.address) ? ctx.address : address;
        if (ctx.selectAddressIndex !== '-1' && ctx.addresses) {
          ctx.addressBaseUK = addressHelpers.buildAddressBaseUk(
            ctx.addresses[ctx.selectAddressIndex]);
        }
      }
    }
    return ctx;
  },

  prepareErrors(ctx, errors) {
    let errorList = errors;
    if (ctx.postcodeError === 'true') {
      errorList = filter(errorList, error => {
        return error.param === 'postcodeError';
      });
    } else if (!ctx.postcode) {
      errorList = filter(errorList, error => {
        return error.param === 'postcode';
      });
    } else if ((!ctx.addresses && !ctx.address) || isEmptyAddress(ctx.address)) {
      errorList = filter(errorList, error => {
        return error.param === 'address';
      });
    } else if (ctx.validPostcode && ctx.addresses && ctx.selectAddressIndex === '-1') {
      errorList = filter(errorList, error => {
        return error.param === 'selectAddressIndex';
      });
    } else if ((ctx.validPostcode && ctx.addresses) || (ctx.validPostcode && ctx.address)) {
      errorList = [];
    }

    return errorList;
  },

  action(ctx, session) {
    delete session.postcodeLookup;

    forEach(ctx, (v, k) => {
      if (/^addressLine[0-9]$/.test(k)) {
        delete ctx[k];
      }
    });

    if (ctx.postcode && ctx.postcode.length) {
      ctx.postcode = formatPostcode(ctx.postcode);
    }

    if (ctx.address && ctx.address.length) {
      ctx.formattedAddress = {
        whereabouts: ctx.address.filter(line => {
          return line !== ctx.postcode;
        }),
        postcode: ctx.postcode
      };
    }

    return ctx;
  }

};
