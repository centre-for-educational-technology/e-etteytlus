function table_sort_utility(el, selector) {
	var break_name = el.tagName;
	var children = el.querySelectorAll(selector);
	var good = [];
	for (var i = 0; i < children.length; i++) {
		var parent = children[i];
		while (parent.tagName != break_name) parent = parent.parentNode;
		if (parent == el) good.push(children[i]);
	}
	return good;
}

function table_sort(el) {
	var asc = 1;
	if (el.hasAttribute("data-ascending")) {
		el.removeAttribute("data-ascending");
		el.innerHTML = "&#9660;";
		asc = -1;
	} else {
		el.setAttribute("data-ascending", "");
		el.innerHTML = "&#9650;";	
	}
		
	while (el.tagName != "TH") el = el.parentNode;
	var table = el; while (table.tagName != "TABLE") table = table.parentNode;

	var rows = table_sort_utility(table, "tr");
	var headers = table_sort_utility(table, "th");	
	rows.shift();
	var nth = headers.indexOf(el);
	
	for (var i = 0; i < rows.length; i++) {
		var cells = table_sort_utility(rows[i], "td");
		rows[i] = {"el":rows[i], "v":cells[nth].innerHTML};
		table.removeChild(rows[i].el);
	}
	
	rows.sort(function(a, b) {return a.v > b.v ? asc : -asc});
	
	for (var i = 0; i < rows.length; i++) {
		table.appendChild(rows[i].el);
	}
}

function table_search(el) {
	var header = el; while (header.tagName != "TH") header = header.parentNode;
	var table = el; while (table.tagName != "TABLE") table = table.parentNode;
	var rows = table_sort_utility(table, "tr");
	var headers = table_sort_utility(table, "th");	
	rows.shift();
	var nth = headers.indexOf(header);
	var test = new RegExp(el.value.length ? el.value : ".");

	for (var i = 0; i < rows.length; i++) {
		var sample = table_sort_utility(rows[i], "td")[nth].innerHTML;
		if (test.test(sample)) {
			rows[i].removeAttribute("data-hidden");
		} else {
			rows[i].setAttribute("data-hidden", "");
		}
	}
}

function table_sort_register_header(el) {
	addClass(el, "sortable");
	
	var asc = document.createElement("div");
	asc.innerHTML = "&#9650;";
	asc.className = "ascdesc";
	asc.setAttribute("data-ascending", "");
	asc.addEventListener("mouseup", function(e){ table_sort(e.target); });
	el.appendChild(asc);
	
	var search = document.createElement("input");
	search.type="text";
	search.className = "search";
	search.addEventListener("mouseout", function(e) {
		if (this.src.value.length) return;
		this.el.removeAttribute("data-searchable");
	}.bind({"el":el, "src":search}));
	search.addEventListener("keyup", function(e) { table_search(e.target) });
	el.appendChild(search);
	
	
	el.addEventListener("mouseup", function(e){ 
		var header = e.target; while (header.tagName != "TH") header = header.parentNode;
		header.setAttribute("data-searchable", "");
	});
}

onLoad(function() {
	var sortable = document.querySelectorAll("[data-table-sorter]");
	for (i = 0; i < sortable.length; i++) {
		table_sort_register_header(sortable[i]);
	}

});