<?php header('charset=utf-8');
	define("db_settings_name", "eetteytlus");
	define("db_settings_user", "root");
	define("db_settings_password", "");
	define("db_settings_host", "localhost");
	define("db_settings_charset", "utf8mb4");
	define("db_settings_collate", "utf8mb4_unicode_ci");
	
	define("db_success", 0);
	define("db_error", 1);
	define("db_error_unique", 2);
	define("db_error_db", 3);
	define("db_error_table", 4);
	define("db_error_connect", 5);
	
	class dbi {
		public $mysqli;
		public $errorArg;
		public $select_db_done = false;
		
		public function __construct() {
			$this->mysqli = new mysqli(db_settings_host, db_settings_user, db_settings_password);
			
		}
		
		public function create_db() {
			return $this->mysqli->query("CREATE DATABASE " . db_settings_name . " CHARACTER SET " . db_settings_charset . " COLLATE " . db_settings_collate);
		}
		
		public function select_db() {
			if ($this->select_db_done) return true;
			return $this->select_db_done = $this->mysqli->select_db(db_settings_name);	
		}
		
		public function query($sql) {
			return $this->mysqli->query($sql);
		}
		
		public function escape($value) {
			return $this->mysqli->real_escape_string($value);
		}
		
		public function insert($obj, $table) {
			if (!$this->mysqli) return db_error_connect;
			
			$sql1 = "INSERT INTO " . $table . " (";
			$sql2 = "VALUES (";
			foreach ($obj as $key => $value) {
				$sql1 .= $key . ",";
				$sql2 .= "'" . $this->escape($value) . "',";
			}
			$sql = rtrim($sql1, ",") . ") " . rtrim($sql2, ",") . ")";

			if (!$this->select_db()) return db_error_db;
			if ($this->query($sql)) return db_success;
			if ($this->mysqli->errno == 1062) {
				preg_match("/'(.[^ ]*)'$/", $this->mysqli->error, $arg);
				$this->errorArg = trim($arg[0], "'");
				return db_error_unique;
			}
			return db_error;
		}
		
		public function select($table, $what, $where, &$result) {
			if (!$this->mysqli) return db_error_connect;
			
			$sql = "SELECT ";
			for ($i = 0; $i < count($what); $i++) $sql .= $this->escape($what[$i]) . ",";
			$sql = rtrim($sql, ",") . " FROM " . $table;
			
			if (is_array($where) && count($where)) {
				$sql .= " WHERE ";
				foreach ($where as $key => $value) $sql .= $this->escape($key) . "='" . $this->escape($value) . "',";
				$sql = rtrim($sql, ",");
			}
		
			if (!$this->select_db()) return db_error_db;
			$result = $this->query($sql);
			if ($result) return db_success;
			return db_error;
		}		
	}
	
	$dbi = new dbi();

?>