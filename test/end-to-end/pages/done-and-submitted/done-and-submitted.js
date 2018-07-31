const content = require ('app/steps/done-and-submitted/content.json').resources.en.translation.content;

async function amDoneAndSubmitted() {

  const I = this;

  I.seeCurrentUrlEquals('/done-and-submitted');
  I.see(content.title);
  const caseId = await I.grabTextFrom('.text-reference-number');
  return caseId.replace(/\s.\s/g, '');
}
module.exports = { amDoneAndSubmitted };
