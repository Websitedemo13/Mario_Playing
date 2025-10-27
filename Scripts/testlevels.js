/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */
 
/* LEVELS ORIGINALLY BY MARTIN BUCHNER & PATRICK SAAR */

// reflection is defined globally in oop.js
//var reflection = {}; // Commented out as reflection is global

var definedLevels = [
{ // Level 0 (Màn 1) - ID: 0
	width: 252,
	height: 15,
	id: 0,
	background: 1,
	data:
	[
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'pipe_top_left' , 'pipe_left' , 'pipe_left_grass' , 'pipe_left_soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'pipe_top_right' , 'pipe_right' , 'pipe_right_grass' , 'pipe_right_soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'mario' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , 'multiple_coinbox' , '' , '' , '' , 'grass_top' , 'soil'], // Giữ lại hộp coin nhiều
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'planted_soil_left'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'planted_soil_middle'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'planted_soil_right'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'bush_left' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'bush_middle' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'bush_middle_right' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'bush_right' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , 'questionbox' , '' , '' , '' , 'grass_top' , 'soil'], // Cột 22: QBox 1 (Câu 0)
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'ballmonster' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'pipe_top_left' , 'pipe_left' , 'pipe_left_grass' , 'pipe_left_soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'pipe_top_right' , 'pipe_right' , 'pipe_right_grass' , 'pipe_right_soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , 'questionbox' , '' , '' , '' , 'brown_block' , 'brown_block' , 'brown_block' , 'grass_top' , 'soil'], // Cột 35: QBox 2 (Câu 1)
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'brown_block' , 'brown_block' , 'brown_block' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'pipe_top_left' , 'pipe_left' , 'pipe_left_grass' , 'pipe_left_soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'pipe_top_right' , 'pipe_right' , 'pipe_right_grass' , 'pipe_right_soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , 'coinbox' , '' , '' , '' , 'grass_top' , 'soil'], // Giữ lại 1 coinbox
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'ballmonster' , 'grass_top' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top_left' , 'grass_left' , 'grass_left' , 'grass_top_left_corner' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , 'questionbox' , '' , '' , '' , 'grass_top' , 'soil' , 'planted_soil_left' , 'soil' , 'soil'], // Cột 68: QBox 3 (Câu 2)
	['' , '' , '' , '' , '' , '' , 'brown_block' , '' , '' , '' , 'grass_top' , 'soil' , 'planted_soil_right' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , 'coinbox' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , 'brown_block' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , 'coinbox' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , '' , '' , 'ballmonster' , 'grass_top' , 'soil' , 'soil' , 'soil' , 'soil'],
	['' , '' , '' , '' , '' , '' , '' , 'pipe_top_left' , 'pipe_left' , 'pipe_left' , 'pipe_left_grass' , 'pipe_left_soil' , 'pipe_left_soil' , 'pipe_left_soil' , 'pipe_left_soil'],
	['' , '' , '' , '' , '' , '' , '' , 'pipe_top_right' , 'pipe_right' , 'pipe_right' , 'pipe_right' , 'pipe_right' , 'pipe_right' , 'pipe_right_grass' , 'pipe_right_soil'],
	// ... (Các cột còn lại giữ nguyên đến hết màn 0) ...
	['' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , '' , 'grass_top'] // Cột 251 (cuối)
	]
}
	,
{ // Level 1 (Màn 2) - ID: 1
	width: 220,
	height: 15,
	id: 1,
	background: 1,
	data:
	[
	['','','','','','','','','','','','','','grass_top','planted_soil_middle'], // Cột 0
	['','','','','','','','','','','','','','grass_top','planted_soil_middle'],
	['','','','','','','','','','','','','mario','grass_top','planted_soil_right'],
	['','','','','','','','','','','','','','grass_top','soil'],
	['','','','','','','','','','','','','','grass_top','soil'],
	['','','','','','','','','questionbox','','','','','grass_top','soil'], // Cột 6: QBox 1 (Câu 3)
	['','','','','','','','','mushroombox','','','','','grass_top','soil'], // Giữ mushroombox
	['','','','','','','','','coinbox','','','','bush_left','grass_top','soil'], // Giữ coinbox
	['','','','','','','','','','','','','bush_middle_left','grass_top','soil'],
	['','','','','','','','','','','','','bush_middle','grass_top','soil'],
	['','','','','','','','','','','','','bush_middle_right','grass_top','soil'],
	['','','','','','','','','','','','','bush_right','grass_top','soil'],
	// ... (Cột 13-66 giữ nguyên) ...
	['','','','','','','','','questionbox','','','bush_right','grass_top','soil','planted_soil_left'], // Cột 67: QBox 2 (Câu 4)
	['','','','','','','','','','','','','grass_top','soil','planted_soil_middle'],
	// ... (Cột 69-148 giữ nguyên) ...
	['','','','','','','','','','questionbox','','','','grass_top','soil'], // Cột 149: QBox 3 (Câu 5)
	// ... (Các cột còn lại giữ nguyên đến hết màn 1) ...
	['','','','','','','','','','','','','','grass_top','soil'] // Cột 219 (cuối)
	]
}
	,
{ // Level 2 (Màn 3) - ID: 2
	width: 194,
	height: 15,
	id: 2,
	background: 8, // Nền hang động
	data:
	[
	['','','','','','','','','','','','','','grass_top','soil'], // Cột 0
	// ... (Cột 1-69 giữ nguyên) ...
	['','','','','','','','','','','questionbox','','grass_top','soil','soil'], // Cột 70: QBox 1 (Câu 6)
	['','','','','','','','','','','','','grass_top','soil','soil'],
	// ... (Cột 72-114 giữ nguyên) ...
	['','','','','','','','','','','questionbox','','','grass_top','soil'], // Cột 115: QBox 2 (Câu 7)
	['','','','','','','','','','','','','grass_top','soil','soil'],
	// ... (Cột 117-179 giữ nguyên) ...
	['','','','','','','','','','','questionbox','','','grass_top','soil'], // Cột 180: QBox 3 (Câu 8)
	['','','','','','','','','','','','','grass_top','soil','soil'],
	// ... (Các cột còn lại giữ nguyên đến hết màn 2) ...
	['','','','','','','','','','','','grass_top_right_rounded','soil_right','soil_right','soil_right'] // Cột 193 (cuối)
	]
}
	// Xóa tất cả các màn chơi từ id: 3 trở đi
];

