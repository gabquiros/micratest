(function(NNA, $){
	/** 
		Basic PageController all other PageControllers extend from.
		@class Basic page controller
		@param {object} [options] Object containing configurable options for the page controller instance
	*/
	NNA.PageController = Class.extend({
		// object initializer
		init: function(options){
			// configurable options
			this.options = {
				crmSocial : {
					authenticateTrackerID: null,
					confirmTrackerID: null,
					shareButtonTrackerID: null
				},
				handraiserErrorMsgs : {}
			};
			$.extend(true, this.options, options);
			
			// class attributes
			
			// init crm tracker
			this.tracker = new NNA.CRMTracker({
				queuedMode: true,
				queueInterval: 750
			});
			
			// init modal window
			this.modal = new NNA.Modal({
				centerOnScroll: Modernizr.touch ? false : true,
				transitionDuration: $.browser.msie && parseInt($.browser.version) <= 8 ? 0 : 500
			});
			
			// global nav is initialized via AppGateway. Now we just store the DOM element
			this.navElement = $('#nissan_global_navigation');
			
			// global footer is initialized via AppGateway. Now we just store the DOM element
			this.footer = $('#nissan_global_footer');
			
			// init disclaimers
			this.disclaimers = new NNA.Disclaimers($("body"));
			
			// init subscriptions
			this.initDeeplinkSubscriptions();
			this.initModalSubscriptions();
			this.initScrollSubscriptions();
			
			// attach event handlers
			this.attach();
			
			// helps with deeplinking to content within pages
			this.replaceHashLinks();
			
			//initialize page load tracking
			this.initPageLoadTracking();
			
			// social buttons
			this.socialButtons = new NNA.SocialButtons($("footer#footer-section"), {
				authenticateTrackerID : this.options.crmSocial.authenticateTrackerID,
				confirmTrackerID      : this.options.crmSocial.confirmTrackerID,
				shareButtonTrackerID  : this.options.crmSocial.shareButtonTrackerID,
				fbAppId               : NNA.GLOBALS.FBAPPID
			});
			
			if(!NNA.BROWSER.isSupportedMobile()) {
				
				if(NNA.BROWSER.isIpad) $("head").append('<meta name="viewport" content="width=1024,user-scalable=no">');
				else $("head").append('<meta name="viewport" content="width=1024, maximum-scale=1">');
			}
			
			debug.log('NNA.PageController: initialized');
		},
		
		initPageLoadTracking: function(){
			$.publish(NNA.TC.CRM_TRACK_EVENT, [1]);
		},
		
		initDeeplinkSubscriptions: function() {
			var self = this;
			
			$.subscribe('/nna/hashChange', function(e, fragment) {
				
				// TODO -- this should use parameters via BBQ
				// checks url for a hash and scrolls the page to the proper spot
				if(fragment.substring(0, 1) === '_') {
					
					debug.log('Event: /nna/hashChange: fragment: ' + fragment);
					
					fragment = fragment.substring(1);
					
					self.scrollTo(fragment, true, 0);
				}
			});
		},
		
		// sets up a pub/sub for opening modal windows
		initModalSubscriptions: function(){
			var self = this;
			
			$.subscribe('/nna/openHandraiser', function(e, modalContents, openCallback, closeCallback) {
				debug.log('Event: /nna/openHandraiser');
				self.openHandraiser();
			});
		},
		
		// sets up pub/sub for scrolling page
		initScrollSubscriptions: function(){
			var self = this;
			
			$.subscribe('/nna/scrollTo', function(e, where, navOffset, duration) {
				debug.log('Event: /nna/scrollTo');
				self.scrollTo(where, navOffset, duration);
			});
		},
		
		// attach event handlers
		attach: function(){
			var self = this;
			
			// deeplink
			$(window).bind('hashchange', function(e) {
				
				// publish hash changed topic
				$.publish('/nna/hashChange', [$.param.fragment()]);
			}).trigger('hashchange');
			
			// show handraiser modals
			$('body').delegate('.open-handraiser-modal', 'click touchend', function(e){
				e.preventDefault();
				$.publish('/nna/openHandraiser');
				return false;
			});
			
		},
		
		// replaces # in anchors with #_ so that we can scroll the page on our own
		replaceHashLinks: function(){
			// might have to make this smarter if it causes problems
			$('a[href*=#]').not('[href^=#], [href*="#gallery-item"], .disclaimer').each(function(){
				$(this).attr('href', $(this).attr('href').replace('#', '#_'));
			});
		},
		
		// animated scroll to a element or position on the page
		scrollTo: function(where, navOffset, duration){
			var deferred = $.Deferred();
			
			// duration can be set or the default is used
			duration = duration !== undefined ? duration : this.options.pageScrollAnimationDuration;
			
			// where can be a pixel position, element id or a element
			var position;
			if(typeof where === 'number'){
				position = where;
			}else if(typeof where === 'string'){
				var element = $('#' + where);
				if(element.length > 0) position = $('#' + where).offset().top;
				else return;
			}else{
				position = $(where).offset().top;
			}
			
			// offset the position to account for the height of the floating nav
			if(navOffset === true) position -= this.navElement.height();
			
			// find the correct element for scrolling the page
			if($.browser.webkit) var scrollElement = $('body');
			else var scrollElement = $('html');
			
			// cancel previous scroll animations
			this.cancelScrollTo();
			
			// scroll to position
			scrollElement.animate({ scrollTop: position }, duration, function(){
				$.publish("/nna/scrollToComplete");
				deferred.resolve;
			});
			
			return deferred.promise();
		},
		
		// cancel any page scroll animations that may be active
		cancelScrollTo: function(){
			// find the correct element for scrolling the page
			if($.browser.webkit) var scrollElement = $('body');
			else var scrollElement = $('html');
			
			// stop scroll animation
			scrollElement.stop(true, false);
		},
		
		openHandraiser: function(){
			var self = this;
			
			// show modals loading indicator while fetching html
			this.modal.showLoading();
			
			// ajax request to get html for modal window
			$.ajax({
				url: NNA.PATHS.CONTEXT + NNA.GLOBALS.HANDRAISER_MODAL_PATH
			}).done(function(html){
				// pull modal window html from response
				var modalTemplate = $(html).find('#handraiser');
				
				// show the content in modal window
				self.modal.open(modalTemplate, function(){
					// init the modal window script just after the modal is shown
					new NNA.HandraiserModal(modalTemplate, { handraiserErrorMsgs : self.options.handraiserErrorMsgs} );
					
				});
			}).fail(function(){
				self.modal.close();
				debug.log('NNA.PageController: error fetching ' + NNA.PATHS.CONTEXT + NNA.GLOBALS.THREESIXTY_MODAL_PATH);
			});
		}
	});
	
})(NNA, jQuery);