
/*name: CountDown background controller
author: Alexander Borsevici*/

// Background Controller
var Controller;
chrome.runtime.getBackgroundPage(function(page){Controller=page;Option.init();});

// Options Controller
var Option={
	id:0,
	init:function(){		
	},
	show:function(){
		
	}
}

// Clock Controller
var Clock={
	time:new Date().getTime(),
	Interval:-1, // Interval for timer
	start:function(){
		if (Clock.Interval<0) { //Start only once
			Clock.Interval = setInterval(function(){Clock.Tick();}, 100 );
		};

	},
	Tick:function(){
		document.getElementById('uptime').innerHTML=Controller.Memory.convertTime( new Date().getTime() - Clock.time);
	}

}