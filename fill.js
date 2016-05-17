//	utility for auto filling html elements 

//	general guidelines:
//	single and double quotes are interchangeable
//	quotes necessary when value contains spaces 
//	spaces outside quotes are ignored
//	line breaks and tabs are ignored
//	use comma to separate array values
//	escape character may be used inside quotes
//	currently supported operators: =, <, >
//	currently supported function names: only window["function_name"] accessible

//	$attribute
//	is replaced with parent query attribute by the same name
//	usage: data-fill-where = 'parent_id = $id'
//	resolved data provider side

//	data-fill-table
//	determines the table name
//	usage: data-fill-table = 'table name'
//	required, inherited

//	data-fill-where
//	determines selection filter
//	usage: data-fill-where = '"column name 1" = "value", "column name 2" > "value", ...'
//	required, inherited

//	data-fill-error
//	determines the js function name to handle error
//	usage: data-fill-error = 'functino_name'
//	default = none
//	argument passed to function: js object - { "result" : "result name", "arg" : "result arg", "error" : "DataSource error message" }
//	function return value: none
//	inherited

//	data-fill-columns
//	determines the required columns from the table
//	usage: data-fill-columns = '"column name 1", "column name 2", ...'
//	required for output

//	data-fill-table-columns
//	used on table row header, generates table cells in the table
//	usage: data-fill-table-columns = '"column name 1", "column name 2", ...'
//	required for output

//	data-fill-columns-silent, data-fill-table-columns-silent
//	same as non-silent versions except they also cause data-fill-targets = "none"
//	useful for providing a parent element
//	usage: data-fill-columns = '"column name 1", "column name 2", ...' 

//	data-fill-targets
//	determines the attributes to be filled
//	usage: data-fill-target = 'value, innerHTML'
//	default = innerHTML

//	data-fill-interpreter
//	determines the js function name to interpret the columns into fill value
//	usage: data-fill-interpreter = 'function name'
//	default = first required column value
//	argument passed to function: js object - { "required column 1" : "value", "required column 2", "value", ... } or [{...}, {...}, ...]
//	function return value: value used to fill

//	data-fill-on-rowclick
//	determines the js function name to trigger on clicking a table row
//	usage: data-fill-on-rowclick = 'function name'
//	default = none
//	argument passed to function: js object - { "required column 1" : "value", "required column 2", "value", ... }
//	function return value: none
//	inherited

function data_fill_extract_args(s) {
	var quote = null;
	var captured = "";
	var escaped = false;
	var extracted = [];
	var operator = null;
	
	//line breaks and tabs
	s = s.replace(/\n|\r|\t/g, "");
	
	//tabs
	for (var i = 0; i < s.length; i++) {
		//handle escape
		if (s[i] == '\\') {
			if (escaped) captured += s[i];
			else escaped = true;
			continue;
		} else escaped = false;

		//handle space
		if (s[i] == ' ') {
			if (quote) captured += s[i];
			continue;
		}
		
		//handle comma
		if (s[i] == ',' && !quote) {
			if (operator) {
				operator.value.push(captured);
				extracted.push(operator);
			} else {
				extracted.push(captured);
			}		
			captured = "";
			operator = null;
			continue;
		}
		
		//handle quotes
		if (s[i] == quote) {
			quote = null;
			continue;
		}
		if (s[i] == '\'' || s[i] == '"') {
			if (!quote && !escaped) quote = s[i];
			else captured += s[i];
			continue;
		}
		
		//handle operators
		if (!quote && s[i] == "=" || s[i] == ">" || s[i] == "<") {
			operator = { "key": captured, "value":[ s[i] ] };
			captured = "";
			continue;
		}
		
		//regular characters
		captured += s[i];
		
	}
	
	//last capture
	if (captured.length) {
		if (operator) {
			operator.value.push(captured);
			extracted.push(operator);
		} else {
			extracted.push(captured);
		}	
	}
	
	return extracted;
}

