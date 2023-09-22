import * as THREE from 'three';
import { LinearToneMapping } from 'three';
import { GLTFLoader } from '../three/GLTFLoader.js';
import { DRACOLoader } from '../three/DRACOLoader.js';

import {gsap} from "./gsap-public/src/index.js"
import {ScrollTrigger} from "./gsap-public/src/ScrollTrigger.js"

class EnvironmentScene extends THREE.Scene {

    createAreaLightMaterial(intensity) {
        const material = new THREE.MeshBasicMaterial();
        material.color.setScalar(intensity);
        return material;
      }

    constructor() {
      super();
  
      this.position.y = -3.5;

      const geometry = new THREE.BoxGeometry();
      geometry.deleteAttribute('uv');
  
      const roomMaterial =
          new THREE.MeshStandardMaterial({metalness: 0, side: THREE.BackSide});
      const boxMaterial = new THREE.MeshStandardMaterial({metalness: 0});
  
      const mainLight = new THREE.PointLight(0xffffff, 500.0, 28, 2);
      mainLight.position.set(0.418, 16.199, 0.300);
      this.add(mainLight);
  
      const room = new THREE.Mesh(geometry, roomMaterial);
      room.position.set(-0.757, 13.219, 0.717);
      room.scale.set(31.713, 28.305, 28.591);
      this.add(room);
  
      const box1 = new THREE.Mesh(geometry, boxMaterial);
      box1.position.set(-10.906, 2.009, 1.846);
      box1.rotation.set(0, -0.195, 0);
      box1.scale.set(2.328, 7.905, 4.651);
      this.add(box1);
  
      const box2 = new THREE.Mesh(geometry, boxMaterial);
      box2.position.set(-5.607, -0.754, -0.758);
      box2.rotation.set(0, 0.994, 0);
      box2.scale.set(1.970, 1.534, 3.955);
      this.add(box2);
  
      const box3 = new THREE.Mesh(geometry, boxMaterial);
      box3.position.set(6.167, 0.857, 7.803);
      box3.rotation.set(0, 0.561, 0);
      box3.scale.set(3.927, 6.285, 3.687);
      this.add(box3);
  
      const box4 = new THREE.Mesh(geometry, boxMaterial);
      box4.position.set(-2.017, 0.018, 6.124);
      box4.rotation.set(0, 0.333, 0);
      box4.scale.set(2.002, 4.566, 2.064);
      this.add(box4);
  
      const box5 = new THREE.Mesh(geometry, boxMaterial);
      box5.position.set(2.291, -0.756, -2.621);
      box5.rotation.set(0, -0.286, 0);
      box5.scale.set(1.546, 1.552, 1.496);
      this.add(box5);
  
      const box6 = new THREE.Mesh(geometry, boxMaterial);
      box6.position.set(-2.193, -0.369, -5.547);
      box6.rotation.set(0, 0.516, 0);
      box6.scale.set(3.875, 3.487, 2.986);
      this.add(box6);
  
  
      // -x right
      const light1 = new THREE.Mesh(geometry, this.createAreaLightMaterial(50));
      light1.position.set(-16.116, 14.37, 8.208);
      light1.scale.set(0.1, 2.428, 2.739);
      this.add(light1);
  
      // -x left
      const light2 = new THREE.Mesh(geometry, this.createAreaLightMaterial(50));
      light2.position.set(-16.109, 18.021, -8.207);
      light2.scale.set(0.1, 2.425, 2.751);
      this.add(light2);
  
      // +x
      const light3 = new THREE.Mesh(geometry, this.createAreaLightMaterial(17));
      light3.position.set(14.904, 12.198, -1.832);
      light3.scale.set(0.15, 4.265, 6.331);
      this.add(light3);
  
      // +z
      const light4 = new THREE.Mesh(geometry, this.createAreaLightMaterial(43));
      light4.position.set(-0.462, 8.89, 14.520);
      light4.scale.set(4.38, 5.441, 0.088);
      this.add(light4);
  
      // -z
      const light5 = new THREE.Mesh(geometry, this.createAreaLightMaterial(20));
      light5.position.set(3.235, 11.486, -12.541);
      light5.scale.set(2.5, 2.0, 0.1);
      this.add(light5);
  
      // +y
      const light6 = new THREE.Mesh(geometry, this.createAreaLightMaterial(100));
      light6.position.set(0.0, 20.0, 0.0);
      light6.scale.set(1.0, 0.1, 1.0);
      this.add(light6);
    }
}



