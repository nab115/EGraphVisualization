//initialize the cells of the grid to be used
var INFINITE = 100000;
var closeEG = [];
var openEG = [];
var ECells = [];
var d = document.getElementById("EGraphLayer");
var lineDrawE = document.getElementById("EGraphGrid");
var x_ = document.getElementById("xPos");
var y_ = document.getElementById("yPos");
var eps_ = document.getElementById("eps");
var weps_ = document.getElementById("weps");
lineDrawE.addEventListener("click", getClickPosition, false);
var startX, startY, goalX, goalY;
var epsilon = 1;
var wepsilon = 1;
var ctxE = d.getContext("2d");
var ctxE2 = lineDrawE.getContext("2d");
var cellQ = 20;
var rE = [];
for(var i = 0; i < cellQ; i++){
	rE.push(new Row(cellQ, 20, i*20));
}
paint();


//FUNCTOION DECLARATIONS
//This function is called upon clicking find path.

function findPath(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			rE[i].cells[j].isExpanded = false;
		}
	}
	updateEGraph();
	computePath();
}
function computePathToEG(){
	setNeighsEG(r);
	start = rE[startY].cells[startX];
	goal = rE[goalY].cells[goalX];
	updateEGraph();
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			rE[i].cells[j].isExpanded = false;
			rE[j].cells[i].g = INFINITE;
			rE[j].cells[i].h = EHeuristic(rE[j].cells[i]);
		}
	}
	start.g = 0;
	openEG.splice(0, openEG.length);
	closeEG.splice(0, closeEG.length);
	openEG.push(start);
	improvePathEG();
	drawPathEG();
}
function improvePathEG(){
	var s, temp, index;
	var count = 0;
	while(openEG.length != 0){
		count++;
		index = getSEG(openEG)
		s = openEG[index];
		openEG.splice(index, 1);
		closeEG.push(s);
		s.isExpanded = true;
		for(i = 0; i < s.neighs.length; i++){
			temp = s.neighs[i];
			if(temp.g > cost(s, temp) + s.g && !closeEG.includes(temp)){
				temp.previous = s;
				temp.g = cost(s, temp) + s.g;
				temp.f = temp.g + wepsilon * temp.h;
				if(!openEG.includes(temp)){
					openEG.push(temp);
				}
			}
		}
		if((s == goal)) break;
	}
}
function getSEG(o){
	var minCellIndex = 0;
	var maxF = INFINITE;
	var temp;
	var returnCell;
	for(i = 0; i < openEG.length; i++){
		temp = openEG[i];
		if((temp.f) < maxF) {
			maxF = temp.f
			minCellIndex = i;
		}
	}
	return minCellIndex;
}
function updateEGraph(){
	var temp;
	setENeighs(r);
	for(i = 0; i < ECells.length; i++){
		ECells[i].e = INFINITE;
	}
	goal.e = 0;
	openEG.splice(0, openEG.length);
	closeEG.splice(0, closeEG.length);
	goal.ENeighs = [];
	openEG.push(goal);
	for(i = 0; i < ECells.length; i++){
		goal.ENeighs.push(ECells[i]);
	}
	setEHeuristic();
}
function setEHeuristic(){
	var s, temp, index;
	while(openEG.length != 0){
		index = getES(openEG)
		s = openEG[index];
		openEG.splice(index, 1);
		closeEG.push(s);
		for(i = 0; i < s.ENeighs.length; i++){
			temp = s.ENeighs[i];
			if(temp.e > ECost(s, temp) + s.e && !closeEG.includes(temp)){
				temp.previous = s;
				temp.e = ECost(s, temp) + s.e;
				if(!openEG.includes(temp)){
					openEG.push(temp);
				}
			}
		}
	}
}
function getES(o){
	var minCellIndex = 0;
	var maxE = INFINITE;
	var temp;
	var returnCell;
	for(i = 0; i < openEG.length; i++){
		temp = openEG[i];
		if((temp.e) < maxE) {
			maxE = temp.e;
			minCellIndex = i;
		}
	}
	return minCellIndex;
}
function heuristic(c){
	return Math.sqrt((goalX - (c.x/20)) * (goalX - (c.x/20)) + (goalY - (c.y/20)) * (goalY - (c.y/20)));
}
function heuristic2(c1, c2){
	return Math.sqrt(((c2.x/20) - (c1.x/20)) * ((c2.x/20) - (c1.x/20)) + ((c2.y/20) - (c1.y/20)) * ((c2.y/20) - (c1.y/20)));
}
function EHeuristic(c){
	var max = INFINITE;
	for(k = 0; k < ECells.length; k++){
		if((epsilon * heuristic2(c, ECells[k]) + ECells[k].e) < max){
			max = epsilon * heuristic2(c, ECells[k]) + ECells[k].e;
		}
	}
	if((epsilon * heuristic(c) < max)){
			max = epsilon * heuristic(c);
	}
	return max;
}
function cost(c1, c2){
	if(c1.x == c2.x || c1.y == c2.y){
		return 1;
	}
	else return Math.sqrt(2);
}
function ECost(c1, c2){
	if(c1 == goal || c2 == goal){
		return epsilon * Math.sqrt(((c2.x/20) - (c1.x/20)) * ((c2.x/20) - (c1.x/20)) + ((c2.y/20) - (c1.y/20)) * ((c2.y/20) - (c1.y/20)));
	}
	else return Math.sqrt(((c2.x/20) - (c1.x/20)) * ((c2.x/20) - (c1.x/20)) + ((c2.y/20) - (c1.y/20)) * ((c2.y/20) - (c1.y/20)));
}
function setNeighsEG(r){
	for(y=0; y<cellQ; y++){
		for(x=0; x<cellQ; x++){
			rE[y].cells[x].neighs = [];
			if (!rE[y].cells[x].isObstacle){
					for (j = -1; j <= 1; j++) {
						if (y + j >= 0 && y + j <= cellQ - 1) {
							for (k = -1; k <= 1; k++) {
								if (x + k >= 0 && x + k <= cellQ - 1 ) {
									if (y+j!=y || x+k!=x){
										if (!rE[y + j].cells[x + k].isObstacle) {
											rE[y].cells[x].neighs.push(rE[y+j].cells[x+k]);									
										}
									}
								}
							}
						}
					}
			}
			rE[y].cells[x].neighsQ = rE[y].cells[x].neighs.length;
		}
	}
}
function setENeighs(r){
	for(y=0; y<cellQ; y++){
		for(x=0; x<cellQ; x++){
			rE[y].cells[x].ENeighs = [];
			if (!rE[y].cells[x].isObstacle && rE[y].cells[x].isEGraph){
				rE[y].cells[x].ENeighs.push(rE[goalY].cells[goalY]);
					for (j = -1; j <= 1; j++) {
						if (y + j >= 0 && y + j <= cellQ - 1) {
							for (k = -1; k <= 1; k++) {
								if (x + k >= 0 && x + k <= cellQ - 1 ) {
									if (y+j!=y || x+k!=x){
										if (!rE[y + j].cells[x + k].isObstacle && rE[y + j].cells[x + k].isEGraph && !rE[y + j].cells[x + k].isGoal) {
											rE[y].cells[x].ENeighs.push(rE[y+j].cells[x+k]);									
										}
									}
								}
							}
						}
					}
			}
			rE[y].cells[x].neighsQ = rE[y].cells[x].neighs.length;
		}
	}
}
function resetEGraph(){
	console.log("UNREAL TO THE MAX");
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			rE[i].cells[j].isEGraph = false;
		}
	}
	ECells = [];
	updatePaintEG();
}
















