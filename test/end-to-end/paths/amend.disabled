Feature('Amend petition @functional').retry(5);

Scenario('Submit an amend petition with an existing statement of truth stops at Check Your Answers', async function(I) {
  I.startApplicationWith('amendPetitionSessionWithConfirmation');
  I.amOnLoadedPage('/index');
  I.click('Continue');
  I.seeInCurrentUrl('/check-your-answers');
});
