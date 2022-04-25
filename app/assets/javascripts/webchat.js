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

  button.addEventListener('click', () => {
    windowOpener('/avaya-webchat', 'Web Chat - Divorce', 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=350,height=550,left=100,top=100');
  });

  webChat.addEventListener('hide', () => {
    webChat.classList.add('hidden');
  });

  // Duplicate child nodes from one element to another
  const copyChildNodes = (srcEl, destEl) => {
    srcEl.childNodes.forEach(child => {
      const clone = child.cloneNode(true);
      destEl.append(clone);
    });
  };

  // Remove child nodes from an element
  const removeChildNodes = parentEl => {
    while (parentEl.firstChild) {
      parentEl.removeChild(parentEl.firstChild);
    }
  };

  // Set initial state.  Should only be visible until JS downloads from webchat server.
  const awaitingWebchat = () => {
    removeChildNodes(message);
    message.innerHTML = 'Awaiting response from Webchat Server...';
    button.classList.add('hidden');
  };
  awaitingWebchat();

  webChat.addEventListener('metrics', function(metrics) {
    const metricsDetail = metrics.detail;
    const ccState = metricsDetail.contactCenterState;
    const ewt = metricsDetail.ewt;
    const availableAgents = metricsDetail.availableAgents;
    const openHoursMessage = document.querySelector('#webchatHours');

    if (ccState !== 'Open') {
      copyChildNodes(openHoursMessage, message);
      button.classList.add('hidden');
    } else if (ewt < 300 && availableAgents > 0) {
      removeChildNodes(message);
      message.innerHTML = '';
      button.classList.remove('hidden');
    } else {
      removeChildNodes(message);
      message.innerHTML = 'All our webchat QMCAs are busy helping other people. Please try again later or contact us using one of the ways below.';
      button.classList.add('hidden');
    }
  });

}).call(this);
