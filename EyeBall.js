import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CopyShader } from './postShader';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();

var canvas = renderer.domElement;

renderer.setSize( window.innerWidth, window.innerHeight );
texLoader.load('./wires2.jpg' , function(texture)
            {
             scene.background = texture;  
            });
document.body.appendChild(canvas);

camera.position.z = 250;
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 250);
const light = new THREE.HemisphereLight( 0x624185, 0x472151, 50);
scene.add(light);

// const directionalLight = new THREE.DirectionalLight(0x3b2747,2);
// directionalLight.position.set(0,0.5,1);
// directionalLight.lookAt(0,0,0);
// directionalLight.castShadow = true;
// scene.add(directionalLight);

const directionalLight4 = new THREE.DirectionalLight(0xffa345,12);
directionalLight4.position.set(0,1.5,0);
directionalLight4.lookAt(0,0,0);
directionalLight4.castShadow = true;
scene.add(directionalLight4);


const directionalLight6 = new THREE.DirectionalLight(0xffa345,12);
directionalLight6.position.set(-2.5,-1.5,0);
directionalLight6.lookAt(0,0,0);
directionalLight6.castShadow = true;
scene.add(directionalLight6);

// const directionalLight2 = new THREE.DirectionalLight(0x472151,10);
// directionalLight2.position.set(-1,0.5,0);
// directionalLight2.lookAt(0,0,0);
// directionalLight2.castShadow = true;
// scene.add(directionalLight2);

// const directionalLight3 = new THREE.DirectionalLight(0x624185,1);
// directionalLight3.position.set(1,0.5,0);
// directionalLight3.lookAt(0,0,0);
// directionalLight3.castShadow = true;
// scene.add(directionalLight3);

const directionalLight5 = new THREE.DirectionalLight(0xf2ad73,12);
directionalLight5.position.set(2.5,-1.5,0);
directionalLight5.lookAt(0,0,0);
directionalLight5.castShadow = true;
scene.add(directionalLight5);

// const hemiLight = new THREE.HemisphereLight( 0xffa345, 0x080820, 25 );
// scene.add( hemiLight );

var gltfScene;

loader.load( './eye_implant.glb', function ( gltf ) {
	gltfScene = gltf.scene;
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var pointOfIntersection = new THREE.Vector3();
canvas.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	mouse.y += 0.1;
	raycaster.setFromCamera(mouse, camera);
	raycaster.ray.intersectPlane(plane, pointOfIntersection);

	gltfScene.lookAt(new THREE.Vector3(pointOfIntersection.x, pointOfIntersection.y, -pointOfIntersection.z));
}

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const copyShader = new ShaderPass(CopyShader);
composer.addPass(copyShader);

const outputPass = new OutputPass();
composer.addPass( outputPass );

renderer.setAnimationLoop(() => {
	if (resize(renderer)) {
	  camera.aspect = canvas.clientWidth / canvas.clientHeight;
	  camera.updateProjectionMatrix();
	}
	composer.render();
  });

function resize(renderer) {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
	  renderer.setSize(width, height, false);
	}
	return needResize;
  }