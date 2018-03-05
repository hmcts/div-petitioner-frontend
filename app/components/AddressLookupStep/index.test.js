const { merge } = require('lodash');
const request = require('supertest');
const { testContent, testCYATemplate, testExistenceCYA, testErrors } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const runStepHandler = require('app/core/handler/runStepHandler');
const server = require('app');

const modulePath = 'app/components/AddressLookupStep';
const addressContent = require(`${modulePath}/content`);

const UnderTest = require('app/components/AddressLookupStep/fixtures');
const underTestContent = require('app/components/AddressLookupStep/fixtures/content');

const content = merge({}, addressContent, underTestContent);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    underTest = new UnderTest({}, 'test.section', 'AddressLookupStep', underTestContent);
    s.app.use(underTest.urlToBind, runStepHandler(underTest));
    agent = request.agent(s.app);
  });

  afterEach(() => {
    s.http.close();
  });


  describe('selecting an address via the postcode service', () => {
    let session = {};

    describe('using the postcode selector', () => {
      beforeEach(done => {
        session = { testAddress: { addressType: 'postcode' } };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'enterPostcodeLink', 'address',
          'selectAnAddress', 'selectAddress', 'pickAddress',
          'buildingAndStreet', 'streetLine2', 'townOrCity', 'county', 'optional',
          'postcode', 'fullAddress', 'adressesFound', 'updateAddress'
        ];

        testContent(done, agent, underTest, content, session, excludeKeys);
      });


      it('renders errors for missing required context', done => {
        const context = {};

        const onlyKeys = ['postcode'];

        testErrors(done, agent, underTest, context, content, 'required', onlyKeys);
      });
    });

    describe('selecting an address from the addresses list', () => {
      beforeEach(done => {
        session = {
          testAddress: {
            addressType: 'postcode',
            addresses: ['address\n1'],
            addressSelect: 0
          }
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'enterPostcodeLink', 'address', 'buildingAndStreet', 'streetLine2',
          'townOrCity', 'county', 'optional',
          'postcode', 'fullAddress', 'selectAnAddress', 'selectAddress',
          'pickAddress', 'adressesFound', 'updateAddress'
        ];

        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });

    describe('not selecting an address from the addresses list', () => {
      beforeEach(done => {
        session = {
          testAddress: {
            addressType: 'postcode',
            addresses: ['address\n1']
          }
        };
        withSession(done, agent, session);
      });

      it('renders errors for missing required context', done => {
        const context = {};

        const onlyKeys = ['addressSelect'];

        testErrors(done, agent, underTest, context, content, 'required', onlyKeys);
      });
    });
  });

  describe('entering an address manually', () => {
    let session = {};

    beforeEach(done => {
      session = { testAddress: { addressType: 'manual' } };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludeKeys = [
        'enterManualLink', 'address', 'findAddress', 'enterPostcode',
        'selectAnAddress', 'selectAddress', 'pickAddress',
        'buildingAndStreet', 'streetLine2', 'townOrCity', 'county', 'optional',
        'postcode', 'adressesFound', 'updateAddress'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });


    it('renders errors for missing required context', done => {
      const context = {};

      const onlyKeys = ['addressManual'];

      testErrors(done, agent, underTest, context, content, 'required', onlyKeys);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders address', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['address'];

      const context = { address: ['line 1', 'line 2', 'line 3', 'postcode'] };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
