/* eslint-disable */

(function (global) {
  var GOVUK = global.GOVUK || {}

  function ShowHideContent () {
    var self = this

    // Radio and Checkbox selectors
    var selectors = {
      namespace: 'ShowHideContent',
      radio: '[data-target] > input[type="radio"]',
      checkbox: '[data-target] > input[type="checkbox"]'
    }

    // Adds ARIA attributes to control + associated content
    function initToggledContent () {
      var $control = jQuery(this)
      var $content = getToggledContent($control)

      // Set aria-controls and defaults
      if ($content.length) {
        $control.attr('aria-controls', $content.attr('id'))
        $control.attr('aria-expanded', 'false')
        $content.attr('aria-hidden', 'true')
      }
    }

    // Return toggled content for control
    function getToggledContent ($control) {
      var id = $control.attr('aria-controls')

      // ARIA attributes aren't set before init
      if (!id) {
        id = $control.closest('[data-target]').data('target')
      }

      // Find show/hide content by id
      return jQuery('#' + id)
    }

    // Show toggled content for control
    function showToggledContent ($control, $content) {
      // Show content
      if ($content.hasClass('js-hidden')) {
        $content.removeClass('js-hidden')
        $content.attr('aria-hidden', 'false')

        // If the controlling input, update aria-expanded
        if ($control.attr('aria-controls')) {
          $control.attr('aria-expanded', 'true')
        }
      }
    }

    // Hide toggled content for control
    function hideToggledContent ($control, $content) {
      $content = $content || getToggledContent($control)

      // Hide content
      if (!$content.hasClass('js-hidden')) {
        $content.addClass('js-hidden')
        $content.attr('aria-hidden', 'true')

        // If the controlling input, update aria-expanded
        if ($control.attr('aria-controls')) {
          $control.attr('aria-expanded', 'false')
        }
      }
    }

    // Handle radio show/hide
    function handleRadioContent ($control, $content) {
      // All radios in this group which control content
      var selector = selectors.radio + '[name="' + $control.attr('name') + '"][aria-controls]'
      var $form = $control.closest('form')
      var $radios = $form.length ? $form.find(selector) : jQuery(selector)

      // Hide content for radios in group
      $radios.each(function () {
        hideToggledContent(jQuery(this))
      })

      // Select content for this control
      if ($control.is('[aria-controls]')) {
        showToggledContent($control, $content)
      }
    }

    // Handle checkbox show/hide
    function handleCheckboxContent ($control, $content) {
      // Show checkbox content
      if ($control.is(':checked')) {
        showToggledContent($control, $content)
      } else { // Hide checkbox content
        hideToggledContent($control, $content)
      }
    }

    // Set up event handlers etc
    function init ($container, elementSelector, eventSelectors, handler) {
      $container = $container || jQuery(document.body)

      // Handle control clicks
      function deferred () {
        var $control = jQuery(this)
        handler($control, getToggledContent($control))
      }

      // Prepare ARIA attributes
      var $controls = jQuery(elementSelector)
      $controls.each(initToggledContent)

      // Handle events
      jQuery.each(eventSelectors, function (idx, eventSelector) {
        $container.on('click.' + selectors.namespace, eventSelector, deferred)
      })

      // Any already :checked on init?
      if ($controls.is(':checked')) {
        $controls.filter(':checked').each(deferred)
      }
    }

    // Get event selectors for all radio groups
    function getEventSelectorsForRadioGroups () {
      var radioGroups = []

      // Build an array of radio group selectors
      return jQuery(selectors.radio).map(function () {
        var groupName = jQuery(this).attr('name')

        if (jQuery.inArray(groupName, radioGroups) === -1) {
          radioGroups.push(groupName)
          return 'input[type="radio"][name="' + jQuery(this).attr('name') + '"]'
        }
        return null
      })
    }

    // Set up radio show/hide content for container
    self.showHideRadioToggledContent = function ($container) {
      init($container, selectors.radio, getEventSelectorsForRadioGroups(), handleRadioContent)
    }

    // Set up checkbox show/hide content for container
    self.showHideCheckboxToggledContent = function ($container) {
      init($container, selectors.checkbox, [selectors.checkbox], handleCheckboxContent)
    }

    // Remove event handlers
    self.destroy = function ($container) {
      $container = $container || jQuery(document.body)
      $container.off('.' + selectors.namespace)
    }
  }

  ShowHideContent.prototype.init = function ($container) {
    this.showHideRadioToggledContent($container)
    this.showHideCheckboxToggledContent($container)
  }

  GOVUK.ShowHideContent = ShowHideContent
  global.GOVUK = GOVUK
})(window);