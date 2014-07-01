
/*name: CountDown popup controller
author: Alexander Borsevici*/

// Background Controller
var Controller;
chrome.runtime.getBackgroundPage(function(page){Controller=page;Clock.init();});

// Clock Controller
var Clock={
	Interval:-1,
	init:function(){
		// Start the clock
		Clock.start();
		Interface.init();
	},
	start:function(){
		if (Clock.Interval<0) { //Start only once
			Clock.Interval = setInterval(function(){Clock.tick();}, 100 );
		};
	},
	tick:function(){
		for (id in Controller.Memory.timers){
			Interface.updateTime(Controller.Memory.timers[id]);
		}
	},
	idle:function(){
		clearInterval(Clock.Interval);
		Clock.Interval=-1;
	}
}

// Interface Controller
var Interface={
	time:{},
	viewID:0,
	init:function(){
		// load all timers
	    setTimeout(function () { Interface.loadTimers(); }, 50);

		document.getElementById('add').addEventListener("click",Interface.timerAdd,false);
		//document.getElementById('options').addEventListener("click", Interface.options, false);
		document.getElementById('qa').addEventListener("click", Interface.qa, false);
	},
	options:function(){
	    window.open("options.html");
	},
	qa:function(){
	    window.open("https://chrome.google.com/webstore/detail/countdown/fefdcjabloofphhfcinhfbinmehfcojm/details?hl=en");
	},
	dblClick: function () {
	    console.log("dblClick");
	    var noteContent = this.querySelector('.note_edit span').innerHTML;
	    var note = this.querySelector('.note_edit');
	    var id = this.id;

	    if (this.querySelector('.note_edit.active') == null) {
	        note.className = "note_edit active";
	        this.querySelector('.note_edit span').contentEditable = "true";
	    }else{
	        note.className = "note_edit";
	        this.querySelector('.note_edit span').contentEditable = "false";
	        this.querySelector('.note').innerHTML = noteContent;
	        Controller.Memory.timers[id].note = noteContent;
	        Controller.Memory.timers[id].note = Controller.Memory.timers[id].note.replace(/\s+/g, '  ');
	        Controller.Memory.save();
        }
	   
	},
	noteEdit: function () {
	    var t = document.createEvent("SVGEvents");
	    t.initEvent("click", true, true);
	    document.getElementById('timer-' + this.parentNode.parentNode.id).dispatchEvent(t);
	    var note = this.parentNode.parentNode.querySelector('.note_edit');
	    note.className = "note_edit active";
	    this.parentNode.parentNode.querySelector('.note_edit span').contentEditable = "true";
	},
	timerAdd:function(id){
		if (isNaN(id)) {
			id=Controller.Memory.newTimer();
		} 
		Interface.viewID+=1;
		Interface.time[id]={input:"",time:Controller.Memory.timers[id].time};

		var timers = document.getElementById("timers") 
		// build
		var timer_wrapper = document.createElement('div'); timer_wrapper.setAttribute('class','timer_wrapper');
		var timer = document.createElement('div'); timer.id = id; timer.setAttribute('class', 'timer'); timer.setAttribute('tabindex', Interface.viewID);

		var start='<svg class="icon" id="start-'+id+'" viewBox="0 0 32 32"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM13,24l0,-16l10,8z" style="fill:#ffffff" /><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM11,24l0,-16l3,0l0,16l0,-3zM19,24l0,-16l3,0l0,16l0,-3z" style="fill:#ffffff;display:none;" /></svg>';
		var stop='<svg class="icon" id="stop-'+id+'" viewBox="0 0 32 32"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM9,23l0,-14,l14,0l0,14z" style="fill:#ffffff" /></svg>';
		var option='<svg id="option-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM24.386,14.968c-1.451,1.669-3.706,2.221-5.685,1.586l-7.188,8.266c-0.766,0.88-2.099,0.97-2.979,0.205s-0.973-2.099-0.208-2.979l7.198-8.275c-0.893-1.865-0.657-4.164,0.787-5.824c1.367-1.575,3.453-2.151,5.348-1.674l-2.754,3.212l0.901,2.621l2.722,0.529l2.761-3.22C26.037,11.229,25.762,13.387,24.386,14.968z" style="fill:white" /></svg>';
		var timer_option='<svg id="timer-'+id+'" class="icon" viewBox="0 0 32 32"><path d="m10,1 10,10 10,-10 2,2 -10,10 10,10 -2,2 -10,-10 -10,10 -2,-2 10,-10 -10,-10z" style="fill:white" /></svg>';
		var remove_option='<svg id="remove-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.522,2.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z" style="fill:white" /></svg>';
		var cycle_option='<svg id="cycle-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M21.786,12.873l7.556-4.361l-7.556-4.362v2.701c-2.929,0.374-4.905,2.64-6.809,4.952c0.545,0.703,1.08,1.418,1.604,2.127c0.192,0.26,0.383,0.514,0.573,0.77c0.802-1.043,1.584-1.999,2.341-2.74c0.884-0.885,1.673-1.393,2.291-1.588V12.873zM17.661,17.006c-1.893-2.371-3.815-5.354-6.009-7.537c-1.461-1.428-3.155-2.664-5.34-2.693h-3.5v3.5h3.5c0.971-0.119,2.845,1.333,4.712,3.771c1.895,2.371,3.815,5.354,6.011,7.537c1.326,1.297,2.847,2.426,4.751,2.645v2.646l7.556-4.363l-7.556-4.362v2.535C20.746,20.346,19.205,19.022,17.661,17.006z" style="fill:white" /></svg>';
		var sort_option='<svg id="sort-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M21.786,20.654c-0.618-0.195-1.407-0.703-2.291-1.587c-0.757-0.742-1.539-1.698-2.34-2.741c-0.191,0.256-0.382,0.51-0.574,0.77c-0.524,0.709-1.059,1.424-1.604,2.127c1.904,2.31,3.88,4.578,6.809,4.952v2.701l7.556-4.362l-7.556-4.362V20.654zM9.192,11.933c0.756,0.741,1.538,1.697,2.339,2.739c0.195-0.262,0.39-0.521,0.587-0.788c0.52-0.703,1.051-1.412,1.592-2.11c-2.032-2.463-4.133-4.907-7.396-5.025h-3.5v3.5h3.5C6.969,10.223,7.996,10.735,9.192,11.933zM21.786,10.341v2.535l7.556-4.363l-7.556-4.363v2.647c-1.904,0.219-3.425,1.348-4.751,2.644c-2.196,2.183-4.116,5.167-6.011,7.538c-1.867,2.438-3.741,3.888-4.712,3.771h-3.5v3.5h3.5c2.185-0.029,3.879-1.266,5.34-2.693c2.194-2.184,4.116-5.167,6.009-7.538C19.205,12.003,20.746,10.679,21.786,10.341z" style="fill:white" /></svg>';
		var style_option='<svg id="style-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M22.255,19.327l-1.017,0.131c-0.609,0.081-1.067,0.208-1.375,0.382c-0.521,0.293-0.779,0.76-0.779,1.398c0,0.484,0.178,0.867,0.532,1.146c0.354,0.28,0.774,0.421,1.262,0.421c0.593,0,1.164-0.138,1.72-0.412c0.938-0.453,1.4-1.188,1.4-2.229v-1.354c-0.205,0.131-0.469,0.229-0.792,0.328C22.883,19.229,22.564,19.29,22.255,19.327zM8.036,18.273h4.309l-2.113-6.063L8.036,18.273zM28.167,7.75H3.168c-0.552,0-1,0.448-1,1v16.583c0,0.553,0.448,1,1,1h24.999c0.554,0,1-0.447,1-1V8.75C29.167,8.198,28.721,7.75,28.167,7.75zM14.305,23.896l-1.433-4.109H7.488L6,23.896H4.094L9.262,10.17h2.099l4.981,13.727H14.305L14.305,23.896zM26.792,23.943c-0.263,0.074-0.461,0.121-0.599,0.141c-0.137,0.02-0.323,0.027-0.562,0.027c-0.579,0-0.999-0.204-1.261-0.615c-0.138-0.219-0.231-0.525-0.29-0.926c-0.344,0.449-0.834,0.839-1.477,1.169c-0.646,0.329-1.354,0.493-2.121,0.493c-0.928,0-1.688-0.28-2.273-0.844c-0.589-0.562-0.884-1.271-0.884-2.113c0-0.928,0.29-1.646,0.868-2.155c0.578-0.511,1.34-0.824,2.279-0.942l2.682-0.336c0.388-0.05,0.646-0.211,0.775-0.484c0.063-0.146,0.104-0.354,0.104-0.646c0-0.575-0.203-0.993-0.604-1.252c-0.408-0.26-0.99-0.389-1.748-0.389c-0.877,0-1.5,0.238-1.865,0.713c-0.205,0.263-0.34,0.654-0.399,1.174H17.85c0.031-1.237,0.438-2.097,1.199-2.582c0.77-0.484,1.659-0.726,2.674-0.726c1.176,0,2.131,0.225,2.864,0.673c0.729,0.448,1.093,1.146,1.093,2.093v5.766c0,0.176,0.035,0.313,0.106,0.422c0.071,0.104,0.223,0.156,0.452,0.156c0.076,0,0.16-0.005,0.254-0.015c0.093-0.011,0.191-0.021,0.299-0.041L26.792,23.943L26.792,23.943z" style="fill:white" /></svg>';
		var notification_option='<svg id="notification-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M27.916,23.667V7.333H3.083v16.334H27.916zM24.915,20.668H6.083v-6.501h18.833L24.915,20.668L24.915,20.668z" style="fill:white" /></svg>';
		var sound_option='<svg id="sound-'+id+'" class="icon" viewBox="0 0 32 32"><path d="M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z M18.806,11.219c-0.393-0.389-1.024-0.389-1.415,0.002c-0.39,0.391-0.39,1.024,0.002,1.416v-0.002c0.863,0.864,1.395,2.049,1.395,3.366c0,1.316-0.531,2.497-1.393,3.361c-0.394,0.389-0.394,1.022-0.002,1.415c0.195,0.195,0.451,0.293,0.707,0.293c0.257,0,0.513-0.098,0.708-0.293c1.222-1.22,1.98-2.915,1.979-4.776C20.788,14.136,20.027,12.439,18.806,11.219z M21.101,8.925c-0.393-0.391-1.024-0.391-1.413,0c-0.392,0.391-0.392,1.025,0,1.414c1.45,1.451,2.344,3.447,2.344,5.661c0,2.212-0.894,4.207-2.342,5.659c-0.392,0.39-0.392,1.023,0,1.414c0.195,0.195,0.451,0.293,0.708,0.293c0.256,0,0.512-0.098,0.707-0.293c1.808-1.809,2.929-4.315,2.927-7.073C24.033,13.24,22.912,10.732,21.101,8.925z" style="fill:white" /></svg>';
		var tag = '<svg class="icon" id="tag-' + id + '" viewBox="0 0 32 32"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM13.665,25.725l-3.536-3.539l6.187-6.187l-6.187-6.187l3.536-3.536l9.724,9.723L13.665,25.725z" style="fill:#ffffff;" /></svg>';
		var edit_note = '<svg class="icon" id="edit_note-' + id + '" viewBox="0 0 32 32"><path d="M22.255,19.327l-1.017,0.131c-0.609,0.081-1.067,0.208-1.375,0.382c-0.521,0.293-0.779,0.76-0.779,1.398c0,0.484,0.178,0.867,0.532,1.146c0.354,0.28,0.774,0.421,1.262,0.421c0.593,0,1.164-0.138,1.72-0.412c0.938-0.453,1.4-1.188,1.4-2.229v-1.354c-0.205,0.131-0.469,0.229-0.792,0.328C22.883,19.229,22.564,19.29,22.255,19.327zM8.036,18.273h4.309l-2.113-6.063L8.036,18.273zM28.167,7.75H3.168c-0.552,0-1,0.448-1,1v16.583c0,0.553,0.448,1,1,1h24.999c0.554,0,1-0.447,1-1V8.75C29.167,8.198,28.721,7.75,28.167,7.75zM14.305,23.896l-1.433-4.109H7.488L6,23.896H4.094L9.262,10.17h2.099l4.981,13.727H14.305L14.305,23.896zM26.792,23.943c-0.263,0.074-0.461,0.121-0.599,0.141c-0.137,0.02-0.323,0.027-0.562,0.027c-0.579,0-0.999-0.204-1.261-0.615c-0.138-0.219-0.231-0.525-0.29-0.926c-0.344,0.449-0.834,0.839-1.477,1.169c-0.646,0.329-1.354,0.493-2.121,0.493c-0.928,0-1.688-0.28-2.273-0.844c-0.589-0.562-0.884-1.271-0.884-2.113c0-0.928,0.29-1.646,0.868-2.155c0.578-0.511,1.34-0.824,2.279-0.942l2.682-0.336c0.388-0.05,0.646-0.211,0.775-0.484c0.063-0.146,0.104-0.354,0.104-0.646c0-0.575-0.203-0.993-0.604-1.252c-0.408-0.26-0.99-0.389-1.748-0.389c-0.877,0-1.5,0.238-1.865,0.713c-0.205,0.263-0.34,0.654-0.399,1.174H17.85c0.031-1.237,0.438-2.097,1.199-2.582c0.77-0.484,1.659-0.726,2.674-0.726c1.176,0,2.131,0.225,2.864,0.673c0.729,0.448,1.093,1.146,1.093,2.093v5.766c0,0.176,0.035,0.313,0.106,0.422c0.071,0.104,0.223,0.156,0.452,0.156c0.076,0,0.16-0.005,0.254-0.015c0.093-0.011,0.191-0.021,0.299-0.041L26.792,23.943L26.792,23.943z" style="fill:#ffffff;" /></svg>';


		//var options=''+remove_option+'  '+style_option+sound_option+notification_option+cycle_option+sort_option+timer_option;
		var options=edit_note+'  '+remove_option+'  '+timer_option;
		var time;

		// select time to show
		if(Controller.Memory.timers[id].pause==0) time=Controller.Memory.convertTime(Interface.time[id].time);
		else {
			if(Controller.Memory.timers[id].pause<0)
				time=Controller.Memory.convertTime(-1*Controller.Memory.timers[id].pause);
			else time=Controller.Memory.convertTime(Controller.Memory.timers[id].pause);
		}

		console.log(Controller.Memory.timers[id].pause);

		timer.innerHTML = '<div class="options">' + options + '</div><div class="selected">' + tag + '</div><div class="control">' + start + stop + option + '</div><div class="time">' + time + '</div><div class="note" spellcheck="false">' + Controller.Memory.timers[id].note + '</div><div class="note_edit" spellcheck="false"><span>' + Controller.Memory.timers[id].note + '</span></div>';

		timer_wrapper.appendChild(timer);
		timers.appendChild(timer_wrapper);

		// start Icon
		if(Controller.Memory.timers[id].end!=0) {
			document.getElementById('start-'+id).firstChild.style.display="none";
			document.getElementById('start-'+id).lastChild.style.display="";
		}

		// tag
		if (Controller.Memory.settings.bID == id) {
		    document.getElementById('tag-' + id).setAttribute("class", "icon tagged");
		}


		// show
		setTimeout(function(){timer.className+=" show";},100);

		// EventListeners
		document.getElementById('option-'+id).addEventListener("click",Interface.option,false);
		document.getElementById('timer-'+id).addEventListener("click",Interface.option_save,false);
		document.getElementById('remove-'+id).addEventListener("click",Interface.timerRemove,false);
		document.getElementById('tag-'+id).addEventListener("click",Interface.tag,false);
		document.getElementById('start-'+id).addEventListener("click",Interface.start,false);
		document.getElementById('stop-' + id).addEventListener("click", Interface.stop, false);

		document.getElementById('edit_note-' + id).addEventListener("click", Interface.noteEdit, false);
		
		timer.addEventListener("keydown",Interface.inputListener,false);
		timer.addEventListener("mousewheel", Interface.inputListener, false);
		timer.addEventListener("dblclick", Interface.dblClick, false);

	    // focus on first
		if (Interface.viewID == 1) timer.focus();

		// timer.oncontextmenu = function (e)
		// 	{
		// 		e.preventDefault();
		// 		console.log(e);
		// 		return false;
		// 	}

	    // autofocus
		//timer.addEventListener("mouseover",function(){this.focus()},false);
		
		
	},
	tag:function(){
		var timer=this.parentNode.parentNode;
		
		if(document.getElementById('tag-'+Controller.Memory.settings.bID)){
		    document.getElementById('tag-' + Controller.Memory.settings.bID).setAttribute("class", "icon");
		}
		
		if(Controller.Memory.settings.bID!=timer.id){
			Controller.Memory.settings.bID=timer.id;
			this.setAttribute("class", "icon tagged");
		} else {
		    Controller.Memory.settings.bID = -1;
		    Controller.Badge.clear();
		}

		Controller.Clock.start();
		//save
		Controller.Memory.save();
	},
	start:function(){
		var timer=this.parentNode.parentNode;
		if(Controller.Memory.timers[timer.id].end==0){
			var timeout=0;
			if(Controller.Memory.timers[timer.id].pause==0){
				timeout=Interface.time[timer.id].time;
			}else{
				timeout=Controller.Memory.timers[timer.id].pause;
			}

			// Start
			if(timeout<0) {
				Controller.Memory.timers[timer.id].start=new Date().getTime()+timeout;
			}
			else{
				Controller.Memory.timers[timer.id].start=new Date().getTime();
			}

			Controller.Memory.timers[timer.id].time=Interface.time[timer.id].time;
			Controller.Memory.timers[timer.id].end=new Date().getTime()+timeout;
			Controller.Memory.timers[timer.id].pause=0;
			

			// Update note
			Controller.Memory.timers[timer.id].note=Controller.Memory.timers[timer.id].note.replace(/((\d{0,4}\s)?\d{2}:\d{2}:\d{2})/,Controller.Memory.convertTime(Controller.Memory.timers[timer.id].time));
			timer.querySelector('.note').innerHTML=Controller.Memory.timers[timer.id].note;
			
			// Clear input log
			Interface.time[timer.id].input="";

			// Set alarm
			if(timeout>0){
				chrome.alarms.create(timer.id.toString(),{when: Controller.Memory.timers[timer.id].end});
				chrome.notifications.clear(timer.id.toString(),function (wasCleared){});
			}
				

			// Redraw start
			document.getElementById('start-'+timer.id).firstChild.style.display="none";
			document.getElementById('start-'+timer.id).lastChild.style.display="";	
		}else{
			// Pause
			Controller.Memory.timers[timer.id].pause=Controller.Memory.timers[timer.id].end - new Date().getTime();
			Controller.Memory.timers[timer.id].end=0;
			chrome.alarms.clear(timer.id.toString());
			// Redraw start
			document.getElementById('start-'+timer.id).firstChild.style.display="";
			document.getElementById('start-'+timer.id).lastChild.style.display="none";
		}
		
		Controller.Clock.start();
		
		//save
		Controller.Memory.save();
	},
	stop:function(){
		var timer=this.parentNode.parentNode;
		var time=timer.querySelector('.time');
		Controller.Memory.timers[timer.id].start=0;
		Controller.Memory.timers[timer.id].end=0;
		Controller.Memory.timers[timer.id].pause=0;
		time.innerHTML=Controller.Memory.convertTime(Controller.Memory.timers[timer.id].time);
		// Stop alarm
		chrome.alarms.clear(timer.id.toString());

		// Save
		Controller.Memory.save();

		// Clear input log
		Interface.time[timer.id].input="";

		// Redraw start
		document.getElementById('start-'+timer.id).firstChild.style.display="";
		document.getElementById('start-' + timer.id).lastChild.style.display = "none";
	},
	option:function(){
		var timer=this.parentNode.parentNode;
		var note=timer.querySelector('.note');
		var op=timer.querySelector('.options');
		timer.style.webkitTransform="rotateX( 1deg )";
		setTimeout(function(){
			timer.style.webkitTransform="rotateX( -93deg )";
		},10);
		setTimeout(function(){
			op.style.display="block";
			note.contentEditable="true";
			note.style.webkitUserSelect="text";
			timer.style.webkitTransform="rotateX( 0deg )";
		}, 500);
	},
	option_save:function(){
		var timer=this.parentNode.parentNode;
		var note=timer.querySelector('.note');
		var op=timer.querySelector('.options');
		var id=timer.id;

		Controller.Memory.timers[id].note=note.innerHTML;
		Controller.Memory.timers[id].note=Controller.Memory.timers[id].note.replace(/\s+/g, '  ');
		Controller.Memory.save();

		timer.style.webkitTransform="rotateX( 1deg )";
		setTimeout(function(){
			timer.style.webkitTransform="rotateX( -93deg )";
		},10);
		setTimeout(function(){
			op.style.display="none";
			note.contentEditable="false";
			note.style.webkitUserSelect="none";
			timer.style.webkitTransform="rotateX( 0deg )";
		},500);

	},
	timerRemove:function(){
		// get id
		id=this.id.split("-");
		id=id[1];
		// remove object
		Controller.Memory.deleteTimer(id);
		// remove the interface
		var timer=this.parentNode.parentNode;
		timer.style.webkitTransform="rotateY( 1deg )";
		setTimeout(function(){
			timer.style.webkitTransform="rotateY( -100deg )";
		},100);
		setTimeout(function(){
			timer.parentNode.parentNode.removeChild(timer.parentNode);
		},600);
		// at least one timer all the time :)
		if (Object.keys(Controller.Memory.timers).length<1){
				setTimeout(Interface.timerAdd,600);
			}
		
	},
	updateTime:function(t){
		var time_div=document.getElementById(t.id);
		
		if (t.end == 0) {
		    // Redraw start
			document.getElementById('start-'+t.id).firstChild.style.display="";
			document.getElementById('start-'+t.id).lastChild.style.display="none";
			return false;
		}
		var time=time_div.querySelector('.time');
		if (t.pause===0) {
			if(t.start==t.end)
				diff=new Date().getTime() - t.start;
				else diff=t.end - new Date().getTime();
		}
		else diff=t.pause;
		if (diff>=0) time.innerHTML=Controller.Memory.convertTime(diff);
	},
	loadTimers:function(){
		timers=Controller.Memory.timers;
		for (var id in timers)
			{
				Interface.timerAdd(id);
			}
	},
	inputListener:function(key){
	    if (this.querySelector('.options').style.display == "block") {
			// option page (set comment)
			// enter
			if(key.keyCode==13){
				event.preventDefault();
				var t = document.createEvent("SVGEvents");
				t.initEvent("click",true,true);
				document.getElementById('timer-'+this.id).dispatchEvent(t);
			}
			return false;
	    }
	    if (this.querySelector('.note_edit.active') != null) {
	        //edit note
	        // enter
	        if (key.keyCode == 13) {
	            event.preventDefault();
	            this.querySelector('.note_edit.active').className = "note_edit";
	            var noteContent = this.querySelector('.note_edit span').innerHTML;
	            var id = this.id;

	            this.querySelector('.note_edit span').contentEditable = "false";
	            this.querySelector('.note').innerHTML = noteContent;
	            Controller.Memory.timers[id].note = noteContent;
	            Controller.Memory.timers[id].note = Controller.Memory.timers[id].note.replace(/\s+/g, '  ');
	            Controller.Memory.save();
	            
	        }

	        //if (key.keyCode != 8 && this.querySelector('.note_edit.active span').textContent.length > 31) { // fix! exception!!!!!!!!!!!!!!!!
	        //    event.preventDefault();
	        //}
	        return false;
	    }
	   


		var time=this.querySelector('.time');
		var c=String.fromCharCode((96 <= key.keyCode && key.keyCode <= 105)? key.keyCode-48 : key.keyCode);

		// Navigate
		// Up
		if(key.keyCode==38 && this.parentNode.previousSibling){
			this.parentNode.previousSibling.firstChild.focus();
		}
		// Down
		if(key.keyCode==40 && this.parentNode.nextSibling){
			this.parentNode.nextSibling.firstChild.focus();
		}

		// Enter / Start
		if(key.keyCode==13 || key.keyCode==39){
			var t = document.createEvent("SVGEvents");
			t.initEvent("click",true,true);
			document.getElementById('start-'+this.id).dispatchEvent(t);
		}

		// Stop
		if(key.keyCode==37){
			var t = document.createEvent("SVGEvents");
			t.initEvent("click",true,true);
			document.getElementById('stop-'+this.id).dispatchEvent(t);
		}

		// Option insert
		if(key.keyCode==45){
			var t = document.createEvent("SVGEvents");
			t.initEvent("click",true,true);
			document.getElementById('add').dispatchEvent(t);
		}

		// Option remove
		if(key.keyCode==46){
			var t = document.createEvent("SVGEvents");
			t.initEvent("click",true,true);
			document.getElementById('remove-'+this.id).dispatchEvent(t);
			if(this.parentNode.nextSibling)
				this.parentNode.nextSibling.firstChild.focus();
			else this.parentNode.previousSibling.firstChild.focus();
		}

		// Block if timer is running;
		if (Controller.Memory.timers[this.id].end!=0) return false;

		// Wheel Control
		if(key.wheelDelta){
			console.log(key);
			var ms=0;
			if(145<=key.x && key.x<=165) ms=1000;
			if(115<=key.x && key.x<=130) ms=60000;
			if(85<=key.x && key.x<=110) ms=3600000;
			if(40<=key.x && key.x<=80) ms=86400000;
			new_time=Interface.time[this.id].time+(key.wheelDelta/120)*ms;
			if(new_time>=0){
				Interface.time[this.id].time=new_time;
				time.innerHTML=Controller.Memory.convertTime(new_time);
			}	
		}

		// delete
		if(key.keyCode==8){
			event.preventDefault();
			Interface.time[this.id].input=Interface.time[this.id].input.substr(0,Interface.time[this.id].input.length-1);
			Interface.time[this.id].time=Controller.Memory.parseTime(Interface.time[this.id].input);
			time.innerHTML=Controller.Memory.convertTime(Interface.time[this.id].time);
		}

		// filter non valid keys
		var is_valid=/([0-9]|n|½)/g;
		var pattern=/^\d{0,4}n?\d{0,2}n?\d{0,2}n?\d{0,2}$/;
		if (!pattern.test(Interface.time[this.id].input+c) || !is_valid.test(c)) return false;

		// display time
		// log input
		Interface.time[this.id].input+=c;
		// parse to ms
		Interface.time[this.id].time=Controller.Memory.parseTime(Interface.time[this.id].input);
		time.innerHTML=Controller.Memory.convertTime(Interface.time[this.id].time);
	}
}