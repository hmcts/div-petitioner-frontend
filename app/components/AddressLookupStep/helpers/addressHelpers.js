const cleanLine = function (line) {
    return line.replace(' null', ' ').replace('null ', ' ')
        .replace(/undefined/g, '')
        .replace(/ +/g, ' ')
        .trim()
        .replace(/^,/g, '');
};


const buildAddressBaseUk = function (selectedAddress) {
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

// refactored based off logic in Royal Mail Programmers' Guide
// https://www.royalmail.com/sites/default/files/docs/pdf/programmers_guide_edition_7_v5.pdf
// @todo prepend the word 'PO BOX' in the cases where it applies

const defaultAddressTemplate = function (address) {
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
        DEPENDENT_LOCALITY: address.DPA.DEPENDENT_LOCALITY,
    }
};


function buildNameIsAnException(buildingName) {
    firstChar = buildingName.charAt(0);
    lastChar = buildingName.slice(-1);
    penultimateChar = buildingName.slice(-2);

    if (!firstChar.isNaN() && !lastChar.isNaN()) {
        return true;
    }
    if ((isNaN(lastChar) && !isNaN(penultimateChar) && !isNaN(firstChar))) {
        return true;
    }
    return !!penultimateChar.match(/[a-z]/i);
}

const buildAddressV2 = function (templateAddress) {
    let firstLine = '';
    let secondLine = '';
    const localitiesThoroughfares = `${templateAddress.DEPENDENT_THOROUGHFARE_NAME} 
    ${templateAddress.THOROUGHFARE_NAME} 
    ${templateAddress.DOUBLE_DEPENDENT_LOCALITY} 
    ${templateAddress.DEPENDENT_LOCALITY}`;

    // assume there's an organisation and dept name
    let organisationLine = `${templateAddress.ORG_NAME} ${templateAddress.DEPT_NAME} ${templateAddress.PO_BOX}`;

    if (templateAddress.BUILDING_NAME &&
        buildNameIsAnException(templateAddress.BUILDING_NAME) &&
        !templateAddress.BUILDING_NUMBER) {
        // format acc to rule 3/6
        firstLine = `${templateAddress.SUB_BUILDING_NAME}`;
        secondLine = `${templateAddress.BUILDING_NAME} ` + localitiesThoroughfares;
    } else {
        firstLine = `${templateAddress.SUB_BUILDING_NAME} ${templateAddress.BUILDING_NAME}`;
        secondLine = `${templateAddress.BUILDING_NUMBER} ` + localitiesThoroughfares;
    }
    // finally check for org/dept
    if (templateAddress.ORG_NAME || templateAddress.DEPT_NAME) {
        secondLine = firstLine + " " + secondLine;
        firstLine = organisationLine;
    }

    let concatenatedAddress = [];

    if (cleanLine(secondLine) === '') {
        concatenatedAddress = [
            cleanLine(firstLine),
            address.DPA.POST_TOWN,
            address.DPA.POSTCODE

        ];
    } else {
        concatenatedAddress = [
            cleanLine(firstLine),
            cleanLine(secondLine),
            address.DPA.POST_TOWN,
            address.DPA.POSTCODE

        ];
    }

    return concatenatedAddress;
};


// if (templateAddress.BUILDING_NAME &&
//     buildNameIsAnException(templateAddress.BUILDING_NAME) &&
//     !templateAddress.BUILDING_NUMBER) {
//     // format acc to rule 3/6
//     if (templateAddress.ORG_NAME || templateAddress.DEPT_NAME) {
//         firstLine = `${templateAddress.ORG_NAME}  ${templateAddress.DEPT_NAME}`;
//         secondLine = `${templateAddress.PO_BOX} ${templateAddress.SUB_BUILDING_NAME}
//             ${templateAddress.BUILDING_NAME}` + localitiesThoroughfares;
//     }
//     firstLine =
//
// } else {
//     // no building name, or building name is not a number or there's a building number present
//     // follow default address template
//     if (templateAddress.ORG_NAME || templateAddress.DEPT_NAME) {
//         firstLine = `${templateAddress.ORG_NAME}  ${templateAddress.DEPT_NAME}`;
//         secondLine = `${templateAddress.PO_BOX} ${templateAddress.SUB_BUILDING_NAME}
//             ${templateAddress.BUILDING_NAME} ${templateAddress.BUILDING_NUMBER} ` + localitiesThoroughfares;
//     } else {
//         firstLine = `${templateAddress.PO_BOX} ${templateAddress.SUB_BUILDING_NAME}
//             ${templateAddress.BUILDING_NAME}`;
//         secondLine = `${templateAddress.BUILDING_NUMBER} ` + localitiesThoroughfares;
//     }
// }
// }
// ;

