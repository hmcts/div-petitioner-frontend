(function() {
  let popupWin;
  function windowOpener(url, name, args) {

    if(typeof(popupWin) != "object" || popupWin.closed)  {
      popupWin =  window.open(url, name, args);
    }
    else{
      popupWin.location.href = url;
    }

    popupWin.focus();
  }

  const button = document.querySelector('.chat-button');
  const webChat = document.querySelector('web-chat');
  const message = document.querySelector('#metrics');
  const openHoursMessage = document.querySelector('#webchatHours');

  button.addEventListener('click', () => {
    windowOpener('/avaya-webchat', 'Web Chat - Divorce', 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=350,height=550,left=100,top=100');
  });

  webChat.addEventListener('hide', () => {
    webChat.classList.add('hidden');
  });

  // Clear webchat availability messages and hide button
  const clearWebchatAvailabilityMessages = () => {
    if (openHoursMessage !== null) {
      openHoursMessage.classList.add('hidden');
    }
    message.innerHTML = '';
    button.classList.add('hidden');
  };

  // Set initial state.  Should only be visible until JS downloads from webchat server.
  if (openHoursMessage === null) {
    clearWebchatAvailabilityMessages();
    message.innerHTML = 'Awaiting response from Webchat Server...';
  }

  webChat.addEventListener('metrics', function(metrics) {
    const metricsDetail = metrics.detail;
    const ccState = metricsDetail.contactCenterState;
    const ewt = metricsDetail.ewt;
    const availableAgents = metricsDetail.availableAgents;

    clearWebchatAvailabilityMessages();

    if (ccState !== 'Close') {
      if (openHoursMessage === null) {
        message.innerHTML = 'Web chat is now closed. Come back Monday to Friday 9am to 5pm. Or contact us using one of the ways below.';
      } else {
        openHoursMessage.classList.remove('hidden');
      }
    } else if (ewt < 300 && availableAgents > 0) {
      button.classList.remove('hidden');
    } else {
      message.innerHTML = 'All our webchat QMCAs are busy helping other people. Please try again later or contact us using one of the ways below.';
    }
  });

}).call(this);
