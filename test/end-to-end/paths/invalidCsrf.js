Feature('Simulated invalid CSRF token @functional').retry(3);

Scenario('Should continue if there is a csrf token set', async function (I) {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  let csrfToken = await I.grabValueFrom('input[name=_csrf]');
  if (!csrfToken) {
    throw new Error('Missing csrfToken');
  }
  I.seeInCurrentUrl('/screening-questions/respondent-address');
});

Scenario('Redirects to error when csrf gets modified', (I) => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.fillField('input[name=_csrf]', 'modifedCsrfToken');
  I.haveRespondentAddress();
  I.dontSeeInCurrentUrl('/screening-questions/marriage-certificate');
});
