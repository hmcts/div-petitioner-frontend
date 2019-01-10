/* eslint-disable global-require */
const { expect } = require('test/util/chai');
const CONF = require('config');
const { cloneDeep } = require('lodash');

const modulePath = 'app/services/courtsAllocation';

const caseDistribution = {
  'unreasonable-behaviour': 0.30,
  'separation-2-years': 0.37,
  'separation-5-years': 0.21,
  adultery: 0.11,
  desertion: 0.01
};

const courts = {
  CTSC:
    {
      weight: 0.30,
      divorceFactsRatio:
            {
              'unreasonable-behaviour': '0.70',
              'separation-2-years': 0.24,
              'separation-5-years': '0',
              adultery: '0',
              desertion: '0'
            }
    },
  eastMidlands:
    { weight: 0.18 },
  westMidlands:
    { weight: 0.10 },
  southWest:
    { weight: 0.24 },
  northWest:
    { weight: 0.18 }
};

const errorMargin = 0.005;

const expectedFactsCourtPercentage = {
  'unreasonable-behaviour': {
    CTSC: 0.21,
    eastMidlands: 0.0231,
    westMidlands: 0.0129,
    southWest: 0.0309,
    northWest: 0.0231
  },
  'separation-2-years': {
    CTSC: 0.0888,
    eastMidlands: 0.0725,
    westMidlands: 0.04,
    southWest: 0.0962,
    northWest: 0.0725
  },
  'separation-5-years': {
    CTSC: 0,
    eastMidlands: 0.054,
    westMidlands: 0.03,
    southWest: 0.072,
    northWest: 0.054
  },
  adultery: {
    CTSC: 0,
    eastMidlands: 0.0283,
    westMidlands: 0.0157,
    southWest: 0.0377,
    northWest: 0.0283
  },
  desertion: {
    CTSC: 0,
    eastMidlands: 0.0026,
    westMidlands: 0.0014,
    southWest: 0.0034,
    northWest: 0.0026
  }
};

describe(modulePath, () => {
  let tempConfig = {};

  beforeEach(() => {
    tempConfig = cloneDeep(CONF.commonProps);
    delete require.cache[require.resolve(modulePath)];
  });

  afterEach(() => {
    CONF.commonProps = tempConfig;
    delete require.cache[require.resolve(modulePath)];
  });

  it('error when total facts allocation > court allocation', () => {
    const localCourts = cloneDeep(courts);

    localCourts.CTSC.divorceFactsRatio['unreasonable-behaviour'] = 0.8;

    CONF.commonProps = {
      divorceFactsRatio: caseDistribution,
      court: localCourts
    };

    try {
      require(modulePath);
      expect.fail(null, null, 'Should have thrown weightage exceeded error');
    } catch (error) {
      expect(error.message).to.eq('Total weightage exceeded for court CTSC');
    }
  });

  it('error when facts allocation > 1', () => {
    const localCourts = cloneDeep(courts);

    localCourts.eastMidlands.divorceFactsRatio = { 'unreasonable-behaviour': 0.4 };

    CONF.commonProps = {
      divorceFactsRatio: caseDistribution,
      court: localCourts
    };

    try {
      require(modulePath);
      expect.fail(null, null, 'Should have thrown weightage exceeded error');
    } catch (error) {
      expect(error.message)
        .to.eq('Total weightage exceeded for fact unreasonable-behaviour');
    }
  });

  it('when fact allocated to same one court return same court', () => {
    const iterations = 10;
    const fact = 'unreasonable-behaviour';
    const court = 'CTSC';

    const localCourts = cloneDeep(courts);
    localCourts[court].divorceFactsRatio['separation-2-years'] = 0;
    localCourts[court].divorceFactsRatio[fact] = 1;

    CONF.commonProps = {
      divorceFactsRatio: caseDistribution,
      court: localCourts
    };

    const underTest = require(modulePath);

    for (let i = 0; i < iterations; i++) {
      expect(underTest.allocateCourt(fact)).to.eq(court);
    }
  });

  it('given 1000000 records the data should be distributed as expected', () => {
    const count = 1000000;
    CONF.commonProps = {
      divorceFactsRatio: caseDistribution,
      court: courts
    };

    const underTest = require(modulePath);

    const factsAllocation = {};

    Object.keys(caseDistribution).forEach(fact => {
      factsAllocation[fact] = {};

      Object.keys(courts).forEach(courtName => {
        factsAllocation[fact][courtName] = 0;
      });

      for (let i = 0; i < count * caseDistribution[fact]; i++) {
        factsAllocation[fact][underTest.allocateCourt(fact)] += 1;
      }
    });

    /* eslint-disable */
    Object.keys(caseDistribution).forEach(fact => {
      Object.keys(courts).forEach(courtName => {
        expect(
          Math.abs(expectedFactsCourtPercentage[fact][courtName]
            - (factsAllocation[fact][courtName] / count)) < errorMargin)
          .to.be.true;
      });
    });
    /* eslint-enable */
  });
});
