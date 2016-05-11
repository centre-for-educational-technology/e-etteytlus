<?php header('charset=utf-8', 'Content-Type: text/plain');
	require('dbModels.php');
	require('levenshtein2.php');
	$current_user = user::fromValues("default", "mc'defaultface", "i prefer gmail", "meh", "keyyboardSMASHIJIRU!", "false");
	
	//generic return handler
	function echoResult($db_result, $arg = NULL) {
		global $dbi;
		$result = NULL; 
		switch ($db_result) {
			case db_success: 
				$result = "success";	
				break;
			case db_error_unique:
				$result = "error_unique";
				$arg = $dbi->arg;
				break;
			default:
				$result = "error";
				break;
		}
		echo json_encode(array("result"=>$result, "arg"=>$arg, "error"=>$dbi->mysqli->error));
	}
	
	//text handlers
	function submitText() {
		global $args, $current_user;
		$text = text::fromValues($args->title, $args->text, $current_user->id, $current_user->fullName(), true);
		echoResult($text->dbInsert(), $text);
	}
	
	function deleteText() {
		global $args, $current_user;
		echoResult(text::dbDeleteById($args->id));
	}
	
	function getTextList() {
		$result = text::dbSelect(NULL, $texts);
		echoResult($result, $texts);
	}
	
	//test handlers
	function submitTest() {
		global $args, $current_user;
		$textResult = text::dbGetById($args->textId, $text);
		$test = test::fromValues($current_user->id, $current_user->fullName(), $text->id, $text->title, 0, $args->duration, 0, true); //Note: dateEnd acts as a temporary duration container when not started yet
		echoResult($test->dbInsert(), $test);
	}
	
	function startTest() {	
		global $args, $current_user;
		$testResult = test::dbGetById($args->id, $test);
		$test->dateBegin = time();
		$test->dateEnd = time() + $test->dateEnd * 60;	//Note: dateEnd acts as a temporary duration container when not started yet
		echoResult($test->dbUpdate(), $test);
	}
	
	function stopTest() {
		global $args, $current_user;
		$testResult = test::dbGetById($args->id, $test);
		$dateEnd = time();
		if ($test->dateEnd > $dateEnd) {
			$test->dateEnd = $dateEnd;
		}
		echoResult($test->dbUpdate(), $test);
	}
	
	function deleteTest() {
		global $args, $current_user;
		echoResult(test::dbDeleteById($args->id));
	}
	
	function getTestList() {
		$result = test::dbSelect(NULL, $tests);
		echoResult($result, $tests);
	}
	
	function getTestById() {
		global $args, $current_user;
		$result = test::dbGetById($args->id, $test);
		echoResult($result, $test);
	}
	
	function startSubmission() {
		global $args;
		$testResult = test::dbGetByCode($args->code, $test);
		//maybe add more elaborate return values here?
		if ($test == NULL || $test->dateBegin == 0 || $test->dateEnd < time()) { 
			echoResult(db_error); 
			exit; 
		}
		
		echoResult(db_success, array("dateEnd" => $test->dateEnd));
	}
	
	function finishSubmission() {
		global $args;
		$testResult = test::dbGetByCode($args->code, $test);
		$textResult = text::dbGetById($test->textId, $text);
		$report = new diffReport($text->text, $args->text);
		
		$submission = submission::fromValues($args->firstname, $args->surname, $args->email, time(), $test->id, $test->code, $test->textId, $test->textName, serialize($report), $report->totalSentences, $report->totalWords, $report->totalLetters, $report->faultySentences, $report->faultyWords, $report->faultyLetters);
		
		$test->submissions++;
		$test->dbUpdate();
		echoResult($submission->dbInsert());
	}
	
	function getTestSubmissions() {
		global $args, $current_user;
		$result = submission::dbSelect(array("testId" => $args->id), $results);
		for ($i = 0; $i < count($results); $i++) {
			$results[$i]->report = unserialize($results[$i]->report)->parsed;
		}
		echoResult($result, $results);
	}

	$args = json_decode(file_get_contents("php://input"));
	switch ($_GET["method"]) {
		case "submitText": submitText(); break;
		case "deleteText": deleteText(); break;
		case "getTextList": getTextList(); break;
		case "submitTest": submitTest(); break;
		case "startTest": startTest(); break;
		case "stopTest": stopTest(); break;
		case "deleteTest": deleteTest(); break;
		case "getTestList": getTestList(); break;
		case "getTestById": getTestById(); break;
		case "startSubmission": startSubmission(); break;
		case "finishSubmission": finishSubmission(); break;
		case "getTestSubmissions": getTestSubmissions(); break;
	}
?>