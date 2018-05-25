function chooseMyLastResortConnections(...connections) {

  const I = this;

  I.waitUrlEquals('/jurisdiction/last-resort');

  connections.forEach((connection) => {
    I.checkOption('#' + connection.toUpperCase());
  });

  I.navByClick('Continue');
}

module.exports = {
  chooseMyLastResortConnections
};