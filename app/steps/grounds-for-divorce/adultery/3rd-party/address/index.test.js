const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/3rd-party/address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.Adultery3rdPartyAddress;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });

    it('redirects to the next page', done => {
      const context = {
        addressType: 'postcode',
        addressConfirmed: 'true',
        address: ['address', '1', 'ea1 eaf'],
        postcode: 'ea1 eaf',
        postcodeError: false
      };

      testRedirect(done, agent, underTest, context, s.steps.AdulteryWhere);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceAdultery3rdAddress if reasonForDivorceAdulteryWishToName is set to no', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdultery3rdAddress: ['address line 1', 'address line 2', 'address line 2', 'postcode']
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('No');
      expect(typeof newSession.reasonForDivorceAdultery3rdAddress)
        .to.equal('undefined');
    });

    it('removes reasonForDivorceAdultery3rdAddress if reasonForDivorceAdulteryWishToName is removed', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'Yes',
        reasonForDivorceAdultery3rdAddress: ['address line 1', 'address line 2', 'address line 2', 'postcode']
      };

      const session = clone(previousSession);
      delete session.reasonForDivorceAdulteryWishToName;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.reasonForDivorceAdultery3rdAddress)
        .to.equal('undefined');
    });

    it('does not remove reasonForDivorceAdultery3rdAddress if reasonForDivorceAdulteryWishToName is set to yes', () => {
      const previousSession = {
        reasonForDivorceAdulteryWishToName: 'No',
        reasonForDivorceAdultery3rdAddress: {
          addressType: 'postcode',
          address: ['address line 1', 'address line 2', 'address line 2', 'postcode']
        }
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorceAdulteryWishToName).to.equal('Yes');
      expect(newSession.reasonForDivorceAdultery3rdAddress)
        .to.equal(previousSession.reasonForDivorceAdultery3rdAddress);
    });
  });
});
