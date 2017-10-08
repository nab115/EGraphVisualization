function Cell(){
	this.isObstacle = false;
	this.isStart = false;
	this.isGoal = false;
	this.isFutureObstacle = false;
	this.isExpanded = false;
	this.wasObstacle = false;
	this.isExpanded = false;
	this.isEGraph = false;
	this.processingObstacle = false;
	this.previous;
	this.neighs = [];
	this.ENeighs = [];
	this.neighsQ;
	this.e = 0;
	this.f = 0;
	this.g = 0;
	this.h = 0;
	this.x = 0;
	this.y = 0;
	this.setXY = function(x_, y_){
		this.x = x_;
		this.y = y_;
	};
}
function Row(num, size, yPos, offset){
	this.cells = [];
	for(var i = 0; i < num; i++){
		tempCell = new Cell();
		tempCell.setXY(i*size, yPos);
		this.cells.push(tempCell);
	}
}