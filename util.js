function isdef(x) { return typeof x !== 'undefined'; }
function select(q) { return document.querySelector(q); }
function onLoad(callback) { window.addEventListener("load", callback, false); }
function toArr(collection) { let arr = []; for (let i = 0; i < collection.length; i++) { arr.push(collection[i]); } return arr; }
function remClass(el, className) { el.className = (" " + el.className + " ").replace(" " + className + " ", "").replace("  ", " "); }
function addClass(el, className) { remClass(el, className); el.className += " " + className; }
function setState(el, state) { el.setAttribute("data-state", state); }





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
