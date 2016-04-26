<?php header('charset=utf-8');
	class levenshtein2 {
		const EDIT_NONE = 0;
		const EDIT_REPLACE = 1;
		const EDIT_INSERT = 2;
		const EDIT_DELETE = 3;
		
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
		public static function compute($mysqlitrol, $sample, &$edits) {	
			$width = mb_strlen( $sample, 'UTF-8');			
			$height = mb_strlen( $mysqlitrol, 'UTF-8');
			$matrix = new SplFixedArray($height);												//Used to store the matrix
			$prevRow = range(0, $width);														//Initial row

			for ($y = 0; $y < $height; $y++) {													//For each row
				$currentRow = array();
				$currentRow[0] = $y + 1;		
				$mRow = ""; 																	//Matrix row temporary
				$mVal = 0;																		//Matrix column temporary
				$cSample = mb_substr( $mysqlitrol, $y, 1, 'UTF-8') ;								//Sample char
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
					if ($diag == $center) 	$edits[] = self::EDIT_NONE;							//to get to the next lowest value cell
					else 					$edits[] = self::EDIT_REPLACE;						//preferred order diagonal -> left -> top
					$x -= 1; $y -= 1;															//Diagonal means either replace if cost or
					$current = $previous;														//no-op without cost
					if ($y > 0) $previous = self::previous_row($matrix[$y - 1], $width, $current);
				} elseif ($left <= $top && $left <= $center) {									//left means delete
					$edits[] = self::EDIT_DELETE;
					$x -= 1;
				} else {
					$edits[] = self::EDIT_INSERT;												//top means insert
					$y -= 1;
					$current = $previous;
					if ($y > 0) $previous = self::previous_row($matrix[$y - 1], $width, $current);
				}
			}
			
			$edits = array_reverse($edits);														//reverse edits to go from left to right
			
			return $prevRow[$width];															//return the distance
		}
	}
?>