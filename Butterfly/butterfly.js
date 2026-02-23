import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'

import { RenderPipeline } from 'three/webgpu'
import { pass } from 'three/tsl'
import {bloom} from 'three/addons/tsl/display/BloomNode.js'

let camera, scene, renderer;
let loader;
let sideCount = 100;
let renderPipeline;
let controls;

init();

function addInstancedMeshes(meshes) {
    let matrices = [];
    const dummy = new THREE.Object3D();
    for(let i = -sideCount / 2; i < sideCount / 2; i++) {
        for(let j = -sideCount / 2; j < sideCount / 2; j++) {
            dummy.position.set(i * .15, 0, j * .15);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.setScalar((Math.random() * 0.3) + 0.7);
            dummy.updateMatrix();
            matrices.push(dummy.matrix.clone());
        }
    }

    for(const { geometry, material } of meshes) {
        const instancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            sideCount * sideCount
        );

        let index = 0;
        for(let i = -sideCount / 2; i < sideCount / 2; i++) {
            for(let j = -sideCount / 2; j < sideCount / 2; j++) {
                instancedMesh.setMatrixAt(index, matrices[index]);
                index++;
            }
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        scene.add(instancedMesh);
    }
}

async function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(1, 0.5, 1);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    renderer = new WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

	renderer.inspector = new Inspector();
    await renderer.init();

    window.addEventListener( 'resize', onWindowResize );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();

    const meshes = [];

    loader = new GLTFLoader();
    loader.load('./models/purple.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (!child.isMesh) return;

            meshes.push({
                geometry: child.geometry,
                material: child.material
            });
        });

        addInstancedMeshes(meshes);
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const dirLight = new THREE.DirectionalLight(0xFFCC78, 10);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    renderPipeline = new RenderPipeline( renderer );
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode( 'output' );

    const bloomPass = bloom( scenePassColor );
    bloomPass.strength = 0.25;
    bloomPass.radius = 0.4;

    renderPipeline.outputNode = scenePassColor.add( bloomPass );
    
    requestAnimationFrame(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(animate);
}