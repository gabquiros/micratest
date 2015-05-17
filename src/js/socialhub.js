/******************************************************************
Social Hub
******************************************************************/

var socialHub = {
	/* CONSTANTS */
	timeoutLength : 10000,

	init : function(){
		//Set Globals

		//FILTER TWITTER FEED DEPENDING ON LANGUAGE
		if (jQuery('body').hasClass('fr')) {
			// socialHub.twitterFeed = '/rest/twitter/timeline/coupemicra';
			socialHub.twitterFeed = '/fr/coupemicra.json';
		} else {
			socialHub.twitterFeed = '/en/micracup.json';
		}
		
		socialHub.facebookOAuth = 'https://graph.facebook.com/oauth/access_token?client_id=276505679100505&client_secret=e69e57587983f0a478eddb73a4faa370&grant_type=client_credentials';
		socialHub.facebookFeed  = 'https://graph.facebook.com/CoupeMicraCup/posts?';
		socialHub.fetchFeeds();
	},
	fetchFeeds : function(){
		//Fetch Social Feeds
		socialHub.proxyURL = "http://nissanca-validation.criticalmass.com/utils/mediaproxy?url=";
		socialHub.fetchTwitterData();
		socialHub.fetchfacebookData();
	},

/*-----
	TWITTER NEWS FEED
-----*/

	fetchTwitterData : function(){

/*-- ACCESS TWITTER TIMELINE FEED --*/
    	jQuery.ajax({
  			url: encodeURI(socialHub.twitterFeed),
  			dataType: 'json',
  			contentType: "text/json; charset=utf-8",
  			timeout: socialHub.timeoutLength,
  			success: function(data){
				socialHub.tweets(data);
			},
			error : function(){
				socialHub.tweetError();
			}
		});
	},
	
/*-- ACCESS TWITTER PROFILE FEED --*/
	tweets : function(data){		
		//-- BUILD HTML FROM DATA
		var	tweet = "",
			tweetFrag = document.createDocumentFragment(),
			tweetNode = [],
			tweetCol = [],
			tweetText = "",
			tweetId = "",
			tweetSlide = jQuery('');
		
		//-- Loop through tweets
		jQuery.each(data, function(i,item){
			
			//--CREATE TAB-SLIDE ITEM ON FIRST LOOP
			if (i == 0) {
				tweetSlide = jQuery('<div class="tab-slide-content twitter-slide-content"></div>');
			}

			if (i%3 == 0) {
				tweetCol = jQuery('<div class="col-50"></div>');
			}			

			//Parse tweet date for pretty display
			tweetText = socialHub.utils.parseTweetText(item.text);
			tweetId = item.id_str;

			//wrap tweet in html	
			tweet += '<div class="post">';
			tweet += '<div class="post-content"><p class="tweet-text">'+ tweetText +'</p>';
			tweet += '<ul class="twitter-icons">';
			tweet += '<li><a class="tweet-popup twitter-reply" target="_blank" href="https://twitter.com/intent/tweet?in_reply_to='+ tweetId +'">Reply</a></li>';
			tweet += '<li><a class="tweet-popup twitter-retweet" target="_blank" href="https://twitter.com/intent/retweet?tweet_id='+ tweetId +'">Retweet  </a></li>';
			tweet += '<li><a class="tweet-popup twitter-favorite" target="_blank" href="https://twitter.com/intent/favorite?tweet_id='+ tweetId +'">Favorite</a></li>';
			tweet += '</div></div>';

			tweetNode = jQuery(tweet);
			tweetNode.appendTo(tweetCol);
			tweet = "";
			tweetNode = [];

			//--APPEND COL TO SLIDE WHEN READY
 			if ((i+1)%3 == 0) { 
				tweetCol.appendTo(tweetSlide);
				tweetCol = [];
			}

			//--APPEND SLIDE TO DOCUMENT FRAGMENT WHEN READY
			if (tweetSlide.children().length == 2) {
				tweetFrag.appendChild(tweetSlide[0]);
				tweetSlide = jQuery('<div class="tab-slide-content twitter-slide-content"></div>');
			}			

		});

		//--APPEND REMAINING POSTS TO DOCUMENT FRAGMENT
		if (tweetCol.length) {  
			tweetCol.appendTo(tweetSlide);
		}

		if (tweetSlide.children().length) {
			tweetFrag.appendChild(tweetSlide[0]);		
		}
		
		//-- APPEND DOCUMENT FRAGMENT TO DOM
		socialHub.globalFeed(tweetFrag,'twitter');
	},
/*-- TWITTER FEED ERROR --*/
	tweetError : function(){
		tweetsArray = [[0, "<div class='feed'><div class='feed-preview'><a class='icon twitter' href='https://twitter.com/NissanPathfindr'></a></div><div class='hubcontent'><h4 class='wf'>@NissanPathfindr<span>Today</span></h4><p>Our Most Innovative Pathfinder Ever.</p></div></div>"]];
		//tweetsArray = [];		
	},






/*-----
	facebook PLUS
-----*/
	fetchfacebookData : function(){

/*-- ACCESS facebook TIMELINE FEED --*/
		var token;

/*-- ACCESS FACEBOOK TIMELINE FEED --*/
		jQuery.ajax({
			type: "GET",
  			url: socialHub.proxyURL+encodeURI(socialHub.facebookOAuth),
  			dataType: "text",
  			contentType: "text/plain",
			//url: socialHub.facebookOAuth,
  			success: function(data){
				
    			token = data;
	 			jQuery.ajax({
	 				type: "GET",
  					url: socialHub.proxyURL+encodeURI(socialHub.facebookFeed)+encodeURI(token),
					//url: socialHub.facebookFeed,
					//url: socialHub.facebookFeed+"&"+encodeURI(token),
  					//data : token,
  					dataType:'jsonp',
  					contentType: "text/json; charset=utf-8",
  					timeout: socialHub.timeoutLength,
  					success: function(data){
						socialHub.facebookItemArray(data);
					},
					error: function(){
						socialHub.facebookError();
					}
				});
  			}
		});
	},
	
/*-- facebook TIMELINE FEED --*/
	facebookItemArray : function(data){

		facebookPostsArray = [],
			validPostCount = 0,
			validFacebookPost = [],
			feedText = "",
			feedObjectID = "",
			feedImg = "",
			facebookFrag = document.createDocumentFragment(),
			facebookPost = "",
			facebookNode = [],
			facebookCol = [],
			facebookSlide = jQuery('');
		
		//-- FILTER VALID POSTS
		jQuery.each(data.data, function(i,item){
			if(item.message != null && item.message != "" && (item.type == 'photo' || item.type == 'video')){
				validFacebookPost[validPostCount] = item;
				validPostCount++;
			}
		});
		
		//-- BUILD HTML WITH VALID POSTS
		jQuery.each(validFacebookPost, function(i,item){

			//-- REDUCE POST BY LENGHT
			if(item.message.length > 179){
				feedText = item.message.substring(0, 140) + "...";
			}else{
				feedText = item.message;
			}

			//--CHECK IF OBJECT ID IS PRESENT 
			if(item.object_id) {
				feedObjectID = item.object_id;
				feedImg = 'https://graph.facebook.com/' + feedObjectID +'/picture?type=normal';
			} else {
				feedObjectID = item.id.split('_')[1];
				feedImg = item.picture;
			}

			//--CREATE TAB-SLIDE ITEM ON FIRST LOOP
			if (i == 0) {
				facebookSlide = jQuery('<div class="tab-slide-content facebook-slide-content"></div>');
			}

			//--CREATE COL
			if ((i == 0) || (i == 1) || ((i-1)%3 == 0)) {
				facebookCol = jQuery('<div class="col-50"></div>');
			}
			
			//--ASSIGN DIFFERENT KIND OF POST CLASSES DEPENDING ON CONDITONS
			if (i == 0) {
				facebookPost += '<div class="main-post">'; 
			} else if (item.type == 'video'){
				facebookPost += '<div class="post video-post">';
			} else {
				facebookPost += '<div class="post">';
			}							 	
			
			//--CREATE POST BODY
			facebookPost += '<div class="img" style="background-image: url('+ feedImg +')"></div>';
			facebookPost += '<div class="post-content"><p>'+ feedText +'</p><a class="view-post" href="https://facebook.com/'+ item.from.id +'/posts/'+ feedObjectID +'" target="_blank">View post</a></div>';				

			//--APPENDING AND RESETTING POST AND NODE VALUE
			facebookNode = jQuery(facebookPost);
			facebookNode.appendTo(facebookCol);
			facebookPost = "";
			facebookNode = [];

			//--APPEND COL TO SLIDE WHEN READY
 			if ((i == 0) || ((i)%3 == 0)) { 
				facebookCol.appendTo(facebookSlide);
				facebookCol = [];
			}

			//--APPEND SLIDE TO DOCUMENT FRAGMENT WHEN READY
			if (facebookSlide.children().length == 2) {
				facebookFrag.appendChild(facebookSlide[0]);
				facebookSlide = jQuery('<div class="tab-slide-content facebook-slide-content"></div>');
			}

		});
		
		//--APPEND REMAINING POSTS TO DOCUMENT FRAGMENT
		if (facebookCol.length) { 
			facebookCol.appendTo(facebookSlide);
		}

		if (facebookSlide.children().length) {
			facebookFrag.appendChild(facebookSlide[0]);		
		}
		
		//-- APPEND DOCUMENT FRAGMENT TO DOM
		socialHub.globalFeed(facebookFrag,'facebook');		
	},
	
/*-- facebook FEED ERROR --*/
	facebookError : function(){

		facebookPostsArray = [[0, "<div class='feed'><div class='feed-preview'><a class='icon facebook' href='http://www.facebook.com/nissanpathfinder'></a></div><div class='hubcontent'><h4 class='wf'>@NissanPathfindr<span>Today</span></h4><p>Our Most Innovative Pathfinder Ever.</p></div></div>"]];
		//facebookPostsArray = [];
	},
	
	globalFeed : function(frag,social){
		var $element = jQuery('#'+social);
		$element.append(frag);
		$element.slick({ 
                    autoplay: false,
                    accessibility: true,
                    dots: false,
                    draggable: true,
                    fade: true,
                    infinite: false,
                    speed: 100,
                    swipe: true,
                    swipeToSlide: true,
                    useCSS: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    cssEase: 'linear'
                });

		if (social == 'twitter') {
			jQuery('.tweet-popup').on('click', function(e){
				var href = jQuery(this).attr('href');
    			var tweet_popup = window.open(href, 'tweet_popup', 'width=500,height=325');
			});
		}
	},

/*-----
	GLOBAL FUNCTIONS
-----*/
	utils : {
		log : function(msg){
			if(console){
				console.log('Social Hub ::: ' + msg);
			}
		},
		prettyDate : function(time){
			// feed's time
			var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," "));
			
			// match feed's time zone
			var now = new Date(); 
			var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			
			// difference
			var diff = (now_utc.getTime() - date.getTime()) / 1000;
			var day_diff = Math.floor(diff / 86400);
			
			// pretty dates
			if ( isNaN(day_diff) || day_diff < 0)
				return;
					
			return day_diff == 0 && (
					diff < 60 && "just now" ||
					diff < 120 && "1 minute ago" ||
					diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
					diff < 7200 && "1 hour ago" ||
					diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
				day_diff == 1 && "Yesterday" ||
				day_diff < 7 && day_diff + " days ago" ||
				day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
				day_diff >= 31 && "months ago";
		},		
		parseFacebookDate : function(date){
			// valid date
			var validDate = date.replace('+0000', '');
			return validDate;
		},
		parseTwitterDate : function(date){
			var splitDate = date.split(' ');
			
			// year
			var year = splitDate[5];
			
			// month
			getMonth = function(){
				var month = splitDate[1];
				if (month == 'Jan') return '01';
				else if (month == 'Feb') return '02';
				else if (month == 'Mar') return '03';
				else if (month == 'Apr') return '04';
				else if (month == 'May') return '05';
				else if (month == 'Jun') return '06';
				else if (month == 'Jul') return '07';
				else if (month == 'Aug') return '08';
				else if (month == 'Sep') return '09';
				else if (month == 'Oct') return '10';
				else if (month == 'Nov') return '11';
				else if (month == 'Dec') return '12';
				else return '01';
			}
			var month = getMonth();
			
			// day
			var day = splitDate[2];
			
			// time
			var time = 'T' + splitDate[3];
			
			// valid date
			var validDate = year + '-' + month + '-' + day + time;
			return validDate;
		},
		parseTweetText : function(text){
			var tweet = text;
			
			//Parse URLs
			tweet = tweet.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
				return '<a class="tweet_popup" target="_blank" href="'+ url +'" target="_blank">'+ url + '</a>';
			});
			
			//Parse Usernames
			tweet = tweet.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
				var username = u.replace("@","");
				return '<a class="tweet_popup" target="_blank" href="http://twitter.com/'+ username +'" target="_blank">'+ u + '</a>';
			});
			
			//Parse Hashtags
			tweet = tweet.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
				var tag = t.replace("#","%23");
				return '<a class="tweet_popup" target="_blank" href="http://search.twitter.com/search?q='+ tag +'" target="_blank">'+ t + '</a>';
			});
			
			return tweet;
		}
	}
};