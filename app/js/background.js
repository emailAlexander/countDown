
/*name: CountDown background controller
author: Alexander Borsevici*/


// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + " one", description: text+"the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
  });


// Storage and Cache Controller
var Memory={
	timers:{'1':{'id':1,'start':0,'end':0,'pause':0,'time':0,'set':'  00:00:00'}},
	settings:{'bID':1,'nid':1},
	init:function(){
		//chrome.storage.sync.clear();
		// test migration
		/*
		localStorage['optiond_0']=false;
		localStorage['optiond_1']=true;
		localStorage['optiond_2']=false;
		localStorage['note_1']="hola nota";
		localStorage['note_2']="que tal";

		localStorage['set_0']='00:20:00';
		localStorage['set_1']='00:00:05';
		localStorage['set_2']='00:00:01';
		localStorage['set_default']='0';
		localStorage['set_id']='["1","0","2"]';
		localStorage['set_num']='3';

		localStorage['pause_1']='00:02:02';
		localStorage['run_0']='1357330428350';
		localStorage['run_1']='1357327060673';
		/**/

		if(localStorage['set_id']!=null) Memory.migrate();
		else Memory.load();
	},
	migrate:function(){
		console.log("Migrating");
		chrome.storage.sync.clear();

		set_id=JSON.parse(localStorage["set_id"]);
		for (id in set_id){

			var t_end=0;

			// set pause
			if (localStorage['pause_'+set_id[id]]!=null) {
				var t_pause=Memory.parseTime(localStorage['pause_'+set_id[id]]);
			}
				else {
					var t_pause=0;
					// set end
					if (localStorage['run_'+set_id[id]]!=null) t_end=localStorage['run_'+set_id[id]];
				}			
			// set time
			if (localStorage['set_'+set_id[id]]!=null) var t_time=Memory.parseTime(localStorage['set_'+set_id[id]]);
				else var t_time=0;
			// set set :)
			if (localStorage['note_'+set_id[id]]!=null) var t_set=localStorage['note_'+set_id[id]];
				else var t_set='  00:00:00';

			Memory.timers[id]={'id':id,'start':0,'end':t_end,'pause':t_pause,'time':t_time,'set':t_set};
			Memory.settings.nid=+Memory.settings.nid+1;
			if (localStorage['set_default']==set_id[id]) Memory.settings.bID=id;
		}
		Memory.save();
		localStorage.clear();
	},
	// change in two methods!!! (save load)
	save:function(){
		chrome.storage.sync.set({'timers':Memory.timers});
		chrome.storage.sync.set({"settings":Memory.settings});
	},
	load:function(){
		chrome.storage.sync.get(function(Data){
			if(Data.settings!==undefined){
				Memory.timers=Data.timers;
				Memory.settings=Data.settings;
			}
			Clock.start();
		});
	},
	sync:function(set){
		chrome.storage.sync.get("syncstamp",function(Remote){
			if(Remote.syncstamp===undefined || set || Remote.syncstamp<Memory.syncstamp){
				// sync in
				console.log("SYNC IN");
				chrome.storage.sync.set({'timers':Memory.timers});
				chrome.storage.sync.set({"settings":Memory.settings});
				chrome.storage.sync.set({"syncstamp":new Date().getTime()});
				console.log(chrome.runtime.lastError);
			}else{
				// sync out
				console.log("SYNC OUT");
				chrome.storage.sync.get(function(Data){
					Memory.timers=Data.timers;
					Memory.settings=Data.settings;
					Memory.syncstamp=new Date().getTime();
				});
			}
		});
	},
	newTimer:function(){
		Memory.settings.nid=+Memory.settings.nid+1;
		Memory.timers[Memory.settings.nid]={'id':Memory.settings.nid,'start':0,'end':0,'pause':0,'time':0,'set':'  00:00:00'};
		Memory.save();
		return Memory.settings.nid;
	},
	deleteTimer:function(id){
		if (Memory.timers[id]){
			delete Memory.timers[id];
			Memory.save();
		}
	},
	parseTime:function(input){
		// parse input string returning time in ms
		var itime=input.split("").reverse().join("");
		var rtime=itime.replace(/(\d{2})\D*/g,"$1n");
		var ntime=rtime.split("").reverse().join("");
		var stime=ntime.split(/:|n|½/);

		if (stime.length==5) {
			stime[1]=stime[0]+stime[1];
			stime=stime.slice(1,5);
		}
		var ms=0;
		var ss=[1000,60000,3600000,86400000];
		var si=0;
		for (var i = stime.length - 1; i >= 0; i--) {
			ms+=stime[i]*ss[si++];
			if(si==4) break;
		};
		return ms;
	},
	convertTime:function(ms){
		return new Date(ms).toJSON().replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/, function(match,p1,p2,p3,p4,p5,p6,p7){
			days=Math.floor(ms/(3600*24*1000));
			days=(days==0)?" ":days;
			return days+" "+p4+":"+p5+":"+p6;
		});
	},
	getBadgeTimer:function(){
		return Memory.timers[Memory.settings.bID];
	}
}

