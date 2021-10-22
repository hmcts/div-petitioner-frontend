const sinon = require('sinon');
const idamExpress = require('@hmcts/div-idam-express-middleware');

const onAuthenticate = () => {
  return (req, res, next) => {
    next();
  };
};

const onLanding = () => {
  return (req, res, next) => {
    next();
  };
};

const onProtect = () => {
  return (req, res, next) => {
    next();
  };
};

const onLogout = () => {
  return (req, res, next) => {
    next();
  };
};

const onUserDetails = () => {
  return (req, res, next) => {
    next();
  };
};

const stub = () => {
  sinon.stub(idamExpress, 'authenticate').callsFake(onAuthenticate);
  sinon.stub(idamExpress, 'landingPage').callsFake(onLanding);
  sinon.stub(idamExpress, 'protect').callsFake(onProtect);
  sinon.stub(idamExpress, 'logout').callsFake(onLogout);
  sinon.stub(idamExpress, 'userDetails').callsFake(onUserDetails);
};

const restore = () => {
  idamExpress.authenticate.restore();
  idamExpress.landingPage.restore();
  idamExpress.protect.restore();
  idamExpress.logout.restore();
  idamExpress.userDetails.restore();
};

module.exports = { onAuthenticate, onLanding, onProtect, onLogout, onUserDetails, stub, restore };