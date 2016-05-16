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
		echo json_encode(array("result"=>$result, "arg"=>$arg, "error"=>$dbi->mysqli->error, "arg2"=>$dbi->arg2));
	}
		
	function replaceToken(&$potential, $obj) {
		$first = mb_substr($potential, 0, 1, 'UTF-8');
		$name = mb_substr($potential, 1, NULL, 'UTF-8');
		if ($first != "$") return db_success;
		global $dbi;
		if (!isset($obj[$name])) return db_error_field;
		$potential = $obj[$name];
		return db_success;
	}
	
	function db_select() {
		global $args, $current_user, $dbi;
		
		if (!is_array($args)) $args = array($args);	
		$result = NULL; 
		$ret = [];
		$by_parent_id = [];
		
		for ($i = 0; $i < count($args); $i++) {		
			$query = $args[$i];
			
			//non users can only request dateEnd column from tests table until models overhaul
			if (!$current_user) {
				if (count($query->columns) != 1) return;
				if ($query->columns[0] != 'dateEnd') return;
				if ($query->table != 'tests') return;
			}
			
			if (!isset($query->columns)) {
				$query->columns = array("*");
			} elseif (isset($query->parent_id) && isset($by_parent_id[$query->parent_id])) {
				for ($i = 0; $i < count($query->columns); $i++) {
					replaceToken($query->columns[$i], $by_parent_id[$query->parent_id]);
				}
			}

			
			if (!isset($query->where)) {
				$query->where = NULL;
			} elseif (isset($query->parent_id) && isset($by_parent_id[$query->parent_id])) {
				$where = [];
				foreach ($query->where as $key => $value) {
					replaceToken($key, $by_parent_id[$query->parent_id]);
					replaceToken($value[1], $by_parent_id[$query->parent_id]);
					$where[$key] = $value; 
				}
				$query->where = $where;			
			}
			
			
			$result = $dbi->select($query->table, $query->columns, $query->where);
			if ($result == "db_success") { 
			
				if ($query->table == "submissions" && array_search("report", $query->columns) !== false) {
					for ($j = 0; $j < count($dbi->arg); $j++) {
						$dbi->arg[$j]["report"] = unserialize($dbi->arg[$j]["report"])->parsed;
					}		
				}
			
				$ret[] = $dbi->arg;
				if (count($dbi->arg) && isset($query->id)) {
					$by_parent_id[$query->id] = $dbi->arg[0];
				}
			} else break;
		}
		echoResult($result, $ret);
	}		
	
	function db_insert() {
		global $args, $current_user, $dbi;
		$item = NULL; $result = db_success;
		
		//non users can only insert submissions
		if (!$current_user) {
			if ($args->table != "submissions") return;
		}
		
		switch($args->table) {
			case "tests": 		
				$result = text::dbGetById($args->textId, $text);
				if ($result != db_success) break;
				
				$item = test::fromRow($args); 
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
				$item = text::fromRow($args); 
				$item->authorId = $current_user->id;
				$item->authorName = $current_user->fullName();
				break;
				
			case "users": 		
				$item = user::fromRow($args); 
				break;
				
			case "submissions":	
				$result = test::dbGetByCode($args->code, $test);
				if ($result != db_success) break;
				$test->submissions++;
				$test->dbUpdate();
				
				if ($test->dateBegin > time() || $test->dateEnd < time()) {
					$result = db_error;
					break;
				}
				
				$result = text::dbGetById($test->textId, $text);
				if ($result != db_success) break;
				
				$report = new diffReport($text->text, $args->text);			
				$item = submission::fromRow($args); 
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
			$result = $item->dbInsert();
		}
		if ($result == db_success) {
			echoResult($result, $item->id);
		} else {
			echoResult($result);
		}		
	}

	function db_update() {
		global $args, $current_user, $dbi;
		$item = NULL; $result = db_success;
		
		//non users can't update
		if (!$current_user) return;
		
		switch($args->table) {
			case "texts": $result = text::dbGetById($args->id, $item); break;
			case "tests": $result = test::dbGetById($args->id, $item); break;
			case "users": $result = user::dbGetById($args->id, $item); break;
			case "submissions": $result = submissions::dbGetById($args->id, $item); break;
		}

		if ($item == NULL) {
			echoResult(db_error);
			return;
		}
		
		$item->update($args);
		$result = $item->dbUpdate();
		
		if ($result == db_success) {
			echoResult($result, $item->id);
		} else {
			echoResult($result);
		}	
	}
	
	function db_delete() {
		global $args, $current_user, $dbi;
		//non users can't delete
		if (!$current_user) return;
		$result = $dbi->deleteById($args->table, $args->id);
		echoResult($result);
	}
	
	$args = json_decode(file_get_contents("php://input"));
	switch ($_GET["method"]) {
		case "db_select": db_select(); break;
		case "db_insert": db_insert(); break;
		case "db_update": db_update(); break;
		case "db_delete": db_delete(); break;
	}
?>