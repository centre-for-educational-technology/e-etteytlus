//verifies form
function formVerify(form) {
	var patternCapable = form.querySelectorAll("[data-pattern]");
	for (var i = 0; i < patternCapable.length; i++) {
		if (patternCapable[i].hasAttribute("data-invalid")) return false;
	}
	return true;
}

//gets form data as object
function formData(form) {
	var obj = {};
	var inputs = form.querySelectorAll("input, select, textarea");
	for (var i = 0; i < inputs.length; i++) {
		var val = "";
		switch (inputs[i].type) {
			case "checkbox":
				val = inputs[i].checked; break;
			case "radio":
				if (inputs[i].checked) val = inputs[i].value; break;
			default:
				val = inputs[i].value;
		}
		if (inputs[i].hasAttribute("data-old-value")) {
			if (inputs[i].getAttribute("data-old-value") != val) {
				obj[inputs[i].name] = val;
			}
		} else {
			obj[inputs[i].name] = val;
		}	
	}
	return obj;
}

function formReset(form) {
	var fields = form.querySelectorAll("input[data-old-value], textarea[data-old-value], select[data-old-value]");
	for (var i = 0; i < fields.length; i++) {
		switch (fields[i].type) {
			case "checkbox":
				fields[i].checked = fields[i].getAttribute("data-old-value"); break;
			case "radio":
				fields[i].checked = fields[i].getAttribute("data-old-value"); break;
			default:
				fields[i].value = fields[i].getAttribute("data-old-value");
		}		
	}
}

function formUnvalidate(form) {
	fields = form.querySelectorAll("*");
	for (var i = 0; i < fields.length; i++) {
		if (fields[i].hasAttribute("data-valid")) fields[i].removeAttribute("data-valid");
		if (fields[i].hasAttribute("data-invalid")) fields[i].removeAttribute("data-invalid");
	}
}

//gets state targets which is the element itself + labels for element
function getFormElementTargets(el) {
	var targets = [el];
	if (!el.id.length) return targets;
	return targets.concat(toArr(document.querySelectorAll('label[for="' + el.id + '"]')));
}

//attribute wireup for form elements
onLoad(function() {	
	//data-empty wireup
	var emptyListener = function(source, targets) {
		if (source.value.length) for (var i = 0; i < targets.length; i++) targets[i].removeAttribute("data-empty");
		else for (var i = 0; i < targets.length; i++) targets[i].setAttribute("data-empty", "");
	}
	
	var emptyCapable = document.querySelectorAll("input, textarea");
	Array.prototype.forEach.call(emptyCapable, function(el) {
		var func = function() { emptyListener(el, getFormElementTargets(el)); };
		el.addEventListener("keyup", func);
		func();
	});
	
	//data-pattern, data-valid, data-invalid wireup
	var patternListener = function(source, targets) {
		var pattern = source.getAttribute("data-pattern");
		if (!pattern) return;
		if ((new RegExp(pattern)).test(source.value)) {
			for (var i = 0; i < targets.length; i++) {
				targets[i].removeAttribute("data-invalid");
				targets[i].setAttribute("data-valid", "");
			}
		} else {
			for (var i = 0; i < targets.length; i++) {
				targets[i].removeAttribute("data-valid");
				targets[i].setAttribute("data-invalid", "");
			}
		}
	}
	
	var patternCapable = emptyCapable;
	Array.prototype.forEach.call(patternCapable, function(el) {
		var func = function() { patternListener(el, getFormElementTargets(el)); };
		el.addEventListener("keyup", func);
		func();
	});
	
	//data-hover wireup
	var hoverOverListener = function(targets) {
		for (var i = 0; i < targets.length; i++) targets[i].setAttribute("data-hover", "");
	}
	var hoverOutListener = function(targets) {
		for (var i = 0; i < targets.length; i++) targets[i].removeAttribute("data-hover");
	}
	
	var hoverCapable = document.querySelectorAll("input, textarea, select");
	Array.prototype.forEach.call(hoverCapable, function(el) {
		var targets = getFormElementTargets(el);
		for (var j = 0; j < targets.length; j++) {
			targets[j].addEventListener("mouseover", function() { hoverOverListener(targets); });
			targets[j].addEventListener("mouseout", function() { hoverOutListener(targets); });
		}	
	});
	
	//data-focus wireup
	var focusInListener = function(targets) {
		for (var i = 0; i < targets.length; i++) targets[i].setAttribute("data-focus", "");
	}
	var focusOutListener = function(targets) {
		for (var i = 0; i < targets.length; i++) targets[i].removeAttribute("data-focus");
	}
	
	var focusCapable = hoverCapable;
	Array.prototype.forEach.call(focusCapable, function(el) {
		var targets = getFormElementTargets(el);	
		el.addEventListener("focusin", function() { focusInListener(targets); });
		el.addEventListener("focusout", function() { focusOutListener(targets); });
	});
});