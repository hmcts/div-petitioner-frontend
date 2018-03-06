const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/petitioner/correspondence/address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PetitionerCorrespondenceAddress;
  });

  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });


  describe('success', () => {
    const session = {};

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

      testRedirect(done, agent, underTest, context, s.steps.LiveTogether);
    });
  });

  describe('Watched session values', () => {
    it('removes petitionerCorrespondenceAddress if petitionerCorrespondenceUseHomeAddress is yes', () => {
      const previousSession = {
        petitionerCorrespondenceUseHomeAddress: 'Yes',
        petitionerCorrespondenceAddress: ['Address 1', 'Address 2', 'Postcode']
      };

      const session = clone(previousSession);
      session.petitionerCorrespondenceUseHomeAddress = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.petitionerCorrespondenceAddress)
        .to.equal('undefined');
    });

    it('does not remove petitionerCorrespondenceAddress if petitionerCorrespondenceUseHomeAddress is no', () => {
      const previousSession = {
        petitionerCorrespondenceUseHomeAddress: 'No',
        petitionerCorrespondenceAddress: ['Address 1', 'Address 2', 'Postcode']
      };

      const session = clone(previousSession);
      session.petitionerCorrespondenceUseHomeAddress = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.petitionerCorrespondenceAddress)
        .to.not.equal('undefined');
    });
  });
});
