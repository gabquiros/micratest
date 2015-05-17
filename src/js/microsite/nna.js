(function($) {
	
	/**
		@namespace contains all code written for NNA sites.
	*/
	NNA = {
		/**
			@namespace Holds all path related constants.
		*/
		PATHS: {},
		/**
			@namespace Holds all global constants.
		*/
		GLOBALS: {},
		/**
			@namespace Holds all pubsub topic constants.
		*/
		TC: {},
		/**
			@namespace Holds all browser detection properties.
		*/
		BROWSER: {},
		/**
			@namespace Holds all Component subclasses.
		*/
		Components: {},
		/**
			@namespace Holds all PageControllers that subclass from PageController.
		*/
		PageControllers: {}
	};
	
	/**
		Base path. eg. 'http://www.nissanusa.com'
		@constant
	*/
	NNA.PATHS.BASE = 'http://' + window.location.host;
	/**
		Context. eg. '/altima'
		@constant
	*/
	NNA.PATHS.CONTEXT = ''; // default is root, can be set via 'contextPath' query parameter
	/**
		Media root. eg. '/vlp-assets/media'
		@constant
	*/
	NNA.PATHS.MEDIA_ROOT = '/vlp-assets/media'; // default is vlp-assets, can be overridden via 'mediaRootPath' query parameter
	
	// global configuration
	/**
		ISO 639-1 Language Code. eg. 'en'
		@constant
	*/
	NNA.GLOBALS.LANG_CODE = $('html').attr('lang') || 'en'; // defaulting to 'en' if lang isn't available
	/**
		Facebook Application ID
		@constant
	*/
	NNA.GLOBALS.FBAPPID = 316884741683725;
	/**
		Threesixty modal path. Does not include context.
		@constant
	*/
	NNA.GLOBALS.THREESIXTY_MODAL_PATH = '/modals/threesixty.html';
	/**
		Handraiser modal path. Does not include context.
		@constant
	*/
	NNA.GLOBALS.HANDRAISER_MODAL_PATH = '/modals/handraiser.html';
	/**
		Offer Details modal path. Does not include context.
		@constant
	*/
	NNA.GLOBALS.OFFERDETAILS_MODAL_PATH = '/modals/offerdetails.html';
	
	// topic constants(TC) for pubsub
	/**
		CRM track event topic.
		@constant
	*/
	NNA.TC.CRM_TRACK_EVENT = '/nna/trackEvent';
	/**
		Social Buttons reinitialize topic. 
		@constant
	*/
	NNA.TC.REINITIALIZE_SOCIAL_BUTTONS = '/nna/socialButtons/reinitialize';
	
	/**
		If detected as mobile safari on iPhone 
		@constant {Boolean}
	*/
	NNA.BROWSER.isIphone = (navigator.userAgent.match(/iPhone/i) != null || navigator.userAgent.match(/iPod/i) != null);
	/**
		If detected as mobile safari on iPad 
		@constant
	*/
	NNA.BROWSER.isIpad =  navigator.userAgent.match(/iPad/i) != null;
	/**
		If detected as a supported mobile device using Modernizr's media query functionality. 
		@constant
		@see The <a href="http://modernizr.com/docs/#mq">Modernizr Docs</a>
	*/
	NNA.BROWSER.isSupportedMobile = function() { return Modernizr.mq('only screen and (min-device-width: 320px) and (max-device-width: 480px)'); }
	
	/** 
		Holds useful functions used throughout the framework. All methods are static.
		@author Philip Musser
		@version 1.0
		@namespace Holds all static utility functions used within framework.
	*/
	NNA.Utils = {
		
		/**
			Safely grabs a property using a path
			@param {String} path the path, in JSON-compatible dot format: eg. NNA.messages.ajaxMessages.errors.ajax404
			@returns {String} retrieved property if found, otherwise empty string.
		 */
		getSafeProperty: function(path){
			
			var keys      = path.split(".");
			var length    = keys.length;
			var parentObj = window;
			var prop      = "";
			
			for(var i=0; i<length; i++){
				var key = keys[i];
				if(key in parentObj){
					//since it's the last key, this is where the prop will come from
					if(i == length-1){
						prop = parentObj[key];
					}
					//use prop as the parent object until we reach the last prop
					else{
						parentObj = parentObj[key];
					}
				}else{ break; }
			}
			return prop;
		},
		
		/**
			Preload a set of images based on an array of image paths. Utilizes <a href="http://api.jquery.com/category/deferred-object/">jQuery's Deferred Object</a>
			@param {String[]} images an array of image paths as strings.
			@returns {Promise} The deferred Object's promise for the preloader.
		 */
		preloadImages: function(images){
			var deferred = $.Deferred();
			
			if(images.length > 0) {
				var imagesLoaded = 0;
				
				$.each(images, function(index, item){
					var img = new Image();
					
					$(img).load(function(){
						imagesLoaded++;
						images[index] = this;
						if(imagesLoaded >= images.length) deferred.resolve(images);
						else deferred.notify(imagesLoaded / images.length);
					}).error(function(){
						deferred.reject(this.src);
					})[0].src = item;
				});
			}else{
				deferred.resolve();
			}
			
			return deferred.promise();
		},

		/**
			Executing a function by name
			@see The <a href="http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string">Related Stackoverflow question</a>
			@param {String} functionName The name of the function
			@param {String} context The context of were the function exists. Typically begins with the namespace.
			@param {*} [arguments] variables that get passed into the function to be called. 
			@returns The return value of the found function.
		 */
		executeFunctionByName: function(functionName, context /*, args */){
			var args = Array.prototype.slice.call(arguments).splice(2);
			var namespaces = functionName.split(".");
			var func = namespaces.pop();
			for(var i = 0; i < namespaces.length; i++){
				context = context[namespaces[i]];
			}
			return context[func].apply(this, args);
		},
		/** Prevent text selection when clicking an DOM element rapidly.
			@param {jQuery} container jQuery-wrapped DOM element for which to prevent text selection
		 */
		preventSelection: function(container){
			if (typeof container !== undefined) {
				$(container).css('MozUserSelect', 'none').bind('selectstart', function(e) { e.preventDefault(); });
			}
		},
		/** Set cookie helper.
			@param {String} name The name of the cookie
			@param {String} value The value of the cookie
			@param {Object} [opts] Options for setting the cookie
				@param {Number} [opts.expiryDays] The number of days before the cookie expires, or 0 to expire at end of session. Default is 365 days.
				@param {String} [opts.path] The path the cookie should be written to. Default is NNA.PATHS.CONTEXT
		 */
		setCookie: function(name, value, opts) {
			
			var cookieStr = name + '=' + escape(value);
			
			var options = {
				expiryDays: 365,
				path: NNA.PATHS.CONTEXT
			};
			$.extend(true, options, opts);
			
			if(options.expiryDays != 0) {
				
				var date = new Date();
				
				date.setDate(date.getDate() + options.expiryDays);
				cookieStr += '; expires=' + date.toGMTString();
			}
			
			document.cookie = cookieStr + '; path=' + options.path;
		},
		
		/** Get cookie helper.
			@param {String} name the name of the cookie to look up
			@returns {String|null} The value of the cookie, or null if not found
		 */
		getCookie: function(name) {
			
			var results = null;

			results = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
			return results ? unescape(results[2]) : null;
		},
		
		/** Delete cookie helper.
			@param {String} name the name of the cookie to delete
		 */
		deleteCookie: function(name) {
			
			this.setCookie(name, '', {expiryDays: -1});
		},
		
		/** Retrieve the value of parameter from window.location helper.
			@param {String} name the parameter to retrieve
			@returns {String|null} The value of the parameter, or null if not found
			@see NNA.Utils.getParam
		 */
		getParam: function(name){
			return NNA.Utils.getParamFromString(window.location.href, name);
		},
		
		/** get a parameter from a String.
			@param {String} aString the string to retrieve from
			@param {String} name the name of the parameter to look for
			@returns {String|null} The value of the parameter, or null if not found
		 */
		getParamFromString: function(aString, name){
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( aString );
			if(results == null) return "";
			else return results[1];
		},
		
		/** converts hex color to rgb
			@param {String} hex the hex value as a String (eg. #000000)
			@returns {Object} Object with r,g and b properties representing each component of the converted color, or null if not a valid hex value
		 */
		hexToRgb: function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
				rgb: parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16)
			} : null;
		},
		
		/** Get a random number between a min and max range. 
			@param {Number} minVal minimum value for the generated number
			@param {Number} maxVal maximum value for the generated number
			@param {Number} [floatVal] how many decimal points the generated number should have 
			@returns {Number|String} the generated random number
		 */
		getRandomNumFromMinMax : function(minVal, maxVal, floatVal){
		  var randVal = minVal+(Math.random()*(maxVal-minVal));
		  return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
		},
		
		/** Get a random number between up to a max range. 
			@param {Number} maxVal maximum value for the generated number
			@param {Number} [floatVal] how many decimal points the generated number should have 
			@returns {Number|String} the generated random number
		 */
		getRandomNumToMax : function(maxVal, floatVal){
		   var randVal = Math.random()*maxVal;
		   return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
		},

		/** Get page tracking information based on body data property and merge with passed in data.
			@param {Object} [obj] crm properties to merge
			@returns {Object} merged properties Object
		 */
		getTrackingInfo : function(obj){
			//TODO make crmObj more agnostic
			var crmObj = $('body').data('crm');
			var objTmp = {};
			//global load event tracking: merges Section information
			if (typeof(obj) !== 'undefined' && typeof(obj) === 'object'){
				if (obj.length !== undefined) { //see if obj is an array
					if(typeof(crmObj) !== 'undefined' && typeof(obj) !== 'undefined'){ //if there is a crm data object on the page
						for (var i=0; i<obj.length;i++){
							$.extend(true, objTmp, obj[i]);
						}
						$.extend(true, objTmp, crmObj.param);
						return  objTmp;
					} else if(typeof(crmObj) === 'undefined' && typeof(obj) !== 'undefined'){ //if there is NO crm data object on the page, use it for merging objects
						for (var i=0; i<obj.length;i++){
							$.extend(true, objTmp, obj[i]);
						}
						return  objTmp;
					}
				} else {//it is a simple object
					if(typeof(crmObj) !== 'undefined' && typeof(obj) !== 'undefined'){
						$.extend(true, objTmp, obj, crmObj.param);
						return  objTmp;
					} else {
						return  crmObj.param;
					}
				 }
			} else if (typeof(obj) !== 'undefined' && typeof(obj) !== 'object'){
				throw 'NAME parameter must be an OBJECT: {key: value} or an ARRAY of OBJECTS: [{key: value},{key: value}]';
			} else if (typeof(crmObj) !== 'undefined' && typeof(obj) === 'undefined'){
				return  crmObj.param;
			}
		}
	};
	
	// bootstrap
	// config parameters via query string. See http://mangstacular.blogspot.ca/2011/12/javascript-script-with-query-string.html
	var scriptElement = (function deriveScriptElement() {
		var id = 'bootstrap_dummy_script';
		document.write('<script id="' + id + '"></script>');
 
		var dummyScript = document.getElementById(id);
		var element = dummyScript.previousSibling;
 
		dummyScript.parentNode.removeChild(dummyScript);
		return element;
	}());
	
	// check if contextPath or mediaRootPath is available
	if(NNA.Utils.getParamFromString(scriptElement.src, 'contextPath')) NNA.PATHS.CONTEXT = decodeURIComponent(NNA.Utils.getParamFromString(scriptElement.src, 'contextPath'));
	if(NNA.Utils.getParamFromString(scriptElement.src, 'mediaRootPath')) NNA.PATHS.MEDIA_ROOT = decodeURIComponent(NNA.Utils.getParamFromString(scriptElement.src, 'mediaRootPath'));
	
	// check for 'jsDebug' query parameter first and set corresponding cookie.
	if(NNA.Utils.getParam('jsDebug')) NNA.Utils.setCookie('jsDebug', NNA.Utils.getParam('jsDebug'), {expiryDays: 0});
	
	// set debug level based on cookie value. Valid values are 0-5, see http://benalman.com/projects/javascript-debug-console-log/ 
	if(NNA.Utils.getCookie('jsDebug')) debug.setLevel(parseInt(NNA.Utils.getCookie('jsDebug')));
	else debug.setLevel(0);
})(jQuery);