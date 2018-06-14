const request = require('supertest');
const { testContent, testErrors, testRedirect, testNonExistence } = require('test/util/assertions');
const server = require('app');
const { expect } = require('test/util/chai');

const modulePath = 'app/steps/save-resume/confirm-remove-saved-application';

const content = require(`${modulePath}/content`);
const commonContent = require('app/content/common');

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.DeleteApplication;
  });

  describe('success', () => {
    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content);
    });

    it('does not render save and close button', done => {
      testNonExistence(done, agent, underTest,
        commonContent.resources.en.translation.saveAndClose);
    });

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required');
    });

    it('redirects to the next page', done => {
      const context = { deleteApplication: 'Yes' };

      testRedirect(done, agent, underTest, context,
        s.steps.ExitRemovedSavedApplication);
    });

    it('redirects to the exit page', done => {
      const context = { deleteApplication: 'No' };

      testRedirect(done, agent, underTest, context,
        s.steps.CheckYourAnswers);
    });
  });

  describe('#next', () => {
    let ctx = {};
    let session = {};
    beforeEach(() => {
      ctx = {};
      session = {};
    });
    it('removes deleteApplication from context and session', () => {
      ctx.deleteApplication = 'Yes';
      session.deleteApplication = 'Yes';
      underTest.next(ctx, session);
      expect(ctx.hasOwnProperty('deleteApplication')).to.eql(false);
      expect(session.hasOwnProperty('deleteApplication')).to.eql(false);
    });
  });
});
