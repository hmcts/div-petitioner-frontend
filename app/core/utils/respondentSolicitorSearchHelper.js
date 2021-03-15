const { get, set, unset, keys, trim, find, forEach, filter, isEmpty, size, isEqual, isUndefined, first, values } = require('lodash');
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
  SOLICITOR_NAME: 'solicitorName',
  SOLICITOR_EMAIL: 'solicitorEmail'
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

const fetchAndAddOrganisations = async (req, searchCriteria) => {
  let organisationsRetrieved = false;

  req.session.respondentSolicitorOrganisation = null;
  try {
    logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, making api request');
    const response = await fetchOrganisations(req, trim(searchCriteria));

    if (response) {
      req.session.organisations = response;
      organisationsRetrieved = true;
      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, request complete');
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
  unset(session, 'error');
  set(session, 'error', {});

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

const mapValidationErrors = (req, errors, manual) => {
  unset(req, 'session.error');
  unset(req, 'session.errors');
  set(req, 'session.error', {});
  set(req, 'session.errors', errors);

  forEach([
    'respondentSolicitorName',
    'respondentSolicitorAddressManual',
    'respondentSolicitorEmail'
  ],
  item => {
    const error = find(errors, ['param', item]);
    if (error) {
      set(req.session.error, item, { error: true, errorMessage: error.msg });
    }
  });

  if (!manual) {
    unset(req.session.error, 'respondentSolicitorAddressManual');
    req.session.errors = filter(errors, error => {
      return !isEqual(error.param, 'respondentSolicitorAddressManual');
    });
  }

  return size(keys(req.session.error)) === 0;
};

const hasBeenPostedWithoutSubmitButton = ({ body }) => {
  return body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');
};

const isInValidManualData = (valid, manual) => {
  return !valid && manual;
};

const isInValidSearchData = (valid, manual) => {
  return !valid && !manual;
};

const isManual = session => {
  return isEqual(session.searchType, 'manual');
};

const parseManualAddress = value => {
  return value.split(/\r?\n/)
    .map(line => {
      return trim(line);
    })
    .filter(item => {
      return !isEmpty(item);
    });
};

const mapRespondentSolicitorData = ({ body, session }, manual) => {
  const { respondentSolicitorOrganisation } = session;
  const solicitorContactInformation = get(respondentSolicitorOrganisation, 'contactInformation');
  let address = filter(values(first(solicitorContactInformation)), size);

  if (manual) {
    const manualAddress = get(body, 'respondentSolicitorAddressManual');
    address = parseManualAddress(manualAddress);
    session.respondentSolicitorAddressManual = manualAddress;
  }

  session.respondentSolicitorAddress = { address };
  session.respondentSolicitorCompany = get(respondentSolicitorOrganisation, 'name');
  session.respondentSolicitorReferenceDataId = get(respondentSolicitorOrganisation, 'organisationIdentifier');
  session.respondentSolicitorName = get(body, 'respondentSolicitorName');
  session.respondentSolicitorReference = get(body, 'respondentSolicitorReference');
  session.respondentSolicitorEmail = get(body, 'respondentSolicitorEmail');
};

const errorsCleanup = session => {
  unset(session, 'error');
  unset(session, 'errors');
};

const cleanupBeforeSubmit = session => {
  unset(session, 'organisations');
  errorsCleanup(session);
  if (isManual(session)) {
    unset(session, 'respondentSolicitorOrganisation');
  }
};

const resetRespondentSolicitorData = session => {
  unset(session, 'respondentSolicitorOrganisation');
  unset(session, 'respondentSolicitorName');
  unset(session, 'respondentSolicitorEmail');
  unset(session, 'respondentSolicitorReference');
  unset(session, 'respondentSolicitorReferenceDataId');
  unset(session, 'respondentSolicitorAddress');
  unset(session, 'respondentSolicitorAddressManual');
  errorsCleanup(session);
};

const resetManualRespondentSolicitorData = session => {
  unset(session, 'organisations');
  unset(session, 'respondentSolicitorFirm');
  resetRespondentSolicitorData(session);
};

const parseAddressToManualAddress = session => {
  const manualAddress = get(session, 'respondentSolicitorAddress.address');
  if (manualAddress) {
    session.respondentSolicitorAddressManual = manualAddress.join('\n');
  }
};

module.exports = {
  UserAction,
  validateSearchRequest,
  fetchAndAddOrganisations,
  mapValidationErrors,
  hasBeenPostedWithoutSubmitButton,
  isInValidManualData,
  isInValidSearchData,
  isManual,
  errorsCleanup,
  parseManualAddress,
  parseAddressToManualAddress,
  mapRespondentSolicitorData,
  cleanupBeforeSubmit,
  resetManualRespondentSolicitorData,
  resetRespondentSolicitorData
};
