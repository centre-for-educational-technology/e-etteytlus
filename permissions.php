<?php header('charset=utf-8');
	define("permissions_take_test", 0);
	define("permissions_conduct", 1);
	define("permissions_admin", 2);
	
	define("action_select", 0);
	define("action_insert", 1);
	define("action_update", 2);
	define("action_delete", 3);
	
	function get_key($collection, $key, &$value) {
		if (is_array($collection)) {
			if (array_keys($collection) === range(0, count($collection) - 1)) return array_search($key, $collection);
			if (array_key_exists($key, $collection)) {
				$value = $collection[$key];
				return true;
			}
			return false;
		}
		if (property_exists($collection, $key)) {
			$value = $collection->$key;
			return true;
		}
		return false;
	}
	
	function test_value($testable, $op, $value) {		
		if (is_array($testable)) return $testable[0] == $op && $testable[1] == $value;
		return $op == "=" && $testable == $value;
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
				if (get_key($columns, "passwordHash", $value)) return false;
				if (get_key($columns, "permissions", $value)) return false;
				if (!get_key($where, "id", $value)) return false;
				if (!test_value($value, "=", $current_user->id)) return false;		
			}
			return true;
		}
		
		public static function evaluate_admin($table, $columns, $where, $action) {
			if (get_key($columns, "passwordHash", $value)) return false;
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