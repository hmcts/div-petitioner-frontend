const getNextValidStep = function* (step, session) {
  let nextStep; // eslint-disable-line init-declarations

  // Put catch here because 'next' function throws
  // error if step doesn't have valid next step
  try {
    let nextStepCtx = step.populateWithPreExistingData(session);
    // run the step interceptor - some next step logic is created in the interceptor
    // eslint-disable-next-line no-warning-comments
    // TODO: this can be removed when all nextStep logic is moved to next function
    nextStepCtx = yield step.interceptor(nextStepCtx, session);

    // ensure step is valid
    const [isValid] = step.validate(nextStepCtx, session);
    if (isValid) {
      nextStep = step.next(nextStepCtx, session);
    }
  } catch (error) {
    // if error caught means there is no next step
  }

  return nextStep;
};

const findNextUnAnsweredStep = function* (step, session = {}) {
  const nextStep = yield getNextValidStep(step, session);

  if (!nextStep) {
    return step;
  } else if (!nextStep.isSkippable) {
    return nextStep;
  }

  return yield findNextUnAnsweredStep(nextStep, session);
};

module.exports = {
  getNextValidStep,
  findNextUnAnsweredStep
};
