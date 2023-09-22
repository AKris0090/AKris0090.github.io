import * as THREE from 'three';
import { LinearToneMapping } from 'three';
import { GLTFLoader } from '/three/GLTFLoader.js';
import { OrbitControls } from '/three/OrbitControls.js'
import { DRACOLoader } from '/three/DRACOLoader.js';

const loadingManager = new THREE.LoadingManager( () => {
	
    const loadingScreen = document.getElementById( 'loading-screen' ); 
    loadingScreen.classList.add( 'fade-out' );

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    
} );

const progBar = document.getElementById("progressbar");
const words = document.getElementById("words");

loadingManager.onProgress = function(items, loaded, total) {
    progBar.style.width = (loaded / total * 100) + '%';
};

loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    words.innerHTML="Loading...";
    progBar.style.display = "block"
};

function onTransitionEnd( event ) {

	event.target.remove();
	
}

const container = document.getElementById('container');
const canvas = document.getElementById('model__container');

canvas.style.width ='100%';
canvas.style.height='100%';
// ...then set the internal size to match
canvas.width  = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const scene = new THREE.Scene();

const width = canvas.width;
const height = canvas.height;

const camera = new THREE.PerspectiveCamera(15, width / height,1,5000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 160;


const renderer = new THREE.WebGLRenderer({antialias:false, canvas: canvas, alpha: true});
renderer.setSize(width, height);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = LinearToneMapping;
renderer.gammaFactor = 2.2;
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.addEventListener('change', renderer);
scene.renderer = renderer;
camera.aspect = width / height;
camera.updateProjectionMatrix();

window.addEventListener( 'resize', function() {
    const renderer = new THREE.WebGLRenderer({antialias:false, canvas: canvas, alpha: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = LinearToneMapping;
    renderer.gammaFactor = 2.2;
    scene.renderer = renderer;
    camera.updateProjectionMatrix();
} );

const directionalLight = new THREE.DirectionalLight(0xCCCCCC,1);
directionalLight.position.set(0,0.5,1);
directionalLight.lookAt(0,0,0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight4 = new THREE.DirectionalLight(0xCCCCCC,4);
directionalLight4.position.set(0,0.5,-1);
directionalLight4.lookAt(0,0,0);
directionalLight4.castShadow = true;
scene.add(directionalLight4);

const directionalLight2 = new THREE.DirectionalLight(0xCCCCCC,2);
directionalLight2.position.set(-1,0.5,0);
directionalLight2.lookAt(0,0,0);
directionalLight2.castShadow = true;
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xCCCCCC,0.5);
directionalLight3.position.set(1,0.5,0);
directionalLight3.lookAt(0,0,0);
directionalLight3.castShadow = true;
scene.add(directionalLight3);

const directionalLight5 = new THREE.DirectionalLight(0xCCCCCC,1);
directionalLight5.position.set(1,-0.5,0);
directionalLight5.lookAt(0,0,0);
directionalLight5.castShadow = true;
scene.add(directionalLight5);

const loader = new GLTFLoader( loadingManager );   

const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dLoader.setDecoderConfig({type: "js"});
loader.setDRACOLoader(dLoader);

var mesh;

let scrollPercent = 0;

await loader.loadAsync("./Character Model & Bow - Copy.glb").then(function(value) {
    console.log(value);
    mesh = value;
    mesh.scenes[0].position.x = 2.75;
    mesh.scenes[0].position.y = 8.5;
    scene.add(mesh.scenes[0]);
});

var controls;
controls = new OrbitControls( camera , renderer.domElement);
controls.addEventListener( 'change', ()=>{renderer.render(scene, camera)} );
controls.enablePan = false;

function animate() {
    controls.update();
    requestAnimationFrame( animate );

    renderer.render( scene, camera );
    console.log(scrollPercent);
};

animate();