// const buildAddress = function (address) {
//     let firstLine = '';
//     let secondline = '';
//
//     if (address.DPA.PO_BOX_NUMBER !== 'undefined') {
//         if (address.DPA.ORGANISATION_NAME !== 'undefined' || address.DPA.DEPARTMENT_NAME !== 'undefined') {
//             // PO Box on second line because organisation/department are present
//             firstLine = `${address.DPA.ORGANISATION_NAME}`;
//             secondline = `${address.DPA.DEPARTMENT_NAME} ${address.DPA.PO_BOX_NUMBER}`;
//         } else {
//             // PO Box should be first on the first line
//             // Check against other rules
//             // fn()
//         }
//
//     } else {
//         // For any other case where we dont have a PO BOX
//         if (address.DPA.ORGANISATION_NAME || address.DPA.DEPARTMENT_NAME) {
//             // organisation must be on the first line, department name on the second
//             firstLine += `${address.DPA.ORGANISATION_NAME}`;
//             secondline += `${address.DPA.DEPARTMENT_NAME}`;
//         }
//
//         if (address.DPA.SUB_BUILDING_NAME &&
//             address.DPA.BUILDING_NUMBER &&
//             address.DPA.BUILDING_NAME) {
//
//         }
//     }
// };

// @todo Refactor this to reduce complexity.

const buildConcatenatedAddress = function (address) { // eslint-disable-line complexity
    let firstLine = `${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME} ${address.DPA.PO_BOX_NUMBER} ${address.DPA.SUB_BUILDING_NAME}  ${address.DPA.BUILDING_NUMBER}, ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.BUILDING_NAME}`;
    let secondLine = `${address.DPA.DEPENDENT_LOCALITY} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY}  ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} `;

    if (`${address.DPA.BUILDING_NAME}` !== 'undefined') {
        firstLine = `${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME} ${address.DPA.SUB_BUILDING_NAME} ${address.DPA.BUILDING_NUMBER}, ${address.DPA.BUILDING_NAME} `;
        secondLine = `${address.DPA.DEPENDENT_LOCALITY} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY} ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} `;
    }

    if (`${address.DPA.BUILDING_NAME}` !== 'undefined' && `${address.DPA.THOROUGHFARE_NAME}` !== 'undefined' && `${address.DPA.BUILDING_NUMBER}` === 'undefined') {
        firstLine = `${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME} ${address.DPA.SUB_BUILDING_NAME} ${address.DPA.BUILDING_NAME} `;
        secondLine = `${address.DPA.DEPENDENT_LOCALITY} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY} ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} `;
    }

    if (`${address.DPA.PO_BOX_NUMBER}` !== 'undefined') {
        firstLine = ` ${address.DPA.CLASSIFICATION_CODE_DESCRIPTION} ${address.DPA.PO_BOX_NUMBER}, ${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME}   ${address.DPA.SUB_BUILDING_NAME} ${address.DPA.BUILDING_NUMBER} ${address.DPA.BUILDING_NAME} `;
        secondLine = `${address.DPA.DEPENDENT_LOCALITY} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY} ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} `;
    }

    if (`${address.DPA.BUILDING_NUMBER}` !== 'undefined' && `${address.DPA.SUB_BUILDING_NAME}` !== 'undefined' && `${address.DPA.THOROUGHFARE_NAME}` !== 'undefined') {
        if (`${address.DPA.BUILDING_NAME}` === 'undefined') {
            firstLine = `${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME} ${address.DPA.SUB_BUILDING_NAME}`;
            secondLine = `${address.DPA.BUILDING_NUMBER}, ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY} ${address.DPA.DEPENDENT_LOCALITY} `;
        } else {
            firstLine = `${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME} ${address.DPA.SUB_BUILDING_NAME}, ${address.DPA.BUILDING_NAME} `;
            secondLine = `${address.DPA.BUILDING_NUMBER}, ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY} ${address.DPA.DEPENDENT_LOCALITY} `;
        }
    }

    if (`${address.DPA.ORGANISATION_NAME}` !== 'undefined' && `${address.DPA.THOROUGHFARE_NAME}` !== 'undefined') {
        firstLine = `${address.DPA.ORGANISATION_NAME} ${address.DPA.DEPARTMENT_NAME}`;
        secondLine = `${address.DPA.BUILDING_NUMBER} ${address.DPA.SUB_BUILDING_NAME} ${address.DPA.BUILDING_NAME}, ${address.DPA.THOROUGHFARE_NAME} ${address.DPA.DEPENDENT_THOROUGHFARE_NAME} ${address.DPA.DEPENDENT_LOCALITY} ${address.DPA.DOUBLE_DEPENDENT_LOCALITY}`;
    }


    let concatenatedAddress = [];

    if (cleanLine(secondLine) === '') {
        concatenatedAddress = [
            cleanLine(firstLine),
            address.DPA.POST_TOWN,
            address.DPA.POSTCODE

        ];
    } else {
        concatenatedAddress = [
            cleanLine(firstLine),
            cleanLine(secondLine),
            address.DPA.POST_TOWN,
            address.DPA.POSTCODE

        ];
    }

    return concatenatedAddress;
};

module.exports = {buildAddressBaseUk, buildConcatenatedAddress};