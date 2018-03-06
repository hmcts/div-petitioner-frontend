const request = require('supertest');
const {
  testContent, testCYATemplate, testExistenceCYA,
  testErrors, testRedirect
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const featureTogglesMock = require('test/mocks/featureToggles');

const modulePath = 'app/steps/marriage/where-married';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    featureTogglesMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.WhereMarried;
  });

  afterEach(() => {
    s.http.close();
    idamMock.restore();
    featureTogglesMock.restore();
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

    it('renders errors for missing required context', done => {
      const context = {};

      testErrors(done, agent, underTest, context, content, 'required', [], session);
    });

    it('redirects to the next page if england for old jurisdiction enabled', done => {
      const context = { marriageWhereMarried: 'england' };

      const nextStep = s.steps.JurisdictionResidence;

      const featureMock = featureTogglesMock.when('jurisdiction', true, testRedirect, agent, underTest, context, nextStep);

      featureMock(done);
    });

    it('redirects to the next page if england for new jurisdiction enabled', done => {
      const context = { marriageWhereMarried: 'england' };

      const nextStep = s.steps.JurisdictionHabitualResidence;

      const featureMock = featureTogglesMock.when('newJurisdiction', true, testRedirect, agent, underTest, context, nextStep);

      featureMock(done);
    });

    it('redirects to the next page if england for no jurisdiction toggles enabled', done => {
      const context = { marriageWhereMarried: 'england' };

      const nextStep = s.steps.PetitionerConfidential;

      testRedirect(done, agent, underTest, context, nextStep);
    });

    it('redirects to the next page if wales for old jurisdiction enabled', done => {
      const context = { marriageWhereMarried: 'wales' };

      const nextStep = s.steps.JurisdictionResidence;

      const featureMock = featureTogglesMock.when('jurisdiction', true, testRedirect, agent, underTest, context, nextStep);

      featureMock(done);
    });

    it('redirects to the next page if wales for new jurisdiction enabled', done => {
      const context = { marriageWhereMarried: 'wales' };

      const nextStep = s.steps.JurisdictionHabitualResidence;

      const featureMock = featureTogglesMock.when('newJurisdiction', true, testRedirect, agent, underTest, context, nextStep);

      featureMock(done);
    });

    it('redirects to the next page if wales for no jurisdiction toggles enabled', done => {
      const context = { marriageWhereMarried: 'wales' };

      const nextStep = s.steps.PetitionerConfidential;

      testRedirect(done, agent, underTest, context, nextStep);
    });

    it('redirects to the exit page', done => {
      const context = { marriageWhereMarried: 'elsewhere' };

      testRedirect(done, agent, underTest, context, s.steps.ExitInTheUk);
    });
  });

  describe('Check Your Answers', () => {
    it('renders the cya template', done => {
      testCYATemplate(done, underTest);
    });

    it('renders the married where england', done => {
      const contentToExist = [
        'question',
        'england'
      ];

      const valuesToExist = [];

      const context = { marriageWhereMarried: 'england' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });

    it('renders the married where wales', done => {
      const contentToExist = [
        'question',
        'wales'
      ];

      const valuesToExist = [];

      const context = { marriageWhereMarried: 'wales' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });


    it('renders the married where elsewhere', done => {
      const contentToExist = [
        'question',
        'elsewhere'
      ];

      const valuesToExist = [];

      const context = { marriageWhereMarried: 'elsewhere' };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });
});
