const ValidationStep = require('app/core/steps/ValidationStep');
const { get, find } = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const MAX_RAND = 2;
function apiCall() {
  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  const v = getRandomInt(MAX_RAND);
  if (v === 0) {
    return null;
  }
  return [
    {
      contactInformation: [
        {
          addressLine1: 'Samson ann partners',
          addressLine2: '71 Cherry Court',
          addressLine3: null,
          country: null,
          county: 'Oxford',
          postCode: 'OX1 3HB',
          townCity: null
        }
      ],
      name: 'Organisation 1',
      organisationIdentifier: 'ORG-01'
    },
    {
      contactInformation: [
        {
          addressLine1: 'Vipers and son',
          addressLine2: '40 Southgate Street',
          addressLine3: null,
          country: null,
          county: 'Bath',
          postCode: 'BA1 1TG',
          townCity: 'London'
        }
      ],
      name: 'Organisation 2',
      organisationIdentifier: 'ORG-02'
    }
  ];

}

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  handler(req, res) {
    const { body } = req;

    const hasBeenPostedWithoutSubmitButton = body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');

    if (hasBeenPostedWithoutSubmitButton) {
      const userAction = get(body, 'userAction');

      if (userAction === 'manual') {
        logger.infoWithReq(null, 'solicitor_search', 'Manual solicitor search, redirecting to solicitor detail page.');
        req.session.respondentSolicitorOrganisation = null;
        req.session.organisations = null;
        return res.redirect(this.steps.RespondentSolicitorDetails.url);
      }

      if (userAction === 'search') {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, making api request');
        req.session.respondentSolicitorOrganisation = null;
        req.session.respondentSolicitorFirm = get(body, 'respondentSolicitorFirm');
        req.session.organisations = apiCall();
      }

      if (userAction === 'selection') {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has selected an organisation');
        const userSelection = get(body, 'userSelection');
        req.session.respondentSolicitorOrganisation = find(req.session.organisations, org => {
          return org.organisationIdentifier === userSelection;
        });
      }

      if (userAction === 'deselection') {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has deselected option');
        req.session.respondentSolicitorOrganisation = null;
      }

      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, redirecting to solicitor search');
      return res.redirect(this.url);
    }

    logger.infoWithReq(null, 'solicitor_search', 'Continue clicked, moving to next page (ReasonForDivorce)');
    return super.handler(req, res);
  }
};
