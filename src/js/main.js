jQuery('document').ready(function() {

    var $ = jQuery;
    if (typeof $.fancybox === 'function') {
	    $("a.thumb").fancybox({
		'padding': 0,
		'autoScale': false,
		'transitionIn': 'none',
		'transitionOut': 'none',
		'width': 1080,
		'type': 'image',
		'arrows': true,
		prevEffect: 'none',
		nextEffect: 'none',
	    });

	    $("a.fancybox").click(function(e) {

		e.preventDefault();

		$.fancybox({
		    'maxWidth': 800,
		    'maxHeight': 600,
		    'fitToView': false,
		    'width': '80%',
		    'height': '80%',
		    'autoSize': false,
		    'closeClick': false,
		    'openEffect': 'none',
		    'closeEffect': 'none',
		    'href': this,
		    'type': 'iframe'
		});

	    });
    }

    $(function() {
	if (typeof $.jcarousel === 'function') {
		var jcarousel = $('.jcarousel').jcarousel({
		    wrap: 'both'
		});

		// Previous control
		$('.jcarousel-control-prev')
		    .on('jcarouselcontrol:active', function() {
			$(this).removeClass('inactive');
		    })
		    .on('jcarouselcontrol:inactive', function() {
			$(this).addClass('inactive');
		    })
		    .jcarouselControl({
			target: '-=3'
		    });

		// Next control
		$('.jcarousel-control-next')
		    .on('jcarouselcontrol:active', function() {
			$(this).removeClass('inactive');
		    })
		    .on('jcarouselcontrol:inactive', function() {
			$(this).addClass('inactive');
		    })
		    .jcarouselControl({
			target: '+=3'
		    });

		$('.alt .jcarousel-control-prev')
		    .jcarouselControl({
			target: '-=1'
		    });

		// Next control
		$('.alt .jcarousel-control-next')
		    .jcarouselControl({
			target: '+=1'
		    });

		$('.jcarousel').on('jcarousel:targetin', 'li', function(event, carousel) {

		});

		$('.alt .jcarousel')
		    .on('jcarousel:scrollend', function(event, carousel) {
			var currentVisibleItem = $(this).jcarousel('visible');
			var currentVisibileID = currentVisibleItem.attr('data-menu-id');
			$('.about-menu a').removeClass('on').filter('#' + currentVisibileID).addClass('on');
		    });

		$('#m-about').on('click', function(e) {
		    e.preventDefault();
		    $('.alt .jcarousel').jcarousel('scroll', 0);
		    $('.about-menu a').removeClass('on');
		    $(this).addClass('on');
		});
		$('#m-what').on('click', function(e) {
		    e.preventDefault();
		    $('.alt .jcarousel').jcarousel('scroll', 1);
		    $('.about-menu a').removeClass('on');
		    $(this).addClass('on');
		});
		$('#m-why').on('click', function(e) {
		    e.preventDefault();
		    $('.alt .jcarousel').jcarousel('scroll', 2);
		    $('.about-menu a').removeClass('on');
		    $(this).addClass('on');
		});
	}
    });

    //Detect Browser
    var get_browser = function () {
	    var N=navigator.appName, ua=navigator.userAgent, tem;
	    var M=ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i);

	    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	    M=M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];

	    if (M[0]=="MSIE"||M[0]=="Trident"){
	    	$('body').addClass('ie');
		}
	}
    
    //pageload tracking event
    if (typeof crmEvent1 === 'function') {
	crmEvent1();
    }

    //Detec Browser
    if (typeof get_browser === 'function') {
		get_browser();
    }

    //Init social hub
    if (typeof socialHub.init() === 'function') {
    	socialHub.init();
    }
});