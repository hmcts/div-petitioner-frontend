const request = require('supertest');
const { testContent, testExistence, testCustom } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const { expect } = require('test/util/chai');
const serviceCentreCourt = require('test/examples/courts/serviceCentre');

const modulePath = 'app/steps/awaiting-amend';

const content = require(`${modulePath}/content`);

const contentStrings = content.resources.en.translation.content;

let appInstance = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  const allocatedCourt = serviceCentreCourt;

  beforeEach(() => {
    appInstance = server.init();
    agent = request.agent(appInstance.app);
    underTest = appInstance.steps.AwaitingAmend;
  });

  describe('renders content', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });

  describe('should show awaiting amends info', () => {
    it('contains main heading', done => {
      testExistence(done, agent, underTest, contentStrings.mainHeading);
    });

    it('contains paragraph 1', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara1);
    });

    it('contains paragraph 2', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara2);
    });

    it('contains paragraph 3', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara3);
    });

    it('contains paragraph 4', done => {
      testExistence(done, agent, underTest, contentStrings.amendedApplicationInfoPara4);
    });
  });

  describe('should display allocated court info', () => {
    let session = {};

    beforeEach(done => {
      session = {
        reasonForDivorce: 'adultery',
        petitionerNameDifferentToMarriageCertificate: 'No',
        divorceWho: 'husband',
        reasonForDivorceAdulteryWishToName: 'Yes',
        financialOrder: 'No',
        allocatedCourt
      };

      withSession(done, agent, session);
    });

    it('contains allocated court e-mail once', done => {
      testCustom(done, agent, underTest, [], response => {
        const timesEmailShouldAppearOnPage = 1;
        const emailOccurrencesInPage = response.text.match(new RegExp(allocatedCourt.email, 'g')).length;
        expect(emailOccurrencesInPage).to.equal(timesEmailShouldAppearOnPage);
      });
    });

    it('contains allocated court phone number', done => {
      testExistence(done, agent, underTest, allocatedCourt.phoneNumber);
    });

    it('contains allocated court opening hours', done => {
      testExistence(done, agent, underTest, allocatedCourt.openingHours);
    });
  });
});
