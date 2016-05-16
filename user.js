var submissionData = {};

//step 1
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
				navigate_timeout("#user_info", undefined, 6000);	
			} else {
				navigate("#not_ready");
				navigate_timeout("#user_info", undefined, 4000);
			}
		} else {
			select("#s2ParticipantName").innerHTML = capitalize(data.firstname) + " " + capitalize(data.surname);
			select("#s2TestCode").innerHTML = data.code;
			select("#s2TimeRemaining").setAttribute("data-countdown-end", r.arg[0][0].dateEnd);
			navigate("#dictation");
		}
	}, function(r) {
		navigate("#system_fault");
		navigate_timeout("#user_info", undefined, 10000);
	});
}

//step 2
function submitDictation(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	var data = formData(e.target);
	submissionData["text"] = data.text;
	submissionData["table"] = "submissions";
	
	ajax("db_insert", submissionData, function(r) {		
		navigate("#complete");
	}, function(r) {
		navigate("#system_fault");
		navigate_timeout("#user_info", undefined, 10000);
	});
	
	
}