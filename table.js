//table management thing


var tables = {};

var tableManager = function(el) {
	this.el = el;
	this.name = el.getAttribute("data-table");
	this.items = [];
	this.columns = [];
	
	
	//get event handlers
	this.onRowClick = function() {};
	if (el.hasAttribute("data-table-onRowClick")) {
		eval("this.onRowClick = " + el.getAttribute("data-table-onRowClick"));
	}
	
	//get tracked columns
	var headers = this.el.querySelectorAll("th");
	for (var i = 0; i < headers.length; i++) {
		var header = headers[i];
		if (header.hasAttribute("data-table-column")) { 
			this.columns.push(header.getAttribute("data-table-column"));
		}
	}
	
	this.push = function(item) {
		var tr = document.createElement("tr");
		for (var i = 0; i < this.columns.length; i++) {
			var td = document.createElement("td");
			td.innerHTML = item[this.columns[i]];
			tr.appendChild(td);
		}
		this.el.appendChild(tr);
		item["el-" + this.name] = tr;
		this.items.push(item);
		
		tr.addEventListener("mouseup", function() { this.onRowClick(item); }.bind(this) );
	}.bind(this);
	
	this.popById = function(id) {
		var item = undefined;
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].id == id) {
				item = this.items[i];
				break;
			}
		}
		if (!isdef(item)) return;
	
		var idx = this.items.indexOf(item);
		this.items.splice(idx, 1);
		this.el.removeChild(item["el-" + this.name]);
	}.bind(this);
	
	this.clear = function() {
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			this.el.removeChild(item["el-" + this.name]);
		}
		this.items = [];
	}.bind(this);
};

onLoad(function(){
	var tableCapable = document.querySelectorAll("[data-table]");
	for (var i = 0; i < tableCapable.length; i++) {
		var table = new tableManager(tableCapable[i]);
		tables[table.name] = table;
	}
});