///////////////////////////////////// Code For the visualization beyond this point//////////////////////
function setStartEG(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			if(rE[i].cells[j].isStart){
				rE[i].cells[j].isStart = false;
				ctxE.fillStyle="#ffffff";
				ctxE.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.stroke();
				ctxE.fillStyle="#000000";
			}
		}
	}
	startX = x_.value;
	startY = y_.value;
	rE[startY].cells[startX].isStart = true;
	updatePaintEG();
}
function setGoalEG(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			if(rE[i].cells[j].isGoal){
				rE[i].cells[j].isGoal = false;
				ctxE.fillStyle="#ffffff";
				ctxE.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.stroke();
				ctxE.fillStyle="#000000";
			}
		}
	}
	goalX = x_.value;
	goalY = y_.value;
	rE[goalY].cells[goalX].isGoal = true;
	updatePaintEG();
}
function setEpsilon(){
	epsilon = eps_.value;
}
function setWEpsilonEG(){
	wepsilon = weps_.value;
}
function getClickPosition(e){
	var rect = d.getBoundingClientRect();
	var xoff = rect.left;
	var yoff = rect.top;
	var xPosition = Math.floor((e.clientX-xoff)/20);
	var yPosition = Math.floor((e.clientY-yoff)/20);
	if(!rE[yPosition].cells[xPosition].isObstacle) rE[yPosition].cells[xPosition].isFutureObstacle = true;
	else rE[yPosition].cells[xPosition].wasObstacle = true;
	if(!r[yPosition].cells[xPosition].isObstacle) r[yPosition].cells[xPosition].isFutureObstacle = true;
	else r[yPosition].cells[xPosition].wasObstacle = true;
	updatePaintEG();
	updatePaint();
}
function paint(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
			ctxE.stroke();
		}
	}
}
function updatePaintEG(){
	ctxE2.clearRect(0, 0, 500, 500);
	console.log("Hello");
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			if(rE[i].cells[j].isFutureObstacle && !rE[i].cells[j].isStart && !rE[i].cells[j].isGoal){
				rE[i].cells[j].isExpanded = false;
				if(rE[i].cells[j].isEGraph){
					rE[i].cells[j].isEGraph = false;
					var index = ECells.indexOf(rE[i].cells[j])
					ECells.splice(index, 1);
				}
				ctxE.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				rE[i].cells[j].isFutureObstacle = false;
				rE[i].cells[j].isObstacle = true;
			}
			else if(rE[i].cells[j].wasObstacle && !rE[i].cells[j].isStart && !rE[i].cells[j].isGoal){	
				ctxE.clearRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.stroke();
				rE[i].cells[j].wasObstacle = false;
				rE[i].cells[j].isObstacle = false;
			}
			else if(rE[i].cells[j].isStart){
				ctxE.fillStyle="#00FF00";
				ctxE.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.stroke();
				ctxE.fillStyle="#000000";
			}
			else if(rE[i].cells[j].isGoal){
				ctxE.fillStyle="#FF0000";
				ctxE.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.stroke();
				ctxE.fillStyle="#000000";
			}
			else if(rE[i].cells[j].isEGraph){
				ctxE.fillStyle="#0000FF";
				ctxE.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.rect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE.stroke();
				ctxE.fillStyle="#000000";
			}
			else if(rE[i].cells[j].isExpanded){
				ctxE2.fillStyle="#D3D3D3";
				ctxE2.fillRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				ctxE2.fillStyle="#000000";
				ctxE2.strokeRect(rE[i].cells[j].x, rE[i].cells[j].y, 20, 20);
				rE[i].cells[j].isExpanded = false;
			}
		}
	}
}
function drawPathEG(){
	var temp = goal;
	ctxE2.clearRect(0, 0, 500, 500);
	updatePaintEG();
	while(temp != start){
		ctxE2.beginPath();
		if(!ECells.includes(temp)){
			ECells.push(temp);
		}
		temp.isEGraph = true;
		ctxE2.moveTo(temp.x + 10, temp.y + 10);
		ctxE2.lineTo(temp.previous.x + 10, temp.previous.y + 10);
		ctxE2.stroke();
		temp = temp.previous;
	}
	start.isEGraph = true;
}