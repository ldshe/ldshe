//Extend jquery
const resizeText = function(options) {
    let settings = $.extend({ maxfont: 40, minfont: 4 }, options);
    let style = $('<style>').html('.nodelays ' +
    '{ ' +
        '-moz-transition: none !important; ' +
        '-webkit-transition: none !important;' +
        '-o-transition: none !important; ' +
        'transition: none !important;' +
    '}');

    function shrink(el, fontsize, minfontsize) {
        if (fontsize < minfontsize) return;
        el.style.fontSize = fontsize + 'px';
        if (el.scrollHeight > el.offsetHeight) shrink(el, fontsize - 1, minfontsize);
    }

    $('head').append(style);

    $(this).each(function(index, el) {
        let element = $(el);
        element.addClass('nodelays');
        shrink(el, settings.maxfont, settings.minfont);
        element.removeClass('nodelays');
    });

    style.remove();
};

const clearSelection = function() {
    if(window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if(document.selection) {
        document.selection.empty();
    }
}

$.extend($.fn, {
    resizeText,
    clearSelection,
});

//Extend selectize
const Selectize = require('selectize');
Selectize.define("stop_backspace_delete", function (options) {
    var self = this;
    this.deleteSelection = (function() {
        var original = self.deleteSelection;
        return function (e) {
            if (!e || (e.keyCode !== 8 && e.keyCode !==46))
                return original.apply(self, arguments);
            return false;
        };
    })();
});
