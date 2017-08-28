function setup() {
	// Sets the workspace:
	createCanvas(1920, 1080);
}

var lines = [];									// Array of lines
var ellipses = [];								// Array of intersection ellipses' points
var default_dist = 30;							// Distance to decide if a mouse press has hit a line or not (for
												// both edges and middle tests)
var edit_mode = {"line": -1, "mode": -1};		// Contains line being edited and mode of operation: "create_new",
												// "edit_first" (to edit first point) or "edit_last"

function draw() {
	
	background(200); // Draws gray background
	
	// Draws every line:
	for (i=0; i<lines.length; i++){
		// Case where line is still being formed:
		if (i == edit_mode["line"]){
			if (edit_mode["mode"] == "create_new" || edit_mode["mode"] == "edit_last"){
				lines[i].display_last(new Point(mouseX, mouseY));
			} else if (edit_mode["mode"] == "edit_first"){
				lines[i].display_first(new Point(mouseX, mouseY));
			} else if (edit_mode["mode"] == "edit_middle"){
				lines[i].update_points(mouseX, mouseY);
				lines[i].display_done();
			}
		// Case where line has already been formed:
		} else {
			lines[i].display_done();
			
			// Checks for intersections:
			for (j=0; j<lines.length; j++){
				// Intersection between line and itself doesnt make sense:
				if (j == i) continue;
				curr_mouse = new Point(mouseX, mouseY);
				// Now we are going to check for intersections and push them to *ellipses*
				// so we can draw them later. This allows us to draw them as the last elements 
				// in the z axis.
				// Checks intersections for current line being formed:
				if (j == edit_mode["line"] && edit_mode["mode"] != "edit_middle"){
					if (edit_mode["mode"] == "create_new" || edit_mode["mode"] == "edit_last"){
						if (j == edit_mode["line"] && doIntersect(lines[i].first, lines[i].last, lines[j].first, curr_mouse)){
							var intersection = intersectionPoint(lines[i].first, lines[i].last, lines[j].first, curr_mouse);
							ellipses.push(intersection);
						}
					} else if (edit_mode["mode"] == "edit_first"){
						if (j == edit_mode["line"] && doIntersect(lines[i].first, lines[i].last, curr_mouse, lines[j].last)){
							var intersection = intersectionPoint(lines[i].first, lines[i].last, curr_mouse, lines[j].last);
							ellipses.push(intersection);
						}
					}
				// Checks intersections for remaining lines:
				} else if ( doIntersect(lines[i].first, lines[i].last, lines[j].first, lines[j].last) ) {
					var intersection = intersectionPoint(lines[i].first, lines[i].last, lines[j].first, lines[j].last);
					ellipses.push(intersection);
				}
			}
		}
		
	}
	
	// Draws all the ellipses calculated above:
	for (i=0; i<ellipses.length; i++){
		var red = color(160, 11, 26);	
		fill(red);
		ellipse(ellipses[i].x, ellipses[i].y, 10, 10);
	}
	
	// Resets the *ellipses* array:
	ellipses = [];

}

// Actions performed when mouse is pressed (once):
function mousePressed() {
	
	// Checks if the edge of an existing line was selected:
	for (i=0; i<lines.length; i++){
		// If first point was selected:
		if ( lines[i].first_dist(mouseX, mouseY) <= default_dist ){
			edit_mode = {"line": i, "mode": "edit_first"};
			return;
		// If last point was selected:
		} else if ( lines[i].last_dist(mouseX, mouseY) <= default_dist ){
			edit_mode = {"line": i, "mode": "edit_last"};
			return;
		}
	}
	
	// Checks if the middle part of an existing line was selected:
	for (i=0; i<lines.length; i++){
		if (lines[i].middle_dist(mouseX, mouseY) <= default_dist){
			lines[i].update_placeholder(mouseX, mouseY);
			edit_mode = {"line": i, "mode": "edit_middle"};
			return;
		}
	}
	
	// Creates a new line and adds it to the array of lines:
	edit_mode = {"line": lines.length, "mode": "create_new"};
	lines.push(new Line(new Point(mouseX, mouseY)));
}

