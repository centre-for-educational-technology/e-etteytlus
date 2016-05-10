//verifies form
function formVerify(form) {
	let patternCapable = form.querySelectorAll("[data-pattern]");
	for (let i = 0; i < patternCapable.length; i++) {
		if (patternCapable[i].hasAttribute("data-invalid")) return false;
	}
	return true;
}

//gets form data as object
function formData(form) {
	let obj = {};
	let inputs = form.querySelectorAll("input");
	for (let i = 0; i < inputs.length; i++) {
		switch (inputs[i].type) {
			case "checkbox":
				obj[inputs[i].name] = inputs[i].checked; break;
			case "radio":
				if (inputs[i].checked) obj[inputs[i].name] = inputs[i].value; break;
			default:
				obj[inputs[i].name] = inputs[i].value;
		}
	}
	
	inputs = form.querySelectorAll("textarea");
	for (let i = 0; i < inputs.length; i++) {
		obj[inputs[i].name] = inputs[i].value;
	}
	
	inputs = form.querySelectorAll("select");
	for (let i = 0; i < inputs.length; i++) {
		obj[inputs[i].name] = inputs[i].childNodes[inputs[i].selectedIndex].value;
	}

	return obj;
}

//gets state targets which is the element itself + labels for element
function getFormElementTargets(el) {
	let targets = [el];
	if (!el.id.length) return targets;
	return targets.concat(toArr(document.querySelectorAll('label[for="' + el.id + '"]')));
}

//attribute wireup for form elements
onLoad(function() {	
	//data-empty wireup
	let emptyListener = function(source, targets) {
		if (source.value.length) for (let i = 0; i < targets.length; i++) targets[i].removeAttribute("data-empty");
		else for (let i = 0; i < targets.length; i++) targets[i].setAttribute("data-empty", "");
	}
	
	let emptyCapable = document.querySelectorAll("input, textarea");
	for (let i = 0; i < emptyCapable.length; i++) {
		let func = function() { emptyListener(emptyCapable[i], getFormElementTargets(emptyCapable[i])); };
		emptyCapable[i].addEventListener("keyup", func);
		func();
	}
	
	//data-pattern, data-valid, data-invalid wireup
	let patternListener = function(source, targets) {
		let pattern = source.getAttribute("data-pattern");
		if (!pattern) return;
		if ((new RegExp(pattern)).test(source.value)) {
			for (let i = 0; i < targets.length; i++) {
				targets[i].removeAttribute("data-invalid");
				targets[i].setAttribute("data-valid", "");
			}
		} else {
			for (let i = 0; i < targets.length; i++) {
				targets[i].removeAttribute("data-valid");
				targets[i].setAttribute("data-invalid", "");
			}
		}
	}
	
	let patternCapable = emptyCapable;
	for (let i = 0; i < patternCapable.length; i++) {
		let func = function() { patternListener(patternCapable[i], getFormElementTargets(patternCapable[i])); };
		patternCapable[i].addEventListener("keyup", func);
		func();
	}
	
	//data-hover wireup
	let hoverOverListener = function(targets) {
		for (let i = 0; i < targets.length; i++) targets[i].setAttribute("data-hover", "");
	}
	let hoverOutListener = function(targets) {
		for (let i = 0; i < targets.length; i++) targets[i].removeAttribute("data-hover");
	}
	
	let hoverCapable = document.querySelectorAll("input, textarea, select");
	for (let i = 0; i < hoverCapable.length; i++) {
		let targets = getFormElementTargets(hoverCapable[i]);
		for (let j = 0; j < targets.length; j++) {
			targets[j].addEventListener("mouseover", function() { hoverOverListener(targets); });
			targets[j].addEventListener("mouseout", function() { hoverOutListener(targets); });
		}	
	}
	
	//data-focus wireup
	let focusInListener = function(targets) {
		for (let i = 0; i < targets.length; i++) targets[i].setAttribute("data-focus", "");
	}
	let focusOutListener = function(targets) {
		for (let i = 0; i < targets.length; i++) targets[i].removeAttribute("data-focus");
	}
	
	let focusCapable = hoverCapable;
	for (let i = 0; i < focusCapable.length; i++) {
		let targets = getFormElementTargets(focusCapable[i]);	
		focusCapable[i].addEventListener("focusin", function() { focusInListener(targets); });
		focusCapable[i].addEventListener("focusout", function() { focusOutListener(targets); });
	}
});