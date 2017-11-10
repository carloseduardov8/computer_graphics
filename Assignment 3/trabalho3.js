var container, controls;
var camera, scene, renderer;
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
}

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var x1 = 0;

function animate() {
	x1++;
	if (x1 == 200){
		controls.reset();
	} else if (x1 == 400){
		controls.saveState();
		x1 = 0;
	}
	controls.update();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

var states = [];

for (var i=1; i<=100; i++){
	
	// Creates the buttons:
	var btn = document.createElement("BUTTON");
	btn.setAttribute("id", "frame"+i);
	btn.setAttribute("class", "round-button");
	
	btn.addEventListener("click", clickListener.bind( null, i) );
	
	// Saves initial position state:
	states[i] = new THREE.Vector3(0, 0, 0);
	
	// Appends the button:
	var info = document.getElementById("info");
	info.appendChild(btn);
}

function clickListener(index){
	console.log("hey "+ index);
}
