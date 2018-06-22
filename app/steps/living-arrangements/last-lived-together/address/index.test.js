const request = require('supertest');
const { testContent, testRedirect } = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/living-arrangements/last-lived-together/address';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.LastLivedTogetherAddress;
  });

  afterEach(() => {
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
        postcode: 'ea1 eaf'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.RespondentLivesAtLastAddress);
    });
  });

  describe('Watched session values', () => {
    it('removes livingArrangementsLastLivedTogetherAddress if livingArrangementsLastLivedTogether is changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLastLivedTogetherAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      delete session.livingArrangementsLastLivedTogether;

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.livingArrangementsLastLivedTogetherAddress)
        .to.equal('undefined');
    });

    it('removes livingArrangementsLastLivedTogetherAddress if livingArrangementsLastLivedTogether is changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLastLivedTogetherAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.livingArrangementsLastLivedTogether = 'No';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.livingArrangementsLastLivedTogetherAddress)
        .to.equal('undefined');
    });

    it('does not remove livingArrangementsLastLivedTogetherAddress if livingArrangementsLastLivedTogether is not changed', () => {
      const previousSession = {
        livingArrangementsLastLivedTogether: 'Yes',
        livingArrangementsLastLivedTogetherAddress: ['Address 1', 'Address 2', 'Address 3']
      };

      const session = clone(previousSession);
      session.livingArrangementsLastLivedTogether = 'Yes';

      const newSession = removeStaleData(previousSession, session);
      expect(typeof newSession.livingArrangementsLastLivedTogetherAddress)
        .to.not.equal('undefined');
    });
  });
});
