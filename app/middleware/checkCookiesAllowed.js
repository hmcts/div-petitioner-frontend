const attemptToSetTestCookieParam = 'attemptToSetTestCookie';
const testCookieName = 'test';

function checkCookiesAllowed(req, res, next) {
  const cookies = req.cookies;

  if (Object.keys(cookies).length) {
    // Remove test cookie, if it exists
    res.clearCookie('test');

    next();
  } else if (req.query[attemptToSetTestCookieParam]) {
    // This is an attempt to set a test cookie

    if (!cookies.test) {
      // Client does not accept cookies. Show them error page
      res.redirect('/cookie-error');
    }
  } else {
    // Cookie was not found, we'll attempt to set a test cookie
    res.cookie(testCookieName, 'testCookie', { secure: true });
    res.redirect(`${req.baseUrl}?${attemptToSetTestCookieParam}=true`);
  }
}

module.exports = checkCookiesAllowed;
