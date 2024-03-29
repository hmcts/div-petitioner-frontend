/* eslint no-unused-expressions: "off" */
const { expect, sinon } = require('test/util/chai');
const forEach = require('mocha-each');
const { invoke, get, set } = require('lodash');

const modulePath = 'app/core/utils/respondentSolicitorSearchHelper';
const organisationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');
const mockOrganisations = require('app/services/mocks/responses/organisations.json');

const underTest = require(modulePath);

const YES_VALUE = 'Yes';
const TEST_RESP_SOLICITOR_NAME = 'RespondentSolicitor';
const TEST_RESP_SOLICITOR_EMAIL = 'test@email';
const TEST_RESP_SOLICITOR_REF = 'SOL-REF';
const TEST_RESP_SOLICITOR_COMPANY = 'Whitehead & Low Solicitors LLP';
const TEST_RESP_SOLICITOR_ID = '11-111';

const Errors = {
  EMPTY_SOLICITOR_SEARCH: 'emptyValue',
  SHORT_SOLICITOR_SEARCH: 'shortValue',
  EMPTY_SOLICITOR_NAME: 'solicitorName',
  EMPTY_SOLICITOR_EMAIL: 'solicitorEmail'
};

const content = {
  resources: {
    en: {
      translation: {
        content: {
          searchErrors: {
            emptyValue: Errors.EMPTY_SOLICITOR_SEARCH,
            shortValue: Errors.SHORT_SOLICITOR_SEARCH,
            solicitorName: Errors.EMPTY_SOLICITOR_NAME,
            solicitorEmail: Errors.EMPTY_SOLICITOR_EMAIL
          }
        }
      }
    }
  }
};

let req = {};

