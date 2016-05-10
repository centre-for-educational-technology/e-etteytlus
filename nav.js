function getNavHierarchy(el) {
	let navNodes = [];																											//gather returning nodes in ordered array
	let pile = toArr(el.childNodes);																							//current pile of DOM children
	let nextPile = [];																											//next pile of DOM children
	while (pile.length) {																										
		for (let i = 0; i < pile.length; i++) {																					//Walk the DOM hierarchy of provided root until
			if (!isdef(pile[i].hasAttribute)) continue;																			//the next nav node is encountered
			if (pile[i].hasAttribute("data-nav")) navNodes.push({ "el":pile[i], "name":pile[i].getAttribute("data-nav") });		//don't walk any further there and add to list
			else nextPile = nextPile.concat(toArr(pile[i].childNodes));
		}
		pile = nextPile;
		nextPile = [];
	}

	let ret = {};																												//use the ordering for figuring
	for (let i = 0; i < navNodes.length; i++) {																					//out before/after siblings
		let node = navNodes[i];																									//and then convert the array to an object
		node["childNodes"] = getNavHierarchy(navNodes[i].el);																	//with nav names serving as keys
		node["siblingsBefore"] = navNodes.slice(0, i);
		node["siblingsAfter"] = navNodes.slice(i + 1, navNodes.length);	
		ret[node.name] = node;	
	}
	return ret;
}

//navigates between various static elements
function navigate() {			
	let el = select('[data-nav="' + arguments[0] + '"]').parentNode;																	
	while (el.parentNode && !el.hasAttribute("data-nav")) el = el.parentNode;
	let root = getNavHierarchy(el)[arguments[0]];		
	let node = undefined;
	for (let i = 0; i < arguments.length; i++) {
		node = node ? node.childNodes[arguments[i]] : root;
		node.el.setAttribute("data-navState", "visible");	
		for (let i = 0; i < node.siblingsBefore.length; i++) node.siblingsBefore[i].el.setAttribute("data-navState", "hiddenBefore");
		for (let i = 0; i < node.siblingsAfter.length; i++) node.siblingsAfter[i].el.setAttribute("data-navState", "hiddenAfter");	
	}
	let check = select('[data-navFor="' + arguments[0] + '"]');
	if (check) {
		let uncheck = document.querySelectorAll('[data-navFor]');
		for (let i = 0; i < uncheck.length; i++) uncheck[i].removeAttribute("data-checked");
		check.setAttribute("data-checked", "");
	}
	navigate.last = (new Date()).getTime();
}

function navigateAuto(delay) {
	let issued = (new Date()).getTime();
	let args = toArr(arguments).slice(1);
	setTimeout(function() {
		if (!isdef(navigate.last) || navigate.last < (issued + 10)) navigate.apply(null, args);
	}, delay);
}

onLoad(function() {																												//hook up data-navButton's
	let buttons = document.querySelectorAll("[data-navFor]");
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("mouseup", function(){navigate(buttons[i].getAttribute("data-navFor"));});
	}
});