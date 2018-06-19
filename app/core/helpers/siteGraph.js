const { forEach, isEqual, uniqWith } = require('lodash');
const Step = require('app/core/steps/Step');

module.exports = steps => {
  const nodes = [];
  let links = [];

  forEach(steps, step => {
    const [group] = step.section.split('.');

    nodes.push({ id: step.name, group, slug: step.url });

    if (step.nextStep instanceof Step) {
      links.push({ source: step.name, target: step.nextStep.name, value: 1 });
    } else if (typeof step.nextStep === 'object') {
      const flatten = v => {
        if (v instanceof Step) {
          links.push({ source: step.name, target: v.name, value: 1 });
        } else if (typeof v === 'object') {
          forEach(v, flatten);
        }
      };

      forEach(step.nextStep, flatten);
    }
  });

  links = uniqWith(links, isEqual);

  return { nodes, links };
};
