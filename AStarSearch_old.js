//initialize the cells of the grid to be used
var INFINITE = 100000;
var close = [];
var open = [];
var c = document.getElementById("myCanvas");
var lineDraw = document.getElementById("lines");
var egraph = document.getElementById("myCanvas2");
var x_ = document.getElementById("xPos");
var y_ = document.getElementById("yPos");
var eps_ = document.getElementById("eps");
var epsilon = 1;
lineDraw.addEventListener("click", getClickPosition, false);
var startX, startY, goalX, goalY, epsilon;
var ctx = c.getContext("2d");
var ctx2 = lineDraw.getContext("2d");
var cellQ = 20;
var r = [];
for(var i = 0; i < cellQ; i++){
	r.push(new Row(cellQ, 20, i*20));
}
paint();










///////////////////////////////////////////////////////////////////////////////////////////
/////////////FUNCTOION DECLARATIONS////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
function computePathTo(){
	setNeighs(r);
	start = r[startY].cells[startX];
	goal = r[goalY].cells[goalX];
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			r[i].cells[j].isExpanded = false;
			r[j].cells[i].g = INFINITE;
			r[j].cells[i].h = heuristic(r[j].cells[i]);
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
		index = getMinimum(open)
		s = open[index];
		open.splice(index, 1);
		close.push(s);
		s.isExpanded = true;
		for(i = 0; i < s.neighs.length; i++){
			temp = s.neighs[i];
			if(temp.g > cost(s, temp) + s.g && !close.includes(temp)){
				temp.previous = s;
				temp.g = cost(s, temp) + s.g;
				temp.f = temp.g + epsilon * temp.h;
				if(!open.includes(temp)){
					open.push(temp);
				}
			}
		}
		if((s == goal)) break;
	}
}
function getMinimum(o){
	var minCellIndex = 0;
	var maxF = INFINITE;
	var temp;
	var returnCell;
	for(i = 0; i < open.length; i++){
		temp = open[i];
		if((temp.f) < maxF) {
			maxF = temp.f;
			minCellIndex = i;
		}
	}
	return minCellIndex;
}
function heuristic(c){
	return Math.sqrt((goalX - (c.x/20)) * (goalX - (c.x/20)) + (goalY - (c.y/20)) * (goalY - (c.y/20)));
}
function cost(c1, c2){
	if(c1.x == c2.x || c1.y == c2.y){
		return 1;
	}
	else return Math.sqrt(2);
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

function getClickPosition(e){
	var xPosition = Math.floor((e.clientX-10)/20);
	var yPosition = Math.floor((e.clientY-10)/20);
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
			else if(r[i].cells[j].isExpanded){
				ctx2.fillStyle="#D3D3D3";
				ctx2.fillRect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx2.rect(r[i].cells[j].x, r[i].cells[j].y, 20, 20);
				ctx2.stroke();
				ctx2.fillStyle="#000000";
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
		ctx2.moveTo(temp.x + 10, temp.y + 10);
		ctx2.lineTo(temp.previous.x + 10, temp.previous.y + 10);
		ctx2.stroke();
		temp = temp.previous;
	}
}
function findPath(){
	for(i = 0; i < cellQ; i++){
		for(j = 0; j < cellQ; j++){
			r[i].cells[j].isExpanded = false;
		}
	}
	updateEGraph();
	computePath();
}
function computePath(){

}
function dijkstra(beg, end){

}