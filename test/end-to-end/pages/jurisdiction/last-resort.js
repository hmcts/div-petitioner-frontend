function chooseMyLastResortConnections(...connections) {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-resort');

  connections.forEach((connection) => {
    I.checkOption('#' + connection.toUpperCase());
  });

  I.click('Continue');
}

module.exports = {
  chooseMyLastResortConnections
};