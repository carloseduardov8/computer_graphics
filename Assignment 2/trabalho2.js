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
var z_count = 0;
var z_rate = 3;

//
// The render callback
//
function render () {
	if (click_timer < time_to_wait+10) click_timer += 1;
	// If a new polygon is being created:
	if (edit_mode["mode"] == "create_new"){
		var p = new THREE.Vector3 (mouseX,mouseY,z_count);
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
			var p = new THREE.Vector3 (mouseX,mouseY,z_count);
			ph_geo.vertices.push(p);
			geometry.vertices.push (p);	
			ph_geo.points.push(p);
			var line = new THREE.Line (geometry, material);
			// Adds created line to the scene:
			new_line = line;
			scene.add(line);
		// If a polygon is being created at the moment:
		} else if (edit_mode["mode"] == "create_new"){
			var p = new THREE.Vector3 (mouseX,mouseY,z_count);
			// Checks to see if polygon should be closed:
			if ((p.distanceTo(ph_geo.vertices[0]) < default_dist) && (ph_geo.vertices[ph_geo.vertices.length-1].x != p.x) && (ph_geo.vertices[ph_geo.vertices.length-1].y != p.y)){
				// Adds the geometry to the line and finishes the editing process:
				ph_geo.vertices.push(ph_geo.vertices[0]);
				new_line.geometry = ph_geo;
				// Creates the resulting polygon and adds it to the scene:
				var shape = new THREE.Shape(new_line.geometry.vertices);
				var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
				var geometry = new THREE.ExtrudeGeometry( shape , extrudeSettings);
				var material2 = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff , clipIntersection: true } );
				var mesh = new THREE.Mesh( geometry, material2 );
				
				// Applies transformation to bring z to front:
				var m = new THREE.Matrix4();
				m.makeTranslation(0, 0, z_count);
				mesh.geometry.applyMatrix(m);
				
				mesh.geometry.points = [];
				mesh.geometry.points = ph_geo.points;
				scene.remove(new_line);
				polygons.push(mesh);
				scene.add( mesh );
				ph_geo = new THREE.Geometry();
				edit_mode["mode"] = -1;
				z_count += z_rate;
			} else if  ((ph_geo.vertices[ph_geo.vertices.length-1].x != p.x) && (ph_geo.vertices[ph_geo.vertices.length-1].y != p.y)){
				// Adds the next point to the newborn polygon:
				ph_geo.vertices.push(p);
				ph_geo.points.push(p);
			}
		}
	}
}

function doubleClick() {
	var collided = [];
	// Checks for collision with every polygon:
	for (var i=polygons.length-1; i>=0; i--){
		var polygon_points = new Array(polygons[i].geometry.points.length);
		// Builds an array containing lists of the points that define the polygon:
		for (var j=0; j<polygons[i].geometry.points.length; j++){
			polygon_points[j] = new Array(2);
			polygon_points[j][0] = ( polygons[i].geometry.points[j].x );
			polygon_points[j][1] = ( polygons[i].geometry.points[j].y );
		}
		// Checks for collision:
		if ( inside([mouseX, mouseY], polygon_points) ){
			
			// Adds polygon to the list of collisions:
			if (collided.length < 2) collided.push(i);
			
		}
		var polygon_points = [];
	}

	// Checks if more than one polygon collided:
	if (collided.length == 2){
		var i_front = collided[0];
		var i_back = collided[1];
		// Checks if polygon on the back has a father:
		if (polygons[i_back].father == undefined){
			// Polygon on the front becomes its father:
			polygons[i_front].add(polygons[i_back]);
			polygons[i_back].father = i_front;
			addPinpoint(mouseX, mouseY);
		// Checks if polygon on the front has a father:
		} else if ((polygons[i_front].father == undefined) && (polygons[i_back].father != i_front)){
			// Polygon on the back becomes father of polygon on the front:
			polygons[i_back].add(polygons[i_front]);
			polygons[i_front].father = i_back;
			addPinpoint(mouseX, mouseY);
		}
		console.log("Pai do poligono " + i_back + ": " + polygons[i_back].father);
		console.log("Pai do poligono " + i_front + ": " + polygons[i_front].father);
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

function addPinpoint(mouseX, mouseY){
	// Adds a pinpoint:
	var m = new THREE.Matrix4();
	m.makeTranslation(mouseX, mouseY, z_count*10);
	z_count += z_rate;
	var geometry_pin = new THREE.SphereGeometry(2);
	var geometry_inner = new THREE.SphereGeometry(7);
	var geometry_outer = new THREE.SphereGeometry(9);
	var material_inner = new THREE.MeshBasicMaterial( {color: 0x876a3a} );
	var material_outer = new THREE.MeshBasicMaterial( {color: 0x000000} );
	var sphere_pin = new THREE.Mesh( geometry_pin, material_outer );
	var sphere_inner = new THREE.Mesh( geometry_inner, material_inner );
	var sphere_outer = new THREE.Mesh( geometry_outer, material_outer );
	sphere_pin.geometry.applyMatrix(m);
	sphere_inner.geometry.applyMatrix(m);
	sphere_outer.geometry.applyMatrix(m);
	scene.add( sphere_inner );
	scene.add( sphere_outer );
	scene.add( sphere_pin );
}



init();
