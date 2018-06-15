/* eslint-disable no-console */
/* eslint-disable arrow-parens */
/* eslint-disable func-names */
/* eslint-disable no-invalid-this */
/* eslint-disable no-use-before-define */
const request = require('supertest');
const { postData } = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const async = require('async');
const { clone } = require('lodash');

const modulePath = 'app/steps/jurisdiction';

let s = {};
let agent = {};
let totalBranchesChecked = 0;
const timeOut = 9000000;
const maximumLoop = 4;
const verboseLogging = false;

const pages = [
  {
    uri: '/jurisdiction/habitual-residence',
    branches: [
      {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes'
      },
      {
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'No'
      },
      {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'No'
      },
      {
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'Yes'
      }
    ]
  }, {
    uri: '/jurisdiction/domicile',
    branches: [
      {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'Yes'
      }, {
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'No'
      }, {
        jurisdictionPetitionerDomicile: 'Yes',
        jurisdictionRespondentDomicile: 'No'
      }, {
        jurisdictionPetitionerDomicile: 'No',
        jurisdictionRespondentDomicile: 'Yes'
      }
    ]
  }, {
    uri: '/jurisdiction/habitual-residence',
    branches: [
      {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'Yes'
      }, {
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'No'
      }, {
        jurisdictionPetitionerResidence: 'Yes',
        jurisdictionRespondentResidence: 'No'
      }, {
        jurisdictionPetitionerResidence: 'No',
        jurisdictionRespondentResidence: 'Yes'
      }
    ]
  }, {
    uri: '/jurisdiction/interstitial',
    branches: [
      { jurisdictionConfidentLegal: 'Yes' },
      { jurisdictionConfidentLegal: 'No' }
    ]
  }, {
    uri: '/jurisdiction/last-habitual-residence',
    branches: [
      { jurisdictionLastHabitualResident: 'Yes' },
      { jurisdictionLastHabitualResident: 'No' }
    ]
  }, {
    uri: '/jurisdiction/last-resort',
    branches: [
      { jurisdictionLastResortConnections: ['A'] },
      { jurisdictionLastResortConnections: ['B'] }
    ]
  }, {
    uri: '/jurisdiction/last-six-months',
    branches: [
      { jurisdictionLastSixMonths: 'Yes' },
      { jurisdictionLastSixMonths: 'No' }
    ]
  }, {
    uri: '/jurisdiction/last-twelve-months',
    branches: [
      { jurisdictionLastTwelveMonths: 'Yes' },
      { jurisdictionLastTwelveMonths: 'No' }
    ]
  }, {
    uri: '/jurisdiction/residual',
    branches: [
      { residualJurisdictionEligible: 'Yes' },
      { residualJurisdictionEligible: 'No' }
    ]
  }, {
    uri: '/jurisdiction/connection-summary',
    branches: [
      { connectionSummary: 'Yes' },
      { connectionSummary: 'No' },
      { connectionSummary: 'Manual' }
    ]
  }
];

const filterTheSession = theSession => {
  return Object.keys(theSession).reduce((filteredSession, key) => {
    if (key.indexOf('jurisdiction') !== -1 || key === 'connections') {
      filteredSession[key] = theSession[key];
    }
    return filteredSession;
  }, {});
};

const logError = function(originalError, theAgent, params = {}) {
  theAgent.get('/session')
    .then((res) => {
      console.log('\n\n===== ERROR OCCOURED =====\n');
      console.log(originalError);
      console.log('\n\n===== Jurisdiction session values =====\n');
      console.log(filterTheSession(res.body));
      console.log('\n\n===== Extra detail =====');
      Object.keys(params).forEach(key => {
        console.log(`\n--- ${key} ---`);
        console.log(params[key]);
      });
    })
    .catch(error => {
      throw error;
    });
};

const testCheckYourAnswers = theAgent => {
  return theAgent.get('/check-your-answers');
};