// Settings Controller 
var Settings={
}

// Clock Controller
var Clock={
	Interval:-1, // Interval for timer
	init:function(){
		// Set listener
		chrome.alarms.onAlarm.addListener(Clock.alert);
		// Start the clock
		Clock.start();
	},
	start:function(){
		if (Clock.Interval<0) { //Start only once
			Clock.Interval = setInterval(function(){Clock.Tick();}, 100 );
		};
	},
	Tick:function(){
		
		if(Memory.timers[Memory.settings.bID]!==undefined) {
			if(Memory.timers[Memory.settings.bID].pause===0 && Memory.timers[Memory.settings.bID].end!=0) {
				Badge.update();
			}
			else{
			    	Clock.Idle();
					if(Memory.timers[Memory.settings.bID].pause===0) Badge.clear();
					else Badge.update();
				}
		}
		else
			// if no timer is running - idle
			Clock.Idle();			
	},
	Idle:function(){
		clearInterval(Clock.Interval);
		Clock.Interval=-1;
	},
	alert:function(alarm){
		// create notification
		chrome.notifications.create(alarm.name, {
			  type: "basic",
			  title: "countDown",
			  message: Memory.timers[alarm.name].set,
			  iconUrl: "img/icon-128.png",
			  priority: 2,
			  eventTime: Date.now() + 100000,
			  buttons: [{title: "Restart"},
			  			{title: "Dismiss"}],
			}, function crCallback(notID) {
			   console.log("Succesfully created " + notID + " notification");
			   chrome.notifications.onButtonClicked.addListener(function (notID,bIndex){
			   	if(bIndex==0){
			   		// if(Controller.Memory.timers[Notification.id].end==0){
					var timeout=0;
					// if(Controller.Memory.timers[Notification.id].pause==0){
						timeout=Memory.timers[notID].time;
					// }else{
					// 	timeout=Controller.Memory.timers[Notification.id].pause;
					// }

					// Start
					if(timeout<0) {
						Memory.timers[notID].start=new Date().getTime()+timeout;
					}
					else{
						Memory.timers[notID].start=new Date().getTime();
					}
					Memory.timers[notID].end=new Date().getTime()+timeout;
					Memory.timers[notID].pause=0;

					// Set alarm
					if(timeout>0)	
						chrome.alarms.create(notID.toString(),{when: Memory.timers[notID].end});
				// }else{
				// 	// Pause
				// 	Controller.Memory.timers[Notification.id].pause=Controller.Memory.timers[Notification.id].end - new Date().getTime();
				// 	Controller.Memory.timers[Notification.id].end=0;
				// 	chrome.alarms.clear(Notification.id.toString());
				// }
				
				Clock.start();
				
				//save
				Memory.save();
				}
			   	chrome.notifications.clear(notID,function clCallback(result){"Cleared"});

			   });
				//chrome.notifications.clear(notID,function clCallback(result){"Cleared"});
			});



		// play sound
		var snd = new Audio("alert.mp3");
		snd.volume=1.0;
		snd.play();

		Memory.timers[alarm.name].start=0;
		Memory.timers[alarm.name].end=0;
		Memory.timers[alarm.name].pause=0;
		
		Memory.save();
	},
	time:function(){
		var time={};
		// get the time
		if (Memory.timers[Memory.settings.bID].pause===0) {
			if(Memory.timers[Memory.settings.bID].start==Memory.timers[Memory.settings.bID].end)
				diff=new Date().getTime() - Memory.timers[Memory.settings.bID].start;
			else diff=Memory.timers[Memory.settings.bID].end - new Date().getTime();
		}
		else if(Memory.timers[Memory.settings.bID].pause<0) diff=-1*Memory.timers[Memory.settings.bID].pause;
			else diff=Memory.timers[Memory.settings.bID].pause/* - new Date().getTime()*/;

		var days=Math.floor(diff/(3600*24*1000));
		if (days>0){
			time.c=[0,0,128,255];
			time.t=days+"d";
			}
		else{
			if(diff>3600000){
				time.c=[200,0,0,255];
				time.t=new Date(diff).toJSON().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, "$1$2");
			}
			else{
				time.c=[0,128,0,255];
				time.t=new Date(diff).toJSON().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, "$2$3");
			}
		}
		return time;
	}
}

//Badge Controller
var Badge={
	update:function(){
		time=Clock.time();
		chrome.browserAction.setBadgeBackgroundColor({color: time.c})
		chrome.browserAction.setBadgeText({text: time.t});
	},
	clear:function(){
		chrome.browserAction.setBadgeText({text: ""});
	}
}

//History Controller
var History={

}

//Engine on (starting tick tack)
chrome.runtime.onStartup.addListener(Memory.init);
Memory.init();
Clock.init();