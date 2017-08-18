function setup() {
	createCanvas(1920, 1080);
}

var lines = [];
var curr_line = 0;

function draw() {
	
	background(200);
	
	for (i=0; i<lines.length; i++){
		if (i == curr_line){
			lines[i].display(mouseX, mouseY);
		} else {
			lines[i].display_final();
		}
	}
	

}


function mousePressed() {
	nline = new Line(mouseX, mouseY);
	lines.push(nline);
}

function mouseReleased() {
	lines[curr_line].lastX = mouseX;
	lines[curr_line].lastY = mouseY;
	curr_line += 1;
}

//Line class:
function Line(x, y) {
	
	this.firstX = x;
	this.firstY = y;
	this.lastX = 0;
	this.lastY = 0;
	
	this.display = function(d_x, d_y){
		line(this.firstX, this.firstY, d_x, d_y);
	}
	
	this.display_final = function(){
		line(this.firstX, this.firstY, this.lastX, this.lastY);
	}
}