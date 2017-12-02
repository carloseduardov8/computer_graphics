var mouseIsPressed=0, mouseX, mouseY, pMouseX, pmouseY;		// Mouse variables
var camera, scene, renderer, container, portal;				// THREE variables
var totalFrames = 80;										// Number of frames in timeline
var allFrames = [];											// Array to hold frames
var selected;												// Currently selected frame
var totalSelected = 0;										// Total frames already selected
var previousFrame = 1;										// Frame previously visited
var currentFrame = 2;										// Current frame to start animation from
var playAnim = false;										// Tracks if the play button is active
var clickingFrames = false;									// Tracks if user is sliding through frames (mouse is down)
var eo = 0;													// Variable incremented every render call

init();
animate();


// Frame class:
function Frame(keyframeBool, position, quaternion) {
	
	this.keyframeBool = keyframeBool;
	this.position = position;
	this.quaternion = quaternion;
	
	// Updates the keyframe status of the current frame:
	this.setKeyframe = function(value){
		this.keyframeBool = value;
	}
	
	// Updates the position vector:
	this.setPosition = function(pos){
		this.position = pos;
	}
	
	// Updates the quaternion:
	this.setQuaternion = function(quat){
		this.quaternion = quat;
	}
	
	// Returns the associated position vector:
	this.getPosition = function(){
		return this.position;
	}
	
	// Returns the associated position vector:
	this.getQuaternion = function(){
		return this.quaternion;
	}
	
	// Returns if this frame is a keyframe:
	this.isKeyframe = function(){
		return this.keyframeBool;
	}
}

