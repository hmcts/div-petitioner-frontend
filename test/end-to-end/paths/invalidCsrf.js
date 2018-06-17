Feature('Simulated invalid CSRF token').retry(3);

Scenario('Should continue if there is a csrf token set', function* (I) {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  let csrfToken = yield I.grabValueFrom('input[name=_csrf]');
  if (!csrfToken) {
    throw new Error('Missing csrfToken');
  }
  I.waitUrlEquals('/screening-questions/respondent-address');
});

Scenario('Redirects to error when csrf gets modified', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.fillField('input[name=_csrf]', 'modifedCsrfToken');
  I.haveRespondentAddress();
  I.dontSeeInCurrentUrl('/screening-questions/marriage-certificate');
});
