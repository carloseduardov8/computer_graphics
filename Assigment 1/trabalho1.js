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
				if (j == i || j == curr_line) continue;
				if ( doIntersect(lines[i].first, lines[i].last, lines[j].first, lines[j].last) ){
					var intersection = intersectionPoint(lines[i], lines[j]);
					console.log("x: " + intersection.x + ", y: " + intersection.y);
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
function intersectionPoint(line1, line2){
	// Line1
    var A1 =  line1.last.y - line1.first.y ;
    var B1 =  line1.last.x - line1.first.x ;
    var C1 = A1*line1.first.x + B1*line1.first.y;

    // Line2
    var A2 =  line2.last.y - line2.first.y ;
    var B2 =  line2.last.x - line2.first.x ;
    var C2 = A2 * line2.first.x + B2 * line2.first.y;
	
	det = A1*B2 - A2*B1;
	
    if (det == 0){
        return null; 	// Parallel lines
    } else {
        var x = (B2*C1 - B1*C2) / det;
        var y = (A1 * C2 - A2 * C1) / det;
        return new Point(x,y);
    }
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