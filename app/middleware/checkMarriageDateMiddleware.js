const logger = require('app/services/logger').logger(__filename);
const { isUndefined, pick } = require('lodash');

const checkMarriageDate = (req, res, next) => {
  const { session } = req;
  const marriageDate = session.marriageDate;

  if (isUndefined(marriageDate)) {
    const attInfoToDisplay = ['marriageDateDay', 'marriageDateMonth', 'marriageDateYear'];
    const displayObject = pick(session, attInfoToDisplay);
    logger.infoWithReq(session.req, 'marriage_date_empty', 'Marriage date is empty', displayObject);
    return res.redirect('/about-your-marriage/date-of-marriage-certificate');
  }

  return next();
};

module.exports = { checkMarriageDate };