const TEST_RESP_SOLICITOR_NAME = 'RespondentSolicitor';
const TEST_RESP_SOLICITOR_EMAIL = 'test@email';
const TEST_RESP_SOLICITOR_REF = 'SOL-REF';
const TEST_RESP_SOLICITOR_COMPANY = 'Whitehead & Low Solicitors LLP';
const TEST_RESP_SOLICITOR_ID = '11-111';

const buildResultData = () => {
  return {
    divorceWho: 'wife',
    respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
    respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL,
    respondentSolicitorReference: TEST_RESP_SOLICITOR_REF,
    respondentSolicitorOrganisation: {
      contactInformation: [
        {
          addressLine1: '19/22 Union St',
          addressLine2: 'Oldham',
          addressLine3: '',
          country: 'United Kingdom',
          county: 'Greater Manchester',
          postCode: 'OL1 222',
          townCity: 'Manchester'
        }
      ],
      name: TEST_RESP_SOLICITOR_COMPANY,
      organisationIdentifier: TEST_RESP_SOLICITOR_ID
    },
    respondentSolicitorFirm: 'searchCriteria'
  };
};

const buildMockOrganisationsList = () => {
  return [
    {
      contactInformation: [
        {
          addressLine1: '1 Trasna way',
          addressLine2: 'Lurgan',
          addressLine3: '',
          country: 'United Kingdom',
          county: 'Armagh',
          postCode: 'BT25 545',
          townCity: 'Craigavon'
        }
      ],
      name: 'Campbell & Haughey Solicitors Ltd',
      organisationIdentifier: '02-002'
    },
    {
      contactInformation: [
        {
          addressLine1: '19/22 Union St',
          addressLine2: 'Oldham',
          addressLine3: '',
          country: 'United Kingdom',
          county: 'Greater Manchester',
          postCode: 'OL1 222',
          townCity: 'Manchester'
        }
      ],
      name: TEST_RESP_SOLICITOR_COMPANY,
      organisationIdentifier: TEST_RESP_SOLICITOR_ID
    }
  ];
};

module.exports = {
  buildResultData,
  buildMockOrganisationsList
};
