function isdef(x) { return typeof x !== 'undefined'; }
function safecall() { if (isdef(arguments[0])) { arguments[0].apply(this, Array.prototype.splice.call(arguments, 1));} }
function select(q) { return document.querySelector(q); }
function onLoad(callback) { window.addEventListener("load", callback, false); }
function toArr(collection) { var arr = []; for (var i = 0; i < collection.length; i++) { arr.push(collection[i]); } return arr; }
function remClass(el, className) { el.className = (" " + el.className + " ").replace(" " + className + " ", "").replace("  ", " "); }
function addClass(el, className) { remClass(el, className); el.className += " " + className; }
function setState(el, state) { el.setAttribute("data-state", state); }
function pad0(s, len) { s = "" + s; while (s.length < len) s = "0" + s; return s; }
function unixTime() { return Math.floor(Date.now() / 1000); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

//method = "method name"
//obj = {}, optional
//callback_success, callback_error = function, optional
//timeout_ms = integer, optional
function ajax(method, obj, callback_success, callback_error, timeout_ms) {
	//console.log("AJAX: " + method);
	if (!isdef(obj)) obj = {};
    var request = new XMLHttpRequest();
	var complete = false;
	
	if (isdef(timeout_ms)) {
		setTimeout(function() {
			if (complete) return;
			complete = true;
			safecall(callback_error, {"result":"error_timeout"});
		}, timeout_ms);
	}
	
    request.onreadystatechange = function () {
		if (complete) return;
        if (request.readyState == 4 && request.status == 200) {
			console.log("RESPONSE: " + request.responseText);	
			complete = true;
			var obj;
			try {
				obj = JSON.parse(request.responseText);
			} catch(e) {
				safecall(callback_error, {"result":"error_json"});
			}
			if (!isdef(obj)) {
				safecall(callback_error, {"result":"error_json"});
			} else if (obj.result == "success") {
				if (isdef(obj.arg)) {
					obj = obj.arg;
				}
				safecall(callback_success, obj);
			} else {
				safecall(callback_error, obj);
			}
        } else if (request.status == 404) {
			complete = true;
			safecall(callback_error, {"result":"error_404"});
		}
    };
	
    request.open("POST", "ajax.php?method=" + method, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(obj));
}


//countdown doodad
onLoad(function() {
	var countdownCapable = document.querySelectorAll("[data-countdown-end]");
	Array.prototype.forEach.call(countdownCapable, function(el) {
		var cdf = function() {
			var timeNow = unixTime();
			var timeEnd = el.getAttribute("data-countdown-end");
			var timeLeft = timeEnd - timeNow;
			if (timeLeft < 1) {
				el.innerHTML = "Aeg Läbi";
			} else {
				var hrs = Math.floor(timeLeft / 3600);
				timeLeft -= hrs * 3600;
				var mins = Math.floor(timeLeft / 60);
				timeLeft -= mins * 60;
				el.innerHTML = pad0(hrs, 2) + ":" + pad0(mins, 2) + ":" + pad0(timeLeft, 2);
			}
			setTimeout(cdf, 100);
		}
		cdf();
	});
});