function data_fill_get_nodes_hierarchial(el, parent, ido) {
	var node = {"element" : el, "parent" : parent, "children" : [], "id" : ido[0]++, "parent_id" : parent.id};
	
	if (el.hasAttribute("data-fill-table")) {
		node["table"] = el.getAttribute("data-fill-table");
	} else {
		node["table"] = parent.table;
	}
	
	if (el.hasAttribute("data-fill-where")) {
		var arr_where = data_fill_extract_args(el.getAttribute("data-fill-where"));
		node["where"] = {};
		for (var i = 0; i < arr_where.length; i++) {
			node["where"][arr_where[i].key] = arr_where[i].value;
		}
	} else {
		node["where"] = parent.where;
	}
	
	if (el.hasAttribute("data-fill-error")) {
		node["error"] = window[el.getAttribute("data-fill-error")];
	} else {
		node["error"] = parent.error;
	}
	
	if (el.hasAttribute("data-fill-columns")) {
		node["columns"] = data_fill_extract_args(el.getAttribute("data-fill-columns"));
	}
	
	if (el.hasAttribute("data-fill-table-columns")) {
		node["table_columns"] = data_fill_extract_args(el.getAttribute("data-fill-table-columns"));
		var seek = el;
		while (seek.parentElement && seek.tagName != "TABLE") seek = seek.parentElement;
		node["table_element"] = seek;
	}
	
	if (el.hasAttribute("data-fill-targets")) {
		node["targets"] = data_fill_extract_args(el.getAttribute("data-fill-targets"));
	} else {
		node["targets"] = ["innerHTML"];
	}
	
	if (el.hasAttribute("data-fill-columns-silent")) {
		node["columns"] = data_fill_extract_args(el.getAttribute("data-fill-columns-silent"));
		node["targets"] = ["none"];
	}
	
	if (el.hasAttribute("data-fill-table-columns-silent")) {
		node["table_columns"] = data_fill_extract_args(el.getAttribute("data-fill-table-columns-silent"));
		var seek = el;
		while (seek.parentElement && seek.tagName != "TABLE") seek = seek.parentElement;
		node["table_element"] = seek;
		node["targets"] = ["none"];
	}

	if (el.hasAttribute("data-fill-interpreter")) {
		node["interpreter"] = window[el.getAttribute("data-fill-interpreter")];
	} else {
		if (isdef(node["columns"])) {
			node["interpreter"] = function(row) { return row[this.columns[0]]; }.bind(node);
		} else {
			node["interpreter"] = function(row) { return row[this.table_columns[0]]; }.bind(node);
		}
	}
	
	if (el.hasAttribute("data-fill-on-rowclick")) {
		node["on_rowclick"] = window[el.getAttribute("data-fill-on-rowclick")];
	} else {
		node["on_rowclick"] = parent.on_rowclick;
	}
	
	for (var i = 0; i < el.childNodes.length; i++) {
		if (!isdef(el.childNodes[i].hasAttribute)) continue;
		var children = data_fill_get_nodes_hierarchial(el.childNodes[i], node, ido);
		for (var j = 0; j < children.length; j++) {
			node.children.push(children[j]);		
		}
	}
	
	if (isdef(node.columns) || isdef(node.table_columns)) return [node];
	for (var i = 0; i < node.children.length; i++) {
		node.children[i].parent_id = parent.id;
	}
	return node.children;
}

function data_fill_get_nodes(el) {
	var flatten_me = data_fill_get_nodes_hierarchial(el, { "error" : function(){}, "id" : 0, "on_rowclick" : null }, [1]);	
	for (var i = 0; i < flatten_me.length; i++) {
		flatten_me = flatten_me.concat(flatten_me[i].children);
	}	
	return flatten_me;
}

