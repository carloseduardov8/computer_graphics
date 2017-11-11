var container, controls;
var camera, scene, renderer;
var totalFrames = 90;					// Number of frames in timeline
var states = [];						// Array to hold frame states
var selected;							// Currently selected frame
var totalSelected = 0;					// Total frames already selected
var currentFrame = 1;					// Current frame to start animation from
var playAnim = false;					// Tracks if the play button is active
init();
animate();

function init() {
	
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10 );
	camera.position.z = 2;
	controls = new THREE.OrbitControls( camera );
	scene = new THREE.Scene();
	scene.add( new THREE.HemisphereLight() );
	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 2 );
	scene.add( directionalLight );
	//3ds files dont store normal maps
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
		scene.add( object );
	});
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', resize, false );
	
	// Sets up initial frame data:
	
	for (var i=1; i<=totalFrames; i++){
	
		// Creates the buttons:
		var btn = document.createElement("BUTTON");
		btn.setAttribute("id", "frame"+i);
		btn.setAttribute("class", "round-button");
		
		btn.addEventListener("click", clickListener.bind( null, i) );
		
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

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var eo = 0;

function animate() {
	
	// Executes animation if need be:
	if (playAnim){
		
		// Handles timeline animation (marks frames as red as they animate):
		document.getElementById("frame"+currentFrame).setAttribute("class", "round-button animated");
		if (currentFrame == 1){
			if (states[totalFrames].w == 1){
				document.getElementById("frame"+totalFrames).setAttribute("class", "round-button selected");
			} else {
				document.getElementById("frame"+totalFrames).setAttribute("class", "round-button");
			}
		} else {
			if (states[currentFrame-1].w == 1){
				document.getElementById("frame"+(currentFrame-1)).setAttribute("class", "round-button selected");
			} else {
				document.getElementById("frame"+(currentFrame-1)).setAttribute("class", "round-button");
			}
		}
		
		// Applies animation to controls:
		controls.position0 = states[currentFrame];
		controls.reset();
		
		eo++;
		if (eo == 2){
			currentFrame++;
			eo = 0;
		}
	}
	if (currentFrame == totalFrames+1){
		currentFrame = 1;
	}
	
	// Updates scene:
	controls.update();
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
		length = totalFrames - end + start;
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



function clickListener(index){
	
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
				break;
			}
		} while (states[j].w == 0);
	}

}
