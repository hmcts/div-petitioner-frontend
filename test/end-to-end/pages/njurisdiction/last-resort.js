function chooseMyLastResortConnections(...connections) {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/last-resort');

  connections.forEach((connection) => {
    I.checkOption('#' + connection.toUpperCase());
  });

  I.click('Continue');
}

module.exports = {
  chooseMyLastResortConnections
};