(function(NNA, $){
	/**
		Generic Vehicle Landing Page (VLP) Page Controller. Includes all the features of Page Controller, plus additional functionality required on every VLP page.
		@class Vehicle Landing Page Controller
		@augments NNA.PageController
		@param {object} [options] Object containing configurable options for the page controller instance
	*/
	NNA.VLPageController = NNA.PageController.extend({
		// object initializer
		init: function(options){
			// configurable options
			var _tmpOptions = {
				pageScrollAnimationDuration: 500,
				threesixtyDeeplinkParameter: 'threesixty',
				requiresScrollIndicator: true
			};
			$.extend(true, _tmpOptions, options);
			
			this._super(_tmpOptions);
			
			//context nav
			this.contextNav;
			this.initContextNav();
			
			// init component mananger
			this.componentManager = new NNA.ComponentManager();
			
			// init scroll indicator
			this.scrollIndicator;
			if(this.options.requiresScrollIndicator) this.initScrollIndicator();
			
			// check for threesixty deeplink
			this.checkThreesixtyDeeplink();
			
			// portable gallery
			this.galleryAnywhereComponent;
			this.galleryAnywhereInitializing = false;
			
			debug.log('NNA.VLPageController: initialized');
		},
		
		initContextNav: function(){
			
			this.contextNav = new NNA.ContextNav($("section"));
		},
		
		// sets up a pub/sub for opening modal windows
		initModalSubscriptions: function(){
			this._super();
			
			var self = this;
			
			$.subscribe('/nna/open360Modal', function(e, view, startingIndex, startingFrame) {
				debug.log('Event: /nna/open360Modal');
				self.open360Modal(view, startingIndex, startingFrame);
			});
			
			$.subscribe('/nna/openOfferDetails', function(e, modalContents, openCallback, closeCallback) {
				debug.log('Event: /nna/openOfferDetails');
				self.openOfferDetails();
			});
			
			$.subscribe('/nna/openPortableGallery', function(e, index, galleryOptions) {
				debug.log('Event: /nna/openPortableGallery');
				
				if(!self.galleryAnywhereComponent && !self.galleryAnywhereInitializing) {
					
					self.galleryAnywhereInitializing = true;
					
					$.ajax({
						url: NNA.PATHS.CONTEXT + '/photos-videos/',
						dataFilter: function(data, type) {
					
							var dummy = $('<div></div>');
							var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi; // strip out scripts
							var rimgsrc = /<img [^>]*src=".*?[^\]"[^>]*\/*>/ig; // strip out img tags, we don't use them
					
							dummy.append(data.replace(rscript, '').replace(rimgsrc, ''));
					
							return dummy.find('#altima-photos-videos');
						}
					}).done(function(html){
					
						// cook component data attribute
						var componentData = html.data('component');
						var options = {
							respondsToDeeplinks: false,
							onReadyCallback: function() {
								
								self.galleryAnywhereComponent = html.data('componentObject');
								self.galleryAnywhereComponent.openModal(index, galleryOptions.hideControls, galleryOptions.navigationMethod);
							}
						};
						$.extend(true, componentData['options'], options);
						
						self.componentManager.loadComponentFromElement(html);
					});
				} else if(self.galleryAnywhereComponent) {
					
					self.galleryAnywhereComponent.openModal(index, galleryOptions.hideControls, galleryOptions.navigationMethod);
				}
			});
		},
		
		initScrollIndicator: function(){
			
			this.scrollIndicator = new NNA.ScrollIndicator();
		},
		
		// attach event handlers
		attach: function(){
			this._super();
			
			var self = this;
			
			// show 360 modals
			$('body').delegate('.open-360-modal', 'click touchend', function(e){
				e.preventDefault();
				var view = $(this).data('view');
				var index = ($(this).data('index') != undefined) ? $(this).data('index') : 0;
				var frame = ($(this).data('frame') != undefined) ? $(this).data('frame') : 0;
				
				$.publish('/nna/open360Modal', [view, index, frame]);
				
			});
			
			// scroll to top of page
			$('body').delegate('.scroll-top', 'click touchend', function(e){
				e.preventDefault();
				$.publish('/nna/scrollTo', [0]);
			});
			
			// share bug events
			$('body').delegate('.share-bug li', 'click', function(e) {
				
				// Twitter API handles links automatically, just deal with facebook
				if($(this).hasClass('fb')) $.publish(NNA.TC.CRM_TRACK_EVENT, [57, {destination: 'Facebook'}]);
			});
			
			// portable gallery modal
			$('body').delegate('.portable-gallery', 'click', function(e) {
				e.preventDefault();
				
				// get index from hash in href
				var index;
				var galleryItem = $(this).attr('href').match(/gallery-item-(\w+)/i);
				
				if(galleryItem && galleryItem.length > 1) {
					
					index = galleryItem[1];
				}
				
				$.publish('/nna/openPortableGallery', [index, {navigationMethod: $(this).data('navigation-method'), hideControls: true}]);
			});
			
			$("body").delegate("a.offer-details-launch", "click", function(e){
				e.preventDefault();
				$.publish('/nna/openOfferDetails');
			});
		},
		
		// opens a 360 modal window
		open360Modal: function(startingView, startingIndex, startingFrame){
			var self = this;
			
			// show modals loading indicator while fetching html
			this.modal.showLoading();
			
			// ajax request to get html for modal window
			$.ajax({
				url: NNA.PATHS.CONTEXT + NNA.GLOBALS.THREESIXTY_MODAL_PATH
			}).done(function(html){
				// pull modal window html from response
				var modalTemplate = $(html).find('#modal-360');
				
				// show the content in modal window
				self.modal.open(modalTemplate, function(){
					// init the modal window script just after the modal is shown
					new NNA.Modal360(modalTemplate, {
						"startingView": startingView ? startingView : 'exterior',
						"startingIndex": startingIndex ? startingIndex : 0,
						"startingFrame": startingFrame ? startingFrame : 0
					});
				});
			}).fail(function(){
				self.modal.close();
				debug.log('NNA.PageController: error fetching threesixty html');
			});
		},
		checkThreesixtyDeeplink: function(){
			// get param for threesixty
			var paramValue = NNA.Utils.getParam(this.options.threesixtyDeeplinkParameter);
			
			// if param was set
			if(paramValue !== ''){
				var split = paramValue.split('-');
				var view = split[0];
				var index = parseInt(split[1]);
				this.open360Modal(view, index);
			}
		},
		openOfferDetails : function(){
			var self = this;
			
			// show modals loading indicator while fetching html
			this.modal.showLoading();
			
			// ajax request to get html for modal window
			$.ajax({
				url: NNA.PATHS.CONTEXT + NNA.GLOBALS.OFFERDETAILS_MODAL_PATH
			}).done(function(html){
				// pull modal window html from response
				var modalTemplate = $(html).find('#offer-details');
				
				// show the content in modal window
				self.modal.open(modalTemplate, function(){
					
				});
			}).fail(function(){
				self.modal.close();
				debug.log('NNA.PageController: error fetching ' + NNA.PATHS.CONTEXT + NNA.GLOBALS.THREESIXTY_MODAL_PATH);
			});
		}
	});
	
})(NNA, jQuery);
