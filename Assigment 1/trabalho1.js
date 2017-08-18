function setup() {
	//Sets the workspace:
	createCanvas(1920, 1080);
}

var lines = [];			//Array of lines
var curr_line = 0;		//Next line to be formed

function draw() {
	
	background(200); //Draws gray background
	
	//Draws every line:
	for (i=0; i<lines.length; i++){
		if (i == curr_line){
			//Case where line is still being formed:
			lines[i].display(new Point(mouseX, mouseY));
		} else {
			//Case where line has already been formed:
			lines[i].display_final();
		}
	}
	

}

//Actions performed when mouse is pressed (once):
function mousePressed() {
	//Creates a new line and adds it to the array of lines:
	lines.push(new Line(new Point(mouseX, mouseY)));
}

//Actions performed when mouse is released:
function mouseReleased() {
	//Sets the second point of the current line being formed to the current mouse position:
	lines[curr_line].last = new Point(mouseX, mouseY);
	curr_line += 1;
}

//Calculates the orientation of points *p*, *q* and *r*:
function orientation(p, q, r){
	var val = (q.y - p.y) * (r.x - q.x) -
              (q.x - p.x) * (r.y - q.y);
	if (val == 0){
		return 0; //Colinear
	} else if (val > 0){
		return 1; //Clockwise orientation
	} else {
		return 2; //Counterclockwise orientation
	}
}


//Point class:
function Point(x, y) {
	this.x = x;
	this.y = y;
}

//Line class:
function Line(point) {
	
	this.first = point;
	this.last = undefined;
	
	//Draw line from points *first* to *p_mouse*:
	this.display = function(p_mouse){
		line(this.first.x, this.first.y, p_mouse.x, p_mouse.y);
	}
	
	//Draw line from points *first* to *last*:
	this.display_final = function(){
		line(this.first.x, this.first.y, this.last.x, this.last.y);
	}
}