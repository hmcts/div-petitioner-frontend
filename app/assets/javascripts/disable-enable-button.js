(function (global) {
  'use strict';

  var $ = global.jQuery;
  var GOVUK = global.GOVUK || {};

  function EnableDisableButton () {
    var self = this;

    var selectors = {
      checkbox: '[data-target-toggle-enabled] > input[type="checkbox"]'
    };

    var enableTarget = function($target){
      $target.removeAttr('disabled');
      $target.removeAttr('aria-disabled');
      $target.removeClass('govuk-button--disabled');
    };

    var disableTarget = function($target){
      $target.attr('disabled', true);
      $target.attr('aria-disabled', true);
      $target.addClass('govuk-button--disabled');
    };

    var getTarget = function($input){
      var targetId = $input.parent().data('target-toggle-enabled');
      return $('#' + targetId);
    };

    var enableDisableTarget = function($input){
      var enabled = $input.is(':checked');
      var $target = getTarget($input);

      if(enabled){
        enableTarget($target);
      }else{
        disableTarget($target);
      }
    };

    self.bindClickEvents = function () {

      $(selectors.checkbox).change(function(){
        enableDisableTarget($(this));
      });

      $('input.button[type="submit"]').click(function(){
        var $el = $(this);
        setTimeout(function(){
          disableTarget($el);
        });
      });

    };

    self.setDefaults = function () {

      $(selectors.checkbox).each(function(){
        enableDisableTarget($(this));
      });

    };

  }

  EnableDisableButton.prototype.init = function () {
    this.bindClickEvents();
    this.setDefaults();
  };

  GOVUK.EnableDisableButton = EnableDisableButton;
  global.GOVUK = GOVUK;
})(window);
