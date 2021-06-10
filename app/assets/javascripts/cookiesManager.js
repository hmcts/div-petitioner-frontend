$(document).ready(() => {
  // eslint-disable-next-line no-use-before-define
  checkCookie();
});

(() => {
  if (document.getElementById('save-cookie-preferences')) {
    document.getElementById('save-cookie-preferences').onclick = () => {
      // eslint-disable-next-line no-use-before-define
      setCookiePreference();
    };
  }
  document.getElementById('cookie-accept-submit').onclick = () => {
    // eslint-disable-next-line no-use-before-define
    setAcceptAllCookies();
  };
  document.getElementById('cookie-reject-submit').onclick = () => {
    // eslint-disable-next-line no-use-before-define
    setRejectAllCookies();
  };
  document.getElementById('cookie-accept-all-success-banner-hide').onclick = () => {
    document.getElementById('accept-all-cookies-success').classList.add('govuk-visually-hidden');
  };
  document.getElementById('cookie-reject-all-success-banner-hide').onclick = () => {
    document.getElementById('reject-all-cookies-success').classList.add('govuk-visually-hidden');
  };
// eslint-disable-next-line no-invalid-this
}).call(this);

function setCookiePreference() {
  const expiryDays = 365;
  const getAnalyticsSelectedValue = document.querySelector('input[name="analytics"]:checked');
  const getApmSelectedValue = document.querySelector('input[name="apm"]:checked');
  // eslint-disable-next-line no-magic-numbers,no-use-before-define
  setCookie('cookies_preferences_set', true, expiryDays);
  // eslint-disable-next-line no-use-before-define
  setCookie('cookies_policy', `{"essential":true,"analytics":${getAnalyticsSelectedValue.value},"apm:"${getApmSelectedValue.value}}`, expiryDays);
  document.getElementById('cookie-preference-success').classList.remove('govuk-visually-hidden');
  if (document.getElementById('accept-all-cookies-successs')) {
    document.getElementById('accept-all-cookies-success').classList.add('govuk-visually-hidden');
  }
  if (document.getElementById('reject-all-cookies-success')) {
    document.getElementById('reject-all-cookies-success').classList.add('govuk-visually-hidden');
  }
  if (document.getElementById('cm_cookie_notification')) {
    document.getElementById('cm_cookie_notification').classList.add('govuk-visually-hidden');
  }

  // eslint-disable-next-line no-use-before-define
  manageAnalyticsCookies(getAnalyticsSelectedValue.value);
  // eslint-disable-next-line no-use-before-define
  manageAPMCookie(getApmSelectedValue.value);
}

function setAcceptAllCookies() {
  const expiryDays = 365;
  // eslint-disable-next-line no-use-before-define
  setCookie('cookies_preferences_set', true, expiryDays);
  // eslint-disable-next-line no-use-before-define
  setCookie('cookies_policy', '{"essential":true,"analytics":true,"apm":true}', expiryDays);
  document.getElementById('accept-all-cookies-success').classList.remove('govuk-visually-hidden');
  document.getElementById('cm_cookie_notification').classList.add('govuk-visually-hidden');
  // eslint-disable-next-line no-use-before-define
  manageAPMCookie('true');
}

