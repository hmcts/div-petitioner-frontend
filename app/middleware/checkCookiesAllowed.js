function checkCookiesAllowed(req, res, next) {
  const requiredCookiesAreSet = req.cookies['connect.sid'];

  if (requiredCookiesAreSet) {
    next();
  } else {
    //  cookie could not be set
    res.redirect('/cookie-error');
  }
}

module.exports = checkCookiesAllowed;
