/* eslint-disable no-unused-vars  */
/* eslint-disable no-undef  */
const saveProgress = require('./save-progress');

(function (global) {
  'use strict';
  var DIVORCE = {
    // Add/remove classes on reason for divorce step to switch background color of selected reason
    SwitchReasonColor: function(){
      var $multipleChoice = $('.multiple-choice');
      $multipleChoice.find('input[type="radio"]').click(function(){
          $multipleChoice.removeClass('selected-reason-state');
          $(this).parent().addClass('selected-reason-state');
      });
    },
    saveProgress
  } ;
  global.DIVORCE = DIVORCE;
})(window);

$(document).ready(function() {
  //Call govuk toolkit constructor to use functionality show/hide content
  var showHideContent = new GOVUK.ShowHideContent();
  showHideContent.init();

  //Call divorce constructor to use functionality enable/disable button
  var enableDisableButton = new GOVUK.EnableDisableButton();
  enableDisableButton.init();
});

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
