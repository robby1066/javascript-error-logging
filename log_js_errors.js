// logging function that will trap javascript errors and report them with a tracking pixel
var log_js_errors = {
		'pixel_path': '/track/event.gif',
		'is_loaded': false, // flag to let us know it's safe to log errors.
		'errors': [],
		'error_count': 0,
		'max_errors': 10, // prevent runaway logging for infinite loops
		'init': function() {
			// only render pixels after the dom is available
			var loaded = function() {  
				log_js_errors.is_loaded = true;   
				log_js_errors.report_errors();  
			};
			if (document.addEventListener) {
				window.addEventListener('load',loaded,false);
			} else if  (document.attachEvent) {
				window.attachEvent("onload", loaded);
			}
			window.onerror = function(msg, url, line) { 
				log_js_errors.log_error(msg,url,line); return false; 
			};
		},
		'log_error': function(msg,url,line) {
			// save the errors to an array, this will be emptied out when the page is fully loaded.
			if (msg !== undefined && url !== undefined && this.error_count < this.max_errors) {
				this.error_count++;
				// build the url for the pixel
				var track_url = this.pixel_path;
				track_url += '?category=browser-errors&action='+escape(msg);
				track_url += '&jsurl='+escape(url);
				track_url += '&line='+escape(line);
				track_url += '&error_count='+this.error_count;
				track_url += '&t='+(new Date()).getTime();
				this.errors.push(track_url);
				// if it's safe to render the pixel, render it. Otherwise, wait a bit
				if (this.is_loaded == true) {
					this.report_errors();
				}
			}
		},
		'report_errors': function() {
			// loop through the errors array and render pixels for each one
			while(this.errors.length > 0) {
				var track_img = document.createElement('img');
				track_img.src = this.errors.shift();
				track_img.height = '1';
				track_img.width = '1';
				document.getElementsByTagName('body')[0].appendChild(track_img);
			}
		}
	}
	log_js_errors.init();