const onComplete = (uri, theAgent, path, toManyRepeats, finalCallback) => {
  testCheckYourAnswers(theAgent)
    .then(() => {
      totalBranchesChecked = totalBranchesChecked + 1;
      process.stdout.write(`${totalBranchesChecked} Branches successfully completed`);
      setImmediate(finalCallback);
    })
    .catch(error => {
      logError(error, theAgent, {
        uri,
        toManyRepeats,
        path
      });
    });
};

const createNewAgent = theAgent => {
  const newAgent = request.agent(s.app);

  return theAgent
    .get('/session')
    .then(res => {
      return newAgent
        .post('/session')
        .send(res.body);
    })
    .then(() => {
      return newAgent;
    })
    .catch(error => {
      logError(error, theAgent);
    });
};

const createBranch = (page, branch, theAgent, path, theCallback) => {
  const newPath = clone(path);
  newPath.push(`${page.uri} - Branch: ${JSON.stringify(branch)}`);

  if (verboseLogging) {
    console.log(`\n\nCurrent path:\n\n${path.join('\n')}`);
  }

  testCheckYourAnswers(theAgent)
    .then(() => {
      return postData(theAgent, page.uri, branch);
    })
    .then(redirectUri => {
      nextPage(redirectUri, theAgent, newPath, theCallback);
    })
    .catch(error => {
      logError(error, theAgent, {
        uri: page.uri,
        path: newPath
      });
    });
};

const createBranches = (page, oldAgent, path, theCallback) => {
  createNewAgent(oldAgent)
    .then(theAgent => {
      async.eachSeries(page.branches, (branch, theSubCallback) => {
        createBranch(page, branch, theAgent, path, theSubCallback);
      }, () => {
        setImmediate(theCallback);
      });
    })
    .catch(error => {
      logError(error);
    });
};

const checkRepeats = path => {
  let biggestRepeat = 0;
  const totals = {};
  path.forEach(url => {
    totals[url] = totals[url] || 0;
    totals[url] += 1;
    biggestRepeat = totals[url] > biggestRepeat ? totals[url] : biggestRepeat;
    return totals;
  });
  return biggestRepeat;
};

const nextPage = (uri, oldAgent, path, theCallback) => {
  const toManyRepeats = checkRepeats(path) > maximumLoop;

  if (toManyRepeats || uri === '/exit/jurisdiction/no-cnnections' || uri === '/petitioner-respondent/confidential') {
    return onComplete(uri, oldAgent, path, toManyRepeats, theCallback);
  }

  const page = pages.find(p => {
    return p.uri === uri;
  });

  if (!page) {
    logError('Page not found', oldAgent, { uri, path });
    return setImmediate(theCallback);
  }

  return createBranches(page, oldAgent, path, theCallback);
};

// This test should only be used to test different scenarios in jurisdiction
// and not as a general unit test.
describe.skip(`${modulePath} - Test every possible scenario`, () => {
  beforeEach(done => {
    idamMock.stub();
    s = server.init();
    agent = request.agent(s.app);
    const session = {
      divorceWho: 'wife',
      marriageIsSameSexCouple: 'No',
      jurisdictionConnection: [],
      jurisdictionPath: [],
      screenHasRespondentAddress: 'Yes',
      screenHasMarriageCert: 'Yes',
      screenHasMarriageBroken: 'Yes',
      helpWithFeesNeedHelp: 'No',
      marriageDateDay: 10,
      marriageDateMonth: 10,
      marriageDateYear: 2010,
      marriageDate: '2010-10-09T23:00:00.000Z',
      marriageCanDivorce: true,
      marriageDateIsFuture: false,
      marriageDateMoreThan100: false,
      marriedInUk: 'Yes'
    };
    withSession(done, agent, session);
  });

  afterEach(() => {
    idamMock.restore();
  });

  it('Successfully completes every scenario', function(done) {
    this.timeout(timeOut);
    nextPage(pages[0].uri, agent, [], () => {
      console.log(`\n\nComplete - All ${totalBranchesChecked} branches passed`);
      done();
    });
  });
});
