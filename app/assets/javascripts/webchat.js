(function() {
  const button = document.querySelector('.chat-button');
  const webChat = document.querySelector('web-chat');
  const message = document.querySelector('#metrics');

  button.addEventListener('click', () => {
    webChat.classList.remove('hidden');
  });

  webChat.addEventListener('hide', () => {
    webChat.classList.add('hidden');
  });

  webChat.addEventListener('metrics', function(metrics) {
    const metricsDetail = metrics.detail;
    const ccState = metricsDetail.contactCenterState;
    const ewt = metricsDetail.ewt;
    const availableAgents = metricsDetail.availableAgents;
    const today = new Date();


    if (ccState !== 'Open' || today.getHours() < 9 || today.getHours() >= 17 || today.getDay() === 0 || today.getDay() === 6) {
      message.innerHTML = 'Web chat is now closed. Come back Monday to Friday 9am to 5pm. Or contact us using one of the ways below.';
      button.classList.add('hidden');
    } else if (ewt < 300 && availableAgents > 0) {
      message.innerHTML = '';
      button.classList.remove('hidden');
    } else {
      message.innerHTML = 'All our webchat QMCAs are busy helping other people. Please try again later or contact us using one of the ways below.';
      button.classList.add('hidden');
    }
  });

}).call(this);
