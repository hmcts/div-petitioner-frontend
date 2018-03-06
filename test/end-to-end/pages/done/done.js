function amDone() {

  const I = this;

  I.seeCurrentUrlEquals('/done');
  I.see('Print your application');
}
module.exports = { amDone };