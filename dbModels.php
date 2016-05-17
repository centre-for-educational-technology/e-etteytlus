<?php header('charset=utf-8');
	require("db.php");

	define("permissions_take_test", 0);
	define("permissions_conduct", 1);
	define("permissions_admin", 2);
	
	define("action_select", 0);
	define("action_insert", 1);
	define("action_update", 2);
	define("action_delete", 3);
	
	//base class for model based tables
	class base {
		public static $table_name;

		//db interaction
		public static function 	db_select($columns, $where, &$results) {
			global $dbi;
			$result = $dbi->select(static::$table_name, $columns, $where);			
			if ($result == db_success) {
				$results = [];
				for ($i = 0; $i < count($dbi->arg); $i++) {
					$results[] =  static::from_row($dbi->arg[$i]);
				}
			}		
			return $result;
		}
		public function 		db_insert() {
			global $dbi;
			return $dbi->insert(static::$table_name, $this);
		}
		public function 		db_update() {
			global $dbi;
			return $dbi->update(static::$table_name, $this);
		}
		
		public static function 	db_delete_by_id($id) {
			global $dbi;
			return $dbi->delete_by_id(static::$table_name, $id);
		}
		public static function 	db_get_select_id($id, &$resultValue) {
			$result = static::db_select(["*"], array("id"=>$id), $results);
			if ($result == db_success && count($results)) $resultValue = $results[0];
			return $result;
		}
		
		//utility
		public static function 	from_row($row) {
			$ret = new static;
			$ret->update($row);
			return $ret;
		}
		public function 		update($row) {
			foreach ($row as $key => $value) {
				if (property_exists(static::class, $key)) {
					$this->{$key} = $value;
				}
			}
		}	
		
		//user permissions
		public static function 	column_allowed($column, $action, $usr, $model = NULL) {
			if (!isset($model)) $model = get_called_class();
			$permissions = $usr->permissions;
					
			switch ($permissions) {
				case permissions_take_test:
					if ($action == action_update) return false;
					if ($action == action_delete) return false;
					if ($action == action_insert) return $model == "submission";
					if ($action == action_select) return $model == "test" && column == "dateEnd";
					break;
				case permissions_conduct:
					return $model != "user";
					break;
				case permissions_admin:
					return true;
					break;
			}
			
			return false;
		}
		public static function 	columns_allowed($columns, $action, $user, $model = NULL) {
			if (!isset($model)) $model = get_called_class();
			global $dbi;
			if (is_array($columns) && array_keys($columns) === range(0, count($columns) - 1)) {
				for ($i = 0; $i < count($columns); $i++) {
					if (!static::column_allowed($columns[$i], $action, $user)) return false;
				}
			} else {
				foreach ($columns as $key => $value) {
					if (!static::column_allowed($key, $action, $user)) return false;
				}
			}
			return true;
		}
	}
	
	//test submission model
	class submission extends base {
		public static $table_name = "submissions";
		public $id, $firstname, $surname, $email, $date, $testId, $testCode, $textId, $textTitle, $report, $totalSentences, $totalWords, $totalLetters, $faultySentences, $faultyWords, $faultyLetters;		
		
		public static function db_select($columns, $where, &$results) {
			$result = parent::db_select($columns, $where, $results);
			for ($i = 0; $i < count($results); $i++) {
				$results[$i]->report = unserialize($results[$i]->report);
			}
			return $result;
		}
		public function db_insert() {
			$hold = $this->report;
			$this->report = serialize($this->report);
			$result = parent::db_insert();
			$this->report = $hold;
			return $result;
		}
		public function db_update() {
			$hold = $this->report;
			$this->report = serialize($this->report);
			$result = parent::db_update();
			$this->report = $hold;
			return $result;
		}
	}
	
	//user model
	class user extends base {
		public static $table_name = "users";
		public $id = 0, $firstname, $surname, $email, $username, $passwordHash, $permissions;
		
		public function fullName() {
			return $this->firstname . " " . $this->surname;
		}
		public static function test_user() {
			$usr = new static;
			$usr->firstname = "default";
			$usr->surname = "mc'defaultface";
			$usr->email = "i prefer gmail";
			$usr->username = "meh";
			$usr->passwordHash = "keyyboardSMASHIJIRU!";
			$usr->permissions = permissions_admin;
			return $usr;
		}
	}
	
	//control text model
	class text extends base {
		public static $table_name = "texts";
		public $id, $title, $text, $authorId, $authorName, $public;
	}
	
	//test model
	class test extends base {
		public static $table_name = "tests";
		public $id, $code, $conductorId, $conductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public;

		public static function db_select_by_code($code, &$resultValue) {
			$result = static::db_select(["*"], array("code"=>$code), $results);
			if (count($results) == 0) $resultValue = NULL;
			else $resultValue = $results[0];
			return $result;
		}
		
		//brute force seek unique code
		public static function dbGenerateCode() {	
			$code = "" . rand(1000, 9999);
			static::db_select_by_code($code, $test);		
			while ($test != NULL) {
				$code = "" . rand(1000, 9999);
				static::db_select_by_code($code, $test);		
			}
			return $code;
		}

	}
	
	//deploy macro
	function db_deploy() {
		global $dbi;
		if (!$dbi->mysqli) return "Failed to connect. " . $dbi->mysqli->error;
		if ($dbi->select_db()) return "Database already exists.";
		if (!$dbi->create_db()) return "Failed to create database. " . $dbi->mysqli->error;
		if (!$dbi->select_db()) return "Failed to select database. " . $dbi->mysqli->error;
		
		if (!$dbi->query("CREATE TABLE " . user::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			firstname VARCHAR(255),
			surname VARCHAR(255),
			email VARCHAR(".db_settings_uKeyLen.") UNIQUE,
			username VARCHAR(".db_settings_uKeyLen.") UNIQUE,
			passwordHash CHAR(60),
			permissions INT,
		)")) return "Failed to create user table. " . $dbi->mysqli->error;
		
		if (!$dbi->query("CREATE TABLE " . text::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			title VARCHAR(".db_settings_uKeyLen.") UNIQUE,
			text TEXT,
			authorId INT,
			authorName VARCHAR(255),
			public BIT
		)")) return "Failed to create text table. " . $dbi->mysqli->error;
		
		if (!$dbi->query("CREATE TABLE " . test::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			code CHAR(4) UNIQUE,
			conductorId INT,
			conductorName VARCHAR(255),
			textId INT,
			textName VARCHAR(255),
			dateBegin INT,
			dateEnd INT,
			submissions INT,
			public BIT
		)")) return "Failed to create test table. " . $dbi->mysqli->error;
		
		if (!$dbi->query("CREATE TABLE " . submission::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			firstname VARCHAR(255),
			surname VARCHAR(255),
			email VARCHAR(255),
			date INT,
			testId INT,
			testCode CHAR(4),
			textId INT,
			textTitle VARCHAR(255),
			report TEXT,
			totalSentences INT,
			totalWords INT,
			totalLetters INT,
			faultySentences INT,
			faultyWords INT,
			faultyLetters INT
		)")) return "Failed to create submission table. " . $dbi->mysqli->error;
		
		return "Deployed successfully";
	}
?>