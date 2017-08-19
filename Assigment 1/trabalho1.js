function setup() {
	// Sets the workspace:
	createCanvas(1920, 1080);
}

var lines = [];			// Array of lines
var curr_line = 0;		// Next line to be formed

function draw() {
	
	background(200); // Draws gray background
	
	// Draws every line:
	for (i=0; i<lines.length; i++){
		if (i == curr_line){
			// Case where line is still being formed:
			lines[i].display(new Point(mouseX, mouseY));
		} else {
			// Case where line has already been formed:
			lines[i].display_final();
			
			// Checks for intersections:
			for (j=0; j<lines.length; j++){
				// Intersection between line and itself doesnt make sense:
				if (j == i) continue;
				curr_mouse = new Point(mouseX, mouseY);
				// Checks intersections for current line being formed:
				if (j == curr_line){
					if (j == curr_line && doIntersect(lines[i].first, lines[i].last, lines[j].first, curr_mouse)){
						var intersection = intersectionPoint(lines[i].first, lines[i].last, lines[j].first, curr_mouse);
						ellipse(intersection.x, intersection.y, 10, 10);
					}
				// Checks intersections for remaining lines:
				} else if ( doIntersect(lines[i].first, lines[i].last, lines[j].first, lines[j].last) ){
					var intersection = intersectionPoint(lines[i].first, lines[i].last, lines[j].first, lines[j].last);
					ellipse(intersection.x, intersection.y, 10, 10);
				}
			}
		}
		
	}
	

}

// Actions performed when mouse is pressed (once):
function mousePressed() {
	// Creates a new line and adds it to the array of lines:
	lines.push(new Line(new Point(mouseX, mouseY)));
}

// Actions performed when mouse is released:
function mouseReleased() {
	// Sets the second point of the current line being formed to the current mouse position:
	lines[curr_line].last = new Point(mouseX, mouseY);
	curr_line += 1;
}

// Calculates the orientation of points *p*, *q* and *r*:
function orientation(p, q, r){
	var val = (q.y - p.y) * (r.x - q.x) -
              (q.x - p.x) * (r.y - q.y);
	if (val == 0){
		return 0;	// Colinear
	} else if (val > 0){
		return 1;	// Clockwise orientation
	} else {
		return 2;	// Counterclockwise orientation
	}
}

// Function to check if colinear point *q* is on segment *pr*
function onSegment(p, q, r) {
    if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) &&
        q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y)) {
		return true;
	} else {
		return false;
	}
}


// Function that returns true if segment *p1q1* and *p2q2* intersect:
// DISCLAIMER: This function was inspired by its C++ counterpart found in GeeksForGeeks.
function doIntersect(p1, q1, p2, q2)
{
    // Find the four orientations needed for general and special cases
    var o1 = orientation(p1, q1, p2);
    var o2 = orientation(p1, q1, q2);
    var o3 = orientation(p2, q2, p1);
    var o4 = orientation(p2, q2, q1);
 
    // General case:
    if (o1 != o2 && o3 != o4)
        return true;
 
    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
 
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
 
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
 
    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
 
    return false; // Doesn't fall in any of the above cases
}


// Function that calculates the point of intersection of two lines:
//DISCLAIMER: This function was inspired by a Flassari.is 2008 post for C++
function intersectionPoint(p1, q1, p2, q2){
	// Store the values for fast access and easy
	// equations-to-code conversion
	var x1 = p1.x;
	var x2 = q1.x; 
	var x3 = p2.x; 
	var x4 = q2.x;
	var y1 = p1.y;
	var y2 = q1.y;  
	var y3 = p2.y; 
	var y4 = q2.y;
	 
	var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	// If d is zero, there is no intersection:
	if (d == 0) return undefined;
	 
	// Get the x and y
	var pre = (x1*y2 - y1*x2);
	var post = (x3*y4 - y3*x4);
	var  x = ( pre * (x3 - x4) - (x1 - x2) * post ) / d;
	var  y = ( pre * (y3 - y4) - (y1 - y2) * post ) / d;
	 
	// Check if the x and y coordinates are within both lines
	if ( x < min(x1, x2) || x > max(x1, x2) ||
	x < min(x3, x4) || x > max(x3, x4) ) return undefined;
	if ( y < min(y1, y2) || y > max(y1, y2) ||
	y < min(y3, y4) || y > max(y3, y4) ) return undefined;
	 
	// Return the point of intersection
	return new Point(x, y);
}


// Point class:
function Point(x, y) {
	this.x = x;
	this.y = y;
}

// Line class:
function Line(point) {
	
	this.first = point;
	this.last = undefined;
	
	// Draws line from points *first* to *p_mouse*:
	this.display = function(p_mouse){
		line(this.first.x, this.first.y, p_mouse.x, p_mouse.y);
	}
	
	// Draws line from points *first* to *last*:
	this.display_final = function(){
		line(this.first.x, this.first.y, this.last.x, this.last.y);
	}
}