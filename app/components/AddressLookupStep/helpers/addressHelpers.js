const cleanLine = function(line) {
  return line.replace(' null', ' ').replace('null ', ' ')
    .replace(/undefined/g, '')
    .replace(/\s\s+/g, ' ')
    .trim()
    .replace(/^,/g, '');
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

// Refactored based off address logic in Royal Mail Programmers' Guide
// https://www.royalmail.com/sites/default/files/docs/pdf/programmers_guide_edition_7_v5.pdf

const defaultAddressTemplate = function(address) {
  return {
    ORG_NAME: address.DPA.ORGANISATION_NAME,
    DEPT_NAME: address.DPA.DEPARTMENT_NAME,
    PO_BOX: address.DPA.PO_BOX_NUMBER,
    SUB_BUILDING_NAME: address.DPA.SUB_BUILDING_NAME,
    BUILDING_NAME: address.DPA.BUILDING_NAME,
    BUILDING_NUMBER: address.DPA.BUILDING_NUMBER,
    DEPENDENT_THOROUGHFARE_NAME: address.DPA.DEPENDENT_THOROUGHFARE_NAME,
    THOROUGHFARE_NAME: address.DPA.THOROUGHFARE_NAME,
    DOUBLE_DEPENDENT_LOCALITY: address.DPA.DOUBLE_DEPENDENT_LOCALITY,
    DEPENDENT_LOCALITY: address.DPA.DEPENDENT_LOCALITY
  };
};

const orderedTfaresLocalities = templateAddress => {
  // order which thoroughfares and localities should be displayed in
  return [
    templateAddress.DEPENDENT_THOROUGHFARE_NAME,
    templateAddress.THOROUGHFARE_NAME,
    templateAddress.DOUBLE_DEPENDENT_LOCALITY,
    templateAddress.DEPENDENT_LOCALITY
  ];
};

function buildNameIsAnException(buildingName) {
  if (!buildingName) {
    return false;
  }
  const firstChar = buildingName.charAt(0);
  const lastChar = buildingName.slice(-1);
  // Exception rule 1 - first and last characters are numeric
  if (!isNaN(firstChar) && !isNaN(lastChar)) {
    return true;
  }
  // Exception rule 3 - Building Name has only one character (eg ‘A’)
  if (buildingName.length === 1) {
    return Boolean(firstChar.match(/[a-z]/i));
  }
  // Exception rule 2 - First and penultimate characters are numeric, last character is alphabetic
  const penultimateCharIndex = -2;
  return (isNaN(lastChar) && !isNaN(buildingName.slice(penultimateCharIndex, -1)) && !isNaN(firstChar));
}

const splitTfaresLocalities = orderedTfaresLocalitiesFields => {
  const tfaresLocalities = orderedTfaresLocalitiesFields.filter(Boolean);
  const firstTfareLocalityElement = tfaresLocalities[0];
  // leave only the subsequent thoroughfare/locality lines
  tfaresLocalities.splice(0, 1);
  return {
    firstLine: `${firstTfareLocalityElement}`,
    otherLines: tfaresLocalities.join(' ')
  };
};

function buildAddressLines(address) {
  const templateAddress = defaultAddressTemplate(address);
  let firstLine = '';
  let secondLine = '';
  let thirdLine = '';

  const thoroughfaresLocalities = splitTfaresLocalities(
    orderedTfaresLocalities(templateAddress));

  // build organisation, dept name and po box line - should come first per Rule 1
  const organisationLine = `${templateAddress.ORG_NAME} ${templateAddress.DEPT_NAME} ${templateAddress.PO_BOX}`;

  // Rules 3 and 6 - if building name/sub-building name is an exception and no building number
  if (buildNameIsAnException(templateAddress.BUILDING_NAME) && !templateAddress.BUILDING_NUMBER) {
    // sub-building name and building name on separate lines when sub-building name not an exception OR does not exist
    if (buildNameIsAnException(templateAddress.SUB_BUILDING_NAME) === false) {
      firstLine = `${templateAddress.SUB_BUILDING_NAME}`;
      secondLine = `${templateAddress.BUILDING_NAME} ${thoroughfaresLocalities.firstLine}`;
      thirdLine = `${thoroughfaresLocalities.otherLines}`;
    } else {
      // when sub-building is an exception - same line as building name
      firstLine = `${templateAddress.SUB_BUILDING_NAME} ${templateAddress.BUILDING_NAME} ${thoroughfaresLocalities.firstLine}`;
      secondLine = `${thoroughfaresLocalities.otherLines}`;
    }
  } else if (buildNameIsAnException(templateAddress.SUB_BUILDING_NAME)) {
    // given a/no building number and no/exceptional/non-exceptional building name
    // if there's a sub-building name and it's an exception - Rules 6 and 7
    firstLine = `${templateAddress.SUB_BUILDING_NAME} ${templateAddress.BUILDING_NAME}`;
    secondLine = `${templateAddress.BUILDING_NUMBER} ${thoroughfaresLocalities.firstLine}`;
    thirdLine = `${thoroughfaresLocalities.otherLines}`;
  } else {
    // sub-building name is not an exception OR doesn't exist - Rules 6 and 7
    firstLine = `${templateAddress.SUB_BUILDING_NAME}`;
    secondLine = `${templateAddress.BUILDING_NAME}`;
    thirdLine = `${templateAddress.BUILDING_NUMBER} ${thoroughfaresLocalities.firstLine} ${thoroughfaresLocalities.otherLines}`;
  }

  // Org/dept names should appear on the first line and precede everything else - Rule 1
  if (templateAddress.ORG_NAME || templateAddress.DEPT_NAME) {
    secondLine = `${firstLine} ${secondLine}`;
    firstLine = organisationLine;
  }

  const allAddressLines = [firstLine, secondLine, thirdLine];

  // form the first part of the address to be returned
  // containing only the lines that are populated in order
  return allAddressLines.reduce((acc, current) => {
    const line = cleanLine(current);
    if (line) {
      acc.push(line);
    }
    return acc;
  }, []);
}

function buildConcatenatedAddress(address) {
  const addressLines = buildAddressLines(address);
  addressLines.push(address.DPA.POST_TOWN, address.DPA.POSTCODE);
  return addressLines;
}

module.exports = { buildAddressBaseUk, buildConcatenatedAddress };