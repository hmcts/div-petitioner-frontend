function prettifyAddress(address) {
  return `${address.address[0]}\n${
    address.address[1]}\n${
    address.address[2]}`;
}

function getOtherJurisdictionConnections(connections) {
  const connectionsList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  connections.forEach(connection => {
    const index = connectionsList.indexOf(connection);
    if (index > -1) {
      connectionsList.splice(index, 1);
    }
  });
  return connectionsList;
}

function merge(intoObject, fromObject) {
  return Object.assign({}, intoObject, fromObject);
}

module.exports = {
  prettifyAddress,
  getOtherJurisdictionConnections,
  merge
};
