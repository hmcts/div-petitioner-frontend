const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/core/utils/respondentSolicitorSearchHelper';
const organisationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');
const mockOrganisations = require('app/services/mocks/responses/organisations.json');

const {
  validateSearchRequest,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton,
  validateUserData
} = require(modulePath);

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
      expect(validateSearchRequest('mock org', content, session)).to.deep.equal([true, null]);
    });

    it('should return EMPTY_SOLICITOR_SEARCH error message when search criteria is empty', () => {
      expect(validateSearchRequest('', content, session))
        .to.deep.equal([false, { error: true, errorMessage: Errors.EMPTY_SOLICITOR_SEARCH }]);
    });

    it('should return SHORT_SOLICITOR_SEARCH error message when search criteria is less than three characters', () => {
      expect(validateSearchRequest('co', content, session))
        .to.deep.equal([false, { error: true, errorMessage: Errors.SHORT_SOLICITOR_SEARCH }]);
    });
  });

  describe('fetchAndAddOrganisations()', () => {
    let getToken = null;
    let getOrganisationByName = null;
    const error = new Error('Something went wrong');

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

        expect(true, await fetchAndAddOrganisations(req));
        expect(getToken.calledOnce).to.equal(true);
        expect(getOrganisationByName.calledOnce).to.equal(true);
        expect(req.session.organisations).to.deep.equal(mockOrganisations);
      });
    });

    context('Organisation service is not successfull', () => {
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

        expect(false, await fetchAndAddOrganisations(req));
        expect(getToken.calledOnce).to.equal(true);
        expect(getOrganisationByName.calledOnce).to.equal(true);
        expect(req.session).to.not.have.property('organisations');
      });
    });

    context('Service token service is not successfull', () => {
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

        expect(false, await fetchAndAddOrganisations(req));
        expect(getToken.calledOnce).to.equal(true);
        expect(getOrganisationByName.calledOnce).to.equal(false);
        expect(req.session).to.not.have.property('organisations');
      });
    });
  });

  describe('hasBeenPostedWithoutSubmitButton()', () => {
    it('should return true if request body does not have a submit property', () => {
      req = { body: { someOtherProp: true } };

      expect(true, hasBeenPostedWithoutSubmitButton(req));
    });

    it('should return false if request body has a submit property', () => {
      req = { body: { submit: 'true' } };

      expect(false, hasBeenPostedWithoutSubmitButton(req));
    });

    it('should return false if request body is empty', () => {
      req = { body: {} };

      expect(false, hasBeenPostedWithoutSubmitButton(req));
    });
  });

  describe('validateUserData()', () => {
    it('should return no errors when respondentSolicitorName and respondentSolicitorEmail have been populated', () => {
      req = {
        body: {
          respondentSolicitorName: 'Karen Fox Solicitor',
          respondentSolicitorEmail: 'test@email.com'
        },
        session: { language: 'en' }
      };

      expect(validateUserData(content, req)).to.deep.equal([]);
    });

    it('should return EMPTY_SOLICITOR_NAME error message when respondentSolicitorName is an empty string', () => {
      req = {
        body: {
          respondentSolicitorName: '',
          respondentSolicitorEmail: 'test@email.com'
        },
        session: { language: 'en' }
      };

      expect(validateUserData(content, req))
        .to.deep.equal([{ key: 'respondentSolicitorNameError', errorMessage: Errors.EMPTY_SOLICITOR_NAME }]);
    });

    it('should return EMPTY_SOLICITOR_EMAIL error message when respondentSolicitorEmail is an empty string', () => {
      req = {
        body: {
          respondentSolicitorName: 'Karen Fox Solicitor',
          respondentSolicitorEmail: ''
        },
        session: { language: 'en' }
      };

      expect(validateUserData(content, req))
        .to.deep.equal([{ key: 'respondentSolicitorEmailError', errorMessage: Errors.EMPTY_SOLICITOR_EMAIL }]);
    });

    it('should return EMPTY_SOLICITOR_NAME and EMPTY_SOLICITOR_EMAIL error message when respondentSolicitorName and respondentSolicitorEmail have not been provided', () => {
      req = {
        body: {},
        session: { language: 'en' }
      };

      expect(validateUserData(content, req))
        .to.deep.equal([
          { key: 'respondentSolicitorNameError', errorMessage: Errors.EMPTY_SOLICITOR_NAME },
          { key: 'respondentSolicitorEmailError', errorMessage: Errors.EMPTY_SOLICITOR_EMAIL }
        ]);
    });
  });
});
