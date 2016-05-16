//	utility for navigating

//	data-nav
//	triggers navigate(element.getAttribute("data-nav"))
//	usage: data-nav="#my_container"
//	static

//	navigate(selector, set_attributes)
//	navigates to selected container by setting data-nav-state visible
//	sets all sibling containers either hiddenBefore or hiddenAfter, depending on order
//	optionally sets attributes of selected container as defined by set_attributes
//	triggers data_fill on selected container
//	argument:selector - standard DOM select syntax
//	argument:set_attributes - {"attribute_name_1": "value", ...}
//	usage: navigate("#my_container", {"className": "new_class"})

//	navigate_timeout(selector, set_attributes, delay)
//	triggers navigate() with given arguments after given delay
//	if another navigation occours before timeout, timeout is cancelled

//	navigate_register(element)
//	adds onmouseup handler to given element to trigger navigate(element.getAttribute("data-nav"))

function navigate_is_descendant(el, ancestor) {
	if (!el) return;
	var parent = el.parentNode;
	while (!parent) {
		if (parent == ancestor) return true;
		parent = parent.parentNode;
	}
	return false;
}

function navigate_is_same_hierarchy(el1, el2) {
	if (el1 == el2) return true;
	if (navigate_is_descendant(el1, el2)) return true;
	if (navigate_is_descendant(el2, el1)) return true;
	return false;
}

function navigate(selector, set_attributes) {	
	var el = select(selector);
	if (!el) return;
	var siblings = el.parentNode.childNodes;
	var before = true;
	for (var i = 0; i < siblings.length; i++) {
		var sibling = siblings[i];
		if (!isdef(sibling.setAttribute)) continue;
		if (sibling == el) {
			before = false;
			for (var key in set_attributes) {
				sibling.setAttribute(key, set_attributes[key]);
			}		
			data_fill(sibling);
			sibling.setAttribute("data-nav-state", "visible");
		} else if (before) {
			sibling.setAttribute("data-nav-state", "hiddenBefore");
		} else {
			sibling.setAttribute("data-nav-state", "hiddenAfter");
		}
	}
	
	var button = select('[data-nav="' + selector + '"]');
	if (button) {
		var buttons = document.querySelectorAll("[data-nav]");
		for (var i = 0; i < buttons.length; i++) {
			if (navigate_is_same_hierarchy(el, select(buttons[i].getAttribute("data-nav")))) {
				buttons[i].setAttribute("data-checked", "");
			} else { 
				buttons[i].removeAttribute("data-checked");
			}
		}
	}
	
	navigate.last = (new Date()).getTime();
}

function navigate_timeout(selector, set_attributes, delay) {
	var issued = (new Date()).getTime();
	var args = toArr(arguments).slice(1);
	setTimeout(function() {
		if (!isdef(navigate.last) || navigate.last < (issued + 10)) navigate(selector, set_attributes);
	}, delay);
}

function navigate_register(el) {
	el.addEventListener("mouseup", function(){ navigate(el.getAttribute("data-nav")); });
}

onLoad(function() {																												
	var buttons = document.querySelectorAll("[data-nav]");
	Array.prototype.forEach.call(buttons, function(button) {
		navigate_register(button);
	});
});