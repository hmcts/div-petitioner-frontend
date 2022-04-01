// const request = require('supertest');
// const { testContent, testErrors, testRedirect, testNonExistence } = require('test/util/assertions');
// const server = require('app');
// const idamMock = require('test/mocks/idam');
// const commonContent = require('app/content/common-en');
//
// const modulePath = 'app/steps/screening-questions/language-preference';
//
// const content = require(`${modulePath}/content`);
//
// let s = {};
// let agent = {};
// let underTest = {};
//
// describe(modulePath, () => {
//   beforeEach(() => {
//     idamMock.stub();
//     s = server.init();
//     agent = request.agent(s.app);
//     underTest = s.steps.ScreeningQuestionsLanguagePreference;
//   });
//
//   afterEach(() => {
//     idamMock.restore();
//   });
//
//   describe('success', () => {
//     it('renders the content from the content file', done => {
//       testContent(done, agent, underTest, content);
//     });
//
//     it('does not render save and close button', done => {
//       testNonExistence(done, agent, underTest,
//         commonContent.resources.en.translation.saveAndClose);
//     });
//
//     it('renders errors for missing required context', done => {
//       const context = {};
//
//       testErrors(done, agent, underTest, context, content, 'required');
//     });
//
//     it('redirects to the next page', done => {
//       const context = { languagePreferenceWelsh: 'Yes' };
//
//       testRedirect(done, agent, underTest, context,
//         s.steps.ScreeningQuestionsMarriageBroken);
//     });
//
//     it('redirects to the exit page', done => {
//       const context = { languagePreferenceWelsh: 'No' };
//
//       testRedirect(done, agent, underTest, context,
//         s.steps.ScreeningQuestionsMarriageBroken);
//     });
//   });
// });

const request = require('supertest');
const { testContent } = require('test/util/assertions');
const server = require('app');

const modulePath = 'app/steps/cutoff-landing-page';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.CutOffLandingPage;
  });

  describe('success', () => {
    const session = {};

    it('renders the content from the content file', done => {
      testContent(done, agent, underTest, content, session);
    });
  });
});
