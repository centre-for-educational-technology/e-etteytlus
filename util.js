function isdef(x) { return typeof x !== 'undefined'; }
function select(q) { return document.querySelector(q); }
function onLoad(callback) { window.addEventListener("load", callback, false); }
function toArr(collection) { var arr = []; for (var i = 0; i < collection.length; i++) { arr.push(collection[i]); } return arr; }
function remClass(el, className) { el.className = (" " + el.className + " ").replace(" " + className + " ", "").replace("  ", " "); }
function addClass(el, className) { remClass(el, className); el.className += " " + className; }
function setState(el, state) { el.setAttribute("data-state", state); }
function pad0(s, len) { s = "" + s; while (s.length < len) s = "0" + s; return s; }
function unixTime() { return Math.floor(Date.now() / 1000); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }


function ajax(method, obj, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
			console.log("RESPONSE: " + request.responseText);
            if (isdef(callback)) callback(JSON.parse(request.responseText));
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
			setTimeout(cdf, 1000);
		}
		cdf();
	});
});