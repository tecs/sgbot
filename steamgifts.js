$(document).ready(function(){
	var getSeconds = function(str) {
		var val = parseInt(str.replace(/[^0-9]+/g,''));
		var mult = 0;
		
		if		(str.indexOf('second')!=-1)	mult = 1;
		else if	(str.indexOf('minute')!=-1)	mult = 60;
		else if	(str.indexOf('hour')!=-1)	mult = 60*60;
		else if	(str.indexOf('day')!=-1)	mult = 60*60*24;
		else if	(str.indexOf('week')!=-1)	mult = 60*60*24*7;
		else if	(str.indexOf('month')!=-1)	mult = 60*60*24*7*30;
		
		if( mult>0 && val>0 && val !== NaN) return val*mult;
				  
		return 1;
	}
	var getInt = function(str, fl) {
		var text = str.html ? str.html() : str;
		if(fl) {
			return parseFloat( text.replace(/[^0-9.]+/g,'') );
		} else {
			return parseInt( text.replace(/[^0-9]+/g,'') );
		}
	}
	
	var points = 0;
	var paging = {};
	var games = [];
	var threshold = 1000;

	// Get current points
	$('#navigation a.arrow').each(function(){
		var text = $(this).html();
		
		if (text.indexOf('Account')!=-1) {
			points = getInt(text);
		}
	});
	
	// Get paging
	$('.results').eq(0).find('strong').each(function(){
		var value = parseInt($(this).html());
		
		if(!paging.from) paging.from = value;
		else if(!paging.to) paging.to = value;
		else {
			paging.total = value;
			paging.current = parseInt($('.numbers .selected').html());
		}
	});
	
	// Aggregate games
	$('.ajax_gifts .post').not('.fade').each(function(){
		var game = {};
		$this = $(this);
		
		var contributor = $this.find('.contributor_only');
		
		if(!contributor.length || contributor.hasClass('green')) {
			var $time = $this.find('.time_remaining').find('strong');
			
			game.price = getInt($this.find('.title span').not('.new'));				
			game.link = $this.find('.title a').attr('href');

			game.created = getSeconds($time.eq(1).text());
			game.left = getSeconds($time.eq(0).text());
			
			game.entries = getInt($this.find('.entries a').eq(0).html());
				
			game.copies = $this.find('.title').contents().filter(function() {
				return this.nodeType == Node.TEXT_NODE && this.data.indexOf('Copies')!=-1; 
			});
			game.copies = game.copies.length ? getInt(game.copies[0].data) : 1;
			
			game.estimated = game.entries*(game.left/game.created);
			if(contributor.length) {
				game.estimated = game.estimated / ( getInt(contributor, true) + 1 );
			}
			
			game.chance = (game.entries + game.estimated ) / game.copies;
			
			if(game.chance < threshold ) {
					games.push(game);
			}
		}
	});
	
	// Sort games
	games.sort(function(a,b){
		return b.chance - a.chance;
	});
});