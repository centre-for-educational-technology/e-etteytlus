//table management thing


let tables = {};

let tableManager = function(el) {
	this.el = el;
	this.name = el.getAttribute("data-table");
	this.items = [];
	this.columns = [];
	
	//get tracked columns
	let headers = this.el.querySelectorAll("th");
	for (let i = 0; i < headers.length; i++) {
		if (headers[i].hasAttribute("data-tableColumn")) this.columns.push(headers[i].getAttribute("data-tableColumn"));
	}
	
	this.push = function(item) {
		let tableItem = {data:item};
		let tr = document.createElement("tr");
		for (let i = 0; i < this.columns.length; i++) {
			let colAtt = this.columns[i];
			tableItem[colAtt] = item[colAtt];
			let td = document.createElement("td");
			td.innerHTML = item[colAtt];
			tr.appendChild(td);
		}
		this.el.appendChild(tr);
	}.bind(this);
};

onLoad(function(){
	let tableCapable = document.querySelectorAll("[data-table]");
	for (let i = 0; i < tableCapable.length; i++) {
		let table = new tableManager(tableCapable[i]);
		tables[table.name] = table;
	}
});