//	*********
//	  TEXTS
//	*********

function view_text(row) {
	navigate("#textDetail", {"data-fill-where": "id=" + row.id});
}

function submit_text(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "texts";
	ajax("db_insert", data, function(r) {
		e.target.reset();
		show_message("Kontrolltekst lisatud");
		navigate_timeout("#textList", undefined, 2000);
	}, function(r) {
		//TODO
	});
}

function deleteText(e) {
	e.preventDefault();
	var data = formData(e.target);
	data.table = "texts";
	ajax("db_delete", data, function(r) {
		show_message("Kontrolltekst kustutatud");
		navigate_timeout("#textList", undefined, 2000);
	}, function(r) {
		//TODO
	});
}

function interpret_text_select(rows) {
	var ret = "";
	for (var i = 0; i < rows.length; i++) {
		ret += "<option value='" + rows[i].id + "'>" + rows[i].title + "</option>";
	}
	return ret;
}

//	*********
//	  TESTS
//	*********

function view_test(row) {
	console.log("VIEW_TEST");
	row["status"] = interpret_test_status(row);
	switch (row.status) {
		case "Alustamata": 	navigate("#startTest", { "data-fill-where" : "id=" + row.id }); break;
		case "Toimumas": 	navigate("#conductTest", { "data-fill-where" : "id=" + row.id }); break;
		case "Lõppenud": 	navigate("#testDetail",  { "data-fill-where" : "id=" + row.id }); break;
	}
}

function start_test(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "tests";
	ajax("db_insert", data, function(r) {
		navigate("#startTest", { "data-fill-where" : "id=" + r.arg });
		e.target.reset();
	}, function(r) {
		//TODO
	});
}

function conduct_test(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "tests";
	data["dateBegin"] = unixTime();
	data.dateEnd = parseInt(data.dateEnd) * 60 + data.dateBegin; 
	ajax("db_update", data, function(r) {
		navigate("#conductTest", { "data-fill-where" : "id=" + r.arg });
	}, function(r) {
		//TODO
	});
}

function stop_test(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "tests";
	data["dateEnd"] = unixTime();
	ajax("db_update", data, function(r) {
		show_message("Etteütlus lõpetatud");
		navigate_timeout("#testList", undefined, 2000);
	}, function(r) {
		//TODO
	});
}

function cancel_test(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "tests";
	ajax("db_delete", data, function(r) {
		show_message("Etteütlus tühistatud");
		navigate_timeout("#testList", undefined, 2000);
	}, function(r) {
		//TODO
	});
}

function delete_test(e) {
	e.preventDefault();
	data["table"] = "tests";
	ajax("db_delete", data, function(r) {
		show_message("Etteütlus kustutatud");
		navigate_timeout("#testList", undefined, 2000);
	}, function(r) {
		//TODO
	});
}

function interpret_test_status(row) {
	if (row.dateEnd < 1000) return "Alustamata";
	if (row.dateEnd > unixTime()) return "Toimumas";
	return "Lõppenud";
}

function interpret_conduct_view_details(row) {
	return "navigate('#testDetail', {'data-fill-where' : 'id=" + row.id + "'})";
}

//	***************
//	  SUBMISSIONS
//	***************

function view_submission(row) {
	navigate("#submissionDetail", {"data-fill-where" : "id=" + row.id});
}

function interpret_submission_result(row) {
	var resultPerc = Math.floor((row.totalLetters - row.faultyLetters) / row.totalLetters * 100) + "%";
	var resultRep = "<table>";
	resultRep += "<tr><td>Vigaseid tähemärke:</td><td>" + row.faultyLetters + " / " + row.totalLetters + "</td>";
	resultRep += "<tr><td>Vigaseid sõnu:</td><td>" + row.faultyWords + " / " + row.totalWords + "</td>";
	resultRep += "<tr><td>Vigaseid lauseid:</td><td>" + row.faultySentences + " / " + row.totalSentences + "</td>";
	return '<div class="tooltipper">' + resultPerc + '<div class="tooltip">' + resultRep +'</div></div>'
}

function interpret_submissions_where(row) {
	return "testId="+row.id;
}


//	************
//	  UTILITY
//	************

function show_message(bigText, smallText) {
	if (isdef(bigText)) select("#message h1").innerHTML = bigText;
	if (isdef(smallText)) select("#message h2").innerHTML = smallText;
	navigate("#message");
}