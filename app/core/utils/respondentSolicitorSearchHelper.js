const { trim, isEmpty, size, isUndefined } = require('lodash');
const organisationService = require('app/services/organisationService');

const MIN_CHARACTERS = 2;
const ORGANISATION_STATUS = 'active';

const fetchOrganisations = (req, searchCriteria) => {
  const organisation = organisationService.setup(null, null);
  return organisation.getOrganisationByName(ORGANISATION_STATUS, searchCriteria);
};

const validateSearchRequest = (searchCriteria, content, session) => {
  if (!isUndefined(searchCriteria)) {
    const solicitorFirm = trim(searchCriteria);

    if (isEmpty(solicitorFirm)) {
      return [
        false, {
          error: true,
          errorMessage: content.resources[session.language].translation.content.searchErrors.emptyValue
        }
      ];
    }

    if (size(solicitorFirm) <= MIN_CHARACTERS) {
      return [
        false, {
          error: true,
          errorMessage: content.resources[session.language].translation.content.searchErrors.toShortValue
        }
      ];
    }
  }
  return [true, null];
};


const hasBeenPostedWithoutSubmitButton = ({ body }) => {
  return body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');
};

module.exports = {
  validateSearchRequest,
  fetchOrganisations,
  hasBeenPostedWithoutSubmitButton
};
