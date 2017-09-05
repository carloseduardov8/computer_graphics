
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(0, 0, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

var scene = new THREE.Scene();

//create a blue LineBasicMaterial
var material = new THREE.LineBasicMaterial({ color: 0x0000ff });

var geometry = new THREE.Geometry();
geometry.verticesNeedUpdate = true;
geometry.elementsNeedUpdate = true;
geometry.morphTargetsNeedUpdate = true;
geometry.uvsNeedUpdate = true;
geometry.normalsNeedUpdate = true;
geometry.colorsNeedUpdate = true;
geometry.tangentsNeedUpdate = true;

function onClick(x){
	x.preventDefault();
	
	//geometry.vertices.push(new THREE.Vector3((x.clientX/window.innerWidth)*2 - 1, (x.clientY/window.innerHeight)*2 + 1, 1));
	geometry.vertices.push(new THREE.Vector3(-10,0,0));
	geometry.vertices.push(new THREE.Vector3(0,10,0));
	geometry.vertices.push(new THREE.Vector3(10,0,0));
}

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.addEventListener('mousedown', onClick)
document.body.appendChild(renderer.domElement);

function animate() {
	var line = new THREE.Line(geometry, material);
	scene.add(line);
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	console.log(line.geometry);
	
	
}
animate();