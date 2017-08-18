function setup() {
	createCanvas(1920, 1080);
}

lines = [];

function draw() {
	
	background(100);
	
	for (i=0; i<lines.length; i++){
		lines[i].display(mouseX, mouseY);
	}
	
	if (mouseIsPressed) {
		//line(firstX, firstY, mouseX, mouseY);
	} else {
		
	}

}


function mousePressed() {
	nline = new Line(mouseX, mouseY);
	lines.push(nline);
			
}

//Line class:
function Line(x, y) {
	
	this.firstX = x;
	this.firstY = y;
	
	this.display = function(d_x, d_y){
		line(this.firstX, this.firstY, d_x, d_y);
	}
}