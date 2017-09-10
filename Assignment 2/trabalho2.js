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

var material; // A line material
var default_dist = 20; // Default distance
var edit_mode = {"poly": -1, "mode": -1};; //Current polygon editing state
var polygons = [];
var points = [];


//
// The render callback
//
function render () {
	if (edit_mode["mode"] == "create_new"){
		var line = polygons[edit_mode["poly"]];
		var p = new THREE.Vector3 (mouseX,mouseY,0);
		var geometry = new THREE.Geometry();
		// Recreates the geometry of the line:
		for (var i=0; i<points.length; i++){
			geometry.vertices.push(points[i]);
		}
		geometry.vertices.push(p);
		line.geometry = geometry;
	}
	requestAnimationFrame( render );
	renderer.render( scene, camera );
};



function setup () {
	material = new THREE.LineBasicMaterial ( {color:0xffffff, depthWrite:false, linewidth : 4 } );
}


function mousePressed() {
	// If no objects are being edited at the moment:
	if (edit_mode["mode"] == -1){
		// States the creation of the new polygon:
		edit_mode["poly"] = polygons.length;
		edit_mode["mode"] = "create_new";
		// Creates a new line to start drawing the polygon:
		var geometry = new THREE.Geometry();
		var p = new THREE.Vector3 (mouseX,mouseY,0);
		points.push(p);
		geometry.vertices.push (p);
		var line = new THREE.Line (geometry, material);
		// Adds created line to the list of polygons:
		polygons.push(line);
		scene.add(line);
		selected = line;
	// If a polygon is being created at the moment:
	} else if (edit_mode["mode"] == "create_new"){
		var p = new THREE.Vector3 (mouseX,mouseY,0);
		// Checks to see if polygon should be closed:
		if (p.distanceTo(points[0]) < default_dist){
			// Adds the last point to the array (same as first one):
			points.push(points[0]);
			// Recreates the geometry of the line:
			var geometry = new THREE.Geometry();
			for (var i=0; i<points.length; i++){
				geometry.vertices.push(points[i]);
			}
			// Add the geometry to the line and finish the editing process:
			var line = polygons[edit_mode["poly"]];
			line.geometry = geometry;
			points = [];
			edit_mode["mode"] = -1;
		} else {
			// Adds the next point to the newborn polygon:
			points.push(p);
		}
	}
}

function mouseDragged() {
}

function mouseReleased() {
}

init();
