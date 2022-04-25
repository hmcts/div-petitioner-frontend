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

  // Show webchat Opening Hours Message
  const displayOpenHoursMessage = () => {
    openHoursMessage.childNodes.forEach(child => {
      const clone = child.cloneNode(true);
      message.append(clone);
    });
  };

  // Clear webchat availability messages
  const clearWebchatAvailabilityMessages = () => {
    while (message.firstChild) {
      message.removeChild(message.firstChild);
    }
    message.innerHTML = '';
  };

  // Set initial state.  Should only be visible until JS downloads from webchat server.
  const awaitingWebchat = () => {
    clearWebchatAvailabilityMessages();
    message.innerHTML = 'Awaiting response from Webchat Server...';
    button.classList.add('hidden');
  };
  awaitingWebchat();

  webChat.addEventListener('metrics', function(metrics) {
    const metricsDetail = metrics.detail;
    const ccState = metricsDetail.contactCenterState;
    const ewt = metricsDetail.ewt;
    const availableAgents = metricsDetail.availableAgents;

    if (ccState !== 'Open') {
      clearWebchatAvailabilityMessages();
      displayOpenHoursMessage();
      button.classList.add('hidden');
    } else if (ewt < 300 && availableAgents > 0) {
      clearWebchatAvailabilityMessages();
      button.classList.remove('hidden');
    } else {
      clearWebchatAvailabilityMessages();
      message.innerHTML = 'All our webchat QMCAs are busy helping other people. Please try again later or contact us using one of the ways below.';
      button.classList.add('hidden');
    }
  });

}).call(this);
