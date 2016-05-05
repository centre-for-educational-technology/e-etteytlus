<?php header('charset=utf-8');
	require("db.php");
	
	class base {
		public static $table_name;
		
		public function urlEncode() {
			foreach ($this as $key => &$value) {
				if (is_string($value)) $value = urlencode($value);
			}
		}
		public function dbInsert() {
			global $dbi;
			return $dbi->insert($this, static::$table_name);
		}
		public static function fromRow($row) {
			$ret = new static;
			foreach ($row as $key => $value) $ret->{$key} = $value;
			return $ret;
		}
		public static function dbSelect($where, &$results) {
			global $dbi;
			$result = $dbi->select(static::$table_name, "*", $where, $selector);
			$results = [];
			if ($result == db_success) while ($row = $selector->fetch_assoc()) array_push($results, static::fromRow($row));
			return $result;
		}
	}
	
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
	
	class test extends base {
		public static $table_name = "tests";
		public $id, $mysqliductorId, $mysqliductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public;
		public static function fromValues($mysqliductorId, $mysqliductorName, $textId, $textName, $dateBegin, $dateEnd, $submissions, $public) {
			$ret = new static;
			$ret->conductorId = $mysqliductorId; $ret->conductorName = $mysqliductorName; $ret->textId = $textName; 
			$ret->dateBegin = $dateBegin; $ret->dateEnd = $dateEnd; $ret->submissions = $submissions; $ret->public = $public;
			return $ret;
		}
	}
	
	function dbDeploy() {
		global $dbi;
		if (!$dbi->mysqli) return "Failed to connect. " . $dbi->mysqli->error;
		if ($dbi->select_db()) return "Database already exists.";
		if (!$dbi->create_db()) return "Failed to create database. " . $dbi->mysqli->error;
		if (!$dbi->select_db()) return "Failed to select database. " . $dbi->mysqli->error;
		
		if (!$dbi->mysqli->query("CREATE TABLE " . user::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			firstname VARCHAR(128),
			surname VARCHAR(128),
			email VARCHAR(128) UNIQUE,
			username VARCHAR(128) UNIQUE,
			passwordHash CHAR(60),
			admin BIT
		)")) return "Failed to create user table. " . $dbi->mysqli->error;
		
		if (!$dbi->mysqli->query("CREATE TABLE " . text::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			title VARCHAR(128) UNIQUE,
			text TEXT,
			authorId INT,
			authorName VARCHAR(128),
			public BIT
		)")) return "Failed to create text table. " . $dbi->mysqli->error;
		
		if (!$dbi->mysqli->query("CREATE TABLE " . test::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT = 1000 PRIMARY KEY,
			conductorId INT,
			conductorName VARCHAR(128),
			textId INT,
			textName VARCHAR(128),
			dateBegin DATETIME,
			dateEnd DATETIME,
			submissions INT,
			public BIT
		)")) return "Failed to create test table. " . $dbi->mysqli->error;
		
		if (!$dbi->mysqli->query("CREATE TABLE " . submission::$table_name . " (
			id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			firstname VARCHAR(128),
			surname VARCHAR(128),
			email VARCHAR(128),
			date DATETIME,
			testId INT,
			textId INT,
			text TEXT,
			errors TEXT	
		)")) return "Failed to create submission table. " . $dbi->mysqli->error;
		
		return "Deployed successfully";
	}
?>