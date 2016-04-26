<?php header('charset=utf-8');
	require('dbModels.php');
	echo dbDeploy();
	
	echo "<br><br>";

	text::dbSelect(array("title"=>"asd"), $res);
	var_dump($res);
?>