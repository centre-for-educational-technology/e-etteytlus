var submissionData = {};

//step 1
function submitUserInfo(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	var data = formData(e.target);
	submissionData = data;
	
	ajax("startSubmission", data, function(r) {
		if (r.result == "success") {
			select("#s2ParticipantName").innerHTML = capitalize(data.firstname) + " " + capitalize(data.surname);
			select("#s2TestCode").innerHTML = data.code;
			select("#s2TimeRemaining").setAttribute("data-countdown-end", r.arg.dateEnd);
			navigate("step2");
		}
	});
	
	
}

//step 2
function submitDictation(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	var data = formData(e.target);
	submissionData["text"] = data.text;
	navigate("step25");
	ajax("finishSubmission", submissionData, function(r) {
		if (r.result == "success") {		
			navigate("step3");
		}
	});
	
	
}