function setRejectAllCookies() {
  const expiryDays = 365;
  // eslint-disable-next-line no-use-before-define
  setCookie('cookies_preferences_set', true, expiryDays);
  // eslint-disable-next-line no-use-before-define
  setCookie('cookies_policy', '{"essential":true,"analytics":false,"apm":false}', expiryDays);
  document.getElementById('reject-all-cookies-success').classList.remove('govuk-visually-hidden');
  document.getElementById('cm_cookie_notification').classList.add('govuk-visually-hidden');
  // eslint-disable-next-line no-use-before-define
  manageAnalyticsCookies('false');
  // eslint-disable-next-line no-use-before-define
  manageAPMCookie('false');
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  // eslint-disable-next-line no-magic-numbers
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/; Secure=true`;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    // eslint-disable-next-line eqeqeq
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    // eslint-disable-next-line eqeqeq
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function checkCookie() {
  const expiryDays = 365;
  let cookiesPolicy = getCookie('cookies_policy');
  const cookiesPreferencesSet = getCookie('cookies_preferences_set');

  // eslint-disable-next-line eqeqeq
  if (cookiesPolicy == '') {
    cookiesPolicy = '{"essential":true,"analytics":false,"apm":false}';
    // eslint-disable-next-line eqeqeq,no-eq-null
    if (cookiesPolicy != '' && cookiesPolicy != null) {
      setCookie('cookies_policy', cookiesPolicy, expiryDays);
    }
  }
  // eslint-disable-next-line eqeqeq
  if (cookiesPreferencesSet == '') {
    setCookie('cookies_preferences_set', false, expiryDays);
    document.getElementById('cm_cookie_notification').classList.remove('govuk-visually-hidden');
  }
  // eslint-disable-next-line eqeqeq
  if (cookiesPreferencesSet == 'false') {
    document.getElementById('cm_cookie_notification').classList.remove('govuk-visually-hidden');
  }
  // setting the radio button value based on cookie value
  // eslint-disable-next-line eqeqeq
  if (cookiesPolicy.split(',')[1].split(':')[1] == 'true') {
    $('#radio-analytics-off').attr('checked', false);
    $('#radio-analytics-on').attr('checked', true);
  } else {
    $('#radio-analytics-on').attr('checked', false);
    $('#radio-analytics-off').attr('checked', true);
    // eslint-disable-next-line no-use-before-define
    manageAnalyticsCookies('false');
  }

  if (cookiesPolicy.split(',')[2].split(':')[1].includes('true')) {
    $('#radio-apm-off').attr('checked', false);
    $('#radio-apm-on').attr('checked', true);
    // eslint-disable-next-line no-use-before-define
    manageAPMCookie('true');
  } else {
    $('#radio-apm-on').attr('checked', false);
    $('#radio-apm-off').attr('checked', true);
    // eslint-disable-next-line no-use-before-define
    manageAPMCookie('false');
  }
}

function manageAnalyticsCookies(cookieStatus) {
  if (cookieStatus === 'false') {
    // eslint-disable-next-line no-use-before-define
    deleteCookie('_ga');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('_gid');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('_gat');
  }
}

function manageAPMCookie(cookieStatus) {
  if (cookieStatus === 'false') {
    // eslint-disable-next-line no-use-before-define
    deleteCookie('dtCookie');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('dtLatC');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('dtPC');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('dtSa');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('rxVisitor');
    // eslint-disable-next-line no-use-before-define
    deleteCookie('rxvt');
  }
  // eslint-disable-next-line no-use-before-define
  apmPreferencesUpdated(cookieStatus);
}

function deleteCookie(cookieName) {
  // eslint-disable-next-line no-use-before-define
  deleteCookieWithoutDomain(cookieName);
  // eslint-disable-next-line no-use-before-define
  deleteCookieFromCurrentAndUpperDomain(cookieName);
}

function deleteCookieWithoutDomain(cookieName) {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
}

function deleteCookieFromCurrentAndUpperDomain(cookieName) {
  const hostname = window.location.hostname;
  const dotHostname = `.${hostname}`;
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${hostname};path=/;`;
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${dotHostname};path=/;`;

  const dots = hostname.split('.');
  // eslint-disable-next-line no-magic-numbers
  const upperDomain = `${dots[dots.length - 2]}.${dots[dots.length - 1]}`;
  const dotUpperDomain = `.${upperDomain}`;
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${upperDomain};path=/;`;
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${dotUpperDomain};path=/;`;
}

function apmPreferencesUpdated(cookieStatus) {
  const dtrum = window.dtrum;

  // eslint-disable-next-line no-undefined
  if (dtrum !== undefined) {
    if (cookieStatus === 'true') {
      dtrum.enable();
      dtrum.enableSessionReplay();
    } else {
      dtrum.disableSessionReplay();
      dtrum.disable();
    }
  }
}
