const request = require('supertest');
const {
  testContent
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');

const modulePath = 'app/steps/respondent/correspondence/solicitor-search';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.RespondentCorrespondenceSolicitorSearch;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('success', () => {
    let session = {};

    beforeEach(done => {
      session = { divorceWho: 'wife' };

      withSession(done, agent, session);
    });

    it('renders the content from the content file', done => {
      const excludedKeys = [
        'deselectBtnText',
        'selectBtnText',
        'enterManuallyBtnText',
        'resultsLabel',
        'solicitorNameLabel',
        'solicitorReferenceLabel',
        'solicitorEmailLabel',
        'solicitorFirmAddressLabel',
        'searchNoOptionFoundText',
        'searchNoResults.paragraph1',
        'searchNoResults.paragraph2',
        'searchNoResults.paragraph3',
        'searchErrors.emptyValue',
        'searchErrors.shortValue'
      ];

      testContent(done, agent, underTest, content, session, excludedKeys);
    });
  });
});
