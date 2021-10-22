Feature('Simulated invalid CSRF token').retry(3);

Scenario('Should continue if there is a csrf token set', async I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.waitForNavigation();
  const csrfToken = await I.grabValueFrom('input[name=_csrf]');
  if (!csrfToken) {
    throw new Error('Missing csrfToken');
  }
  I.seeInCurrentUrl('/screening-questions/respondent-address');
});

Scenario('Redirects to error when csrf gets modified', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.waitForNavigation();
  I.fillField('input[name=_csrf]', 'modifedCsrfToken');
  I.haveRespondentAddress();
  I.dontSeeInCurrentUrl('/screening-questions/marriage-certificate');
  I.seeCurrentUrlEquals('/generic-error');
});
