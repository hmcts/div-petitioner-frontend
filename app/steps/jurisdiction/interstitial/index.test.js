const request = require('supertest');
const {
  testContent, testErrors, testRedirect,
  testNoneExistenceCYA, testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/jurisdiction/interstitial';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.JurisdictionInterstitial;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('JurisdictionInterstitial step content for connection A (both habitually resident)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['A', 'C']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for A', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['A', 'C']
      const excludeKeys = [
        'B.summary', 'B.help', 'B.helpText1', 'B.helpText2', 'B.helpText3', 'B.helpText4', 'B.helpText5', 'B.helpText6', 'B.clarification',
        'C.summary', 'C.help', 'C.helpText1', 'C.helpText2', 'C.helpText3', 'C.helpText4', 'C.helpText5', 'C.helpText6', 'C.clarification',
        'D.summary', 'D.help', 'D.helpText1', 'D.helpText2', 'D.helpText3', 'D.helpText4', 'D.helpText5', 'D.helpText6', 'D.clarification',
        'E.summary', 'E.help', 'E.helpText1', 'E.helpText2', 'E.helpText3', 'E.helpText4', 'E.helpText5', 'E.helpText6', 'E.clarification', 'E.helpText7', 'E.helpText8',
        'F.summary', 'F.help', 'F.helpText1', 'F.helpText2', 'F.helpText3', 'F.helpText4', 'F.helpText5', 'F.helpText6', 'F.clarification'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionInterstitial step content for connection B (last habitual residence)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionLastHabitualResidence'],
        jurisdictionConnection: ['B']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for B', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['B']
      const excludeKeys = [
        'A.summary', 'A.help', 'A.helpText1', 'A.helpText2', 'A.helpText3', 'A.helpText4', 'A.helpText5', 'A.helpText6', 'A.clarification',
        'C.summary', 'C.help', 'C.helpText1', 'C.helpText2', 'C.helpText3', 'C.helpText4', 'C.helpText5', 'C.helpText6', 'C.clarification',
        'D.summary', 'D.help', 'D.helpText1', 'D.helpText2', 'D.helpText3', 'D.helpText4', 'D.helpText5', 'D.helpText6', 'D.clarification',
        'E.summary', 'E.help', 'E.helpText1', 'E.helpText2', 'E.helpText3', 'E.helpText4', 'E.helpText5', 'E.helpText6', 'E.clarification', 'E.helpText7', 'E.helpText8',
        'F.summary', 'F.help', 'F.helpText1', 'F.helpText2', 'F.helpText3', 'F.helpText4', 'F.helpText5', 'F.helpText6', 'F.clarification'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionInterstitial step content for connection C (respondent habitually resident)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['C']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for C', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['C']
      const excludeKeys = [
        'A.summary', 'A.help', 'A.helpText1', 'A.helpText2', 'A.helpText3', 'A.helpText4', 'A.helpText5', 'A.helpText6', 'A.clarification',
        'B.summary', 'B.help', 'B.helpText1', 'B.helpText2', 'B.helpText3', 'B.helpText4', 'B.helpText5', 'B.helpText6', 'B.clarification',
        'D.summary', 'D.help', 'D.helpText1', 'D.helpText2', 'D.helpText3', 'D.helpText4', 'D.helpText5', 'D.helpText6', 'D.clarification',
        'E.summary', 'E.help', 'E.helpText1', 'E.helpText2', 'E.helpText3', 'E.helpText4', 'E.helpText5', 'E.helpText6', 'E.clarification', 'E.helpText7', 'E.helpText8',
        'F.summary', 'F.help', 'F.helpText1', 'F.helpText2', 'F.helpText3', 'F.helpText4', 'F.helpText5', 'F.helpText6', 'F.clarification'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionInterstitial step content for connection D (respondent habitually resident)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths'],
        jurisdictionConnection: ['D']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for D', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['D']
      const excludeKeys = [
        'A.summary', 'A.help', 'A.helpText1', 'A.helpText2', 'A.helpText3', 'A.helpText4', 'A.helpText5', 'A.helpText6', 'A.clarification',
        'B.summary', 'B.help', 'B.helpText1', 'B.helpText2', 'B.helpText3', 'B.helpText4', 'B.helpText5', 'B.helpText6', 'B.clarification',
        'C.summary', 'C.help', 'C.helpText1', 'C.helpText2', 'C.helpText3', 'C.helpText4', 'C.helpText5', 'C.helpText6', 'C.clarification',
        'E.summary', 'E.help', 'E.helpText1', 'E.helpText2', 'E.helpText3', 'E.helpText4', 'E.helpText5', 'E.helpText6', 'E.clarification', 'E.helpText7', 'E.helpText8',
        'F.summary', 'F.help', 'F.helpText1', 'F.helpText2', 'F.helpText3', 'F.helpText4', 'F.helpText5', 'F.helpText6', 'F.clarification'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionInterstitial step content for connection E (habitually resident for 6 months)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['E']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for E', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case connectionArray is ['E']
      const excludeKeys = [
        'A.summary', 'A.help', 'A.helpText1', 'A.helpText2', 'A.helpText3', 'A.helpText4', 'A.helpText5', 'A.helpText6', 'A.clarification',
        'B.summary', 'B.help', 'B.helpText1', 'B.helpText2', 'B.helpText3', 'B.helpText4', 'B.helpText5', 'B.helpText6', 'B.clarification',
        'C.summary', 'C.help', 'C.helpText1', 'C.helpText2', 'C.helpText3', 'C.helpText4', 'C.helpText5', 'C.helpText6', 'C.clarification',
        'D.summary', 'D.help', 'D.helpText1', 'D.helpText2', 'D.helpText3', 'D.helpText4', 'D.helpText5', 'D.helpText6', 'D.clarification',
        'F.summary', 'F.help', 'F.helpText1', 'F.helpText2', 'F.helpText3', 'F.helpText4', 'F.helpText5', 'F.helpText6', 'F.clarification', 'F.helpText7', 'F.helpText8'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });

  describe('JurisdictionInterstitial step content for connection F (both domiciled)', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence'],
        jurisdictionConnection: ['F']
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file for F', done => {
      // we are excluding these keys as the content changes based on the last connection. In this case jurisdictionConnection is ['F']
      const excludeKeys = [
        'A.summary', 'A.help', 'A.helpText1', 'A.helpText2', 'A.helpText3', 'A.helpText4', 'A.helpText5', 'A.helpText6', 'A.clarification',
        'B.summary', 'B.help', 'B.helpText1', 'B.helpText2', 'B.helpText3', 'B.helpText4', 'B.helpText5', 'B.helpText6', 'B.clarification',
        'C.summary', 'C.help', 'C.helpText1', 'C.helpText2', 'C.helpText3', 'C.helpText4', 'C.helpText5', 'C.helpText6', 'C.clarification',
        'D.summary', 'D.help', 'D.helpText1', 'D.helpText2', 'D.helpText3', 'D.helpText4', 'D.helpText5', 'D.helpText6', 'D.clarification',
        'E.summary', 'E.help', 'E.helpText1', 'E.helpText2', 'E.helpText3', 'E.helpText4', 'E.helpText5', 'E.helpText6', 'E.clarification', 'E.helpText7', 'E.helpText8'
      ];

      testContent(done, agent, underTest, content, session, excludeKeys);
    });
  });


  describe('JurisdictionInterstitial step errors', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPath: ['JurisdictionHabitualResidence']
      };
      withSession(done, agent, session);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });
  });

  describe('JurisdictionInterstitial routing for connection A', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes'
      };
      withSession(done, agent, session);
    });


    it('redirects to the next page for confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the next page for add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastTwelveMonths);
    });
  });

  describe('JurisdictionInterstitial routing for connection C', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['C'],
        jurisdictionPath: ['JurisdictionHabitualResidence']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page for confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the domicile page for unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionDomicile);
    });
  });

  describe('JurisdictionInterstitial routing for connection D', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['D'],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page when confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the domicile page to add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionDomicile);
    });
  });

  describe('JurisdictionInterstitial routing for connection F when < 12 months resident', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['F'],
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'No',
        jurisdictionLastTwelveMonths: 'No',
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths', 'JurisdictionDomicile']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page when confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the habitually resident for at least 6 months page to add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastHabitualResidence);
    });
  });

  describe('JurisdictionInterstitial routing for connection F when > 12 months resident', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['F'],
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'No',
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes',
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionDomicile']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page when confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the habitually resident for at least 6 months page to add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastHabitualResidence);
    });
  });

  describe('JurisdictionInterstitial routing for connection A when both resident', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['A', 'C'],
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes',
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionDomicile']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page when confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the habitually resident for at least 12 months page to add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastTwelveMonths);
    });
  });

  describe('JurisdictionInterstitial routing for connection E', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: ['E'],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths', 'JurisdictionDomicile', 'JurisdictionLastSixMonths']
      };
      withSession(done, agent, session);
    });

    it('redirects to the petitioner details page when confident legal connections', done => {
      const context = { jurisdictionConfidentLegal: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerConfidential);
    });

    it('redirects to the JurisdictionLastHabitualResidence page to add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastHabitualResidence);
    });
  });

  describe('JurisdictionInterstitial routing for JurisdictionLastHabitualResidence Exception', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        jurisdictionConnection: [],
        jurisdictionPath: ['JurisdictionHabitualResidence', 'JurisdictionLastTwelveMonths', 'JurisdictionDomicile', 'JurisdictionLastSixMonths']
      };
      withSession(done, agent, session);
    });


    it('redirects to the JurisdictionLastHabitualResidence page to add more details when unsure', done => {
      const context = { jurisdictionConfidentLegal: 'No' };
      testRedirect(done, agent, underTest, context,
        s.steps.JurisdictionLastHabitualResidence);
    });
  });

  describe('Check Your Answers', () => {
    it('renders legalCheckYourAnswersTemplate.html if jurisdictionConfidentLegal is yes', done => {
      const contentToExist = ['how-your-connected'];

      const valuesToExist = [];

      const context = { jurisdictionConfidentLegal: 'Yes' };

      const session = { divorceWho: 'wife' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context, session);
    });

    it('does not render legalCheckYourAnswersTemplate.html if jurisdictionConfidentLegal is no', done => {
      const contentToNotExist = ['how-your-connected'];

      const valuesToNotExist = [];

      const context = { jurisdictionConfidentLegal: 'no' };

      const session = { divorceWho: 'wife' };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context, session);
    });

    describe('jurisdiction legal CYA template', () => {
      it('renders the how-your-connected title', done => {
        const contentToExist = ['how-your-connected'];

        const context = { jurisdictionConfidentLegal: 'Yes' };

        testExistenceCYA(done, underTest, content, contentToExist, [], context);
      });

      it('renders all connection content', done => {
        const contentToExist = [
          'connectionA',
          'connectionB',
          'connectionC',
          'connectionD',
          'connectionE',
          'connectionF',
          'connectionG'
        ];

        const valuesToExist = [];

        const context = { jurisdictionConfidentLegal: 'Yes' };

        const session = {
          divorceWho: 'wife',
          connections: {
            A: 'connection text',
            B: 'connection text',
            C: 'connection text',
            D: 'connection text',
            E: 'connection text',
            F: 'connection text',
            G: 'connection text'
          }
        };

        testExistenceCYA(done, underTest, content,
          contentToExist, valuesToExist, context, session);
      });

      it('renders the see your legal connections link', done => {
        const contentToExist = ['see-you-legal-connections'];

        const context = { jurisdictionConfidentLegal: 'Yes' };

        testExistenceCYA(done, underTest, content, contentToExist, [], context);
      });

      it('renders the legal content for the connections', done => {
        const contentToExist = [
          'legalA',
          'legalB',
          'legalC',
          'legalD',
          'legalE',
          'legalF',
          'legalG'
        ];

        const valuesToExist = [];

        const context = { jurisdictionConfidentLegal: 'Yes' };

        const session = {
          divorceWho: 'wife',
          connections: {
            A: 'connection text',
            B: 'connection text',
            C: 'connection text',
            D: 'connection text',
            E: 'connection text',
            F: 'connection text',
            G: 'connection text'
          }
        };

        testExistenceCYA(done, underTest, content,
          contentToExist, valuesToExist, context, session);
      });
    });
  });
});
