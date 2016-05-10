//text
function submitText(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("submitText", data, function(r) {
		if (r.result == "success") {
			uiTextPush(r.arg);
			e.target.reset();
			navigate("msgTextAdded");
			navigateAuto(2000, "textList");
		}
	});
}

function deleteText(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("deleteText", data, function(r) {
		if (r.result == "success") {
			uiTextPopById(data.id);
			navigate("msgTextDeleted");
			navigateAuto(2000, "textList");
		}
	});
}

function viewText(item) {
	select("#textDetailTitle").innerHTML = item.title;
	select("#textDetailAuthor").innerHTML = item.authorName;
	select("#textDetailText").innerHTML = item.text;
	select("#textDetailId").value = item.id;
	navigate("textDetail");
}

function uiTextPush(item) {
	//add item to select in 'new test'
	var ntsTextNameSelect = select("#ntsTextName");	
	var opt = document.createElement("option");
	opt.value = item.id;
	opt.innerHTML = item.title;
	ntsTextNameSelect.appendChild(opt);
	
	//add item to textList table
	tables["textList"].push(item);
}

function uiTextPopById(id) {
	//remove item from select in 'new test'
	var ntsTextNameSelect = select("#ntsTextName");
	var opts = ntsTextNameSelect.childNodes;
	for (var i = 0; i < opts.length; i++) {
		if (opts[i].value == id) {
			ntsTextNameSelect.removeChild(opts[i]);
			break;
		}
	}
	
	//remove item from textList table
	tables["textList"].popById(id);
}

//test

function submitTest(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("submitTest", data, function(r) {
		if (r.result == "success") {
			uiTestPush(r.arg);
			navigateStartTest(r.arg);
			e.target.reset();
		}
	});
}

function startTest(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("startTest", data, function(r) {
		if (r.result == "success") {
			uiTestPopById(r.arg.id);
			uiTestPush(r.arg);
			navigateConductTest(r.arg);
		}
	});
}

function stopTest(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("stopTest", data, function(r) {
		if (r.result == "success") {
			uiTestPopById(r.arg.id);
			uiTestPush(r.arg);
			navigate("msgTestEnded");
			navigateAuto(2000, "testList");
		}
	});
}

function navigateConductTest(test) {
	select("#conductTestTextName").innerHTML = test.textName;
	select("#conductTestCountdown").setAttribute("data-countdown-end", test.dateEnd);
	select("#conductTestId").value = test.id;
	navigate("conductTest");
}

function navigateStartTest(test) {
	select("#startTestTextName").innerHTML = test.textName;
	select("#startTestDurationMin").innerHTML = test.dateEnd;
	select("#startTestId").innerHTML = pad0(test.id, 4);
	select("#startTestId2").value = test.id;
	navigate("startTest");
}

function viewTest(item) {
	switch (item.status) {
		case "Alustamata": navigateStartTest(item); break;
		case "Toimumas": navigateConductTest(item); break;
	}
}

function deleteTest(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("deleteTest", data, function(r) {
		if (r.result == "success") {
			uiTestPopById(data.id);
			navigate("msgTestDeleted");
			navigateAuto(2000, "testList");
		}
	});
}

function checkTest(item) {
	ajax("getTestById", {"id":item.id}, function(r) {
		if (r.result == "success") {
			uiTestPopById(r.arg.id);
			uiTestPush(r.arg);
		}
	});
}

function uiTestPush(item) {
	//generate code
	item["code"] = pad0(item.id, 4);

	//generate status
	item["status"] = "NaN";
	if (item.dateBegin == 0) {
		item.status = "Alustamata";
	} else if (item.dateEnd > unixTime()) {
		//set update timer
		setTimeout(function() { checkTest(item); }, (item.dateEnd - unixTime() + 1) * 1000);
		item.status = "Toimumas";
	} else {
		item.status = "Lõppenud";
	}

	tables["testList"].push(item);
}

function uiTestPopById(id) {
	tables["testList"].popById(id);
}


onLoad(function(){
	//initially load all texts
	ajax("getTextList", {}, function(r) {
		if (r.result == "success") {
			for (var i = 0; i < r.arg.length; i++) {
				uiTextPush(r.arg[i]);
			}
		}
	});
	
	ajax("getTestList", {}, function(r) {
		if (r.result == "success") {
			for (var i = 0; i < r.arg.length; i++) {
				uiTestPush(r.arg[i]);
			}
		}
	});
});