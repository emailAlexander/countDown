
/*name: CountDown background controller
author: Alexander Borsevici*/

// Background Controller
var Controller;
chrome.runtime.getBackgroundPage(function(page){Controller=page;Notification.init();});

// Notification Controller
var Notification={
	id:0,
	init:function(){
		Notification.id=location.search.substring(1);
		document.getElementById('time').innerHTML=Controller.Memory.convertTime(Controller.Memory.timers[Notification.id].time);
		document.getElementById('set').innerHTML=Controller.Memory.timers[Notification.id].set;
		// show
		setTimeout(Notification.show,300);
		Clock.start();

		// Listeners
		document.getElementById('dismiss').addEventListener("click",Notification.dismiss,false);
		document.getElementById('restart').addEventListener("click",Notification.restart,false);
		
	},
	show:function(){
		document.getElementById('timer').style.webkitTransform="rotateX( 0deg )";
	},
	dismiss:function(){
		window.close();
	},
	restart:function(){
		// if(Controller.Memory.timers[Notification.id].end==0){
			var timeout=0;
			// if(Controller.Memory.timers[Notification.id].pause==0){
				timeout=Controller.Memory.timers[Notification.id].time;
			// }else{
			// 	timeout=Controller.Memory.timers[Notification.id].pause;
			// }

			// Start
			if(timeout<0) {
				Controller.Memory.timers[Notification.id].start=new Date().getTime()+timeout;
			}
			else{
				Controller.Memory.timers[Notification.id].start=new Date().getTime();
			}
			Controller.Memory.timers[Notification.id].end=new Date().getTime()+timeout;
			Controller.Memory.timers[Notification.id].pause=0;

			// Set alarm
			if(timeout>0)	
				chrome.alarms.create(Notification.id.toString(),{when: Controller.Memory.timers[Notification.id].end});
		// }else{
		// 	// Pause
		// 	Controller.Memory.timers[Notification.id].pause=Controller.Memory.timers[Notification.id].end - new Date().getTime();
		// 	Controller.Memory.timers[Notification.id].end=0;
		// 	chrome.alarms.clear(Notification.id.toString());
		// }
		
		Controller.Clock.start();
		
		//save
		Controller.Memory.save();

		window.close();
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