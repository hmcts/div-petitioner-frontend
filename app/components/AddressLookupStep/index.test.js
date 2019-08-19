const { merge } = require('lodash');
const request = require('supertest');
const { testContent, testCYATemplate, testExistenceCYA, testErrors, testExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const { expect, sinon } = require('test/util/chai');
const co = require('co');

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
    s.app.use(underTest.router);
    agent = request.agent(s.app);
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
            postcode: 'postcode'
          }
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'enterPostcodeLink', 'address', 'buildingAndStreet', 'streetLine2',
          'townOrCity', 'county', 'optional',
          'postcode', 'fullAddress', 'selectAddress',
          'adressesFound', 'updateAddress', 'enterManualLink'
        ];

        testContent(done, agent, underTest, content, session, excludeKeys);
      });

      it('adds auto focus to select an address element', done => {
        const autoFocusHTML = 'name="selectAddressIndex" title="Select an address" onchange="this.form.submit()" autofocus>';

        testExistence(done, agent, underTest, autoFocusHTML, session);
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

    it('renders errors for missing required manual address', done => {
      const context = {
        address: [],
        addressType: 'manual',
        addressConfirmed: 'true',
        addressManual: ''
      };

      const onlyKeys = ['addressManual'];
      testErrors(done, agent, underTest, context, content, 'required', onlyKeys);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      const onlyKeys = ['addressManual'];

      testErrors(done, agent, underTest, context, content, 'required', onlyKeys);
    });
  });

  describe('#getRequest', () => {
    let req = {};
    let res = {};
    beforeEach(() => {
      req = {
        session: {},
        body: {},
        method: 'GET'
      };
      res = {
        locals: {},
        render: sinon.stub()
      };
    });
    it('renders the template successfully', done => {
      req.query = { addressType: 'manual' };
      co(function* generator() {
        yield underTest.getRequest(req, res);
        expect(req.session.hasOwnProperty('testAddress')).to.eql(true);
        expect(req.session.testAddress).to.eql({ addressType: 'manual' });
      }).then(done, done);
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

  describe('address selected from address list but deleted after', () => {
    beforeEach(done => {
      const session = {};
      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {
        addressType: 'postcode',
        addresses: ['some address'],
        address: ['', '', ''],
        postcode: 'SW1H 9AG',
        addressSelect: 0
      };

      const onlyKeys = ['address'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys);
    });
  });
});
