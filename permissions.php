<?php header('charset=utf-8');
	define("permissions_take_test", 0);
	define("permissions_conduct", 1);
	define("permissions_admin", 2);
	
	define("action_select", 0);
	define("action_insert", 1);
	define("action_update", 2);
	define("action_delete", 3);
	
	function test_key($namedCollection, $key, $value) {
		$good = false;
		foreach($namedCollection as $key2 => $value2) {
			if ($key2 == $key) {			
				if (is_array($value2)) {
					if ($value2[0] != "=" || $value2[1] != $value) return false;
				} else {
					if ($value2 != $value) return false;
				}
				$good = true;
			}
		}
		return good;
	}
	
	class permissions {
		
		public static function evaluate_test_taker($table, $columns, $where, $action) {
			if ($action == action_insert) return $table == "submissions";
			if ($action == action_select) return $table == "test" && $columns == array("dateEnd");
			return false;
		}
		
		public static function evaluate_conductor($table, $columns, $where, $action) {
			global $current_user;
			if ($table == "users") {
				if (array_search("passwordHash", $columns) !== false) return false;
				if (array_search("permissions", $columns) !== false) return false;
				if (!test_key($where, "id", $current_user->id)) return false;			
			}
			return true;
		}
		
		public static function evaluate_admin($table, $columns, $where, $action) {
			if (array_search("passwordHash", $columns) !== false) return false;
			return true;
		}
		
		public static function evaluate($table, $columns, $where, $action) {
			global $current_user;
			switch ($current_user->permissions) {
				case permissions_take_test: return static::evaluate_test_taker($table, $columns, $where, $action);
				case permissions_conduct: return static::evaluate_conductor($table, $columns, $where, $action);
				case permissions_admin: return static::evaluate_admin($table, $columns, $where, $action);
			}
		}
			
	}
	
	

	
	
	
	
	
	
?>