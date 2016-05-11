<?php header('charset=utf-8');
	require 'levenshtein2.php';
	$controlText = '
	"Adalbert, paks koer, kohvi ja moosi ja mustasõstra-veinikastet pealikule ja kiiresti!" hõikas zombistunud kambüüsiülemale kipper Hillar Hurmav, mees, kel kallim igas Läänemere maade sadamas.

	 Kõik mereaastahuvilised ja vegankruiislased tuleb Rohuküla-Heltermaa liinil ära vedada ning barkassiga Hari kurgus dokkimiseks pole aegagi. 
	
	Mõtlik pootsman, käes mõttetu kirjaplokk, kannab tekimadrused järjestikku munsterrolli. 
	
	Marssallik e-resident sooritab aga mängus egomaniakliku kontradmiraliga šahhi.
	';
	
	$sampleText = '
	     
	     
	Aadal Pert, paks koer - "Kohvi ja moosi. Ja mustasõstra-veini kastet pealikule, ja kiiresti!" hõikas zombistunud kambüüsiülemale kipper Hiller Hurmav. Mees, kel kallim igas läänemeremaade sadamas. 
	
	 Kõik mereaasta huvilised ja vegankruiislased tuleb rohuküla - heltermaa liinil ära vedada ning barkassiga. Hari kurgus nokkimiseks pole aegagi. 
	
	Mõtlik pootsman, käes mõttetu kirjaplokk, kannab tekimadrused järjestikus monster rolli. 
	
	Marsallik e-resident sooritab aga mängus egomanjakliku kontra-admiraliga šahhi.
	';
	



	$mt = microtime(true);
	
	$report = new diffReport($controlText, $sampleText);
	echo "faulty letters: " . $report->faultyLetters . "/" . $report->totalLetters;
	echo "<br>";
	echo "faulty words: " . $report->faultyWords . "/" . $report->totalWords;
	echo "<br>";
	echo "faulty sentences: " . $report->faultySentences . "/" . $report->totalSentences;
	echo "<br>";

	echo "distance: " . $report->distance;
	echo "<br><br>";
	
	echo $report->parseSample();
	echo "<br><br>";
	
	echo $report->control;

	echo "<br><br>Time: " . (microtime(true) - $mt) . "s";
	
	

?>