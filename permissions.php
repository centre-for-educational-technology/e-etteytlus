<?php header('charset=utf-8');
	define("permissions_take_test", 0);
	define("permissions_conduct", 1);
	define("permissions_admin", 2);
	
	define("action_select", 0);
	define("action_insert", 1);
	define("action_update", 2);
	define("action_delete", 3);
	
	function test_key($key, $collection, $value = NULL) {
		if (!isset($collection)) return false;
		if (is_array($collection) && array_keys($collection) === range(0, count($collection) - 1)) return array_search($key, $collection) !== false;
		foreach ($collection as $key2 => $value2) {
			if ($key2 == $key) {
				if (!isset($value)) return true;
				if (is_array($value2)) return $value == $value2[1];
				return $value == $value2;
			}
		}
		return false;
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
				if (!test_key("id", $where, $current_user->id)) return false;			
				if ($action != action_select && test_key("permissions", $columns)) return false;
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