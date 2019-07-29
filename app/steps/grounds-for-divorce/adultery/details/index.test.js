const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA, testNoneExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const { removeStaleData } = require('app/core/helpers/staleDataManager');
const { expect } = require('test/util/chai');
const { clone } = require('lodash');

const modulePath = 'app/steps/grounds-for-divorce/adultery/details';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.AdulteryDetails;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success if petitioner does not know when or where', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        reasonForDivorceAdulteryKnowWhen: 'No',
        reasonForDivorceAdulteryKnowWhere: 'No'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const ignoreContent = ['whenDidAdulteryHappen', 'whereDidAdulteryHappen', 'whatElseDoYouKnow'];

      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = {};
      const ignoreContent = ['whenDidAdulteryHappen', 'whereDidAdulteryHappen'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('redirects to Second Hand Info page', done => {
      const context = { reasonForDivorceAdulteryDetails: 'I don’t want to talk about it really.' };
      testRedirect(done, agent, underTest, context,
        s.steps.AdulterySecondHandInfo);
    });
  });

  describe('success if petitioner does know when but not where', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        reasonForDivorceAdulteryKnowWhen: 'Yes',
        reasonForDivorceAdulteryKnowWhere: 'No'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const ignoreContent = ['whereDidAdulteryHappen', 'whatDoYouKnow'];

      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = {};
      const ignoreContent = ['whatDoYouKnow'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = { reasonForDivorceAdulteryDetails: 'I don’t want to talk about it really.' };
      const ignoreContent = ['whatDoYouKnow'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = { reasonForDivorceAdulteryWhenDetails: 'Adultery happened at a point in time.' };
      const ignoreContent = ['whatDoYouKnow'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('redirects to the next page', done => {
      const context = {
        reasonForDivorceAdulteryDetails: 'I don’t want to talk about it really.',
        reasonForDivorceAdulteryWhenDetails: 'Adultery happened at a point in time.'
      };

      testRedirect(done, agent, underTest, context,
        s.steps.AdulterySecondHandInfo);
    });
  });

  describe('success if petitioner does know where but not when', () => {
    let session = {};

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        reasonForDivorceAdulteryKnowWhen: 'No',
        reasonForDivorceAdulteryKnowWhere: 'Yes'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const ignoreContent = ['whenDidAdulteryHappen', 'whatDoYouKnow'];

      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = {};
      const ignoreContent = ['whatDoYouKnow'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = { reasonForDivorceAdulteryDetails: 'I don’t want to talk about it really.' };
      const ignoreContent = ['whatDoYouKnow'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = { reasonForDivorceAdulteryWhereDetails: 'Adultery happened at a place.' };
      const ignoreContent = ['whatDoYouKnow'];

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('redirects to the next page', done => {
      const context = {
        reasonForDivorceAdulteryDetails: 'I don’t want to talk about it really.',
        reasonForDivorceAdulteryWhereDetails: 'Adultery happened at a place.'
      };

      testRedirect(
        done,
        agent,
        underTest,
        context,
        s.steps.AdulterySecondHandInfo);
    });
  });

  describe('success if petitioner does know when and where', () => {
    let session = {};

    const ignoreContent = ['whatDoYouKnow'];

    beforeEach(done => {
      session = {
        divorceWho: 'wife',
        reasonForDivorceAdulteryKnowWhen: 'Yes',
        reasonForDivorceAdulteryKnowWhere: 'Yes'
      };
      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = { reasonForDivorceAdulteryWhereDetails: 'Adultery happened at a place.' };

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('renders errors for missing required context', done => {
      const context = { reasonForDivorceAdulteryWhenDetails: 'Adultery happened at a point in time.' };

      testErrors(done, agent, underTest, context, content, 'required', ignoreContent);
    });

    it('redirects to the next page', done => {
      const context = {
        reasonForDivorceAdulteryDetails: 'I don’t want to talk about it really.',
        reasonForDivorceAdulteryWhereDetails: 'Adultery happened at a place.',
        reasonForDivorceAdulteryWhenDetails: 'Adultery happened at a point in time.'
      };

      testRedirect(
        done,
        agent,
        underTest,
        context,
        s.steps.AdulterySecondHandInfo);
    });
  });

  describe('Watched session values', () => {
    it('removes details when reasonForDivorce does not equal adultery', () => {
      const previousSession = {
        reasonForDivorce: 'adultery',
        reasonForDivorceAdulteryDetails: 'Details...',
        reasonForDivorceAdulteryWhenDetails: 'Details When...',
        reasonForDivorceAdulteryWhereDetails: 'Details Where...'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'seperation-2-years';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('seperation-2-years');
      expect(typeof newSession.reasonForDivorceAdulteryDetails)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal('undefined');
      expect(typeof newSession.reasonForDivorceAdulteryWhereDetails)
        .to.equal('undefined');
    });

    it('does not remove details when reasonForDivorce is set to adultery', () => {
      const previousSession = {
        reasonForDivorce: 'seperation-2-years',
        reasonForDivorceAdulteryDetails: 'Details...',
        reasonForDivorceAdulteryWhenDetails: 'Details When...',
        reasonForDivorceAdulteryWhereDetails: 'Details Where...'
      };

      const session = clone(previousSession);
      session.reasonForDivorce = 'adultery';

      const newSession = removeStaleData(previousSession, session);
      expect(newSession.reasonForDivorce).to.equal('adultery');
      expect(newSession.reasonForDivorceAdulteryDetails)
        .to.equal(previousSession.reasonForDivorceAdulteryDetails);
      expect(newSession.reasonForDivorceAdulteryWhenDetails)
        .to.equal(previousSession.reasonForDivorceAdulteryWhenDetails);
      expect(newSession.reasonForDivorceAdulteryWhereDetails)
        .to.equal(previousSession.reasonForDivorceAdulteryWhereDetails);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders adultery when, where and details', done => {
      const contentToExist = [
        'whenDidAdulteryHappen',
        'whereDidAdulteryHappen',
        'whatDoYouKnow'
      ];

      const valuesToExist = [
        'reasonForDivorceAdulteryWhereDetails',
        'reasonForDivorceAdulteryWhenDetails',
        'reasonForDivorceAdulteryDetails'
      ];

      const context = {
        reasonForDivorceAdulteryKnowWhen: 'Yes',
        reasonForDivorceAdulteryKnowWhere: 'Yes',
        reasonForDivorceAdulteryWhereDetails: 'details where',
        reasonForDivorceAdulteryWhenDetails: 'details when',
        reasonForDivorceAdulteryDetails: 'details plain'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders adultery when details', done => {
      const contentToExist = ['whenDidAdulteryHappen'];

      const valuesToExist = ['reasonForDivorceAdulteryWhenDetails'];

      const context = {
        reasonForDivorceAdulteryWhenDetails: 'details...',
        reasonForDivorceAdulteryKnowWhen: 'Yes'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders adultery where details', done => {
      const contentToExist = ['whereDidAdulteryHappen'];

      const valuesToExist = ['reasonForDivorceAdulteryWhereDetails'];

      const context = {
        reasonForDivorceAdulteryWhereDetails: 'details...',
        reasonForDivorceAdulteryKnowWhere: 'Yes'
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders adultery details', done => {
      const contentToExist = ['whatDoYouKnow'];

      const valuesToExist = ['reasonForDivorceAdulteryDetails'];

      const context = { reasonForDivorceAdulteryDetails: 'details...' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('does not render adultery where details', done => {
      const contentToNotExist = ['whereDidAdulteryHappen'];

      const valuesToNotExist = ['reasonForDivorceAdulteryWhereDetails'];

      const context = {
        reasonForDivorceAdulteryDetails: 'details...',
        reasonForDivorceAdulteryWhereDetails: 'knowWhereDetails',
        reasonForDivorceAdulteryKnowWhere: 'No'
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });

    it('does not render adultery when details', done => {
      const contentToNotExist = ['whenDidAdulteryHappen'];

      const valuesToNotExist = ['reasonForDivorceAdulteryWhenDetails'];

      const context = {
        reasonForDivorceAdulteryDetails: 'details...',
        reasonForDivorceAdulteryWhenDetails: 'knowWhenDetails',
        reasonForDivorceAdulteryKnowWhen: 'No'
      };

      testNoneExistenceCYA(done, underTest, content,
        contentToNotExist, valuesToNotExist, context);
    });
  });
});
