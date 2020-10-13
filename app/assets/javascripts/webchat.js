(function() {

  const button = document.querySelector('.chat-button');
  const webChat = document.querySelector('web-chat');

  button.addEventListener('click', () => {
    webChat.classList.remove('hidden');
  });

  /**
   * When a user clicks the 'Hide' button on the chat client,
   * an event is dispatched on the web-chat component.
   * To listen for this event, we use the addEventListener DOM API
   * and register a callback.
   */
  webChat.addEventListener('hide', () => {
    webChat.classList.add('hidden');
  });

  if(isWebChatHidden && !webChat.classList.contains('hidden')){
    console.log('add hidden');
    webChat.classList.add('hidden');
  }else if(!isWebChatHidden && webChat.classList.contains('hidden')){
    webChat.classList.remove('hidden');
    console.log('remove hidden');
  }

}).call(this);
