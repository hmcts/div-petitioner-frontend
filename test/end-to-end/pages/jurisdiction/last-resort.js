function chooseMyLastResortConnections(...connections) {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-resort');

  connections.forEach((connection) => {
    I.checkOption('#' + connection.toUpperCase());
  });

  I.navByClick('Continue');
}

module.exports = {
  chooseMyLastResortConnections
};