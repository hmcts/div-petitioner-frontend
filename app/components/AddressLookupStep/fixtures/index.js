const AddressLookupStep = require('app/components/AddressLookupStep');

module.exports = class TestAddress extends AddressLookupStep {
  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'testAddress';
  }

  get url() {
    return '/test/address';
  }
  get nextStep() {
    return { url: '/test/address/valid' };
  }
};
