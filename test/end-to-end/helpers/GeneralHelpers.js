function prettifyAddress(address) {
  return address.address[0] + '\n' +
    address.address[1] + '\n' +
    address.address[2];
}

function getOtherJurisdictionConnections(connections) {
  let connectionsList = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  connections.forEach((connection) => {
    let index = connectionsList.indexOf(connection);
    if (index > -1) {
      connectionsList.splice(index, 1);
    }
  });
  return connectionsList;
}

module.exports = {
  prettifyAddress,
  getOtherJurisdictionConnections
};