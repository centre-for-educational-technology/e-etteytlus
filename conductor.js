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
		if (r.result == "error_unique") {
			show_message("Sellise nimega tekst on juba olemas!");	
		} else {
			show_message("Süsteemi viga", "Vabandame.");	
		}
		navigate_timeout("#newText", undefined, 4000);
	});
}

function delete_text(e) {
	e.preventDefault();
	var data = formData(e.target);
	data.table = "texts";
	ajax("db_delete", data, function(r) {
		show_message("Kontrolltekst kustutatud");
		navigate_timeout("#textList", undefined, 2000);
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#textDetail", undefined, 4000);
	});
}

function interpret_text_select(rows) {
	if (rows.constructor !== Array) rows = [rows];
	var ret = "";
	for (var i = 0; i < rows.length; i++) {
		ret += "<option value='" + rows[i].id + "'>" + rows[i].title + "</option>";
	}
	console.log(ret);
	return ret;
}

//	*********
//	  TESTS
//	*********

function view_test(row) {
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
		console.log(r);
		navigate("#startTest", { "data-fill-where" : "id=" + r });
		e.target.reset();
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#startTest", undefined, 4000);
	});
}

function conduct_test(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "tests";
	data["dateBegin"] = unixTime();
	data.dateEnd = parseInt(data.dateEnd) * 60 + data.dateBegin; 
	ajax("db_update", data, function(r) {
		navigate("#conductTest", { "data-fill-where" : "id=" + r });
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#startTest", undefined, 4000);
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
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#conductTest", undefined, 4000);
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
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#testList", undefined, 4000);
	});
}

function delete_test(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "tests";
	ajax("db_delete", data, function(r) {
		show_message("Etteütlus kustutatud");
		navigate_timeout("#testList", undefined, 2000);
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#testDetail", undefined, 4000);
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

//	**********
//	  USERS
//	**********

function view_user(row) {
	navigate("#userDetail", {"data-fill-where" : "id=" + row.id});
}

function submit_user(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "users";
	console.log(data);
	ajax("db_insert", data, function(r) {
		e.target.reset();
		show_message("Kasutaja lisatud");
		navigate_timeout("#userList", undefined, 2000);
	}, function(r) {
		if (r.result == "error_unique") {
			if (r.arg == "username") {
				show_message("Sellise kasutajanimega tegelane on juba olemas!");	
			} else {
				show_message("Sellise E-posti aadressiga tegelane on juba olemas!");
			}
		} else {
			show_message("Süsteemi viga", "Vabandame.");	
		}
		navigate_timeout("#newUser", undefined, 4000);
	});
}

function update_user(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "users";
	ajax("db_update", data, function(r) {
		e.target.reset();
		show_message("Kasutaja muudetud");
		navigate_timeout("#userList", undefined, 2000);
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#userDetails", undefined, 4000);
	});
}

function reset_user(e) {
	e.preventDefault();
	formReset(e.target);
}

function delete_user(e) {
	e.preventDefault();
	var data = formData(e.target);
	data["table"] = "users";
	ajax("db_delete", data, function(r) {
		show_message("Kasutaja kustutatud");
		navigate_timeout("#userList", undefined, 2000);
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#userDetail", undefined, 4000);
	});
}

function interpret_user_permissions(row) {
	if (row.permissions == 0) return "Õigusteta";
	if (row.permissions == 1) return "Juhendaja";
	if (row.permissions == 2) return "Administraator";
}


//	************
//	  UTILITY
//	************

function show_message(bigText, smallText) {
	select("#message h1").innerHTML = isdef(bigText) ? bigText : "";
	select("#message h2").innerHTML = isdef(smallText) ? smallText : "";
	navigate("#message");
}

function log_in(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	var data = formData(e.target);
	ajax("log_in", data, function(r) {
		e.target.reset();
		start_page();
	}, function(r) {
		if (r.result == "error_unauthorized") {
			show_message("Vale kasutaja või parool.");
			navigate_timeout("#login", undefined, 4000);
		} else {
			show_message("Süsteemi viga", "Vabandame.");
			navigate_timeout("#login", undefined, 4000);
		}
	});
}

function log_out() {
	ajax("log_out", {}, function(r) {
		h = (new Date()).getHours();
		s = "ööd"; if (h>4&&h<=10)s="hommikut.";if(h>10&&h<=19)s="päeva";if(h>19&&h<23)s="õhtut";
		show_message("Olete välja logitud.", "Head " + s);
		select(".nav").setAttribute("data-hidden", "");
		select(".nav.right").setAttribute("data-hidden", "");
		navigate_timeout("#login", undefined, 4000);
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame.");
		navigate_timeout("#testList", undefined, 4000);
	});
}

function start_page() {
	ajax("get_permissions", {}, function(r) {
		switch (r) {
			case "conduct":
				select(".nav").removeAttribute("data-hidden");
				select(".nav.right").removeAttribute("data-hidden");
				navigate("#testList");
				break;
			case "admin":
				select(".nav").removeAttribute("data-hidden");
				select(".nav.right").removeAttribute("data-hidden");
				navigate("#testList");
				break;
			default:
				navigate('#login');
				break;
		}
	}, function(r) {
		show_message("Süsteemis esinevad hetkel rikked.", "Vabandame.");
		navigate_timeout("#login", undefined, 4000);
	});			
}