var mouseIsPressed=0, mouseX, mouseY, pMouseX, pmouseY;
var camera, scene, renderer, container, portal;
var totalFrames = 90;					// Number of frames in timeline
var states = [];						// Array to hold frame states
var selected;							// Currently selected frame
var totalSelected = 0;					// Total frames already selected
var currentFrame = 1;					// Current frame to start animation from
var playAnim = false;					// Tracks if the play button is active
init();
animate();

function init() {
	
	// Creates the canvas:
	container = document.createElement( 'div' );
	container.setAttribute("id", "canvas");
	container.oncontextmenu = function (e) {
		e.preventDefault();
	};
	document.body.appendChild( container );
	
	// Sets up the camera:
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 200 );
	camera.position.z = 2;
	
	// Creates scene and adds light:
	scene = new THREE.Scene();
	scene.add( new THREE.HemisphereLight() );
	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 2 );
	scene.add( directionalLight );
	
	// Loads 3DS file:
	var loader = new THREE.TextureLoader();
	var normal = loader.load( 'models/3ds/portalgun/textures/normal.jpg' );
	var loader = new THREE.TDSLoader( );
	loader.setPath( 'models/3ds/portalgun/textures/' );
	loader.load( 'models/3ds/portalgun/portalgun.3ds', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.normalMap = normal;
			}
		} );  
		portal = object;
		portal.position.z = -3;
		scene.add( object );
	});
	
	// Renderer:
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	window.addEventListener( 'resize', resize, false );
	
	// Mouse event listeners:
	mouseIsPressed = false;
	mouseX = 0;
	mouseY = 0;
	pmouseX = 0;
	pmouseY = 0;

	var setMouse = function ()
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	
	// Jquery mouse events (except for mouse wheel):
	$("#canvas").ready(function() {
		
		// Mouse down event:
		$("canvas").mousedown(function(de) {	
			setMouse();
			// For left mouse button:
			if (de.which == 1){
				mouseIsPressed = 1;
			}
			// For right mouse button:
			if (de.which == 3){
				mouseIsPressed = 3;
			}
		});
		
		// Mouse up event:
		$("canvas").mouseup(function(de) {
			mouseIsPressed = 0; 
		});
		
		// Mouse move event:
		$("canvas").mousemove(function(de) {
			pmouseX = mouseX;
			pmouseY = mouseY;
			setMouse();
			if (mouseIsPressed == 1){
				rotate(); 
			} else if (mouseIsPressed == 3){
				translateXY();
			} 
		});
	});
	
	// Adds event handler for mouse wheel:
	renderer.domElement.addEventListener ('wheel', function (){ 
		translateZ(); 
	});


	
	// Sets up initial frame data:
	
	for (var i=1; i<=totalFrames; i++){
	
		// Creates the buttons:
		var btn = document.createElement("BUTTON");
		btn.setAttribute("id", "frame"+i);
		btn.setAttribute("class", "round-button");
		
		btn.addEventListener("click", clickKeyFrame.bind( null, i) );
		
		// Saves initial position state:
		states[i] = new THREE.Vector4(-50, -50, -50, 0);
		
		// Appends the button:
		var info = document.getElementById("info");
		info.appendChild(btn);
	}
	
	// Adds event listener to play button:
	document.getElementById("play").addEventListener("click", function(){
		playAnim = true;
	});
}

// Function to be called when window is resized:
function resize() { 
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
	
	// Updates scene:
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function interpolate(start, end){
	var startVec = states[start];
	var endVec = states[end];
	
	// Calculates number of frames to interpolate:
	var length;
	if (end > start){
		length = end-start;
	} else {
		length = totalFrames - start + end;
	}
	
	var varX = ( endVec.x - startVec.x ) / length;
	var varY = ( endVec.y - startVec.y ) / length;
	var varZ = ( endVec.z - startVec.z ) / length;
	
	var k = 1;
	for (var j=start+1; j!=end; j++, k++){
		
		states[j] = new THREE.Vector4(startVec.x + varX*k, startVec.y + varY*k, startVec.z + varZ*k, 0);
		
		// Resets j if needed:
		if (j == totalFrames+1){
			j = 0;
		}
	}
}


function translateZ() {
	
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	// Attenuates translation factor:
	delta *= 0.5;
	
	// Translates the object on the z axis:
	portal.position.z += delta;

}

function translateXY() 
{
	var delta = new THREE.Vector3();
	var mouse = new THREE.Vector3(mouseX, mouseY, 0);
	var pmouse = new THREE.Vector3(pmouseX, pmouseY, 0);

	//Calculates difference for translation:
	delta.subVectors(mouse, pmouse);
	
	// Attenuates translation factor:
	delta.multiplyScalar(0.006);

	portal.position.x += delta.x;
	portal.position.y -= delta.y;
}

function rotate()
{
	var vec1 = getArcBallVec(pmouseX, pmouseY, portal);
	var vec2 = getArcBallVec(mouseX, mouseY, portal);
	var angle = vec1.angleTo(vec2);
	var vec3 = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	vec3.crossVectors(vec1, vec2);
	vec3.normalize();

	quaternion.setFromAxisAngle(vec3, angle);
	portal.applyQuaternion(quaternion);
}

function getArcBallVec(x, y, object)
{
	var mouse = new THREE.Vector3(x - (window.innerWidth / 2), y - (window.innerHeight / 2), 0);
	var obj = toScreenPosition(object, camera);
	var p = new THREE.Vector3();

	p.subVectors(mouse, obj);
	p.y = -p.y;

	var OPSquared = p.x * p.x + p.y * p.y;

	if (OPSquared <= 200*200)
	{
		p.z = Math.sqrt(200*200 - OPSquared);  // Pythagore
	}

	else
	{
		p.normalize();  // nearest point
	} 

	return p;
}

function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf );
    vector.y = - ( vector.y * heightHalf );
    vector.z = 0;

    return vector;
}

// Function to be called when a keyframe is clicked on:
function clickKeyFrame(index){
	
	// Saves the controls position:
	controls.saveState();
	
	// Marks new frame as selected:
	document.getElementById("frame"+index).setAttribute("class", "round-button selected");
	selected = index;
	totalSelected++;
	
	// Copies the resulting vector:
	var vec = new THREE.Vector4();
	vec.x = controls.position0.x;
	vec.y = controls.position0.y;
	vec.z = controls.position0.z;
	vec.w = 1;
	
	// Assingns state vector to corresponding frame:
	states[index] = vec;
	
	// Checks to see if interpolation is required:
	if (totalSelected >= 2){
		
		console.log("Interpolating start");
		
		// Searches for the first keyrame PRIOR to the current frame:
		var j = index;
		do {
			// Decrements j:
			--j;
			// Resets j if it overshot the timeline:
			if (j == 0){
				j = totalFrames;
			}
			// Checks if states[j] is a keyframe:
			if (states[j].w == 1){
				interpolate(j, index);
				console.log("Interpolating from "+j+" to "+index);
				break;
			}
		} while (states[j].w == 0);
		
		// Searches for the first keyrame SUBSEQUENT to the current frame:
		j = index;
		do {
			// Increments j:
			++j;
			// Resets j if it overshot the timeline:
			if (j == totalFrames+1){
				j = 1;
			}
			// Checks if states[j] is a keyframe:
			if (states[j].w == 1){
				interpolate(index, j);
				console.log("Interpolating from "+index+" to "+j);
				break;
			}
		} while (states[j].w == 0);
	}

}
