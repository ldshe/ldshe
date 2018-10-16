require('./string');

require('./jquery');

require('bootstrap-sass');

//bootstrap ext
require('lib/bootstrap/js/scrollhspy');

//polyfill for ES6 api
require('babel-polyfill');

$(window).resize(() => {
    $('.sticky-container').css('paddingTop', $('.navbar.menu').height()+'px');
});

$(() => {
    $(window).resize();

    $('.navbar-collapse a').not('.dropdown-toggle').click(() => {
        $(".navbar-collapse").collapse('hide');
        setTimeout(() => $(window).resize(), 500);
    });
});
