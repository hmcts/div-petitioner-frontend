const { trim, isEmpty, size, isUndefined } = require('lodash');
const organisationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');

const tempOrganisationApiUrl = 'https://rd-professional-api-pr-983.service.core-compute-preview.internal/refdata/external/v1/organisations/status';
const MIN_CHARACTERS = 2;
const ORGANISATION_STATUS = 'active';

const fetchOrganisations = async (req, searchCriteria) => {
  const authToken = req.cookies['__auth-token'];
  const serviceToken = serviceTokenService.setup();
  const serviceAuthToken = await serviceToken.getToken(req);
  const organisation = organisationService.setup(authToken, serviceAuthToken, tempOrganisationApiUrl);
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

// function postRequest(req, res) {
//   const auth = req.cookies['__auth-token'];
//   const serviceToken = serviceTokenService.setup();
//   const solicitorFirm = req.body.respondentSolicitorFirm;
//
//   if (solicitorFirm) {
//     let organisation = null;
//
//     return serviceToken.getToken(req)
//       .then(serviceAuthToken => {
//         organisation = organiationService.setup(auth, serviceAuthToken, tempOrganisationApiUrl);
//         return organisation.getOrganisationByName('active', solicitorFirm);
//       })
//       .then(organisations => {
//         req.session.organisations = organisations;
//         return res.redirect(this.url);
//       })
//       .catch(error => {
//         console.log('Error getting prd client data', error.message); // eslint-disable-line no-console
//         return res.redirect('/generic-error');
//       });
//   }
// }