// Called on startup:
function init() {
	
	// Creates the canvas:
	container = document.createElement( 'div' );
	container.setAttribute("id", "canvas");
	document.body.appendChild( container );
	
	// Disables drop down menu on right click:
	document.body.oncontextmenu = function (e) {
		e.preventDefault();
	};
	
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

	var setMouse = function (){
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	
	// Jquery mouse events (except for mouse wheel):
	$("canvas").ready(function() {
		
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
			clickingFrames = false;
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
	
		// Saves initial position state for ith frame:
		allFrames[i] = new Frame(false, new THREE.Vector3(), new THREE.Quaternion());
		
		// Creates a new button element:
		var btn = $('<button/>', {
			id: 'frame'+i,
			class: "round-button",
			mousedown: clickKeyFrame(i),
			mouseover: mouseMovementOverFrames(i),
			mouseup: function () { clickingFrames = false; }
		});
	
		// Appends button to DOM:
		$("#info").append( btn );

	}
	
	// Adds event listener to play button:
	document.getElementById("play").addEventListener("click", function(){
		// If animation is halted:
		if (playAnim == false){
			// Checks if there exists at least 2 keyframes:
			if (totalSelected >= 2){
				playAnim = true;
			}
		// If animation is ongoing:
		} else {
			playAnim = false;
		}
	});
}

// Function to be called when window is resized:
function resize() { 
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


// Rendering function:
function animate() {
	
	// Executes animation if need be:
	if (playAnim){
		
		// Handles timeline animation:
		colorTimeline();
		
		// Applies animation:
		var position = allFrames[currentFrame].getPosition();
		portal.position.x = position.x;
		portal.position.y = position.y;
		portal.position.z = position.z;
		var quaternionAnim = allFrames[currentFrame].getQuaternion();
		portal.quaternion.copy(quaternionAnim);
		
		// Counts +1 to timer variable and checks if it's time to count +1 to currentFrame:
		eo++;
		if (eo == 2){
			currentFrame++;
			previousFrame = currentFrame-1;
			eo = 0;
		}
		
		// Resets currentFrame if it overshot the timeline:
		if (currentFrame == totalFrames+1){
			currentFrame = 1;
		}
		
		// Resets previousFrame if it overshot the timeline:
		if (previousFrame == totalFrames+1){
			previousFrame = 1;
		}
	}
	
	// Updates scene:
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function colorTimeline(){
	// Handles timeline animation (marks frames as red as they animate):
	document.getElementById("frame"+currentFrame).setAttribute("class", "round-button animated");
	if (allFrames[previousFrame].isKeyframe() == true){
		document.getElementById("frame"+previousFrame).setAttribute("class", "round-button selected");
	} else {
		document.getElementById("frame"+previousFrame).setAttribute("class", "round-button");
	}
}

function interpolate(start, end){
	
	// Retrieves frame information:
	var startFrame = allFrames[start];
	var endFrame = allFrames[end];
	
	// Calculates number of frames to interpolate:
	var length;
	if (end > start){
		length = end-start;
	} else {
		length = totalFrames - start + end;
	}
	
	// Loops through every frame between (start, end) and saves the interpolation info accordingly:
	var k = start+1;
	for (var j=0; j!=length; j++, k++){
		
		var alpha = j/length;
		
		// Calculates interpolated vector:
		var lerpPosition = new THREE.Vector3();
		lerpPosition.lerpVectors(startFrame.getPosition(), endFrame.getPosition(), alpha);
		
		// Calculates interpolated quaternion:
		var lerpQuaternion = new THREE.Quaternion();
		lerpQuaternion.copy(startFrame.getQuaternion());
		lerpQuaternion.slerp(endFrame.getQuaternion(), alpha);
		
		// Assigns interpolated variables to corresponding frame:
		allFrames[k].setPosition(lerpPosition);
		allFrames[k].setQuaternion(lerpQuaternion);
		
		// Resets k if it overshot the timeline:
		if (k == totalFrames){
			k = 0;
		}
	}
}

// Function to be called when mouse wheel is used:
function translateZ() {
	
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	// Attenuates translation factor:
	delta *= 0.5;
	
	// Translates the object on the z axis:
	portal.position.z += delta;

}

// Function to be called when dragging with right click:
function translateXY() {
	var delta = new THREE.Vector3();
	var mouse = new THREE.Vector3(mouseX, mouseY, 0);
	var pmouse = new THREE.Vector3(pmouseX, pmouseY, 0);

	//Calculates difference for translation:
	delta.subVectors(mouse, pmouse);
	
	// Attenuates translation factor (measured empirically):
	delta.multiplyScalar(0.006*(0.28-portal.position.z*0.142));

	portal.position.x += delta.x;
	portal.position.y -= delta.y;
}

// Function to be called when dragging with left click:
function rotate(){
	var vec1 = getArcBallVec(pmouseX, pmouseY);
	var vec2 = getArcBallVec(mouseX, mouseY);
	var angle = vec1.angleTo(vec2);
	var vec3 = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	vec3.crossVectors(vec1, vec2);
	vec3.normalize();

	quaternion.setFromAxisAngle(vec3, angle);
	portal.applyQuaternion(quaternion);
}

function getArcBallVec(x, y){
	
	var proj = new THREE.Vector3();

    portal.updateMatrixWorld();
    proj.setFromMatrixPosition(portal.matrixWorld);
    proj.project(camera);
	
	var dist = new THREE.Vector3(proj.x * (renderer.context.canvas.width/2),
						     -( proj.y * (renderer.context.canvas.height/2) ),
							 0);
	
	var mouse = new THREE.Vector3(x - (window.innerWidth / 2), y - (window.innerHeight / 2), 0);
	var p = new THREE.Vector3();
	p.subVectors(mouse, dist);
	p.y = -p.y;

	var legs = p.x * p.x + p.y * p.y;

	if (legs <= 200*200) {
		p.z = Math.sqrt(200*200 - legs);  // Pythagore
	} else {
		p.normalize();  // nearest point
	} 

	return p;
}


// Function to be called when a keyframe is clicked on:
function clickKeyFrame(index){
	
	return function(event) { 
		
		// Moves timeline to visited frame:
		previousFrame = currentFrame;
		currentFrame = index;
		
		// Handles timeline coloring:
		colorTimeline();
		
		// Signals that mouse is down:
		clickingFrames = true;
		
		// Handles right mouse click (create keyframe):
		if (event.which == 3){
			createKeyFrame(index);
		// Handles left mouse click (visit keyframe):
		} else if (event.which == 1){
			visitFrame(index);
		}
	};

}


// Applies the transformation of the index-th frame to the object:
function visitFrame(index){
	
	// Applies keyframe information to object:
	var position = allFrames[currentFrame].getPosition();
	portal.position.x = position.x;
	portal.position.y = position.y;
	portal.position.z = position.z;
	var quaternionAnim = allFrames[currentFrame].getQuaternion();
	portal.quaternion.copy(quaternionAnim);
}


// Uses the index-th to create a new keyframe:
function createKeyFrame(index){
	
	// Marks new frame as selected:
	document.getElementById("frame"+index).setAttribute("class", "round-button selected");
	selected = index;
	totalSelected++;
	
	// Updates corresponding frame values:
	allFrames[index].setKeyframe(true);
	allFrames[index].setPosition(new THREE.Vector3(portal.position.x, portal.position.y, portal.position.z));
	allFrames[index].setQuaternion(new THREE.Quaternion(portal.quaternion.x, portal.quaternion.y, portal.quaternion.z, portal.quaternion.w));
	
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
			// Checks if allFrames[j] is a keyframe:
			if (allFrames[j].isKeyframe() == true){
				interpolate(j, index);
				console.log("Interpolating from "+j+" to "+index);
				break;
			}
		} while (allFrames[j].isKeyframe() == false);
		
		// Searches for the first keyrame SUBSEQUENT to the current frame:
		j = index;
		do {
			// Increments j:
			++j;
			// Resets j if it overshot the timeline:
			if (j == totalFrames+1){
				j = 1;
			}
			// Checks if allFrames[j] is a keyframe:
			if (allFrames[j].isKeyframe() == true){
				interpolate(index, j);
				console.log("Interpolating from "+index+" to "+j);
				break;
			}
		} while (allFrames[j].isKeyframe() == false);
	}
}

// Called when rolling mouse over frames:
function mouseMovementOverFrames(index){
	return function(event) { 
		// Checks if mouse is pressed:
		if (clickingFrames == true){
			
			// Moves timeline to visited frame:
			previousFrame = currentFrame;
			currentFrame = index;
			
			// Handles timeline coloring:
			colorTimeline();
			
			// Applies frame transformation:
			visitFrame(index);
		}
	};
}
