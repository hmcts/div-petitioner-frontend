const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect, testExistence, testNonExistence
} = require('test/util/assertions');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { mockSession } = require('test/fixtures');
const clone = require('lodash').cloneDeep;
const { withSession } = require('test/util/setup');

const modulePath = 'app/steps/petitioner/contact-details';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.PetitionerContactDetails;
  });

  afterEach(() => {
    s.http.close();
    idamMock.restore();
  });

  describe('Confidential Contact Details not selected', () => {
    let session = {};

    beforeEach(done => {
      session = clone(mockSession);
      session.petitionerContactDetailsConfidential = 'share';
      withSession(done, agent, session);
    });
    it('should not show confidential message', done => {
      testNonExistence(done, agent, underTest,
        content.resources.en.translation.content.confidentialContactDetails,
        session);
    });
  });
  describe('Confidential Contact Details selected', () => {
    let session = {};

    beforeEach(done => {
      session = clone(mockSession);
      session.petitionerContactDetailsConfidential = 'private';
      withSession(done, agent, session);
    });
    it('should show confidential message', done => {
      testExistence(done, agent, underTest,
        content.resources.en.translation.content.confidentialContactDetails,
        session);
    });
  });

  describe('content', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });
  });

  describe('errors', () => {
    it('renders errors for missing required context', done => {
      testErrors(done, agent, underTest, {}, content, 'required');
    });

    it('renders errors for invalid email', done => {
      const context = {
        petitionerEmail: 'firstnamelatsname.com',
        petitionerConsent: 'Yes'
      };

      const onlyKeys = ['email'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys);
    });

    it('renders errors for invalid phone', done => {
      const context = {
        petitionerEmail: 'firstname@latsname.com',
        petitionerPhoneNumber: 'asdfqwer',
        petitionerConsent: 'Yes'
      };

      const onlyKeys = ['petitionerPhoneNumber'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys);
    });

    it('renders errors for missing consent', done => {
      const context = {
        petitionerEmail: 'firstname@latsname.com',
        petitionerPhoneNumber: '292834726'
      };

      const onlyKeys = ['petitionerConsent'];

      testErrors(done, agent, underTest, context, content, 'invalid', onlyKeys);
    });
  });

  describe('success', () => {
    it('redirects to the next page when valid email is entered and consent is given', done => {
      const context = {
        petitionerEmail: 'firstname@latsname.com',
        petitionerConsent: 'Yes'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerHomeAddress);
    });

    it('redirects to the next page when valid phone is entered and consent is given', done => {
      const context = {
        petitionerEmail: 'firstname@latsname.com',
        petitionerPhoneNumber: '292834726',
        petitionerConsent: 'Yes'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.PetitionerHomeAddress);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders when petitionerEmail is entered', done => {
      const contentToExist = ['email'];

      const valuesToExist = ['petitionerEmail'];

      const context = { petitionerEmail: 'simulate-delivered@notifications.service.gov.uk' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders when petitionerEmail and number is entered', done => {
      const contentToExist = [
        'email',
        'petitionerPhoneNumber'
      ];

      const valuesToExist = [
        'petitionerEmail',
        'petitionerPhoneNumber'
      ];

      const context = {
        petitionerEmail: 'simulate-delivered@notifications.service.gov.uk',
        petitionerPhoneNumber: '0123456789'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
