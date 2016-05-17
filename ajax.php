<?php header('charset=utf-8', 'Content-Type: text/plain');
	require('dbModels.php');
	require('levenshtein2.php');
	
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
			case db_error_unauthorized:
				$result = "error_unauthorized";
				break;
			default:
				$result = "error";
				break;
		}
		echo json_encode(array("result"=>$result, "arg"=>$arg, "error"=>$dbi->mysqli->error, "arg2"=>$dbi->arg2));
	}
		
	function replaceToken(&$potential, $obj) {
		$first = mb_substr($potential, 0, 1, 'UTF-8');
		$name = mb_substr($potential, 1, NULL, 'UTF-8');
		if ($first != "$") return db_success;
		if (!property_exists($obj, $name)) return db_error_field;
		$potential = $obj->$name;
		return db_success;
	}
	
	function db_select_single($args, &$by_parent_id, &$results) {
		global $current_user, $dbi;
		if (!base::columns_allowed($args->columns, action_select, $current_user, $args->table)) return db_error_unauthorized;
		$table = $args->table;
		$columns = isset($args->columns) ? $args->columns : ["*"];
		$where = isset($args->where) ? $args->where : NULL;
		$parent_id = isset($args->parent_id) ? $args->parent_id : NULL;
		$id = isset($args->id) ? $args->id : NULL;	
		
		if ($parent_id) {
			if (isset( $by_parent_id[$parent_id] )) {	
				for ($i = 0; $i < count($columns); $i++) {
					replaceToken($columns[$i], $by_parent_id[$parent_id]);
				}
				foreach ($where as $key => &$value) {
					replaceToken($value[1], $by_parent_id[$parent_id]);
				}		
			}
		}
		
		$result = NULL;		
		switch($table) {
			case "users": $result = user::db_select($columns, $where, $results); break;
			case "texts": $result = text::db_select($columns, $where, $results); break;
			case "tests": $result = test::db_select($columns, $where, $results); break;
			case "submissions": 
				$result = submission::db_select($columns, $where, $results); 
				if (array_search("report", $columns)) {
					for ($i = 0; $i < count($results); $i++) {
						$results[$i]->report = $results[$i]->report->parsed;
					}
				}
				break;
		}
		
		if ($result == db_success && $id && count($results)) {
			$by_parent_id[$id] = $results[0];
		}
		
		return $result;
	}
	
	function db_select() {
		global $args;
		$by_parent_id = [];
		$results_all = [];
		$result = NULL;
		
		if (!is_array($args)) $args = array($args);
		for ($i = 0; $i < count($args); $i++) {
			$result = db_select_single($args[$i], $by_parent_id, $results);
			if ($result == db_success) {
				$results_all[] = $results;
			} else break;
		}

		echoResult($result, $results_all);
	}		
	
	function db_insert() {
		global $args, $current_user, $dbi;
		if (!base::columns_allowed($args, action_insert, $current_user, $args->table)) { echoResult(db_error_unauthorized); return; }
		$item = NULL; $result = db_success;	

		switch($args->table) {
			case "tests": 		
				$result = text::db_get_select_id($args->textId, $text);
				if ($result != db_success) break;
				
				$item = test::from_row($args); 
				$item->textId = $text->id;
				$item->textName = $text->title;
				$item->dateBegin = 0;
				$item->dateEnd = $args->duration;
				$item->submissions = 0;
				$item->code = test::dbGenerateCode(); 
				$item->conductorId = $current_user->id;
				$item->conductorName = $current_user->fullName();
				break;
				
			case "texts": 		
				$item = text::from_row($args); 
				$item->authorId = $current_user->id;
				$item->authorName = $current_user->fullName();
				break;
				
			case "users": 		
				$item = user::from_row($args); 
				$item->passwordHash = password_hash($password, PASSWORD_BCRYPT, ["cost" => 8]);
				break;
				
			case "submissions":	
				$result = test::db_select_by_code($args->code, $test);
				if ($result != db_success) break;
				$test->submissions++;
				$test->db_update();
				
				if ($test->dateBegin > time() || $test->dateEnd < time()) {
					$result = db_error_unauthorized;
					break;
				}
				
				$result = text::db_get_select_id($test->textId, $text);
				if ($result != db_success) break;
				
				$report = new diffReport($text->text, $args->text);			
				$item = submission::from_row($args); 
				$item->report = serialize($report);
				$item->totalSentences = $report->totalSentences;
				$item->totalWords = $report->totalWords;
				$item->totalLetters = $report->totalLetters;
				$item->faultySentences = $report->faultySentences;
				$item->faultyWords = $report->faultyWords;
				$item->faultyLetters = $report->faultyLetters;
				$item->date = time();
				$item->testId = $test->id;
				$item->testCode = $test->code;
				$item->textId = $text->id;
				$item->textTitle = $text->title;	
				break;
				
		}
		
		if ($result == db_success) {
			$result = $item->db_insert();
		}
		if ($result == db_success) {
			echoResult($result, $item->id);
		} else {
			echoResult($result);
		}		
	}

	function db_update() {
		global $args, $current_user, $dbi;
		if (!base::columns_allowed($args, action_update, $current_user, $args->table)) { echoResult(db_error_unauthorized); return; }
		$item = NULL; $result = db_success;
		
		
		
		switch($args->table) {
			case "texts": $result = text::db_get_select_id($args->id, $item); break;
			case "tests": $result = test::db_get_select_id($args->id, $item); break;
			case "users": $result = user::db_get_select_id($args->id, $item); break;
			case "submissions": $result = submissions::db_get_select_id($args->id, $item); break;
		}

		if ($item == NULL) {
			echoResult(db_error);
			return;
		}
		
		$item->update($args);
		$result = $item->db_update();
		
		if ($result == db_success) {
			echoResult($result, $item->id);
		} else {
			echoResult($result);
		}	
	}
	
	function db_delete() {
		global $args, $current_user, $dbi;
		if (!base::columns_allowed(["id"], action_delete, $current_user, $args->table)) { echoResult(db_error_unauthorized); return; }
		//non users can't delete
		if (!$current_user) return;
		$result = $dbi->delete_by_id($args->table, $args->id);
		echoResult($result);
	}
	
	function log_in() {
		global $args, $dbi;
		$result = user::select_by_credentials($args->username, $args->password, $usr);
		if ($result == db_success) {		
			$_SESSION["current_user"] = $usr;
			$_SESSION["default_user"] = false;
			$_SESSION["timeout"] = time() + 3600;	
			echoResult(db_success);
		} else {
			echoResult(db_error_unauthorized);
		}
	}
	
	function log_out() {
		$_SESSION["current_user"] = user::default_user();
		$_SESSION["default_user"] = true;
		$_SESSION["timeout"] = 0;
		echoResult("db_success");
	}
	
	function get_permissions() {
		global $current_user;
		switch($current_user->permissions) {
			case permissions_take_test: echoResult(db_success, "take_test"); break;
			case permissions_conduct: echoResult(db_success, "conduct"); break;
			case permissions_admin: echoResult(db_success, "admin"); break;
		}
	}
	
	//	SESSION
	session_start();

	if (!isset($_SESSION["current_user"])) log_out();
	
	if ($_SESSION["default_user"] == false) {
		if ($_SESSION["timeout"] < time()) log_out();
		else $_SESSION["timeout"] = time() + 3600;
	}
	
	$current_user = $_SESSION["current_user"];
	
	//	JUNCTION
	$args = json_decode(file_get_contents("php://input"));
	switch ($_GET["method"]) {
		case "db_select": 		db_select(); 		break;
		case "db_insert": 		db_insert(); 		break;
		case "db_update": 		db_update(); 		break;
		case "db_delete": 		db_delete(); 		break;
		case "log_in":			log_in(); 			break;
		case "log_out":			log_out();			break;
		case "get_permissions":	get_permissions();	break;
	}
?>