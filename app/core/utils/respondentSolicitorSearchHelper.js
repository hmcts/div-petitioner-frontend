const CONF = require('config');
const { get, trim, isEmpty, size, isUndefined } = require('lodash');
const organisationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');
const logger = require('app/services/logger').logger(__filename);

const prdUrl = `${CONF.services.prdClient.baseUrl}`;
const tempOrganisationApiUrl = 'https://rd-professional-api-pr-983.service.core-compute-preview.internal/refdata/external/v1/organisations/status';

const MIN_CHARACTERS = 2;
const ORGANISATION_STATUS = 'active';

const UserAction = {
  MANUAL: 'manual',
  SEARCH: 'search',
  SELECTION: 'selection',
  DESELECTION: 'deselection'
};

const ErrorMessage = {
  EMPTY_VALUE: 'emptyValue',
  SHORT_VALUE: 'shortValue'
};

const getOrganisationApiUrl = () => {
  return prdUrl || tempOrganisationApiUrl;
};

const getServiceAuthToken = req => {
  const serviceToken = serviceTokenService.setup();
  return serviceToken.getToken(req);
};

const fetchOrganisations = (req, searchCriteria) => {
  const authToken = req.cookies['__auth-token'];
  const serviceAuthToken = getServiceAuthToken(req);
  const organisation = organisationService.setup(authToken, serviceAuthToken, getOrganisationApiUrl());
  return organisation.getOrganisationByName(ORGANISATION_STATUS, searchCriteria);
};

const fetchAndAddOrganisations = async req => {
  const { body } = req;
  let organisationsRetrieved = false;

  req.session.respondentSolicitorOrganisation = null;
  req.session.respondentSolicitorFirm = get(body, 'respondentSolicitorFirm');

  if (req.session.respondentSolicitorFirmError) {
    req.session.respondentSolicitorFirmError = null;
  }
  try {
    logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, making api request');
    req.session.organisations = await fetchOrganisations(req, trim(req.session.respondentSolicitorFirm));
    organisationsRetrieved = true;
  } catch (error) {
    logger.errorWithReq(null, 'solicitor_search', `Organisation search failed with error: ${error.message}`);
  }

  return organisationsRetrieved;
};

const getErrorMessage = (contentKey, content, session) => {
  return content.resources[session.language].translation.content.searchErrors[contentKey];
};

const validateSearchRequest = (searchCriteria, content, session) => {
  if (!isUndefined(searchCriteria)) {
    const solicitorFirm = trim(searchCriteria);

    if (isEmpty(solicitorFirm)) {
      const errorMessage = getErrorMessage(ErrorMessage.EMPTY_VALUE, content, session);
      return [false, { error: true, errorMessage }];
    }

    if (size(solicitorFirm) <= MIN_CHARACTERS) {
      const errorMessage = getErrorMessage(ErrorMessage.SHORT_VALUE, content, session);
      return [false, { error: true, errorMessage }];
    }
  }
  return [true, null];
};

const hasBeenPostedWithoutSubmitButton = ({ body }) => {
  return body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');
};

module.exports = {
  UserAction,
  getServiceAuthToken,
  getOrganisationApiUrl,
  validateSearchRequest,
  fetchOrganisations,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton
};
