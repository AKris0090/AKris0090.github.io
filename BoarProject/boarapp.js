import * as THREE from 'three';
import { LinearToneMapping } from 'three';
import { GLTFLoader } from '../three/GLTFLoader.js';
import { DRACOLoader } from '../three/DRACOLoader.js';


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
    progBar.style.display = "block";
};

function onTransitionEnd( event ) {

	event.target.remove();
	
}

const canvas = document.getElementById('model__container')

canvas.style.width = window.innerWidth;
console.log(window.innerWidth);
canvas.style.height = window.innerHeight;

const scene = new THREE.Scene();

const width = canvas.width;
const height = canvas.height;

const camera = new THREE.PerspectiveCamera(60, width / height,1,5000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 500;


const renderer = new THREE.WebGLRenderer({antialias:false, canvas: canvas, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
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
    const renderer = new THREE.WebGLRenderer({antialias:true, canvas: canvas, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = LinearToneMapping;
    renderer.gammaFactor = 2.2;
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', renderer);
    scene.renderer = renderer;
    // camera.aspect = width / height;
    camera.updateProjectionMatrix();
} )

// const hlight = new THREE.AmbientLight (0xFFFFFF,0.3);
// hlight.castShadow = true;
// scene.add(hlight);

const directionalLight = new THREE.DirectionalLight(0xEFE4DC,1);
directionalLight.position.set(0,0.5,1);
directionalLight.lookAt(0,0,0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight4 = new THREE.DirectionalLight(0xCCCCCC,4);
directionalLight4.position.set(0,0.5,-1);
directionalLight4.lookAt(0,0,0);
directionalLight4.castShadow = true;
scene.add(directionalLight4);

const directionalLight2 = new THREE.DirectionalLight(0xEFE4DC,2);
directionalLight2.position.set(-1,0.5,0);
directionalLight2.lookAt(0,0,0);
directionalLight2.castShadow = true;
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xEFE4DC,0.5);
directionalLight3.position.set(1,0.5,0);
directionalLight3.lookAt(0,0,0);
directionalLight3.castShadow = true;
scene.add(directionalLight3);

const directionalLight5 = new THREE.DirectionalLight(0xEFE4DC,1);
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
var mesh2;

let scrollPercent = 0;

await loader.loadAsync("./boar5.glb").then(function(value) {
    console.log(value);
    mesh = value;
    scene.add(mesh.scenes[0]);
});

await loader.loadAsync("./earth.glb").then(function(value) {
    console.log(value);
    mesh2 = value;
    mesh2.scenes[0].position.x = -0.5;
    mesh2.scenes[0].position.y = 10.15;
    mesh2.scenes[0].position.z = 2;
    scene.add(mesh2.scenes[0]);
});

calculateScrollPercent();

playScrollAnimations();

var mousecoords;

document.addEventListener('mousemove', function(e) {
    mousecoords = getMousePos(e);
  });
  
  function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
  }

function lerp(x, y, a) {
    return (1 - a) * x + a * y
}

function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}

var rot = true;

function zeropos(scalePs, scalePE){
    camera.position.x = -2.01
    camera.position.y = lerp(-6, 6, scalePercent(scalePs, scalePE));
    camera.position.z = 4
    camera.rotation.x = 0
    camera.rotation.y = 0
    camera.rotation.z = 0
    scene.rotation.y = 300;
    mesh.scenes[0].position.y = lerp(-50, -4, scalePercent(scalePs, scalePE));
}

function boarpos(scalePs, scalePE){
    camera.position.x = -2.01
    camera.position.y = lerp(6, 8, scalePercent(scalePs, scalePE));
    camera.position.z = 4
    camera.rotation.x = 0
    camera.rotation.y = 0
    camera.rotation.z = 0
    scene.rotation.y = 300;
    mesh.scenes[0].position.y = lerp(-4, 0, scalePercent(scalePs, scalePE));
}


function firstpos(scalePs, scalePE){
    camera.position.x = -2.01
    camera.position.y = lerp(8, 17, scalePercent(scalePs, scalePE));
    camera.position.z = lerp(4, 1.2, scalePercent(scalePs, scalePE));
    camera.rotation.x = 0
    camera.rotation.y = 0
    camera.rotation.z = 0
    scene.rotation.y = 300;
    mesh.scenes[0].position.y = 0
}

function secondpos(scalePs, scalePE){
    camera.position.x = -2.01
    camera.position.y = lerp(17, 12.9, scalePercent(scalePs, scalePE));
    camera.position.z = 1.2
    camera.rotation.x = 0
    camera.rotation.y = 0
    camera.rotation.z = 0
    scene.rotation.y = 300;
    mesh.scenes[0].position.y = 0
}

function lastLocRotPos(){
    camera.position.x = -2.01;
    camera.position.y = 12.9;
    camera.position.z = 1.2;
    camera.rotation.x = 0;
    camera.rotation.z = 0;
    scene.rotation.y = 300;
    mesh.scenes[0].position.y = 0
}

function playScrollAnimations() {
    if (scrollPercent >= 0 && scrollPercent < 60) {
        zeropos(0, 60);
    }  else if (scrollPercent >= 60 && scrollPercent < 65) {
        boarpos(60, 65);
    } else if (scrollPercent >= 65 && scrollPercent < 85) {
        firstpos(65, 85);
    } else if (scrollPercent >= 85 && scrollPercent < 99) {
        secondpos(85, 99);
    } else if (scrollPercent >= 99 && scrollPercent < 101) {
        lastLocRotPos();
    }
}

function calculateScrollPercent(){
    scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
        ((document.documentElement.scrollHeight ||
            document.body.scrollHeight) -
            document.documentElement.clientHeight)) *
    100;
}

document.body.onscroll = () => {
    calculateScrollPercent();
}

scene.background = null;

function animate() {
    console.log(scrollPercent);
    requestAnimationFrame( animate );

    var scaleper = 50;

    if(mesh2 && rot && mousecoords) {
        mesh2.scenes[0].rotation.y += ((mousecoords.x - document.documentElement.clientWidth / 2) / document.documentElement.clientWidth / scaleper);
        mesh2.scenes[0].rotation.z += (mousecoords.y - document.documentElement.clientHeight / 2) / document.documentElement.clientHeight / (scaleper);
    }

    playScrollAnimations()

    renderer.render( scene, camera );
};

animate();