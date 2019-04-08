const cleanLine = function(line) {
  return line.replace(' null', ' ').replace('null ', ' ')
    .replace(/undefined/g, '')
    .replace(/ +/g, ' ')
    .trim();
};

const buildAddressBaseUk = function(selectedAddress) {
  let line1 = `${selectedAddress.DPA.ORGANISATION_NAME} ${selectedAddress.DPA.DEPARTMENT_NAME} ${selectedAddress.DPA.PO_BOX_NUMBER}`;
  let line2 = `${selectedAddress.DPA.BUILDING_NAME} ${selectedAddress.DPA.SUB_BUILDING_NAME} ${selectedAddress.DPA.BUILDING_NUMBER} ${selectedAddress.DPA.THOROUGHFARE_NAME}`;
  let line3 = `${selectedAddress.DPA.DEPENDENT_LOCALITY} ${selectedAddress.DPA.DOUBLE_DEPENDENT_LOCALITY} ${selectedAddress.DPA.DEPENDENT_THOROUGHFARE_NAME}`;

  if (cleanLine(line1).length === 0) {
    line1 = line2;
    line2 = line3;
    line3 = '';
  }

  const addressBaseUK = {
    addressLine1: cleanLine(line1),
    addressLine2: cleanLine(line2),
    addressLine3: cleanLine(line3),
    postCode: selectedAddress.DPA.POSTCODE,
    postTown: selectedAddress.DPA.POST_TOWN,
    county: '',
    country: 'UK'
  };
  return addressBaseUK;
};

module.exports = { buildAddressBaseUk };