/* eslint-disable max-len */
const weighted = require('weighted');
const CONF = require('config');

const caseDistribution = CONF.commonProps.divorceFactsRatio;
const courts = CONF.commonProps.court;

const weightPerFactPerCourt = {};
const allocationPerFactLeft = {};
const remainingWeightForCourt = {};

const calculatePreAllocations = () => {
  Object.keys(caseDistribution).forEach(fact => {
    if (!allocationPerFactLeft[fact]) {
      allocationPerFactLeft[fact] = 1;
    }

    Object.keys(courts).forEach(courtName => {
      if (typeof remainingWeightForCourt[courtName] === 'undefined') {
        remainingWeightForCourt[courtName] = courts[courtName].weight;
      }

      if (courts[courtName].divorceFactsRatio && typeof courts[courtName].divorceFactsRatio[fact] !== 'undefined') {
        if (!weightPerFactPerCourt[fact]) {
          weightPerFactPerCourt[fact] = {};
        }

        remainingWeightForCourt[courtName] -= (courts[courtName].divorceFactsRatio[fact] * caseDistribution[fact]);

        if (remainingWeightForCourt[courtName] < 0) {
          throw new Error(`Total weightage exceeded for court ${courtName}`);
        }

        weightPerFactPerCourt[fact][courtName] = courts[courtName].divorceFactsRatio[fact];

        allocationPerFactLeft[fact] -= courts[courtName].divorceFactsRatio[fact];
      }
    });
  });
};

const allocateRemainders = () => {
  const totalWeightPerFact = {};

  Object.keys(caseDistribution).forEach(fact => {
    Object.keys(courts).forEach(courtName => {
      if (!weightPerFactPerCourt[fact] || typeof weightPerFactPerCourt[fact][courtName] === 'undefined') {
        if (!totalWeightPerFact[fact]) {
          totalWeightPerFact[fact] = 0;
        }

        totalWeightPerFact[fact] += courts[courtName].weight;
      }
    });
  });

  Object.keys(caseDistribution).forEach(fact => {
    Object.keys(courts).forEach(courtName => {
      if (!weightPerFactPerCourt[fact]) {
        weightPerFactPerCourt[fact] = {};
      }

      if (typeof weightPerFactPerCourt[fact][courtName] === 'undefined') {
        weightPerFactPerCourt[fact][courtName] = 0;
        if (totalWeightPerFact[fact]) {
          weightPerFactPerCourt[fact][courtName] = allocationPerFactLeft[fact] * remainingWeightForCourt[courtName] / totalWeightPerFact[fact];
        } else {
          weightPerFactPerCourt[fact][courtName] = 0;
        }
      }
    });
  });
};

calculatePreAllocations();
allocateRemainders();

const allocateCourt = fact => {
  return weighted.select(weightPerFactPerCourt[fact]);
};

module.exports = { allocateCourt };
