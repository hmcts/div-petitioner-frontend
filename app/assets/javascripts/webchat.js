(function() {

  const button = document.querySelector('.chat-button');
  const webChat = document.querySelector('web-chat');

  button.addEventListener('click', function () {
    webChat.classList.remove('hidden');
  });

  /**
   * When a user clicks the 'Hide' button on the chat client,
   * an event is dispatched on the web-chat component.
   * To listen for this event, we use the addEventListener DOM API
   * and register a callback.
   */
  webChat.addEventListener('hide', function () {
    webChat.classList.add('hidden');
  });

  webChat.addEventListener('metrics', function (metrics) {
    const metricsDetail = metrics.detail;
    const ewt = metricsDetail.ewt;
    //const ccState = metricsDetail.contactCenterState;
    const ccState = 'Open';
    const availableAgents = metricsDetail.availableAgents;
    if (ccState === 'Open') {
      message.innerHTML = `Retrieved metrics: EWT = ${ewt}, available agents = ${availableAgents}`;
    } else {
      button.replaceWith('Retrieved metrics: EWT = ' + ewt + ', available agents = ' + availableAgents + ', Contact Center State = ' + ccState);
    }
  });

  if(isWebChatHidden && !webChat.classList.contains('hidden')){
    webChat.classList.add('hidden');
  }else if(!isWebChatHidden && webChat.classList.contains('hidden')){
    webChat.classList.remove('hidden');
  }

}).call(this);
