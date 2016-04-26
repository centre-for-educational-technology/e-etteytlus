
//step 1
function submitUserInfo(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	navigate("step2");
}

//step 2
function submitDictation(e) {
	e.preventDefault();
	if (!formVerify(e.target)) return;
	navigate("step3");
}