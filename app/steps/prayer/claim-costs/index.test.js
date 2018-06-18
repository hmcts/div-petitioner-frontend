const request = require('supertest');
const clone = require('lodash').cloneDeep;
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { mockSession } = require('test/fixtures');

const modulePath = 'app/steps/prayer/claim-costs';
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ClaimCosts;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('content', () => {
    let session = {};

    describe('when Help with fees refference number exists', () => {
      beforeEach(done => {
        session = {
          divorceWho: 'wife',
          helpWithFeesReferenceNumber: 'HWF-A1B-23C'
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'question',
          'introWhenNotClaimingAdultery',
          'warning',
          'warning5YearsSeparation',
          'whoCosts',
          'your',
          'theCorespondent',
          'introWhenClaimingAdultery',
          'youHaveToPayFeeAppNow'
        ];
        const context = { claimsCosts: 'Yes' };
        testContent(done, agent, underTest, content, session,
          excludeKeys, context);
      });
    });

    describe('when Help with fees refference does not exist', () => {
      beforeEach(done => {
        session = { divorceWho: 'wife' };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'question',
          'introWhenNotClaimingAdultery',
          'warning',
          'warning5YearsSeparation',
          'whoCosts',
          'your',
          'theCorespondent',
          'introWhenClaimingAdultery'
        ];
        const context = { claimsCosts: 'Yes' };
        testContent(done, agent, underTest, content, session,
          excludeKeys, context);
      });
    });

    describe('when reason is adultery and reasonForDivorceAdulteryWishToName is Yes', () => {
      beforeEach(done => {
        session = {
          divorceWho: 'wife',
          reasonForDivorce: 'adultery',
          reasonForDivorceAdulteryWishToName: 'Yes',
          reasonForDivorceAdultery3rdPartyFirstName: 'Scarlett',
          reasonForDivorceAdultery3rdPartyLastName: 'Johansson'
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'question',
          'introWhenNotClaimingAdultery',
          'warning',
          'warning5YearsSeparation'
        ];
        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });

    describe('when reason is adultery and reasonForDivorceAdulteryWishToName is No', () => {
      beforeEach(done => {
        session = {
          divorceWho: 'wife',
          reasonForDivorce: 'adultery',
          reasonForDivorceAdulteryWishToName: 'No'
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'question',
          'introWhenNotClaimingAdultery',
          'warning',
          'warning5YearsSeparation',
          'whoCosts',
          'your',
          'theCorespondent'
        ];
        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });

    describe('when reason is separation-5-years', () => {
      beforeEach(done => {
        session = {
          divorceWho: 'wife',
          reasonForDivorce: 'separation-5-years'
        };
        withSession(done, agent, session);
      });

      it('renders the content from the content file', done => {
        const excludeKeys = [
          'question',
          'introWhenClaimingAdultery',
          'whoCosts',
          'your',
          'theCorespondent'
        ];
        testContent(done, agent, underTest, content, session, excludeKeys);
      });
    });

    describe('errors when claiming', () => {
      it('renders errors for missing required context', done => {
        const context = { claim: 'Yes' };
        testErrors(done, agent, underTest, context, content, 'required', ['claimFor']);
      });
    });
  });

  describe('errors', () => {
    it('renders errors for missing required context', done => {
      const context = {};
      testErrors(done, agent, underTest, context, content, 'required', ['claim']);
    });
  });

  describe('success', () => {
    beforeEach(done => {
      const session = clone(mockSession);
      session.helpWithFeesNeedHelp = 'Yes';
      withSession(done, agent, session);
    });

    it('redirects to the UploadMarriageCertificate when need help with fees', done => {
      let nextStep = {};
      nextStep = s.steps.UploadMarriageCertificate;
      testRedirect(done, agent, underTest, {}, nextStep);
    });
  });
  describe('success', () => {
    beforeEach(done => {
      const session = clone(mockSession);
      session.helpWithFeesNeedHelp = 'No';
      withSession(done, agent, session);
    });

    it('redirects to the UploadMarriageCertificate when not applied for help with fees', done => {
      let nextStep = {};
      nextStep = s.steps.UploadMarriageCertificate;
      testRedirect(done, agent, underTest, {}, nextStep);
    });
  });

  describe('Watched session values', () => {
    it('removes reasonForDivorceAdulteryIsNamed if claimsCosts is set to no', () => {
      const previousSession = {
        claimsCosts: 'Yes',
        reasonForDivorceAdulteryIsNamed: 'Yes'
      };

      const session = clone(previousSession);
      session.claimsCosts = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.reasonForDivorceAdulteryIsNamed)
        .to.equal('undefined');
    });

    it('removes claimsCostsFrom if claimsCosts is set to no', () => {
      const previousSession = {
        claimsCosts: 'Yes',
        claimsCostsFrom: ['correspondent']
      };

      const session = clone(previousSession);
      session.claimsCosts = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.claimsCostsFrom).to.equal('undefined');
    });

    it(' does not remove reasonForDivorceAdulteryIsNamed or claimsCostsFrom if claimsCosts is set to yes', () => {
      const previousSession = {
        claimsCosts: 'No',
        reasonForDivorceAdulteryIsNamed: 'Yes',
        claimsCostsFrom: ['correspondent']
      };

      const session = clone(previousSession);
      session.claimsCosts = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.reasonForDivorceAdulteryIsNamed)
        .to.equal(previousSession.reasonForDivorceAdulteryIsNamed);
      expect(newSession.claimsCostsFrom)
        .to.deep.equal(previousSession.claimsCostsFrom);
    });

    it('removes data created in interceptor if claimsCosts is set to no', () => {
      const previousSession = {
        claimsCosts: 'Yes',
        claimsCostsAppliedForFees: true,
        reasonForDivorceClaiming5YearSeparation: true,
        reasonForDivorceClaimingAdultery: true
      };

      const session = clone(previousSession);
      session.claimsCosts = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.claimsCostsAppliedForFees)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceClaiming5YearSeparation)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceClaimingAdultery)
        .to.equal('undefined');
    });

    it('does not remove data created in interceptor if claimsCosts is set to yes', () => {
      const previousSession = {
        claimsCosts: 'No',
        claimsCostsAppliedForFees: true,
        reasonForDivorceClaiming5YearSeparation: true,
        reasonForDivorceClaimingAdultery: true
      };

      const session = clone(previousSession);
      session.claimsCosts = 'Yes';

      const newSession = removeStaleData(previousSession, session);

      expect(newSession.claimsCostsAppliedForFees)
        .to.equal(previousSession.claimsCostsAppliedForFees);
      expect(newSession.reasonForDivorceClaiming5YearSeparation)
        .to.equal(previousSession.reasonForDivorceClaiming5YearSeparation);
      expect(newSession.reasonForDivorceClaimingAdultery)
        .to.equal(previousSession.reasonForDivorceClaimingAdultery);
    });

    it('sets the claimsCostsFrom array to just respondent when correspondent is no longer named', () => {
      const previousSession = {
        claimsCosts: 'Yes',
        claimsCostsFrom: ['respondent', 'correspondent'],
        reasonForDivorceAdulteryWishToName: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.claimsCostsFrom).to.equal('undefined');
    });

    it('resets claimsCosts when only the correspondent is claimed from and then correspondent is no longer named', () => {
      const previousSession = {
        claimsCosts: 'Yes',
        claimsCostsFrom: ['correspondent'],
        reasonForDivorceAdulteryWishToName: 'Yes'
      };

      const session = clone(previousSession);
      session.reasonForDivorceAdulteryWishToName = 'No';

      const newSession = removeStaleData(previousSession, session);

      expect(typeof newSession.claimCosts).to.equal('undefined');
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when claimsCosts is no', done => {
      const contentToExist = ['question'];

      const valuesToExist = ['claimsCosts'];

      const context = { claimsCosts: 'No' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when claimsCosts is no and claimsCostsFrom is respondent', done => {
      const contentToExist = [
        'question',
        'whoCosts',
        'your'
      ];

      const valuesToExist = [
        'claimsCosts',
        'divorceWho'
      ];

      const context = {
        claimsCosts: 'No',
        claimsCostsFrom: ['respondent']
      };

      const session = {
        divorceWho: 'wife',
        reasonForDivorceAdultery3rdPartyFirstName: 'name 1',
        reasonForDivorceAdultery3rdPartyLastName: 'name 2'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('renders when claimsCosts is yes and claimsCostsFrom is correspondent', done => {
      const contentToExist = [
        'question',
        'whoCosts',
        'theCorespondent'
      ];

      const valuesToExist = ['claimsCosts'];

      const context = {
        claimsCosts: 'Yes',
        claimsCostsFrom: ['correspondent']
      };

      const session = {
        divorceWho: 'wife',
        reasonForDivorceAdultery3rdPartyFirstName: 'name 1',
        reasonForDivorceAdultery3rdPartyLastName: 'name 2'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('does not render claimsCostsFrom when it doesnt exist', done => {
      const contentToNotExist = [
        'whoCosts',
        'theCorespondent'
      ];

      const valuesToNotExist = [];

      const context = { claimsCosts: 'No' };

      const session = {
        divorceWho: 'wife',
        reasonForDivorceAdultery3rdPartyFirstName: 'name 1',
        reasonForDivorceAdultery3rdPartyLastName: 'name 2'
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context, session);
    });
  });
});
