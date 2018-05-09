const { mockSession } = require('test/fixtures');

function enterUnreasonableBehaviourExample() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/unreasonable-behaviour');
  I.fillField('reasonForDivorceBehaviourDetails[]', mockSession.reasonForDivorceBehaviourDetails[0]);

  I.navByClick('Continue');
}

function enterUnreasonableBehaviourAddMoreExamples() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/unreasonable-behaviour');
  //  enter data to pass validation
  I.fillField('reasonForDivorceBehaviourDetails[]', mockSession.reasonForDivorceBehaviourDetails[0]);

  I.seeElement('.add-example-link');
  I.seeElement('#how-behaved-example-0');
  I.seeElement('#how-behaved-example-1');
  I.seeElement('#how-behaved-example-2');
  I.dontSeeElement('#how-behaved-example-3');
  I.dontSeeElement('#how-behaved-example-4');
  I.dontSeeElement('#how-behaved-example-5');
  I.click('.add-example-link');
  I.seeElement('.add-example-link');
  I.seeElement('#how-behaved-example-0');
  I.seeElement('#how-behaved-example-1');
  I.seeElement('#how-behaved-example-2');
  I.seeElement('#how-behaved-example-3');
  I.dontSeeElement('#how-behaved-example-4');
  I.dontSeeElement('#how-behaved-example-5');
  I.click('.add-example-link');
  I.seeElement('.add-example-link');
  I.seeElement('#how-behaved-example-0');
  I.seeElement('#how-behaved-example-1');
  I.seeElement('#how-behaved-example-2');
  I.seeElement('#how-behaved-example-3');
  I.seeElement('#how-behaved-example-4');
  I.dontSeeElement('#how-behaved-example-5');
  I.click('.add-example-link');
  I.dontSeeElement('.add-example-link');
  I.seeElement('#how-behaved-example-0');
  I.seeElement('#how-behaved-example-1');
  I.seeElement('#how-behaved-example-2');
  I.seeElement('#how-behaved-example-3');
  I.seeElement('#how-behaved-example-4');
  I.seeElement('#how-behaved-example-5');

  I.navByClick('Continue');
}

module.exports = { enterUnreasonableBehaviourExample, enterUnreasonableBehaviourAddMoreExamples };
