/*
* Date Added: November 5, 2017
* Added By: Stephen Noble
* Descriiption: This js file allows the page of the logged in user to scroll down to the "Account section"
* */
//Allows the page to scroll down
// jQuery for page scrolling feature - requires jQuery Easing plugin
$('a.page-scroll').bind('click', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
        scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1250, 'easeInOutExpo');
    event.preventDefault();
});