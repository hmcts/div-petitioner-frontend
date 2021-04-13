const {
  get,
  set,
  unset,
  keys,
  trim,
  find,
  forEach,
  filter,
  isEmpty,
  size,
  isEqual,
  isUndefined,
  first,
  values
} = require('lodash');
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

const isManual = session => {
  return isEqual(session.searchType, 'manual');
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

const excludeErrors = (session, exclusionList, errors) => {
  forEach(exclusionList, item => {
    unset(session.error, item);
  });
  session.errors = filter(errors, error => {
    return !exclusionList.includes(error.param);
  });
};

const mapValidationErrors = (session, errors) => {
  unset(session, 'error');
  unset(session, 'errors');
  set(session, 'error', {});
  set(session, 'errors', errors);

  forEach([
    'respondentSolicitorName',
    'respondentSolicitorEmail',
    'respondentSolicitorCompany',
    'respondentSolicitorNameManual',
    'respondentSolicitorEmailManual',
    'respondentSolicitorAddressManual'
  ],
  item => {
    const error = find(errors, ['param', item]);
    if (error) {
      set(session.error, item, { error: true, errorMessage: error.msg });
    }
  });

  const manual = isManual(session);
  if (manual) {
    excludeErrors(session, [
      'respondentSolicitorName',
      'respondentSolicitorEmail'
    ], errors);
  } else {
    excludeErrors(session, [
      'respondentSolicitorAddressManual',
      'respondentSolicitorEmailManual',
      'respondentSolicitorNameManual',
      'respondentSolicitorCompany'
    ], errors);
  }

  return size(keys(session.error)) === 0;
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

const trimAndRemoveBlanks = list => {
  return [].concat(list)
    .map(line => {
      return trim(line);
    })
    .filter(item => {
      return !isEmpty(item);
    });
};

const parseManualAddress = value => {
  return trimAndRemoveBlanks(value.split(/\r?\n/));
};

const mapRespondentSolicitorData = ({ body, session }) => {
  const manual = isManual(session);
  const { respondentSolicitorOrganisation } = session;

  let address = filter(values(first(get(respondentSolicitorOrganisation, 'contactInformation'))), size);
  session.respondentSolicitorEmail = get(body, 'respondentSolicitorEmail');
  session.respondentSolicitorCompany = get(respondentSolicitorOrganisation, 'name');
  session.respondentSolicitorName = get(body, 'respondentSolicitorName');
  session.respondentSolicitorNameManual = get(body, 'respondentSolicitorNameManual');
  session.respondentSolicitorEmailManual = get(body, 'respondentSolicitorEmailManual');

  if (manual) {
    const manualAddress = get(body, 'respondentSolicitorAddressManual');
    address = parseManualAddress(manualAddress);
    session.respondentSolicitorAddressManual = manualAddress;
    session.respondentSolicitorCompany = get(body, 'respondentSolicitorCompany');
    session.respondentSolicitorEmail = get(body, 'respondentSolicitorEmailManual');
    session.respondentSolicitorName = get(body, 'respondentSolicitorNameManual');
  }

  session.respondentSolicitorAddress = { address };
  session.respondentSolicitorReferenceDataId = get(respondentSolicitorOrganisation, 'organisationIdentifier');
  session.respondentSolicitorReference = get(body, 'respondentSolicitorReference');
};

const mapRespondentSolicitorCyaData = session => {
  const displayContentList = [].concat(
    get(session, 'respondentSolicitorName'),
    get(session, 'respondentSolicitorCompany'),
    get(session, 'respondentSolicitorAddress.address'),
    get(session, 'respondentSolicitorEmail'),
    get(session, 'respondentSolicitorReference')
  );

  return trimAndRemoveBlanks(displayContentList).join('<br>');
};

const errorsCleanup = session => {
  unset(session, 'error');
  unset(session, 'errors');
};

const errorsManualCleanup = session => {
  excludeErrors(session, [
    'respondentSolicitorAddressManual',
    'respondentSolicitorEmailManual',
    'respondentSolicitorNameManual',
    'respondentSolicitorCompany'
  ], session.errors);
};

const cleanupBeforeSubmit = session => {
  unset(session, 'organisations');
  unset(session, 'resetManualData');
  errorsCleanup(session);
  if (isManual(session)) {
    unset(session, 'respondentSolicitorOrganisation');
  }
};

const resetRespondentSolicitorData = session => {
  unset(session, 'respondentSolicitorOrganisation');
  unset(session, 'respondentSolicitorName');
  unset(session, 'respondentSolicitorNameManual');
  unset(session, 'respondentSolicitorCompany');
  unset(session, 'respondentSolicitorEmail');
  unset(session, 'respondentSolicitorEmailManual');
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

const resetSolicitorManualData = session => {
  if (isUndefined(session.resetManualData)) {
    const manualAddress = get(session, 'respondentSolicitorAddress.address', []);
    session.respondentSolicitorAddressManual = manualAddress.join('\n');
    session.respondentSolicitorNameManual = get(session, 'respondentSolicitorName');
    session.respondentSolicitorEmailManual = get(session, 'respondentSolicitorEmail');
    session.resetManualData = false;
  }
};

const showManualDisplayUrl = session => {
  let manualEntry = false;

  if (!isEmpty(trim(session.respondentSolicitorCompany)) && isEmpty(trim(session.respondentSolicitorReferenceDataId))) {
    manualEntry = true;
  }

  return manualEntry;
};

module.exports = {
  UserAction,
  validateSearchRequest,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton,
  isInValidManualData,
  isInValidSearchData,
  isManual,
  errorsCleanup,
  errorsManualCleanup,
  parseManualAddress,
  resetSolicitorManualData,
  mapValidationErrors,
  mapRespondentSolicitorData,
  mapRespondentSolicitorCyaData,
  cleanupBeforeSubmit,
  resetManualRespondentSolicitorData,
  resetRespondentSolicitorData,
  trimAndRemoveBlanks,
  showManualDisplayUrl
};
