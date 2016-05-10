<?php header('charset=utf-8');
	require("db.php");
	
	//base class for model based tables
	class base {
		public static $table_name;
		
		public function urlEncode() {
			foreach ($this as $key => &$value) {
				if (is_string($value)) $value = urlencode($value);
			}
		}
		
		//db interaction
		public function dbInsert() {
			global $dbi;
			return $dbi->insert(static::$table_name, $this);
		}
		public function dbUpdate() {
			global $dbi;
			return $dbi->update(static::$table_name, $this);
		}
		public static function dbDeleteById($id) {
			global $dbi;
			return $dbi->deleteById(static::$table_name, $id);
		}
		public static function dbGetById($id, &$resultValue) {
			$result = static::dbSelect(array("id"=>$id), $results);
			if ($result == db_success) {
				$resultValue = $results[0];
			}
			return $result;
		}
		public static function dbSelect($where, &$results) {
			global $dbi;
			$result = $dbi->select(static::$table_name, "*", $where);
				
			if ($result == db_success) {
				$selector = $dbi->arg;
				$results = [];
				while ($row = $selector->fetch_assoc()) {
					array_push($results, static::fromRow($row));
				}
			}
			
			return $result;
		}
		
		//sql fetched row constructor
		public static function fromRow($row) {
			$ret = new static;
			foreach ($row as $key => $value) $ret->{$key} = $value;
			return $ret;
		}
	}
	
	//test submission model
	class submission extends base {
		public static $table_name = "submissions";
		public $id, $firstname, $surname, $email, $date, $testId, $textId, $text, $errors;
		
		public static function fromValues($firstname, $surname, $email, $date, $testId, $textId, $text, $errors) {
			$ret = new static;
			$ret->firstname = $firstname; $ret->surname = $surname; $ret->email = $email; $ret->date = $date; 
			$ret->testId = $testId; $ret->textId = $textId; $ret->text = $text; $ret->errors = $errors;
			return $ret;
		}
	}
	
	//user model
	class user extends base {
		public static $table_name = "users";
		public $id = 0, $firstname, $surname, $email, $username, $passwordHash, $admin;
		
		public static function fromValues($firstname, $surname, $email, $username, $passwordHash, $admin) {
			$ret = new static;
			$ret->firstname = $firstname; $ret->surname = $surname; $ret->email = $email; 
			$ret->username = $username; $ret->passwordHash = $passwordHash; $ret->admin = $admin;
			return $ret;
		}
		
		public function fullName() {
			return $this->firstname . " " . $this->surname;
		}
	}
	
	//control text model
	class text extends base {
		public static $table_name = "texts";
		public $id, $title, $text, $authorId, $authorName, $public;
		
		public static function fromValues($title, $text, $authorId, $authorName, $public) {
			$ret = new static;
			$ret->title = $title; $ret->text = $text; $ret->public = $public;
			$ret->authorId = $authorId; $ret->authorName = $authorName; 
			return $ret;
		}
	}
	
	//test model
	class test extends base {
		public static $table_name = "tests";
		public $id, $code, $conductorId, $conductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public;
		
		public static function fromValuesWithCode($code, $conductorId, $conductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public) {
			$ret = new static;
			$ret->code = $code; $ret->conductorId = $conductorId; $ret->conductorName = $conductorName; $ret->textId = $textId; $ret->textName = $textName; 
			$ret->dateBegin = $dateBegin; $ret->dateEnd = $dateEnd; $ret->submissions = $submissions; $ret->public = $public;
			return $ret;
		}
		
		public static function fromValues($conductorId, $conductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public) {
			global $dbi;
			
			//brute force seek unique code
			$foundCode = false;
			$code = NULL;
			while (!$foundCode) {
				$code = "" . rand(0, 9999);
				$selResult = static::dbSelect(array("code"=>$code), $results);
				if (count($results) == 0) $foundCode = true;
			}
			
			return static::fromValuesWithCode($code, $conductorId, $conductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public);
		}
	}
	
	//deploy macro
	function dbDeploy() {
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
			admin BIT
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
			code CHAR(4),
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
			textId INT,
			text TEXT,
			errors TEXT	
		)")) return "Failed to create submission table. " . $dbi->mysqli->error;
		
		return "Deployed successfully";
	}
?>