describe(modulePath, () => {
  describe('validateSearchRequest()', () => {
    const session = { language: 'en' };

    it('should return no validation errors when search criteria is longer than three characters', () => {
      expect(underTest.validateSearchRequest('mock org', content, session)).to.deep.equal([true, null]);
    });

    it('should return EMPTY_SOLICITOR_SEARCH error message when search criteria is empty', () => {
      expect(underTest.validateSearchRequest('', content, session))
        .to.deep.equal([false, { error: true, errorMessage: Errors.EMPTY_SOLICITOR_SEARCH }]);
    });

    it('should return SHORT_SOLICITOR_SEARCH error message when search criteria is less than three characters', () => {
      expect(underTest.validateSearchRequest('co', content, session))
        .to.deep.equal([false, { error: true, errorMessage: Errors.SHORT_SOLICITOR_SEARCH }]);
    });

    it('should return as valid if no search criteria is provided', () => {
      const searchCriteria = get(req.body, 'respondentSolicitorFirm');
      expect(underTest.validateSearchRequest(searchCriteria, content, session))
        .to.deep.equal([true, null]);
    });
  });

  describe('fetchAndAddOrganisations()', () => {
    let getToken = null;
    let getOrganisationByName = null;
    const error = new Error('Something went wrong');
    const searchCriteria = 'searchCriteria';

    context('Organisation service and service token service are successfull', () => {
      beforeEach(() => {
        getToken = sinon.stub().resolves('token');
        getOrganisationByName = sinon.stub().resolves(mockOrganisations);

        sinon.stub(organisationService, 'setup').returns({ getOrganisationByName });
        sinon.stub(serviceTokenService, 'setup').returns({ getToken });
      });

      afterEach(() => {
        serviceTokenService.setup.restore();
        organisationService.setup.restore();
      });

      it('should set organisation search results', async () => {
        req = { session: {}, cookies: ['__auth-token=auth.token', 'connect.sid=some-sid'] };

        expect(true, await underTest.fetchAndAddOrganisations(req, searchCriteria));
        expect(getToken.calledOnce).to.equal(true);
        expect(getOrganisationByName.calledOnce).to.equal(true);
        expect(req.session.organisations).to.deep.equal(mockOrganisations);
      });
    });

    context('Organisation service is not successful', () => {
      beforeEach(() => {
        getToken = sinon.stub().resolves('token');
        getOrganisationByName = sinon.stub().rejects(error);

        sinon.stub(organisationService, 'setup').returns({ getOrganisationByName });
        sinon.stub(serviceTokenService, 'setup').returns({ getToken });
      });

      afterEach(() => {
        serviceTokenService.setup.restore();
        organisationService.setup.restore();
      });

      it('should not set organisations on the session', async () => {
        req = { session: {}, cookies: ['__auth-token=auth.token', 'connect.sid=some-sid'] };

        expect(false, await underTest.fetchAndAddOrganisations(req, searchCriteria));
        expect(getToken.calledOnce).to.equal(true);
        expect(getOrganisationByName.calledOnce).to.equal(true);
        expect(req.session).to.not.have.property('organisations');
      });
    });

    context('Service token service is not successful', () => {
      beforeEach(() => {
        getToken = sinon.stub().rejects(error);
        getOrganisationByName = sinon.stub().resolves(mockOrganisations);

        sinon.stub(organisationService, 'setup').returns({ getOrganisationByName });
        sinon.stub(serviceTokenService, 'setup').returns({ getToken });
      });

      afterEach(() => {
        serviceTokenService.setup.restore();
        organisationService.setup.restore();
      });

      it('should not set organisations on the session', async () => {
        req = { session: {}, cookies: ['__auth-token=auth.token', 'connect.sid=some-sid'] };

        expect(false, await underTest.fetchAndAddOrganisations(req, searchCriteria));
        expect(getToken.calledOnce).to.equal(true);
        expect(getOrganisationByName.calledOnce).to.equal(false);
        expect(req.session).to.not.have.property('organisations');
      });
    });
  });

  describe('hasBeenPostedWithoutSubmitButton()', () => {
    it('should return true if request body does not have a submit property', () => {
      req = { body: { someOtherProp: true } };

      expect(true, underTest.hasBeenPostedWithoutSubmitButton(req));
    });

    it('should return false if request body has a submit property', () => {
      req = { body: { submit: 'true' } };

      expect(false, underTest.hasBeenPostedWithoutSubmitButton(req));
    });

    it('should return false if request body is empty', () => {
      req = { body: {} };

      expect(false, underTest.hasBeenPostedWithoutSubmitButton(req));
    });
  });

  describe('mapValidationErrors()', () => {
    let validationErrors = [];

    beforeEach(() => {
      req = { session: { error: null } };
      validationErrors = [
        { param: 'respondentSolicitorName', msg: 'Please provide a solicitor\'s name' },
        { param: 'respondentSolicitorNameManual', msg: 'Please provide a solicitor\' name' },
        { param: 'respondentSolicitorEmail', msg: 'Please provide a solicitor\'s email' },
        { param: 'respondentSolicitorEmailManual', msg: 'Please provide a solicitor\'s email' },
        { param: 'respondentSolicitorAddressManual', msg: 'Please provide solicitor\'s address' },
        { param: 'respondentSolicitorCompany', msg: 'Please provide solicitor\'s firm' }
      ];
    });

    it('should mapped expected errors when is not manual entry', () => {
      const manual = false;
      const expectedLength = 2;

      underTest.mapValidationErrors(req.session, validationErrors, manual);

      expect(req.session.errors).to.be.lengthOf(expectedLength);
      expect(get(req.session.error, 'respondentSolicitorName.errorMessage')).to.equal('Please provide a solicitor\'s name');
      expect(get(req.session.error, 'respondentSolicitorNameManual.errorMessage')).to.be.undefined;
      expect(get(req.session.error, 'respondentSolicitorEmailManual.errorMessage')).to.be.undefined;
      expect(get(req.session.error, 'respondentSolicitorAddressManual.errorMessage')).to.be.undefined;
    });

    it('should mapped expected errors when is manual entry', () => {
      const manual = true;
      const expectedLength = 4;
      set(req.session, 'searchType', 'manual');

      underTest.mapValidationErrors(req.session, validationErrors, manual);

      expect(req.session.errors).to.be.lengthOf(expectedLength);
      expect(get(req.session.error, 'respondentSolicitorNameManual.errorMessage')).to.equal('Please provide a solicitor\' name');
      expect(get(req.session.error, 'respondentSolicitorCompany.errorMessage')).to.equal('Please provide solicitor\'s firm');
      expect(get(req.session.error, 'respondentSolicitorEmailManual.errorMessage')).to.equal('Please provide a solicitor\'s email');
      expect(get(req.session.error, 'respondentSolicitorAddressManual.errorMessage')).to.equal('Please provide solicitor\'s address');
    });

    it('should not have any mapped errors when no validation fails', () => {
      const manual = false;
      const expectedLength = 0;

      underTest.mapValidationErrors(req.session, [], manual);

      expect(req.session.errors).to.be.lengthOf(expectedLength);
    });
  });

  describe('#errorsManualCleanup()', () => {
    const noItems = 0;

    beforeEach(() => {
      set(req.session, 'error.respondentSolicitorNameManual', {});
      set(req.session, 'errors', [
        {
          param: 'respondentSolicitorNameManual',
          msg: 'Please provide a solicitor\'s name'
        }
      ]);
    });

    it('should clear up errors in session', () => {
      underTest.errorsManualCleanup(req.session);

      expect(get(req.session.error, 'respondentSolicitorNameManual')).to.be.undefined;
      expect(req.session.errors).to.have.lengthOf(noItems);
    });
  });

  context('Validating if manual or search:', () => {
    forEach([
      [false, true, 'isInValidManualData', true],
      [true, true, 'isInValidManualData', false],
      [false, false, 'isInValidSearchData', true],
      [false, true, 'isInValidSearchData', false]
    ])
      .it('should check when isValid is %s and isManual %s calling \'%s\' and expect %s', (isValid, isManual, methodName, expectedResult) => {
        expect(invoke(underTest, methodName, isValid, isManual)).to.equal(expectedResult);
      });
  });

  describe('isManual()', () => {
    it('should return true if search type is manual', () => {
      const session = { searchType: 'manual' };
      expect(underTest.isManual(session)).to.equal(true);
    });

    it('should return false if search type does not exist', () => {
      const session = {};
      expect(underTest.isManual(session)).to.equal(false);
    });
  });

  context('Address data parsing:', () => {
    describe('parseManualAddress()', () => {
      const expectedLines = 4;
      it('should correctly format manually entered address', () => {
        const addressEntry = 'An\n\raddress\nline\n \r\nlast line';
        const expectedResult = ['An', 'address', 'line', 'last line'];
        const result = underTest.parseManualAddress(addressEntry);
        expect(result).to.deep.equal(expectedResult);
        expect(result).to.have.lengthOf(expectedLines);
      });
    });

    describe('resetManualSolicitorData()', () => {
      it('should parse address to manual address format', () => {
        const session = {
          respondentSolicitorAddress: {
            address: ['Solicitor', 'address']
          }
        };

        underTest.resetSolicitorManualData(session);

        expect(session.respondentSolicitorAddressManual).to.equal('Solicitor\naddress');
      });

      it('should not parse address to manual address format if no address', () => {
        const session = {
          respondentSolicitorAddress: {
            address: null
          }
        };

        underTest.resetSolicitorManualData(session);

        expect(session.respondentSolicitorAddressManual).to.be.undefined;
      });

      it('should reset manual data', () => {
        const session = {
          respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
          respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL
        };

        underTest.resetSolicitorManualData(session);

        expect(session).to.have.property('resetManualData');
        expect(session.resetManualData).to.equal(false);
        expect(session).to.have.property('respondentSolicitorNameManual');
        expect(session).to.have.property('respondentSolicitorEmailManual');
      });

      it('should not reset manual data', () => {
        const session = {
          resetManualData: false,
          respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
          respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL
        };

        underTest.resetSolicitorManualData(session);

        expect(session).not.to.have.property('respondentSolicitorNameManual');
        expect(session).not.to.have.property('respondentSolicitorEmailManual');
      });
    });

    describe('trimAndRemoveBlanks()', () => {
      const expectedLines = 5;
      it('should correctly process list of items', () => {
        const itemsArray = ['Some', ' ', 'items', null, 'in', 'a', 'list', ''];
        const expectedResult = ['Some', 'items', 'in', 'a', 'list'];
        const result = underTest.trimAndRemoveBlanks(itemsArray);
        expect(result).to.deep.equal(expectedResult);
        expect(result).to.have.lengthOf(expectedLines);
      });
    });
  });

  context('Session data mapping', () => {
    describe('mapRespondentSolicitorData() - Digital', () => {
      let session = {};
      const buildRespondentSolicitorSessionData = () => {
        return {
          divorceWho: 'wife',
          respondentSolicitorName: null,
          respondentSolicitorEmail: null,
          respondentSolicitorReference: null,
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

      beforeEach(() => {
        session = buildRespondentSolicitorSessionData();
        req = { session };
      });

      afterEach(() => {
        session = {};
      });

      it('should map current data to expected respondent solicitor payload', () => {
        const expectedAddress = [
          '19/22 Union St',
          'Oldham',
          'United Kingdom',
          'Greater Manchester',
          'OL1 222',
          'Manchester'
        ];

        req.body = {
          respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
          respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL,
          respondentSolicitorReference: TEST_RESP_SOLICITOR_REF
        };

        underTest.mapRespondentSolicitorData(req);

        expect(req.session.respondentSolicitorRepresented).to.equal(YES_VALUE);
        expect(req.session.respondentSolicitorName).to.equal(TEST_RESP_SOLICITOR_NAME);
        expect(req.session.respondentSolicitorEmail).to.equal(TEST_RESP_SOLICITOR_EMAIL);
        expect(req.session.respondentSolicitorReference).to.equal(TEST_RESP_SOLICITOR_REF);
        expect(req.session.respondentSolicitorCompany).to.equal(TEST_RESP_SOLICITOR_COMPANY);
        expect(req.session.respondentSolicitorAddress).to.have.property('address');
        expect(req.session.respondentSolicitorAddress.address).to.have.deep.members(expectedAddress);
        expect(req.session.respondentSolicitorReferenceDataId).to.equal(TEST_RESP_SOLICITOR_ID);
      });

      it('should map empty array to solicitor address when no solicitor organisation', () => {
        req.session.respondentSolicitorOrganisation = null;

        underTest.mapRespondentSolicitorData(req);

        expect(req.session.respondentSolicitorRepresented).to.equal(YES_VALUE);
        expect(req.session.respondentSolicitorName).to.be.undefined;
        expect(req.session.respondentSolicitorEmail).to.be.undefined;
        expect(req.session.respondentSolicitorReference).to.be.undefined;
        expect(req.session.respondentSolicitorCompany).to.be.undefined;
        expect(req.session.respondentSolicitorAddress).to.have.property('address');
        expect(req.session.respondentSolicitorAddress.address).to.have.lengthOf(0);
        expect(req.session.respondentSolicitorReferenceDataId).to.be.undefined;
      });
    });

    describe('mapRespondentSolicitorData() - Manual', () => {
      const manualAddress = 'An\n\raddress\nline\n \r\nlast line';
      const expectedAddress = ['An', 'address', 'line', 'last line'];

      it('should map current data to expected respondent solicitor payload', () => {
        req = {
          body: {
            respondentSolicitorNameManual: TEST_RESP_SOLICITOR_NAME,
            respondentSolicitorEmailManual: TEST_RESP_SOLICITOR_EMAIL,
            respondentSolicitorReference: TEST_RESP_SOLICITOR_REF,
            respondentSolicitorAddressManual: manualAddress,
            respondentSolicitorCompany: TEST_RESP_SOLICITOR_COMPANY
          },
          session: {
            divorceWho: 'wife',
            searchType: 'manual'
          }
        };

        underTest.mapRespondentSolicitorData(req);

        expect(req.session.respondentSolicitorRepresented).to.equal(YES_VALUE);
        expect(req.session.respondentSolicitorName).to.equal(TEST_RESP_SOLICITOR_NAME);
        expect(req.session.respondentSolicitorEmail).to.equal(TEST_RESP_SOLICITOR_EMAIL);
        expect(req.session.respondentSolicitorReference).to.equal(TEST_RESP_SOLICITOR_REF);
        expect(req.session.respondentSolicitorCompany).to.equal(TEST_RESP_SOLICITOR_COMPANY);
        expect(req.session.respondentSolicitorAddress).to.have.property('address');
        expect(req.session.respondentSolicitorAddress.address).to.have.deep.members(expectedAddress);
        expect(req.session.respondentSolicitorAddressManual).to.equal(manualAddress);
      });
    });

    describe('mapRespondentSolicitorCyaData', () => {
      it('should correctly generate CYA content when all data is available', () => {
        req.session = {
          respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
          respondentSolicitorCompany: TEST_RESP_SOLICITOR_COMPANY,
          respondentSolicitorAddress: {
            address: [
              'address line 1',
              '',
              'address line 3'
            ]
          },
          respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL,
          respondentSolicitorReference: TEST_RESP_SOLICITOR_REF
        };
        const expectedCyaContent = [
          TEST_RESP_SOLICITOR_NAME,
          TEST_RESP_SOLICITOR_COMPANY,
          'address line 1',
          'address line 3',
          TEST_RESP_SOLICITOR_EMAIL,
          TEST_RESP_SOLICITOR_REF
        ].join('<br>');

        const cyaContent = underTest.mapRespondentSolicitorCyaData(req.session);

        expect(cyaContent).to.deep.equal(expectedCyaContent);
      });

      it('should correctly generate CYA content when some optional data not available', () => {
        req.session = {
          respondentSolicitorName: TEST_RESP_SOLICITOR_NAME,
          respondentSolicitorCompany: TEST_RESP_SOLICITOR_COMPANY,
          respondentSolicitorAddress: {
            address: [
              'address line 1',
              'address line 2'
            ]
          },
          respondentSolicitorEmail: TEST_RESP_SOLICITOR_EMAIL
        };
        const expectedCyaContent = [
          TEST_RESP_SOLICITOR_NAME,
          TEST_RESP_SOLICITOR_COMPANY,
          'address line 1',
          'address line 2',
          TEST_RESP_SOLICITOR_EMAIL
        ].join('<br>');

        const cyaContent = underTest.mapRespondentSolicitorCyaData(req.session);

        expect(cyaContent).to.deep.equal(expectedCyaContent);
      });
    });
  });

  describe('errorsCleanup()', () => {
    it('should remove error variables from session data', () => {
      const session = { error: {}, errors: [] };

      underTest.errorsCleanup(session);

      expect(session.error).to.be.undefined;
      expect(session.errors).to.be.undefined;
    });
  });

  describe('cleanupBeforeSubmit()', () => {
    let session = {};

    beforeEach(() => {
      session = {
        organisations: [{ item: 1 }], error: {}, errors: [],
        respondentSolicitorOrganisation: {},
        resetManualData: false
      };
    });

    it('should cleanup session before submission', () => {
      underTest.cleanupBeforeSubmit(session);

      expect(session.organisations).to.be.undefined;
      expect(session.resetManualData).to.be.undefined;
      expect(session.error).to.be.undefined;
      expect(session.errors).to.be.undefined;
      expect(session.respondentSolicitorOrganisation).not.to.be.undefined;
    });

    it('should cleanup session before submission if manual entry', () => {
      session.searchType = 'manual';
      underTest.cleanupBeforeSubmit(session);

      expect(session.organisations).to.be.undefined;
      expect(session.error).to.be.undefined;
      expect(session.errors).to.be.undefined;
      expect(session.respondentSolicitorOrganisation).to.be.undefined;
    });
  });

  describe('showManualDisplayUrl()', () => {
    it('should return true if data Solicitor Reference Data id does not exist', () => {
      const session = { respondentSolicitorCompany: TEST_RESP_SOLICITOR_NAME };

      expect(underTest.showManualDisplayUrl(session)).to.equal(true);
    });

    it('should return false if data Solicitor Reference Data id does exist', () => {
      const session = {
        respondentSolicitorCompany: TEST_RESP_SOLICITOR_NAME,
        respondentSolicitorReferenceDataId: TEST_RESP_SOLICITOR_REF };

      expect(underTest.showManualDisplayUrl(session)).to.equal(false);
    });
  });

  context('Session data reset and clean up:', () => {
    const commonResetExpectations = ({ session }) => {
      expect(session.respondentSolicitorRepresented).to.be.undefined;
      expect(session.respondentSolicitorName).to.be.undefined;
      expect(session.respondentSolicitorNameManual).to.be.undefined;
      expect(session.respondentSolicitorEmail).to.be.undefined;
      expect(session.respondentSolicitorReference).to.be.undefined;
      expect(session.respondentSolicitorReferenceDataId).to.be.undefined;
      expect(session.respondentSolicitorAddress).to.be.undefined;
      expect(session.respondentSolicitorAddressManual).to.be.undefined;
      expect(session.respondentSolicitorOrganisation).to.be.undefined;
      expect(session.respondentSolicitorCompany).to.be.undefined;
      expect(session.respondentSolicitorEmailManual).to.be.undefined;
    };

    beforeEach(() => {
      req.session = {
        organisations: [],
        respondentSolicitorRepresented: YES_VALUE,
        respondentSolicitorFirm: null,
        respondentSolicitorCompany: null,
        respondentSolicitorOrganisation: null,
        respondentSolicitorName: null,
        respondentSolicitorNameManual: null,
        respondentSolicitorEmail: null,
        respondentSolicitorEmailManual: null,
        respondentSolicitorReference: null,
        respondentSolicitorReferenceDataId: null,
        respondentSolicitorAddress: null,
        respondentSolicitorAddressManual: null
      };
    });
    describe('resetManualRespondentSolicitorData()', () => {
      it('should remove manual data propertied from session data', () => {
        underTest.resetManualRespondentSolicitorData(req.session);

        expect(req.session.organisations).to.be.undefined;
        expect(req.session.respondentSolicitorFirm).to.be.undefined;
        commonResetExpectations(req);
      });
    });

    describe('resetRespondentSolicitorData()', () => {
      it('should reset respondent solicitor session data', () => {
        underTest.resetRespondentSolicitorData(req.session);

        expect(req.session.organisations).not.to.be.undefined;
        expect(req.session.respondentSolicitorFirm).not.to.be.undefined;
        commonResetExpectations(req);
      });
    });
  });
});
