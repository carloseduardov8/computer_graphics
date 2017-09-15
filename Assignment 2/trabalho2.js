//
// Global variables
//
var scene, width, height, camera, renderer;
var mouseIsPressed, mouseX, mouseY, pmouseX, pmouseY;

//
// Initialization of global objects and set up callbacks for mouse and resize
//
function init() {

	// Scene object
	scene = new THREE.Scene();

	// Will use the whole window for the webgl canvas
	width = window.innerWidth;
	height = window.innerHeight;

	// Orthogonal camera for 2D drawing
	camera = new THREE.OrthographicCamera( 0, width, 0, height, -height, height );
	camera.lookAt (new THREE.Vector3 (0,0,0));

	// Renderer will use a canvas taking the whole window
	renderer = new THREE.WebGLRenderer( {antialias: true});
	renderer.sortObjects = false;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );

	// Append camera to the page
	document.body.appendChild( renderer.domElement );

	// Set resize (reshape) callback
	window.addEventListener( 'resize', resize );

	// Set up mouse callbacks. 
	// Call mousePressed, mouseDragged and mouseReleased functions if defined.
	// Arrange for global mouse variables to be set before calling user callbacks.
	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;
	var setMouse = function () {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	renderer.domElement.addEventListener ( 'mousedown', function () {
		setMouse();
		mouseIsPressed = true; 
		if (typeof mousePressed !== 'undefined') mousePressed();
	});
	renderer.domElement.addEventListener ( 'mousemove', function () { 
		pmouseX = mouseX;
		pmouseY = mouseY;
		setMouse();
		if (mouseIsPressed) {
			if (typeof mouseDragged !== 'undefined') mouseDragged(); 
		}
		if (typeof mouseMoved !== 'undefined') mouseMoved();
	});
	renderer.domElement.addEventListener ( 'mouseup', function () { 
		mouseIsPressed = false; 
		if (typeof mouseReleased !== 'undefined') mouseReleased(); 
	});
	renderer.domElement.addEventListener ( 'dblclick', function () { 
		setMouse();
		mouseIsPressed = true; 
		if (typeof doubleClick !== 'undefined') doubleClick(); 
	});

	// If a setup function is defined, call it
	if (typeof setup !== 'undefined') setup();

	// First render
	render();
}

// 
// Reshape callback
//
function resize() {
	width = window.innerWidth;
	height = window.innerHeight;
	camera.right = width;
	camera.bottom = height;
	camera.updateProjectionMatrix();
	renderer.setSize(width,height);
	render();
}

//------------------------------------------------------------
//
// User code from here on 
//
//------------------------------------------------------------

var material; 									// A line material
var default_dist = 20; 							// Default distance for condition testing
var edit_mode = {"poly": -1, "mode": -1};; 		// Current polygon editing state
var polygons = [];								// Array of existing polygons
var ph_geo = new THREE.Geometry();				// Placeholder geometry for any operation
var new_line;									// Current line being created
var click_timer = 50;							// Time since last click
var time_to_wait = 15;							// Time to identify a double click

//
// The render callback
//
function render () {
	if (click_timer < time_to_wait+10) click_timer += 1;
	// If a new polygon is being created:
	if (edit_mode["mode"] == "create_new"){
		var p = new THREE.Vector3 (mouseX,mouseY,0);
		// Clones placeholder geometry to line geometry:
		var geometry = ph_geo.clone();
		geometry.vertices.push(p);
		new_line.geometry = geometry;
	}
	// Updates the scene:
	requestAnimationFrame( render );
	renderer.render( scene, camera );
};

function setup () {
	material = new THREE.LineBasicMaterial ( {color:0xffffff, depthWrite:false, linewidth : 4 } );
}


function mousePressed() {
	if (click_timer <= time_to_wait){
		edit_mode["mode"] = -1;
		ph_geo = new THREE.Geometry();
		scene.remove(new_line);	
	}
	if (click_timer > time_to_wait){
		click_timer = 0;
		// If no objects are being edited at the moment:
		if (edit_mode["mode"] == -1){
			// States the creation of the new polygon:
			edit_mode["mode"] = "create_new";
			// Creates a new line to start drawing the polygon:
			var geometry = new THREE.Geometry();
			ph_geo.points = [];
			var p = new THREE.Vector3 (mouseX,mouseY,0);
			ph_geo.vertices.push(p);
			geometry.vertices.push (p);
			ph_geo.points.push(p);
			var line = new THREE.Line (geometry, material);
			// Adds created line to the scene:
			new_line = line;
			scene.add(line);
		// If a polygon is being created at the moment:
		} else if (edit_mode["mode"] == "create_new"){
			var p = new THREE.Vector3 (mouseX,mouseY,0);
			// Checks to see if polygon should be closed:
			if ((p.distanceTo(ph_geo.vertices[0]) < default_dist) && (ph_geo.vertices[ph_geo.vertices.length-1].x != p.x) && (ph_geo.vertices[ph_geo.vertices.length-1].y != p.y)){
				// Adds the geometry to the line and finishes the editing process:
				ph_geo.vertices.push(ph_geo.vertices[0]);
				new_line.geometry = ph_geo;
				// Creates the resulting polygon and adds it to the scene:
				var shape = new THREE.Shape(new_line.geometry.vertices);
				var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
				var geometry = new THREE.ExtrudeGeometry( shape , extrudeSettings);
				var material2 = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff , clipIntersection: true, } );
				var mesh = new THREE.Mesh( geometry, material2 ) ;
				mesh.geometry.points = [];
				mesh.geometry.points = ph_geo.points;
				scene.remove(new_line);
				polygons.push(mesh);
				scene.add( mesh );
				ph_geo = new THREE.Geometry();
				edit_mode["mode"] = -1;
			} else if  ((ph_geo.vertices[ph_geo.vertices.length-1].x != p.x) && (ph_geo.vertices[ph_geo.vertices.length-1].y != p.y)){
				// Adds the next point to the newborn polygon:
				ph_geo.vertices.push(p);
				ph_geo.points.push(p);
			}
		}
	}
}

function doubleClick() {
	// Checks for collision with every polygon:
	for (var i=0; i<polygons.length; i++){
		var polygon_points = new Array(polygons[i].geometry.points.length);
		// Builds an array containing lists of the points that define the polygon:
		for (var j=0; j<polygons[i].geometry.points.length; j++){
			polygon_points[j] = new Array(2);
			polygon_points[j][0] = ( polygons[i].geometry.points[j].x );
			polygon_points[j][1] = ( polygons[i].geometry.points[j].y );
		}
		// Checks for collision:
		if ( inside([mouseX, mouseY], polygon_points) ){
			console.log("Collision with polygon "+i);
		}
		var polygon_points = [];
	}
}

function mouseDragged() {
}

function mouseReleased() {
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

init();
