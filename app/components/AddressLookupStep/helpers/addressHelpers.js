const cleanLine = function(line) {
  return line.replace(' null', ' ').replace('null ', ' ')
    .replace(/ +/g, ' ')
    .trim();
};

const buildAddressBaseUk = function(selectedAddress) {
  let line1 = `${selectedAddress.organisation_name} ${selectedAddress.department_name} ${selectedAddress.po_box_number}`;
  let line2 = `${selectedAddress.building_name} ${selectedAddress.sub_building_name} ${selectedAddress.building_number} ${selectedAddress.thoroughfare_name}`;
  let line3 = `${selectedAddress.dependent_locality} ${selectedAddress.double_dependent_locality}`;

  if (line1.trim().length === 0) {
    line1 = line2;
    line2 = line3;
    line3 = '';
  }

  const addressBaseUK = {
    addressLine1: cleanLine(line1),
    addressLine2: cleanLine(line2),
    addressLine3: cleanLine(line3),
    postCode: selectedAddress.postcode,
    postTown: selectedAddress.post_town,
    county: '',
    country: 'UK'
  };

  return addressBaseUK;
};

module.exports = { buildAddressBaseUk };