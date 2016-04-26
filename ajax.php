<?php header('charset=utf-8', 'Content-Type: text/plain');
	require('dbModels.php');
	$current_user = user::fromValues("default", "mc'defaultface", "i prefer gmail", "meh", "keyyboardSMASHIJIRU!", "false");
	
	function echoResult($db_result, $arg = NULL) {
		global $dbi;
		$result = NULL; 
		switch ($db_result) {
			case db_success: 
				$result = "success";	
				break;
			case db_error_unique:
				$result = "error_unique";
				$arg = $dbi->errorArg;
				break;
			default:
				$result = "error";
				break;
		}
		echo json_encode(array("result"=>$result, "arg"=>$arg));
	}
	
	
	function submitText() {
		global $args, $current_user;
		$text = text::fromValues($args->title, $args->text, $current_user->id, $current_user->fullName(), true);
		echoResult($text->dbInsert());
	}
	
	function getTextList() {
		$result = text::dbSelect(NULL, $texts);
		echoResult($result, $texts);
	}
	
	$args = json_decode(file_get_contents("php://input"));
	switch ($_GET["method"]) {
		case "submitText": submitText(); break;
		case "getTextList": getTextList(); break;
	}
?>