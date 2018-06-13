const { expect } = require('chai');
const Step = require('app/core/steps/Step');
const siteGraph = require('./siteGraph');

describe(__filename, () => {
  it('returns nodes and links from steps', () => {
    class Step4 extends Step {
      get url() {
        return '/step4';
      }
    }
    const step4 = new Step4({}, 'exit');

    class Step3 extends Step {
      get url() {
        return '/step3';
      }
    }
    const step3 = new Step3({}, 'exit');

    class Step2 extends Step {
      get url() {
        return '/step2';
      }
      get nextStep() {
        return {
          decision: {
            step3,
            step4
          }
        };
      }
    }
    const step2 = new Step2({}, 'question');

    class Step1 extends Step {
      get url() {
        return '/step';
      }
      get nextStep() {
        return step2;
      }
    }

    const step1 = new Step1({}, '');
    const steps = {
      step1,
      step2,
      step3,
      step4
    };

    const actual = siteGraph(steps);

    const expected = {
      nodes: [
        { id: 'Step1', group: '', slug: '/step' },
        { id: 'Step2', group: 'question', slug: '/step2' },
        { id: 'Step3', group: 'exit', slug: '/step3' },
        { id: 'Step4', group: 'exit', slug: '/step4' }
      ],
      links: [
        { source: 'Step1', target: 'Step2', value: 1 },
        { source: 'Step2', target: 'Step3', value: 1 },
        { source: 'Step2', target: 'Step4', value: 1 }
      ]
    };

    expect(actual)
      .to.deep.equal(expected);
  });
});
