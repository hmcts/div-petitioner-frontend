/* eslint-disable max-len */
const weighted = require('weighted');
const CONF = require('config');

const caseDistribution = CONF.commonProps.divorceFactsRatio;
const courts = CONF.commonProps.court;

const weightPerFactPerCourt = {};
const allocationPerFactLeft = {};
const remainingWeightForCourt = {};

const initialiseAllocationRemainingForFact = fact => {
  if (typeof allocationPerFactLeft[fact] === 'undefined') {
    allocationPerFactLeft[fact] = 1;
  }
};

const initialiseAllocationRemainingForCourt = courtName => {
  if (typeof remainingWeightForCourt[courtName] === 'undefined') {
    remainingWeightForCourt[courtName] = Number(courts[courtName].weight);
  }
};

const initialiseWeightPerFactPerCourt = fact => {
  if (!weightPerFactPerCourt[fact]) {
    weightPerFactPerCourt[fact] = {};
  }
};

const updateAllocationRemainingForCourt = (fact, courtName) => {
  remainingWeightForCourt[courtName] -= (courts[courtName].divorceFactsRatio[fact] * caseDistribution[fact]);

  // this will fail when the allocation configuration is not validation
  // it should break the deployment and it is the expected behaviour
  if (remainingWeightForCourt[courtName] < 0) {
    throw new Error(`Total weightage exceeded for court ${courtName}`);
  }
};

const updateAllocationRemainingForFact = (fact, courtName) => {
  allocationPerFactLeft[fact] -= courts[courtName].divorceFactsRatio[fact];

  // this will fail when the allocation configuration is not validation
  // it should break the deployment and it is the expected behaviour
  if (allocationPerFactLeft[fact] < 0) {
    throw new Error(`Total weightage exceeded for fact ${fact}`);
  }
};

const updateWeightPerFactPerCourt = (fact, courtName) => {
  weightPerFactPerCourt[fact][courtName] = courts[courtName].divorceFactsRatio[fact];
};

const calculateTotalUnAllocatedWeightPerFact = () => {
  const totalWeightPerFact = {};

  Object.keys(caseDistribution).forEach(fact => {
    Object.keys(courts).forEach(courtName => {
      if (!weightPerFactPerCourt[fact] || typeof weightPerFactPerCourt[fact][courtName] === 'undefined') {
        if (!totalWeightPerFact[fact]) {
          totalWeightPerFact[fact] = 0;
        }

        totalWeightPerFact[fact] += Number(courts[courtName].weight);
      }
    });
  });

  return totalWeightPerFact;
};

const distributeRemainingFactsAllocationToCourts = (fact, courtName, totalWeightPerFact) => {
  if (typeof weightPerFactPerCourt[fact][courtName] === 'undefined') {
    if (totalWeightPerFact[fact]) {
      weightPerFactPerCourt[fact][courtName] = allocationPerFactLeft[fact] * remainingWeightForCourt[courtName] / totalWeightPerFact[fact];
    } else {
      weightPerFactPerCourt[fact][courtName] = 0;
    }
  }
};

const calculatePreAllocations = () => {
  Object.keys(caseDistribution).forEach(fact => {
    initialiseAllocationRemainingForFact(fact);

    Object.keys(courts).forEach(courtName => {
      initialiseAllocationRemainingForCourt(courtName);

      if (courts[courtName].divorceFactsRatio && typeof courts[courtName].divorceFactsRatio[fact] !== 'undefined') {
        initialiseWeightPerFactPerCourt(fact);
        updateAllocationRemainingForCourt(fact, courtName);
        updateWeightPerFactPerCourt(fact, courtName);
        updateAllocationRemainingForFact(fact, courtName);
      }
    });
  });
};

const allocateRemainders = () => {
  const totalWeightPerFact = calculateTotalUnAllocatedWeightPerFact();

  Object.keys(caseDistribution).forEach(fact => {
    Object.keys(courts).forEach(courtName => {
      initialiseWeightPerFactPerCourt(fact);
      distributeRemainingFactsAllocationToCourts(fact, courtName, totalWeightPerFact);
    });
  });
};

calculatePreAllocations();
allocateRemainders();

const allocateCourt = fact => {
  return weighted.select(weightPerFactPerCourt[fact]);
};

module.exports = { allocateCourt };