function data_fill_targets(el, value, targets) {
	for (var i = 0; i < targets.length; i++) {
		if (targets[i] == "innerHTML") {
			el.innerHTML = value;
		} else if (targets[i] == "none") {
		
		} else {
			el.setAttribute(targets[i], value);
		}			
	}
}

function data_fill(el) {
	var nodes = data_fill_get_nodes(el);
	if (!nodes.length) return;

	var errors = [];
	var by_query = {};
	for (var i = 0; i < nodes.length; i++) {
		var key = JSON.stringify([nodes[i].table, nodes[i].where]);
		if (!isdef(by_query[key])) {
			by_query[key] = [];
		}
		by_query[key].push(nodes[i]);
		if (errors.indexOf(nodes[i].error) == -1) {
			errors.push(nodes[i].error);
		}
	}
	
	var queries = [];
	var queries_cells = []
	for (var key in by_query) {
		var cells = by_query[key];
		var query = {"table" : cells[0].table, "where" : cells[0].where, "columns" : [], "id" : cells[0].id, "parent_id" : cells[0].parent_id};
		var query_cells = [];
		for (var i = 0; i < cells.length; i++) {
			query_cells.push(cells[i]);
			if (isdef(cells[i].columns)) {
				for (var j = 0; j < cells[i].columns.length; j++) {
					var col = cells[i].columns[j];
					if (query.columns.indexOf(col) == -1) {
						query.columns.push(col);
					}
				}
			}
			if (isdef(cells[i].table_columns)) {
				for (var j = 0; j < cells[i].table_columns.length; j++) {
					var col = cells[i].table_columns[j];
					if (query.columns.indexOf(col) == -1) {
						query.columns.push(col);
					}
				}
			}
		}
		queries.push(query);
		queries_cells.push(query_cells);
	}
	
	ajax("db_select", queries, function(r) {
		var tables = [];

		for (var i = 0; i < r.length; i++) {
			var table = null;
			for (var j = 0; j < queries_cells[i].length; j++) {
				var key = queries[i].columns[j];
				var cell = queries_cells[i][j];
				
				if (isdef(cell.columns)) {
					var value = r[i].length > 1 ? cell.interpreter(r[i]) : cell.interpreter(r[i][0]);
					data_fill_targets(cell.element, value, cell.targets);
				}
					
				if (isdef(cell.table_columns)) {
					if (!table) table = {"element" : cell.table_element, "on_rowclick" : cell.on_rowclick, "rows" : [], "arg_rows" : r[i]};
					for (var k = 0; k < r[i].length; k++) {					
						var value = cell.interpreter(r[i][k]);
						
						if (!isdef(table.rows[k])) table.rows[k] = [];
						table.rows[k].push({"value" : value, "targets" : cell.targets});				
					}
				}
				
			}
			if (table) tables.push(table);
		}

		for (var i = 0; i < tables.length; i++) {
			var table = tables[i].element;
			var remove = table.querySelectorAll("[data-fill-dynamic-row]");
			for (var j = 0; j < remove.length; j++) {
				table.removeChild(remove[j]);
			}

			for (var j = 0; j < tables[i].rows.length; j++) {
				var ro = {};
				var tr = document.createElement("tr");
				tr.setAttribute("data-fill-dynamic-row", "");
				table.appendChild(tr);
				
				if (tables[i].on_rowclick) {
					var obj = {"on_rowclick" : tables[i].on_rowclick, "row" : tables[i].arg_rows[j]};
					tr.addEventListener("mouseup", function() { this.on_rowclick(this.row); }.bind(obj) );
				}
				
				for (var k = 0; k < tables[i].rows[j].length; k++) {
					if (tables[i].rows[j][k].targets[0] == "none") continue;
					var td = document.createElement("td");
					tr.appendChild(td);
					data_fill_targets(td, tables[i].rows[j][k].value, tables[i].rows[j][k].targets);
				}
			}
		}
	}, function(r) {
		for (var i = 0; i < errors.length; i++) {
			errors[i](r);
		}
	}, 5000);
}