// Actions performed when mouse is released:
function mouseReleased() {
	// If *edit_mode* means a new line is being created:
	if (edit_mode["mode"] == "create_new"){
		// Sets the second point of the current line being formed to the current mouse position:
		lines[edit_mode["line"]].last = new Point(mouseX, mouseY);
	// If *edit_mode* means a line is being edited:
	} else if (edit_mode["mode"] == "edit_first"){
		lines[edit_mode["line"]].first = new Point(mouseX, mouseY);
	} else if (edit_mode["mode"] == "edit_last"){
		lines[edit_mode["line"]].last = new Point(mouseX, mouseY);
	}
	edit_mode = {"line": -1, "mode": -1};
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
    // p1, q1 and p2 are colinear and p2 lies on segment *p1q1*
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
 
    // p1, q1 and p2 are colinear and q2 lies on segment *p1q1*
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
 
    // p2, q2 and p1 are colinear and p1 lies on segment *p2q2*
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
 
    // p2, q2 and q1 are colinear and q1 lies on segment *p2q2*
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
 
	// If *p1q1* and *p2q2* dont intersect:
    return false;
}


// Function that calculates the point of intersection of two lines:
function intersectionPoint(p1, q1, p2, q2){
	 
	var d = (p1.x - q1.x) * (p2.y - q2.y) - (p1.y - q1.y) * (p2.x - q2.x);
	
	// Returns if no intersection was found:
	if (d == 0) {
		return undefined;
	}
	 
	// Finds the x and y coordinates:
	var a = (p1.x*q1.y - p1.y*q1.x);
	var b = (p2.x*q2.y - p2.y*q2.x);
	var x = ( a * (p2.x - q2.x) - (p1.x - q1.x) * b ) / d;
	var y = ( a * (p2.y - q2.y) - (p1.y - q1.y) * b ) / d;
	 
	// Returns undefined if x and y are in neither lines:
	if ( x < min(p1.x, q1.x) || x > max(p1.x, q1.x) || x < min(p2.x, q2.x) || x > max(p2.x, q2.x) ){
		return undefined;
	} else if ( y < min(p1.y, q1.y) || y > max(p1.y, q1.y) || y < min(p2.y, q2.y) || y > max(p2.y, q2.y) ) {
		return undefined;
	}
	 
	// Returns an object containing the intersection:
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
	
	// Placeholder variables to hold given points:
	this.placeholder = undefined;
	this.original_first = undefined;
	this.original_last = undefined;
	
	// Draws line from points *first* to *p_mouse*:
	this.display_last = function(p_mouse){
		line(this.first.x, this.first.y, p_mouse.x, p_mouse.y);
	}
	
	// Draws line from points *p_mouse* to *last*:
	this.display_first = function(p_mouse){
		line(p_mouse.x, p_mouse.y, this.last.x, this.last.y);
	}
	
	// Draws line from points *first* to *last*:
	this.display_done = function(){
		line(this.first.x, this.first.y, this.last.x, this.last.y);
	}
	
	// Updates the *first* and *last* coordinates by adding an offset (mouse distance):
	this.update_points = function(x, y){
		this.first.x = this.original_first.x + (x - this.placeholder.x);
		this.first.y = this.original_first.y + (y - this.placeholder.y);
		this.last.x = this.original_last.x + (x - this.placeholder.x);
		this.last.y = this.original_last.y + (y - this.placeholder.y);
	}
	
	//Saves *x* and *y* to *placeholder*:
	this.update_placeholder = function(x, y){
		this.placeholder = new Point(x, y);
		this.original_first = new Point(this.first.x, this.first.y);
		this.original_last = new Point(this.last.x, this.last.y);
	}
	
	// Returns the distance between *first* and (x,y):
	this.first_dist = function(x, y){
		return Math.sqrt( Math.pow(this.first.x-x, 2) + Math.pow(this.first.y-y, 2));
	}
	
	// Returns the distance between *last* and (x,y):
	this.last_dist = function(x, y){
		return Math.sqrt( Math.pow(this.last.x-x, 2) + Math.pow(this.last.y-y, 2));
	}
	
	// Returns the distance form points (x,y) to the line:
	// DISCLAIMER: This function was designed with help from Wikipedia, The Free Encyclopedia
	this.middle_dist = function(x, y){
		var numerator = Math.abs( (this.last.y - this.first.y)*x - 
								  (this.last.x - this.first.x)*y + 
								   this.last.x*this.first.y - this.last.y*this.first.x );
		var denominator = Math.sqrt( Math.pow(this.last.y - this.first.y, 2) + 
									 Math.pow(this.last.x - this.first.x, 2) );
		return numerator/denominator;
	}
}