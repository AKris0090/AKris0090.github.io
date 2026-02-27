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
let sideCount = 50;
let renderPipeline;

let model, mixer, timer, handBone;
let drawAnim, gun;
let controls;

let matrices = [];
let dummyObjs = [];
let instances = [];

let raycaster;
let arrowHelper;
let intersects = new Array();

const sceneMeshes = new Array();

init();

function drawGun() {
    drawAnim.reset();
    drawAnim.play();
}

function onMouseDown(event) {
    if (event.button === 0) {
        if (!model || !gun || !mixer || !handBone) return;

        drawGun();
    }
}

function addInstancedMeshes(meshes) {
    for(let i = -sideCount / 2; i < sideCount / 2; i++) {
        for(let j = -sideCount / 2; j < sideCount / 2; j++) {
            const dummy = new THREE.Object3D();
            dummy.position.set(i * .15, 0, j * .15);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.setScalar((Math.random() * 0.3) + 0.7);
            dummy.updateMatrix();
            dummyObjs.push(dummy);

            matrices.push(dummy.matrix.clone());
        }
    }

    for(const { geometry, material } of meshes) {
        const instancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            sideCount * sideCount
        );
        instances.push(instancedMesh);

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

function loadGLTF(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });
}

function raycastTarget(event) {
    raycaster.setFromCamera(
        {
            x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
        },
        camera
    );
    intersects = raycaster.intersectObjects(sceneMeshes, false);
    if (intersects.length > 0) {
        let n = new THREE.Vector3();
        n.copy(intersects[0].face.normal);
        n.transformDirection(intersects[0].object.matrixWorld);
        arrowHelper.setDirection(n);
        arrowHelper.position.copy(intersects[0].point);
    }
}

function onMouseMove(event) {
    raycastTarget(event);
}

async function initModels() {
    const [characterGLTF, monitorGLTF, gunGLTF] = await Promise.all([
        loadGLTF('./models/character_animated.glb'),
        loadGLTF('./models/monitor.glb'),
        loadGLTF('./models/gun.glb')
    ]);

    model = characterGLTF.scene;
    scene.add(model);

    const animations = characterGLTF.animations;
    mixer = new THREE.AnimationMixer(model);

    drawAnim = mixer.clipAction(animations[0]);
    drawAnim.enabled = true;
    drawAnim.setEffectiveTimeScale(0.6);
    drawAnim.setLoop(THREE.LoopOnce, 1);
    drawAnim.clampWhenFinished = true;

    handBone = model.getObjectByName("handR");

    const monitor = monitorGLTF.scene;
    monitor.position.set(0, 0, -3.4);
    monitorGLTF.scene.traverse(function (child) {
        if (child.isMesh) {
            let m = child;
            sceneMeshes.push(m);
        }
    });
    scene.add(monitor);

    gun = gunGLTF.scene;
    if (handBone) {
        handBone.attach(gun);
    }
}

async function init() {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(1.77, 0.49, -1.83);
    camera.rotation.set(
        THREE.MathUtils.degToRad(174.7),
        THREE.MathUtils.degToRad(28.35),
        THREE.MathUtils.degToRad(-177.48)
    );

    timer = new THREE.Timer();
    timer.connect( document );

    scene = new THREE.Scene();

    renderer = new WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

	renderer.inspector = new Inspector();
    await renderer.init();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    window.addEventListener( 'resize', onWindowResize );
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);

    raycaster = new THREE.Raycaster();
    arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 15.0, 0xffff00);

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

    await initModels();

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const dirLight = new THREE.DirectionalLight(0xFFCC78, 10);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    renderPipeline = new RenderPipeline( renderer );
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode( 'output' );

    const bloomPass = bloom( scenePassColor );
    bloomPass.strength = 0.2;
    bloomPass.radius = 0.4;

    renderPipeline.outputNode = scenePassColor.add( bloomPass );

    requestAnimationFrame(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function hash2(x, y) {
    return [
        fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453),
        fract(Math.sin(x * 269.5 + y * 183.3) * 43758.5453)
    ];
}

function fract(x) {
    return x - Math.floor(x);
}

function voronoi2D(x, y) {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    const fx = x - gx;
    const fy = y - gy;

    let minDist = 1e9;

    for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
            const h = hash2(gx + i, gy + j);
            const dx = i + h[0] - fx;
            const dy = j + h[1] - fy;
            minDist = Math.min(minDist, dx * dx + dy * dy);
        }
    }

    return Math.sqrt(minDist);
}

function foliageWind(x, z, time) {
    const scale = 0.25;
    const speedX = 0.08;
    const speedZ = 0.05;

    return voronoi2D(
        x * scale + time * speedX,
        z * scale + time * speedZ
    );
}

function updateWorld() {
    let time = performance.now() * 0.001;

    let matrices = [];
    let index = 0;

    for(let i = -sideCount / 2; i < sideCount / 2; i++) {
        for(let j = -sideCount / 2; j < sideCount / 2; j++) {
            const phase = index * 0.37;
            const swayAmount = 0.15;
            const swaySpeed = 1.2;

            const pos = dummyObjs[index].position;
            const v = foliageWind(pos.x, pos.z, time);
            const wind = 1.0 - Math.min(v * 1.8, 1.0);

            dummyObjs[index].rotation.x = Math.sin(time * swaySpeed + phase) * swayAmount * wind;
            dummyObjs[index].rotation.z = Math.cos(time * swaySpeed * 0.8 + phase) * swayAmount * 0.6 * wind;

            dummyObjs[index].updateMatrix();
            
            matrices.push(dummyObjs[index].matrix.clone());

            index++;
        }
    }

    for(let instance of instances) {
        index = 0;
        for(let i = -sideCount / 2; i < sideCount / 2; i++) {
            for(let j = -sideCount / 2; j < sideCount / 2; j++) {
                instance.setMatrixAt(index, matrices[index]);
                index++;
            }
        }
        instance.instanceMatrix.needsUpdate = true;
    }
}

function animate() {
    controls.update();
    if ((timer != null) && (mixer != null)) {
        timer.update();
        let mixerUpdateDelta = timer.getDelta();
            
        mixer.update( mixerUpdateDelta );
    }
    renderPipeline.render();
    requestAnimationFrame(animate);
    if (dummyObjs.length != 0) {
        updateWorld();
    }
}