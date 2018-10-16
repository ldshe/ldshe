/* ========================================================================
 * Bootstrap: scrollhspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollhspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

//Horizontal version of ScrollSpy
//Mainly changed top -> left and height -> width

+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollHSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollHSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollWidth   = 0

    this.$scrollElement.on('scroll.bs.scrollhspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollHSpy.VERSION  = '3.3.7'

  ScrollHSpy.DEFAULTS = {
    offset: 10
  }

  ScrollHSpy.prototype.getScrollWidth = function () {
    return this.$scrollElement[0].scrollWidth || Math.max(this.$body[0].scrollWidth, document.documentElement.scrollWidth)
  }

  ScrollHSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollWidth = this.getScrollWidth()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollLeft()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')

        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().left + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollHSpy.prototype.process = function () {
    var scrollLeft    = this.$scrollElement.scrollLeft() + this.options.offset
    var scrollWidth = this.getScrollWidth()
    var maxScroll    = this.options.offset + scrollWidth - this.$scrollElement.width()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollWidth != scrollWidth) {
      this.refresh()
    }

    if (scrollLeft >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollLeft < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollLeft >= offsets[i]
        && (offsets[i + 1] === undefined || scrollLeft < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollHSpy.prototype.activate = function (target) {

    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollhspy')
  }

  ScrollHSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollhspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollhspy', (data = new ScrollHSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollhspy

  $.fn.scrollhspy             = Plugin
  $.fn.scrollhspy.Constructor = ScrollHSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollhspy.noConflict = function () {
    $.fn.scrollhspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollhspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);
