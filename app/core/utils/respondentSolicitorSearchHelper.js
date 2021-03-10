const { get, trim, isEmpty, size, isUndefined, isEqual } = require('lodash');
const organisationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');
const logger = require('app/services/logger').logger(__filename);

const MIN_CHARACTERS = 2;
const ORGANISATION_STATUS = 'active';

const UserAction = {
  MANUAL: 'manual',
  SEARCH: 'search',
  SELECTION: 'selection',
  DESELECTION: 'deselection',
  PROVIDED: 'provided'
};

const ErrorMessage = {
  EMPTY_VALUE: 'emptyValue',
  SHORT_VALUE: 'shortValue',
  SOLICITOR_NAME: 'solicitorName'
};

const getServiceAuthToken = req => {
  const serviceToken = serviceTokenService.setup();
  return serviceToken.getToken(req);
};

const fetchOrganisations = async (req, searchCriteria) => {
  const authToken = req.cookies['__auth-token'];

  try {
    const serviceAuthToken = await getServiceAuthToken(req);
    logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, retrieving organisation token');
    const organisation = organisationService.setup(authToken, serviceAuthToken);
    return organisation.getOrganisationByName(ORGANISATION_STATUS, searchCriteria);
  } catch (error) {
    logger.errorWithReq(null, 'solicitor_search', `Organisation search failed with error: ${error.message}`);
  }
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
    const response = await fetchOrganisations(req, trim(req.session.respondentSolicitorFirm));

    if (response) {
      req.session.organisations = response;
      organisationsRetrieved = true;
    }
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

const validateUserData = (content, req, userAction) => {
  const { body, session } = req;
  const solicitorName = get(body, 'respondentSolicitorName');

  if (isEqual(userAction, UserAction.PROVIDED) && isEmpty(solicitorName)) {
    const errorMessage = getErrorMessage(ErrorMessage.SOLICITOR_NAME, content, session);
    return [false, { error: true, errorMessage }];
  }

  return [true, null];
};

const hasBeenPostedWithoutSubmitButton = ({ body }) => {
  return body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');
};

module.exports = {
  UserAction,
  validateSearchRequest,
  validateUserData,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton
};
