<?php header('charset=utf-8');

	function hasFlag($sample, $flag) {
		return ($sample & $flag) == $flag;
	}
	
	function parseArr($arr) {
		$ret = "";
		for ($i = 0; $i < count($arr); $i++) {
			$ret .= $arr[$i] . " ";
		}
		return $ret;
	}

	class levenshtein2 {
		const FLAG_OK = 0;
		const FLAG_REPLACE = 1;
		const FLAG_INSERT = 2;
		const FLAG_DELETE = 4;
		
		//matrix row unpack utility
		public static function previous_row($row, $width, $current) {
			$mVal = 0;
			for ($x = 0; $x < $width + 1; $x++) {
				$xm = $x % 4;
				if (!$xm) $mVal = ord($row[$x >> 2]);	
				$current[$x] -= (($mVal >> 2 * $xm) & 3) - 1;
			}
			return $current;
		}
		
		//Levenshtein distance, based on Wagner-Fischer algorithm
		//with php friendly matrix storage and backwards tracing to get the optimal edit sequence
		public static function compute($control, $sample, &$edits) {	
			$width = mb_strlen( $sample, 'UTF-8');			
			$height = mb_strlen( $control, 'UTF-8');
			$matrix = new SplFixedArray($height);												//Used to store the matrix
			$prevRow = range(0, $width);														//Initial row

			for ($y = 0; $y < $height; $y++) {													//For each row
				$currentRow = array();
				$currentRow[0] = $y + 1;		
				$mRow = ""; 																	//Matrix row temporary
				$mVal = 0;																		//Matrix column temporary
				$cSample = mb_substr( $control, $y, 1, 'UTF-8') ;								//Sample char
				for ($x = 0; $x < $width; $x++) {												//For each column
					$cControl = mb_substr( $sample, $x, 1, 'UTF-8' );							//Control char
					$insert = $prevRow[$x+1] + 1;												//Insertion cost
					$delete = $currentRow[$x] + 1;												//Deletion cost
					$replace = $prevRow[$x] + ($cSample != $cControl);							//Replacement cost
					$currentRow[] = min($insert, $delete, $replace);							//Act on lowest cost
							
					$xm = $x % 4;																//To store the matrix,
					$mVal += ($currentRow[$x] - $prevRow[$x] + 1) << ($xm * 2);					//calculate differential between rows
					if ($xm == 3) {																//and store as 2 bits packed in a byte
						$mRow .= chr($mVal);													//When byte is full,
						$mVal = 0;																//append to row string as char
					}
				}
				$mVal += ($currentRow[$width] - $prevRow[$width] + 1) << (($width % 4) * 2);	//get last value
				$mRow .= chr($mVal);															//get last row
				$matrix[$y] = $mRow;															//append last row
				$prevRow = $currentRow;															//cycle the unpacked row
			}	
			
			//unpacking and tracing part
			$x = $width;																		//Start at the bottom-right corner
			$y = $height;																		//of the matrix and work towards top-left
			$current = $prevRow;																//Bottom row
			$previous = self::previous_row($matrix[$y - 1], $width, $current);					//Top row
			$edits = array();																	//Edit sequence storage
			
			while ($x && $y) {																	//While not in the top-left cell		
				$center = 	 $current [$x];														//Current cell
				$top = 		 $previous[$x];														//Top cell
				$left = $x ? $current[$x - 1] : $center + 1;									//If possible, left cell, otherwise unusable
				$diag = $x ? $previous[$x - 1]:	$center + 1;									//If possible, diagonal cell, otherwise unusable
				
				if ($diag <= $left && $diag <= $top && $diag <= $center) {						//Choose between the 3 adjecant cells
					if ($diag == $center) 	$edits[] = self::FLAG_OK;							//to get to the next lowest value cell
					else 					$edits[] = self::FLAG_REPLACE;						//preferred order diagonal -> left -> top
					$x -= 1; $y -= 1;															//Diagonal means either replace if cost or
					$current = $previous;														//no-op without cost
					if ($y > 0) $previous = self::previous_row($matrix[$y - 1], $width, $current);
				} elseif ($left <= $top && $left <= $center) {									//left means delete
					$edits[] = self::FLAG_DELETE;
					$x -= 1;
				} else {
					$edits[] = self::FLAG_INSERT;												//top means insert
					$y -= 1;
					$current = $previous;
					if ($y > 0) $previous = self::previous_row($matrix[$y - 1], $width, $current);
				}
			}
			
			$edits = array_reverse($edits);														//reverse edits to go from left to right
			
			return $prevRow[$width];															//return the distance
		}
		
	}
	
	class diffBlock {
		public $char;
		public $flags;
		
		public function __construct($char) {
			$this->char = $char;
			$this->flags = 0;
		}
	}
	
	class diffReport {
		public $distance; 
		
		public $faultyLetters;
		public $faultyWords;
		public $faultySentences;	
		public $totalLetters;
		public $totalWords;
		public $totalSentences;
			
		public $sample;
		public $control;
		public $edits;
		public $sampleLen;
		public $controlLen;
		public $editsLen;
		public $parsed;
		
		const FLAG_FAULTY_LETTER = 1;
		const FLAG_FAULTY_SENTENCE = 2;
		const FLAG_FAULTY_WORD = 4;
		const FLAG_WORD_BEGIN = 8;
		const FLAG_WORD_END = 16;
		const FLAG_SENTENCE_BEGIN = 32;
		const FLAG_SENTENCE_END = 64;
		
		public function __toString() {
			return $parsed;
		}
		
		public static function isPunctuation($c) {
			return preg_match("/[^A-zäöõüåðþÄÖÕÜÅÐÞ]/", $c);
		}
		
		public static function isSentenceEnder($c) {
			return preg_match("/[.!?]/", $c);;
		}
		
		public function parseSample($faultyLetterAttribute = "style='background-color:red'", $faultyWordAttribute = "style='background-color:orange'", $faultySentenceAttribute = "style='background-color:yellow'") {
			$this->faultyLetters = 0;
			$this->faultyWords = 0;
			$this->faultySentences = 0;
			$this->totalLetters = 0;
			$this->totalWords = 0;
			$this->totalSentences = 0;
			$lastPunctuation = !static::isPunctuation(mb_substr($this->sample, 0, 1, 'UTF-8'));
			$lastSentenceEnder = true;
			
			$map = [];
			
			//mark + count letter faults and mark word + sentence bounds
			for ($i = 0; $i < $this->editsLen; $i++) {
				$edit = &$this->edits[$i];
				$block = new diffBlock(($edit == levenshtein2::FLAG_INSERT) ? " " : mb_substr($this->sample, $this->totalLetters++, 1, 'UTF-8'));
							
				if ($edit != levenshtein2::FLAG_OK) {
					$this->faultyLetters++;
					$block->flags |= static::FLAG_FAULTY_LETTER;
				}
				
				if (static::isPunctuation($block->char) != $lastPunctuation) {
					$block->flags |= static::FLAG_WORD_BEGIN;
					if (count($map) > 0) end($map)->flags |= static::FLAG_WORD_END;
					$lastPunctuation = !$lastPunctuation;
				}
				
				if ($lastSentenceEnder) {
					$block->flags |= static::FLAG_SENTENCE_BEGIN;
					if (count($map) > 0) end($map)->flags |= static::FLAG_SENTENCE_END;				
				}
				$lastSentenceEnder = static::isSentenceEnder($block->char);		
				
				$map[] = $block;
			}
			end($map)->flags |= static::FLAG_SENTENCE_END | static::FLAG_WORD_END;
			
			//extend letter faults to word and sentence faults and count words + sentences
			$mapLen = count($map);
			$wordBegin = 0;
			$sentenceBegin = 0;
			$faultyWord = false;
			$faultySentence = false;
			for ($i = 0; $i < $mapLen; $i++) {
				$block = &$map[$i];
				
				if (hasFlag($block->flags, static::FLAG_WORD_BEGIN)) {
					$faultyWord = false;
					$wordBegin = $i;
					$this->totalWords++;
				}
				if (hasFlag($block->flags, static::FLAG_SENTENCE_BEGIN)) {
					$faultySentence = false;
					$sentenceBegin = $i;
					$this->totalSentences++;
				}
				
				if (hasFlag($block->flags, static::FLAG_FAULTY_LETTER)) {
					if (!$faultyWord) {
						$faultyWord = true;
						$map[$wordBegin]->flags |= static::FLAG_FAULTY_WORD;
						$this->faultyWords++;
					}
					if (!$faultySentence) {
						$faultySentence = true;
						$map[$sentenceBegin]->flags |= static::FLAG_FAULTY_SENTENCE;
						$this->faultySentences++;
					}		
				}
				
				if (hasFlag($block->flags, static::FLAG_WORD_END) && $faultyWord) {
					$block->flags |= static::FLAG_FAULTY_WORD;
				}
				if (hasFlag($block->flags, static::FLAG_SENTENCE_END) && $faultySentence) {
					$block->flags |= static::FLAG_FAULTY_SENTENCE;
				}
			}
			
			//parse blocks into html
			$html = "";
			for ($i = 0; $i < $mapLen; $i++) {
				$block = &$map[$i];
				$c = $block->char;
				
				if (hasFlag($block->flags, static::FLAG_FAULTY_LETTER)) {
					$c = "<span " . $faultyLetterAttribute . ">" . $c . "</span>";
				}
				if (hasFlag($block->flags, static::FLAG_FAULTY_WORD | static::FLAG_WORD_BEGIN)) {
					$c = "<span " . $faultyWordAttribute . ">" . $c;
				}
				if (hasFlag($block->flags, static::FLAG_FAULTY_SENTENCE | static::FLAG_SENTENCE_BEGIN)) {
					$c = "<span " . $faultySentenceAttribute . ">" . $c;
				}
				if (hasFlag($block->flags, static::FLAG_FAULTY_WORD | static::FLAG_WORD_END)) {
					$c = $c . "</span>";
				}
				if (hasFlag($block->flags, static::FLAG_FAULTY_SENTENCE | static::FLAG_SENTENCE_END)) {
					$c = $c . "</span>";
				}
				$html .= $c;
			}
			
			return $html;
		}
		

		public function __construct($control, $sample) {
			$this->sample = trim(preg_replace('/\s+/', ' ', preg_replace("/[\n\r]/", "", preg_replace('/(\x{201C}|\x{201D}|\x{00AB}|\x{00BB}|\x{201E})/u', '"', $sample))), " ");
			$this->control = trim(preg_replace('/\s+/', ' ', preg_replace("/[\n\r]/", "", preg_replace('/(\x{201C}|\x{201D}|\x{00AB}|\x{00BB}|\x{201E})/u', '"', $control))), " ");
			$this->distance = levenshtein2::compute($this->control, $this->sample, $this->edits);
			$this->sampleLen = mb_strlen($this->sample, 'UTF-8');
			$this->controlLen = mb_strlen($this->control, 'UTF-8');
			$this->editsLen = count($this->edits);
			
			$fla = "class='faultyLetter'";
			$fwa = "class='faultyWord'";
			$fsa = "class='faultySentence'";
			$this->parsed = $this->parseSample($fla, $fwa, $fsa);
		}
	}
	
?>