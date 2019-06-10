const success = {
  caseId: '1509031793780148',
  allocatedCourt: {
    courtId: 'serviceCentre',
    identifiableCentreName: 'Courts and Tribunals Service Centre',
    serviceCentreName: 'Courts and Tribunals Service Centre',
    divorceCentre: 'East Midlands Regional Divorce Centre',
    poBox: 'PO Box 10447',
    courtCity: 'Nottingham',
    postCode: 'NG2 9QN',
    openingHours: 'Telephone Enquiries from: 8.30am to 5pm',
    email: 'contactdivorce@justice.gov.uk',
    phoneNumber: '0300 303 0642',
    siteId: 'AA07'
  },
  error: null,
  status: 'success'
};

const failure = {
  caseId: 0,
  error: 'Request Id : null and Exception message : 422 , Exception response body: {"exception":"uk.gov.hmcts.ccd.endpoint.exceptions.CaseValidationException","timestamp":"2017-11-01T10:52:09.018","status":422,"error":"Unprocessable Entity","message":"Case data validation failed","path":"/citizens/69/jurisdictions/DIVORCE/case-types/DIVORCE/cases","details":{"field_errors":[{"id":"D8DivorceWho","message":"significant-other is not a valid value"}]},"callbackErrors":null,"callbackWarnings":null}',
  status: 'error'
};

const mockSession = {
  screenHasMarriageBroken: 'Yes',
  screenHasRespondentAddress: 'Yes',
  screenHasMarriageCert: 'Yes',
  screenHasPrinter: 'Yes',
  divorceWho: 'husband',
  marriageDateDay: 2,
  marriageDateMonth: 2,
  marriageDateYear: 2001,
  marriageDate: '2001-02-02T00:00:00.000Z',
  marriageWhereMarried: 'england',
  helpWithFeesNeedHelp: 'Yes',
  helpWithFeesAppliedForFees: 'Yes',
  helpWithFeesReferenceNumber: 'HWF-123-456',
  marriedInUk: 'Yes',
  fetchedDraft: true
};

const mockedService = {
  submit: (_, _a, outcome = true) => {
    return new Promise(resolve => {
      resolve(outcome ? success : failure);
    });
  },

  update: (_, _a, outcome = true) => {
    return new Promise(resolve => {
      resolve(outcome ? success : failure);
    });
  },

  saveToDraftStore: (options, userToken, body, sendEmail, outcome = true) => {
    return new Promise((resolve, reject) => {
      if (outcome) {
        resolve();
      } else {
        reject(Error());
      }
    });
  },

  restoreFromDraftStore: (_, outcome = false) => {
    return new Promise((resolve, reject) => {
      if (outcome) {
        resolve(mockSession);
      } else {
        reject(Error());
      }
    });
  },

  removeFromDraftStore: (_, outcome = true) => {
    return new Promise((resolve, reject) => {
      if (outcome) {
        resolve();
      } else {
        reject(Error());
      }
    });
  },

  mockSession
};

module.exports = mockedService;
