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
	select("#conductTestCode").innerHTML = test.code;
	select("#conductTestTextName").innerHTML = test.textName;
	select("#conductTestCountdown").setAttribute("data-countdown-end", test.dateEnd);
	select("#conductTestId").value = test.id;
	select("#conductTestNavView").onclick = function() { navigateTestDetail(test); };
	navigate("conductTest");
}

function navigateStartTest(test) {
	select("#startTestTextName").innerHTML = test.textName;
	select("#startTestDurationMin").innerHTML = test.dateEnd;
	select("#startTestCode").innerHTML = test.code;
	select("#startTestId2").value = test.id;
	navigate("startTest");
}

function navigateTestDetail(test) {
	ajax("getTestSubmissions", test, function(r) {
		if (r.result == "success") {
			tables["submissionList"].clear();
			for (var i = 0; i < r.arg.length; i++) {
				var subm = r.arg[i];
				var resultPerc = Math.floor((subm.totalLetters - subm.faultyLetters) / subm.totalLetters * 100) + "%";
				var resultRep = "<table>";
				resultRep += "<tr><td>Vigaseid tähemärke:</td><td>" + subm.faultyLetters + " / " + subm.totalLetters + "</td>";
				resultRep += "<tr><td>Vigaseid sõnu:</td><td>" + subm.faultyWords + " / " + subm.totalWords + "</td>";
				resultRep += "<tr><td>Vigaseid lauseid:</td><td>" + subm.faultySentences + " / " + subm.totalSentences + "</td>";
				subm.result = '<div class="tooltipper">' + resultPerc + '<div class="tooltip">' + resultRep +'</div></div>'
				tables["submissionList"].push(subm);
			}
		
			select("#testDetailCode").innerHTML = test.code;
			select("#testDetailTextTitle").innerHTML = test.textName;
			navigate("testDetail");
		}
	});
}

function viewTest(item) {
	switch (item.status) {
		case "Alustamata": navigateStartTest(item); break;
		case "Toimumas": navigateConductTest(item); break;
		case "Lõppenud": navigateTestDetail(item); break;
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

function cancelTest(e) {
	e.preventDefault();
	var data = formData(e.target);
	ajax("deleteTest", data, function(r) {
		if (r.result == "success") {
			uiTestPopById(data.id);
			navigate("msgTestCancelled");
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

//submissions

function viewSubmission(item) {
	select("#subDetailTestCode").innerHTML = item.testCode;
	select("#subDetailFirstname").innerHTML = item.firstname;
	select("#subDetailSurname").innerHTML = item.surname;
	select("#subDetailEmail").innerHTML = item.email;
	select("#subDetailDate").innerHTML = new Date(item.date * 1000).toISOString().slice(0,10).replace(/-/g,"");
	select("#subDetailTextTitle").innerHTML = item.textTitle;
	select("#subDetailText").innerHTML = item.report;
	select("#subDetailFaultyLetters").innerHTML = item.faultyLetters + " / " + item.totalLetters;
	select("#subDetailFaultyWords").innerHTML = item.faultyWords + " / " + item.totalWords;
	select("#subDetailFaultySentences").innerHTML = item.faultySentences + " / " + item.totalSentences;
	navigate("submissionDetail");
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