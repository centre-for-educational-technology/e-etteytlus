<?php header('charset=utf-8');
	require 'array.php';
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
	


	function stuff1() {
		global $controlText; global $sampleText;
		$control = "door";
		$sample = "bor";
		$control = $controlText; $sample = $sampleText;
		$edits;
		$diff = levenshtein2::compute($control, $sample, $edits);

		echo "<br><br>";
		echo "distance: " . $diff;
		
		echo "<br><br>Control:" . $control;	
		
		$out = "";
		$tp = 0;
		$bad1 = "<span style='background-color:red'>";
		$bad2 = "</span>";
		for ($i = 0; $i < count($edits); $i++) {		
			switch ($edits[$i]) {
				case levenshtein2::EDIT_NONE: 
					$out .= mb_substr($sample, $tp++, 1, 'UTF-8'); break;
				case levenshtein2::EDIT_REPLACE:
					$out .= $bad1 . mb_substr($sample, $tp++, 1, 'UTF-8') . $bad2; break;
				case levenshtein2::EDIT_DELETE:
					$out .= $bad1 . mb_substr($sample, $tp++, 1, 'UTF-8') . $bad2; break;
				case levenshtein2::EDIT_INSERT:
					$out .= $bad1 . "_" . $bad2; break;
			}
			
		}
		echo "<br><br>Sample:" . $out;
	}

	$mt = microtime(true);
	
	stuff1();

	echo "<br><br>Time: " . (microtime(true) - $mt) . "s";
	
	

?>