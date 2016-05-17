var submissionData = {};

function submit_user_info(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	var data = formData(e.target);
	submissionData = data;
	
	var req = { "table" : "tests", "columns" : ["dateEnd"], "where" : {"code" : data.code} };
	
	ajax("db_select", req, function(r) {
		if (!r.arg.length || !r.arg[0].length || unixTime() > r.arg[0][0].dateEnd) {
			if (!r.arg.length || !r.arg[0].length || r.arg[0][0].dateEnd > 10000) {
				navigate("#not_found");
				show_message("Sellise koodiga etteütlust ei ole olemas või on lõppenud.", "Kontrolli koodi?");
				navigate_timeout("#user_info", undefined, 6000);	
			} else {
				show_message("Etteütlus pole veel alanud!", "Kannatust");
				navigate_timeout("#user_info", undefined, 4000);
			}
		} else {
			select("#s2ParticipantName").innerHTML = capitalize(data.firstname) + " " + capitalize(data.surname);
			select("#s2TestCode").innerHTML = data.code;
			select("#s2TimeRemaining").setAttribute("data-countdown-end", r.arg[0][0].dateEnd);
			navigate("#dictation");
		}
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame");
		navigate_timeout("#user_info", undefined, 10000);
	});
}

function submit_dictation(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	var data = formData(e.target);
	submissionData["text"] = data.text;
	submissionData["table"] = "submissions";
	
	ajax("db_insert", submissionData, function(r) {		
		show_message("Etteütlus sooritatud!", "Täname osalemise eest.");
	}, function(r) {
		show_message("Süsteemi viga", "Vabandame");
		navigate_timeout("#user_info", undefined, 10000);
	});
	
	
}

//	************
//	  UTILITY
//	************

function show_message(bigText, smallText) {
	if (isdef(bigText)) select("#message h1").innerHTML = bigText;
	if (isdef(smallText)) select("#message h2").innerHTML = smallText;
	navigate("#message");
}