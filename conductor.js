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

onLoad(function(){
	//populate texts
	ajax("getTextList", {}, function(r) {
		if (r.result == "success") {
		console.log(tables["textList"]);
			for (let i = 0; i < r.arg.length; i++) {
			
				tables["textList"].push(r.arg[i]);
			}
		}
	});
	
	
});