const request = require('supertest');
const { testContent, testExistence } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const appServer = require('app');

const modulePath = 'app/steps/issued-to-bailiff';

const content = require(`${modulePath}/content`);

let server = {};
let agent = {};
let underTest = {};

const downloadFiles = [
  'downloadDocumentsHeading',
  'files.respondentAnswers',
  'files.coRespondentAnswers',
  'files.certificateOfEntitlement',
  'files.costsOrder',
  'files.dnAnswers',
  'files.clarificationDnRefusalOrder',
  'files.rejectionDnRefusalOrder',
  'files.deemedAsServedGranted',
  'files.dispenseWithServiceGranted',
  'files.deemedServiceRefused',
  'files.dispenseWithServiceRefused',
  'files.generalOrder'
];

const interpolationTextFields = [
  'yourResponds',
  'issuedToBailiffInfoPara3',
  'issuedToBailiffInfoPara4',
  'howToRespondLink'
];

describe(modulePath, () => {
  let session = {};

  beforeEach(done => {
    server = appServer.init();
    agent = request.agent(server.app);
    underTest = server.steps.SentToBailiff;
    session = { divorceWho: 'wife' };
    withSession(done, agent, session);
  });

  describe('Issued To Bailiff page', () => {
    const exclude = downloadFiles.concat(interpolationTextFields);

    it('should render the content from the content file when state is IssuedToBailiff', done => {
      testContent(done, agent, underTest, content, server, exclude);
    });

    it('should render court bailiff served text to respondent party gender', done => {
      testExistence(done, agent, underTest,
        'If the court bailiff is able to serve successfully, then your wife is given 7 days to respond.');
    });
  });
});
