function submitText(e) {
	e.preventDefault();
	ajax("submitText", formData(e.target), function(r) {
		if (r.result == "success") {
			e.target.reset();
			navigate("newText2");
			navigateAuto(2000, "textList");
		}
	});
}

function deleteText() {
	
}

function viewTextDetail(item) {
	select("#textDetailTitle").innerHTML = item.title;
	select("#textDetailAuthor").innerHTML = item.authorName;
	select("#textDetailText").innerHTML = item.text;
	navigate("textDetail");
}

function submitNewTest(e) {
	e.preventDefault();
}


onLoad(function(){
	//populate texts
	ajax("getTextList", {}, function(r) {
		if (r.result == "success") {
			let selTN = select("#ntsTextName");
			for (let i = 0; i < r.arg.length; i++) {
				let opt = document.createElement("option");
				opt.value = r.arg[i].id;
				opt.innerHTML = r.arg[i].title;
				selTN.appendChild(opt);
				tables["textList"].push(r.arg[i]);
			}
		}
	});
	
	
});