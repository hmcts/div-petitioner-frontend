const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/core/utils/respondentSolicitorSearchHelper';
const organisationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');
const mockOrganisations = require('app/services/mocks/responses/organisations.json');

const {
  validateSearchRequest,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton
} = require(modulePath);

let req = {};

describe(modulePath, () => {
  describe('validateSearchRequest()', () => {
    const emptyError = 'emptyValue';
    const shortValueError = 'shortValue';

    const content = {
      resources: {
        en: {
          translation: {
            content: {
              searchErrors: {
                emptyValue: emptyError,
                shortValue: shortValueError
              }
            }
          }
        }
      }
    };

    const session = { language: 'en' };

    it('should return no validation errors when search criteria is longer than three characters', () => {
      expect(validateSearchRequest('mock org', content, session)).to.deep.equal([true, null]);
    });

    it('should return EMPTY_VALUE error message when search criteria is empty', () => {
      expect(validateSearchRequest('', content, session)).to.deep.equal([false, { error: true, errorMessage: emptyError }]);
    });

    it('should return SHORT_VALUE error message when search criteria is less than three characters', () => {
      expect(validateSearchRequest('co', content, session)).to.deep.equal([false, { error: true, errorMessage: shortValueError }]);
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
});
