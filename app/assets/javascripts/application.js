/* eslint-disable no-unused-vars  */
/* eslint-disable no-undef  */
const saveProgress = require('./save-progress');
const govukFrontend = require('govuk-frontend/all');

import './showHideContent';

window.jQuery = $;

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ['\'self\''],
    fontSrc: [
      '\'self\' data:',
      'fonts.gstatic.com'
    ],
    scriptSrc: [
      '\'self\'',
      'www.google-analytics.com',
      'www.googletagmanager.com',
      `'nonce-${nonce}'`
    ],
    connectSrc: [
      '\'self\'',
      'www.google-analytics.com'
    ],
    mediaSrc: ['\'self\''],
    imgSrc: [
      '\'self\'',
      '\'self\' data:',
      'www.google-analytics.com',
      'stats.g.doubleclick.net',
      'ssl.gstatic.com',
      'www.gstatic.com'
    ],
    styleSrc: [
      '\'self\'',
      '\'unsafe-inline\'',
      'tagmanager.google.com',
      'fonts.googleapis.com'
    ]
  }
}));

(function (global) {
  'use strict';
  var DIVORCE = {
    // Add/remove classes on reason for divorce step to switch background color of selected reason
    SwitchReasonColor: function(){
      var $multipleChoice = $('.govuk-radios__item');
      $multipleChoice.find('input[type="radio"]').click(function(){
        $multipleChoice.removeClass('selected-reason-state');
        $(this).parent().addClass('selected-reason-state');
      });
    },
    saveProgress
  } ;
  global.DIVORCE = DIVORCE;

  $(document).ready(function() {
    const showHideContent = new global.GOVUK.ShowHideContent();
    showHideContent.init();

    var enableDisableButton = new GOVUK.EnableDisableButton();
    enableDisableButton.init();

    govukFrontend.initAll();
  });

})(window);

function dateSlice(date)
{
  if (date.value.length > date.maxLength)
    date.value = date.value.slice(0, date.maxLength);
}


(function (global) {
  'use strict';
  var trackExpandableSection = {
    event: function(label) {
      ga('send', 'event', {
        eventCategory: 'Expandable section',
        eventAction: 'Expandable section clicked',
        eventLabel: label
      });
    }
  } ;
  global.DIVORCE = global.DIVORCE || {};
  global.DIVORCE.trackExpandableSection = trackExpandableSection;
})(window);

$(document).ready(function() {
  $('details > summary span.summary').click(function(e){
    DIVORCE.trackExpandableSection.event($(this).text());
  });
});
