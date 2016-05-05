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
		let header = headers[i];
		if (header.hasAttribute("data-tableColumn")) {
			let col = { "name":header.getAttribute("data-tableColumn") };
			if (header.hasAttribute("data-tableOnClick")) col["onClick"] = header.getAttribute("data-tableOnClick");
			this.columns.push(col);
		}
	}
	
	this.push = function(item) {
		let tableItem = {data:item};
		let tr = document.createElement("tr");
		for (let i = 0; i < this.columns.length; i++) {
			let col = this.columns[i];
			let colAtt = this.columns[i].name;
			tableItem[colAtt] = item[colAtt];
			let td = document.createElement("td");
			let content = document.createTextNode(item[colAtt]);
			if (col.onClick) {
				let inner = content;
				content = document.createElement("a");
				content.href = "javascript:;";
				content.appendChild(inner);
				content.addEventListener("mouseup", function() {
					eval(col.onClick + "(" + JSON.stringify(item) + ")");
				});
			}
			td.appendChild(content);
			tr.appendChild(td);
		}
		this.el.appendChild(tr);
		this.items.push(item);
	}.bind(this);
};

onLoad(function(){
	let tableCapable = document.querySelectorAll("[data-table]");
	for (let i = 0; i < tableCapable.length; i++) {
		let table = new tableManager(tableCapable[i]);
		tables[table.name] = table;
	}
});