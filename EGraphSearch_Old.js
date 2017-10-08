//initialize the cells of the grid to be used
var INFINITE = 100000;
var close = [];
var open = [];
var ECells = [];
var c = document.getElementById("myCanvas");
var lineDraw = document.getElementById("lines");
var x_ = document.getElementById("xPos");
var y_ = document.getElementById("yPos");
var eps_ = document.getElementById("eps");
var weps_ = document.getElementById("weps");
lineDraw.addEventListener("click", getClickPosition, false);
var startX, startY, goalX, goalY;
var epsilon = 1;
var wepsilon = 1;
var ctx = c.getContext("2d");
var ctx2 = lineDraw.getContext("2d");
var cellQ = 20;
var r = [];
for(var i = 0; i < cellQ; i++){
	r.push(new Row(cellQ, 20, i*20));
}
paint();


//FUNCTOION DECLARATIONS
//This function is called upon clicking find path.

function findPath(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			r[i].cells[j].isExpanded = false;
		}
	}
	updateEGraph();
	computePath();
}
function computePathTo(){
	setNeighs(r);
	start = r[startY].cells[startX];
	goal = r[goalY].cells[goalX];
	updateEGraph();
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			r[i].cells[j].isExpanded = false;
			r[j].cells[i].g = INFINITE;
			r[j].cells[i].h = EHeuristic(r[j].cells[i]);
		}
	}
	start.g = 0;
	open.splice(0, open.length);
	close.splice(0, close.length);
	open.push(start);
	improvePath();
	drawPath();
}
function improvePath(){
	var s, temp, index;
	var count = 0;
	while(open.length != 0){
		count++;
		index = getS(open)
		s = open[index];
		open.splice(index, 1);
		close.push(s);
		s.isExpanded = true;
		for(i = 0; i < s.neighs.length; i++){
			temp = s.neighs[i];
			if(temp.g > cost(s, temp) + s.g && !close.includes(temp)){
				temp.previous = s;
				temp.g = cost(s, temp) + s.g;
				temp.f = temp.g + wepsilon * temp.h;
				if(!open.includes(temp)){
					open.push(temp);
				}
			}
		}
		if((s == goal)) break;
	}
}
function getS(o){
	var minCellIndex = 0;
	var maxF = INFINITE;
	var temp;
	var returnCell;
	for(i = 0; i < open.length; i++){
		temp = open[i];
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
	open.splice(0, open.length);
	close.splice(0, close.length);
	goal.ENeighs = [];
	open.push(goal);
	for(i = 0; i < ECells.length; i++){
		goal.ENeighs.push(ECells[i]);
	}
	setEHeuristic();
}
function setEHeuristic(){
	var s, temp, index;
	while(open.length != 0){
		index = getES(open)
		s = open[index];
		open.splice(index, 1);
		close.push(s);
		for(i = 0; i < s.ENeighs.length; i++){
			temp = s.ENeighs[i];
			if(temp.e > ECost(s, temp) + s.e && !close.includes(temp)){
				temp.previous = s;
				temp.e = ECost(s, temp) + s.e;
				if(!open.includes(temp)){
					open.push(temp);
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
	for(i = 0; i < open.length; i++){
		temp = open[i];
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
function setNeighs(r){
	for(y=0; y<cellQ; y++){
		for(x=0; x<cellQ; x++){
			r[y].cells[x].neighs = [];
			if (!r[y].cells[x].isObstacle){
					for (j = -1; j <= 1; j++) {
						if (y + j >= 0 && y + j <= cellQ - 1) {
							for (k = -1; k <= 1; k++) {
								if (x + k >= 0 && x + k <= cellQ - 1 ) {
									if (y+j!=y || x+k!=x){
										if (!r[y + j].cells[x + k].isObstacle) {
											r[y].cells[x].neighs.push(r[y+j].cells[x+k]);									
										}
									}
								}
							}
						}
					}
			}
			r[y].cells[x].neighsQ = r[y].cells[x].neighs.length;
		}
	}
}
function setENeighs(r){
	for(y=0; y<cellQ; y++){
		for(x=0; x<cellQ; x++){
			r[y].cells[x].ENeighs = [];
			if (!r[y].cells[x].isObstacle && r[y].cells[x].isEGraph){
				r[y].cells[x].ENeighs.push(r[goalY].cells[goalY]);
					for (j = -1; j <= 1; j++) {
						if (y + j >= 0 && y + j <= cellQ - 1) {
							for (k = -1; k <= 1; k++) {
								if (x + k >= 0 && x + k <= cellQ - 1 ) {
									if (y+j!=y || x+k!=x){
										if (!r[y + j].cells[x + k].isObstacle && r[y + j].cells[x + k].isEGraph && !r[y + j].cells[x + k].isGoal) {
											r[y].cells[x].ENeighs.push(r[y+j].cells[x+k]);									
										}
									}
								}
							}
						}
					}
			}
			r[y].cells[x].neighsQ = r[y].cells[x].neighs.length;
		}
	}
}
















///////////////////////////////////// Code For the visualization beyond this point//////////////////////
function setStart(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			if(r[i].cells[j].isStart){
				r[i].cells[j].isStart = false;
				ctx.fillStyle="#ffffff";
				ctx.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.stroke();
				ctx.fillStyle="#000000";
			}
		}
	}
	startX = x_.value;
	startY = y_.value;
	r[startY].cells[startX].isStart = true;
	updatePaint();
}
function setGoal(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			if(r[i].cells[j].isGoal){
				r[i].cells[j].isGoal = false;
				ctx.fillStyle="#ffffff";
				ctx.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.stroke();
				ctx.fillStyle="#000000";
			}
		}
	}
	goalX = x_.value;
	goalY = y_.value;
	r[goalY].cells[goalX].isGoal = true;
	updatePaint();
}
function setEpsilon(){
	epsilon = eps_.value;
}
function setWEpsilon(){
	wepsilon = weps_.value;
}
function getClickPosition(e){
	var rect = c.getBoundingClientRect();
	var xoff = rect.left;
	var yoff = rect.top;
	var xPosition = Math.floor((e.clientX-xoff)/20);
	var yPosition = Math.floor((e.clientY-yoff)/20);
	if(!r[yPosition].cells[xPosition].isObstacle) r[yPosition].cells[xPosition].isFutureObstacle = true;
	else r[yPosition].cells[xPosition].wasObstacle = true;
	updatePaint();
}
function paint(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
			ctx.stroke();
		}
	}
}
function updatePaint(){
	ctx2.clearRect(0, 0, 500, 500);
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			if(r[i].cells[j].isFutureObstacle && !r[i].cells[j].isStart && !r[i].cells[j].isGoal){
				r[i].cells[j].isExpanded = false;
				if(r[i].cells[j].isEGraph){
					r[i].cells[j].isEGraph = false;
					var index = ECells.indexOf(r[i].cells[j])
					ECells.splice(index, 1);
				}
				ctx.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				r[i].cells[j].isFutureObstacle = false;
				r[i].cells[j].isObstacle = true;
			}
			else if(r[i].cells[j].wasObstacle && !r[i].cells[j].isStart && !r[i].cells[j].isGoal){	
				ctx.clearRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.stroke();
				r[i].cells[j].wasObstacle = false;
				r[i].cells[j].isObstacle = false;
			}
			else if(r[i].cells[j].isStart){
				ctx.fillStyle="#00FF00";
				ctx.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.stroke();
				ctx.fillStyle="#000000";
			}
			else if(r[i].cells[j].isGoal){
				ctx.fillStyle="#FF0000";
				ctx.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.stroke();
				ctx.fillStyle="#000000";
			}
			else if(r[i].cells[j].isEGraph){
				ctx.fillStyle="#0000FF";
				ctx.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx.stroke();
				ctx.fillStyle="#000000";
			}
			else if(r[i].cells[j].isExpanded){
				ctx2.fillStyle="#D3D3D3";
				ctx2.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx2.fillStyle="#000000";
				ctx2.strokeRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				r[i].cells[j].isExpanded = false;
			}
		}
	}
}
function drawPath(){
	var temp = goal;
	ctx2.clearRect(0, 0, 500, 500);
	updatePaint();
	while(temp != start){
		ctx2.beginPath();
		if(!ECells.includes(temp)){
			ECells.push(temp);
		}
		temp.isEGraph = true;
		ctx2.moveTo(temp.x + 10, temp.y + 10);
		ctx2.lineTo(temp.previous.x + 10, temp.previous.y + 10);
		ctx2.stroke();
		temp = temp.previous;
	}
	start.isEGraph = true;
}
function computePath(){

}
function dijkstra(beg, end){
	
}