const $ = require('jquery');

const saveInterval = 15000;

function saveAgain(data) {
  setTimeout(() => {
    // eslint-disable-next-line no-use-before-define
    saveProgress(data);
  }, saveInterval);
}

function saveProgress(previousData = '') {
  const form = $('#form');
  const data = $(form).serialize();

  if (data !== previousData) {
    return $.ajax({
      type: 'post',
      url: $(form).attr('action'),
      headers: { 'x-save-draft-session-only': 'true' },
      data
    }).always(() => {
      saveAgain(data);
    });
  }
  return saveAgain(data);
}

module.exports = saveProgress;
