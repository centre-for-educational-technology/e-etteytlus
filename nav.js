function getNavHierarchy(el) {
	var navNodes = [];																											//gather returning nodes in ordered array
	var pile = toArr(el.childNodes);																							//current pile of DOM children
	var nextPile = [];																											//next pile of DOM children
	while (pile.length) {																										
		for (var i = 0; i < pile.length; i++) {																					//Walk the DOM hierarchy of provided root until
			if (!isdef(pile[i].hasAttribute)) continue;																			//the next nav node is encountered
			if (pile[i].hasAttribute("data-nav")) navNodes.push({ "el":pile[i], "name":pile[i].getAttribute("data-nav") });		//don't walk any further there and add to list
			else nextPile = nextPile.concat(toArr(pile[i].childNodes));
		}
		pile = nextPile;
		nextPile = [];
	}

	var ret = {};																												//use the ordering for figuring
	for (var i = 0; i < navNodes.length; i++) {																					//out before/after siblings
		var node = navNodes[i];																									//and then convert the array to an object
		node["childNodes"] = getNavHierarchy(navNodes[i].el);																	//with nav names serving as keys
		node["siblingsBefore"] = navNodes.slice(0, i);
		node["siblingsAfter"] = navNodes.slice(i + 1, navNodes.length);	
		ret[node.name] = node;	
	}
	return ret;
}

//navigates between various static elements
function navigate() {			
	var el = select('[data-nav="' + arguments[0] + '"]').parentNode;																	
	while (el.parentNode && !el.hasAttribute("data-nav")) el = el.parentNode;
	var root = getNavHierarchy(el)[arguments[0]];		
	var node = undefined;
	for (var i = 0; i < arguments.length; i++) {
		node = node ? node.childNodes[arguments[i]] : root;
		node.el.setAttribute("data-navState", "visible");	
		for (var i = 0; i < node.siblingsBefore.length; i++) node.siblingsBefore[i].el.setAttribute("data-navState", "hiddenBefore");
		for (var i = 0; i < node.siblingsAfter.length; i++) node.siblingsAfter[i].el.setAttribute("data-navState", "hiddenAfter");	
	}
	var check = select('[data-navFor="' + arguments[0] + '"]');
	if (check) {
		var uncheck = document.querySelectorAll('[data-navFor]');
		for (var i = 0; i < uncheck.length; i++) uncheck[i].removeAttribute("data-checked");
		check.setAttribute("data-checked", "");
	}
	navigate.last = (new Date()).getTime();
}

function navigateAuto(delay) {
	var issued = (new Date()).getTime();
	var args = toArr(arguments).slice(1);
	setTimeout(function() {
		if (!isdef(navigate.last) || navigate.last < (issued + 10)) navigate.apply(null, args);
	}, delay);
}


onLoad(function() {																												//hook up data-navButton's
	var buttons = document.querySelectorAll("[data-navFor]");
	Array.prototype.forEach.call(buttons, function(button) {
		button.addEventListener("mouseup", function(){ navigate(button.getAttribute("data-navFor")); });
	});
});