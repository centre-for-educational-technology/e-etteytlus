<?php header('charset=utf-8');
	require("config.php");

	//dbi interaction result constants
	define("db_success", 0);
	define("db_error", 1);
	define("db_error_unique", 2);
	define("db_error_db", 3);
	define("db_error_table", 4);
	define("db_error_connect", 5);
	define("db_error_field", 6);
	define("db_error_unauthorized", 7);
	
	//mysqli wrapper for convenience
	class dbi {
		//the interface
		public $mysqli;
		private $select_db_done = false;
		
		//optional result arg
		public $arg;
		public $arg2;
		
		
		//def constructor
		public function __construct() {
			$this->mysqli = new mysqli(db_settings_host, db_settings_user, db_settings_password, NULL, db_settings_port);		
		}
		
		//boiler stuff
		public function create_db() {
			return $this->mysqli->query("CREATE DATABASE " . db_settings_name . " CHARACTER SET " . db_settings_charset . " COLLATE " . db_settings_collate);
		}		
		public function select_db() {
			if ($this->select_db_done) return true;
			return $this->select_db_done = $this->mysqli->select_db(db_settings_name);	
		}	
		public function query($sql) {
			//$this->arg2 = $sql;
			return $this->mysqli->query($sql);
		}	
		public function escape($value) {
			return $this->mysqli->real_escape_string($value);
		}
		
		//basic interaction
		public function insert($table, &$obj) {
			if (!$this->mysqli) return db_error_connect;
			if (!$this->select_db()) return db_error_db;
			
			$sql1 = "INSERT INTO " . $this->escape($table) . " (";
			$sql2 = "VALUES (";
			foreach ($obj as $key => $value) {
				$sql1 .= $key . ",";
				$sql2 .= "'" . $this->escape($value) . "',";
			}
			$sql = rtrim($sql1, ",") . ") " . rtrim($sql2, ",") . ")";
			
			if ($this->query($sql)) {
				$obj->id = $this->mysqli->insert_id;
				return db_success;
			}
			
			if ($this->mysqli->errno == 1062) {
				preg_match("/'(.[^ ]*)'$/", $this->mysqli->error, $arg);
				$this->arg = trim($arg[0], "'");
				return db_error_unique;
			}
			return db_error;
		}
		
		public function delete_by_id($table, $id) {
			if (!$this->mysqli) return db_error_connect;
			if (!$this->select_db()) return db_error_db;
			
			$sql = "DELETE FROM " . $this->escape($table) . " WHERE id = " . $this->escape($id);
			if ($this->query($sql)) return db_success;
			return db_error;
		}
		
		//$what is a regular array of column names
		//$where is a named array "key"=>"value", equals only
		//$where optionally "key"=>["operator", "value"]
		public function select($table, $columns, $where) {
			if (!$this->mysqli) return db_error_connect;
			if (!$this->select_db()) return db_error_db;
			
			$sql = "SELECT ";
			for ($i = 0; $i < count($columns); $i++) {
				$sql .= $this->escape($columns[$i]) . ",";
			}
			$sql = rtrim($sql, ",") . " FROM " . $this->escape($table);
			
			if (isset($where) && count($where)) {
				$sql .= " WHERE ";
				foreach ($where as $key => $value) {
					if (is_array($value)) {
						$sql .= $this->escape($key) . $this->escape($value[0]) . "'" . $this->escape($value[1]) . "',";
					} else {
						$sql .= $this->escape($key) . "='" . $this->escape($value) . "',";
					}	
				}
				$sql = rtrim($sql, ",");
			}

			$selector = $this->query($sql);
			if (!$selector) return db_error;
			
			$this->arg = [];
			while ($row = $selector->fetch_assoc()) {
				array_push($this->arg, $row);
			}
			
			return db_success;
		}

		public function update($table, $obj) {
			if (!$this->mysqli) return db_error_connect;
			if (!$this->select_db()) return db_error_db;
			
			$sql = "UPDATE " . $this->escape($table) . " SET ";
			foreach ($obj as $key => $value) {
				if ($key == "id") continue;
				$sql .= $key . "='" . $this->escape($value) . "',";
			}
			$sql = rtrim($sql, ",") . " WHERE id=" . $this->escape($obj->id);
			if ($this->query($sql)) return db_success;
			return db_error;
		}
	}
	
	//request specific instance
	$dbi = new dbi();
?>