const loadingManager = new THREE.LoadingManager( () => {
	
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    
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

const canvas = document.getElementById('model__container')

canvas.style.width = window.innerWidth;
console.log(window.innerWidth);
canvas.style.height = window.innerHeight;

const scene = new THREE.Scene();

const width = canvas.width;
const height = canvas.height;

const environment = new EnvironmentScene();
scene.environment = environment;

const camera = new THREE.PerspectiveCamera(60, width / height,1,5000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 50;


const renderer = new THREE.WebGLRenderer({antialias:false, canvas: canvas, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = LinearToneMapping;
renderer.gammaFactor = 2.2;
scene.renderer = renderer;
camera.aspect = width / height;
camera.updateProjectionMatrix();

window.addEventListener( 'resize', function() {
    const renderer = new THREE.WebGLRenderer({antialias:false, canvas: canvas, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = LinearToneMapping;
    renderer.gammaFactor = 2.2;
    scene.renderer = renderer;
    camera.updateProjectionMatrix();
} )

const directionalLight = new THREE.DirectionalLight(0xCCCCCC,4);
directionalLight.position.set(0,0.5,1);
directionalLight.lookAt(0,0,0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight4 = new THREE.DirectionalLight(0xCCCCCC,1.5);
directionalLight4.position.set(0,0.5,-1);
directionalLight4.lookAt(0,0,0);
directionalLight4.castShadow = true;
scene.add(directionalLight4);

const directionalLight2 = new THREE.DirectionalLight(0xCCCCCC,8);
directionalLight2.position.set(-1,0.5,0);
directionalLight2.lookAt(0,0,0);
directionalLight2.castShadow = true;
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xCCCCCC,0.5);
directionalLight3.position.set(1,0.5,0);
directionalLight3.lookAt(0,0,0);
directionalLight3.castShadow = true;
scene.add(directionalLight3);

const loader = new GLTFLoader( loadingManager );

const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dLoader.setDecoderConfig({type: "js"});
loader.setDRACOLoader(dLoader);

var mesh;

function onTransitionEnd( event ) {

	event.target.remove();
	
}

let scrollPercent = 0;

await loader.loadAsync("./Example2.glb").then(function(value) {
    console.log(value);
    mesh = value;
    scene.add(mesh.scenes[0]);
});

calculateScrollPercent();

playScrollAnimations();

function lerp(x, y, a) {
    return (1 - a) * x + a * y
}

function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}

function secondLocRotPos(){
    camera.position.x = 7.5
    camera.position.y = 16
    camera.position.z = 4
    camera.rotation.x = 0
    camera.rotation.y = 0.7
    camera.rotation.z = -0.65
}

function thirdLocRotPos(scalePs, scalePE){
    camera.position.x = lerp(7.5, 15, scalePercent(scalePs, scalePE));
    camera.position.y = lerp(16, 12, scalePercent(scalePs, scalePE));
    camera.position.z = 4   
    camera.rotation.x = lerp(0, -0.25, scalePercent(scalePs, scalePE));
    camera.rotation.y = 0.7;
    camera.rotation.z = lerp(-0.65, -0.35, scalePercent(scalePs, scalePE));
}

//this
function fourthLocRotPos(scalePs, scalePE){
    camera.position.x = lerp(15, 17, scalePercent(scalePs, scalePE));
    camera.position.y = lerp(12, 3, scalePercent(scalePs, scalePE));
    camera.position.z = lerp(4, -4, scalePercent(scalePs, scalePE));
    camera.rotation.x = lerp(-0.25, -0.5, scalePercent(scalePs, scalePE));
    camera.rotation.y = lerp(0.7, 1.2, scalePercent(scalePs, scalePE));
    camera.rotation.z = lerp(-0.35, 0, scalePercent(scalePs, scalePE));
}

function fifthLocRotPos(scalePs, scalePE){
    camera.position.x = lerp(17, -1.5, scalePercent(scalePs, scalePE));
    camera.position.y = lerp(3, -5, scalePercent(scalePs, scalePE));
    camera.position.z = lerp(-4, -14, scalePercent(scalePs, scalePE));
    camera.rotation.x = lerp(-0.5, -0.85, scalePercent(scalePs, scalePE));
    camera.rotation.y = lerp(1.2, 3, scalePercent(scalePs, scalePE));
    camera.rotation.z = lerp(0, 0.15, scalePercent(scalePs, scalePE));
}

function sixthLocRotPos(scalePs, scalePE){
    camera.position.x = lerp(-1.5, -1.5, scalePercent(scalePs, scalePE));
    camera.position.y = lerp(-5, -5, scalePercent(scalePs, scalePE));
    camera.position.z = lerp(-14, -14, scalePercent(scalePs, scalePE));
    camera.rotation.x = lerp(-0.85, -0.85, scalePercent(scalePs, scalePE));
    camera.rotation.y = lerp(3, 3, scalePercent(scalePs, scalePE));
    camera.rotation.z = lerp(0.15, 0.15, scalePercent(scalePs, scalePE));
}

function firstLocRotPos(scalePs, scalePE){
    camera.position.x = lerp(-1.5, -12, scalePercent(scalePs, scalePE));
    camera.position.y = lerp(-5, 0, scalePercent(scalePs, scalePE));
    camera.position.z = lerp(-14, 20, scalePercent(scalePs, scalePE));
    camera.rotation.x = lerp(-0.85, 0, scalePercent(scalePs, scalePE));
    camera.rotation.y = lerp(3, 6.2, scalePercent(scalePs, scalePE));
    camera.rotation.z = lerp(0.15, 0, scalePercent(scalePs, scalePE));
}

function lastLocRotPos(scalePs, scalePE){
    camera.position.x = lerp(-12, -10, scalePercent(scalePs, scalePE));
    camera.position.y = lerp(0, 4, scalePercent(scalePs, scalePE));
    camera.position.z = lerp(20, 37, scalePercent(scalePs, scalePE));
    camera.rotation.x = 0
    camera.rotation.y = lerp(6.2, 6.5, scalePercent(scalePs, scalePE));
    camera.rotation.z = 0
}

function maintain(){
    camera.position.x = -10;
    camera.position.y = 4;
    camera.position.z = 37;
    camera.rotation.x = 0
    camera.rotation.y = 6.5;
    camera.rotation.z = 0
}


function playScrollAnimations() {
    if (scrollPercent >= 0 && scrollPercent < 3.2) {
        secondLocRotPos();
    } else if (scrollPercent >= 3.2 && scrollPercent < 10) {
        thirdLocRotPos(3.2, 10);
    } else if (scrollPercent >= 10 && scrollPercent < 20) {
        fourthLocRotPos(10, 20);
    } else if (scrollPercent >= 20 && scrollPercent < 30) {
        fifthLocRotPos(20, 30);
    } else if (scrollPercent >= 30 && scrollPercent < 34) {
        sixthLocRotPos(30, 34);
    } else if (scrollPercent >= 37 && scrollPercent < 63) {
        firstLocRotPos(37, 63);
    } else if (scrollPercent >= 70 && scrollPercent < 96) {
        lastLocRotPos(70, 96);
    } else if (scrollPercent >= 97) {
        maintain();
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

const tex_loader = new THREE.TextureLoader();
const texture = tex_loader.load(
  './Ks6OwQdo_4x.jpg',
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt.texture;
  });

function animate() {
    console.log(scrollPercent);
    requestAnimationFrame( animate );

    playScrollAnimations()

    renderer.render( scene, camera );
};

animate();

gsap.registerPlugin(ScrollTrigger);

let sections = gsap.utils.toArray(".tx");

gsap.to(sections, {
  yPercent: -1 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".container",
    pin: true,
    scrub: 1,
    snap: {
      snapTo: 1 / (sections.length - 1),
      duration: 2.5,
      delay: 0.1,
      ease: "Power1.easeInOut"
    },
  }
});
