/**
 * Created by Nguyen Duong Kim Hao on 16/12/2015.
 */

/**
 * INSPINIA - Responsive Admin Theme
 * 2.3
 *
 * Custom scripts
 */

// Move right sidebar top after scroll
$(window).scroll(function () {
	if ($(window).scrollTop() > 0) {
		$('#right-sidebar').addClass('sidebar-top');
	} else {
		$('#right-sidebar').removeClass('sidebar-top');
	}
});

// Minimalize menu when screen is less than 768px
$(window).bind("load resize", function () {
	if ($(this).width() < 769) {
		$('body').addClass('body-small')
	} else {
		$('body').removeClass('body-small')
	}
});

// Remove focus
$(".btn-nofocus").mouseup(function () {
	$(this).blur();
});