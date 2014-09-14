(function (window, document) {
    /*name: CountDown options controller
    author: Alexander Borsevici*/

    // Background Controller
    var Controller;
    chrome.runtime.getBackgroundPage(function(page){Controller=page;Option.init();});

    // Options Controller
    var Option={
	    id:0,
	    init: function () {
	        Template.render();
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

    // tiny template for i18 purposes
    var Template = {
        data:{
                version: chrome.runtime.getManifest().version,
                manifest_descr: chrome.i18n.getMessage("manifest_descr")
        },
        render: function () {
            String.prototype.supplant = function (o) {
                return this.replace(/{([^{}]*)}/g,
                  function (a, b) {
                      var r = o[b];
                      return typeof r === 'string' ? r : a;
                  }
                );
            };

            var target = document.getElementById('layout');
            var template = target.innerHTML;

            target.innerHTML = template.supplant(this.data);
        }
    }

    var layout = document.getElementById('layout'),
        menu = document.getElementById('menu'),
        menuLink = document.getElementById('menuLink');

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/),
            length = classes.length,
            i = 0;

        for (; i < length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                break;
            }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }

    menuLink.onclick = function (e) {
        var active = 'active';

        e.preventDefault();
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    };

    


}(this, this.document));