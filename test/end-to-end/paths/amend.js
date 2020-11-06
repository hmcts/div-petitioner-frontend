Feature('Amend petition @functional');

Scenario('Submit an amend petition with an existing statement of truth stops at Check Your Answers', async function(I) {
  I.startApplicationWith('amendPetitionSessionWithConfirmation');
  I.amOnLoadedPage('/');
  I.click('Continue');
  I.seeInCurrentUrl('/check-your-answers');
});
