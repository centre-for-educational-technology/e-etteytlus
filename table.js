//table management thing


let tables = {};

let tableManager = function(el) {
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
	let headers = this.el.querySelectorAll("th");
	for (let i = 0; i < headers.length; i++) {
		let header = headers[i];
		if (header.hasAttribute("data-table-column")) { 
			this.columns.push(header.getAttribute("data-table-column"));
		}
	}
	
	this.push = function(item) {
		let tr = document.createElement("tr");
		for (let i = 0; i < this.columns.length; i++) {
			let td = document.createElement("td");
			td.innerHTML = item[this.columns[i]];
			tr.appendChild(td);
		}
		this.el.appendChild(tr);
		item["el-" + this.name] = tr;
		this.items.push(item);
		
		tr.addEventListener("mouseup", function() { this.onRowClick(item); }.bind(this) );
	}.bind(this);
	
	this.popById = function(id) {
		let item = undefined;
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].id == id) {
				item = this.items[i];
				break;
			}
		}
		if (!isdef(item)) return;
	
		let idx = this.items.indexOf(item);
		this.items.splice(idx, 1);
		this.el.removeChild(item["el-" + this.name]);
	}.bind(this);
};

onLoad(function(){
	let tableCapable = document.querySelectorAll("[data-table]");
	for (let i = 0; i < tableCapable.length; i++) {
		let table = new tableManager(tableCapable[i]);
		tables[table.name] = table;
	}
});