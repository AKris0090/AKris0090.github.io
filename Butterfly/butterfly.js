import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

import { RenderPipeline } from 'three/webgpu'
import { pass } from 'three/tsl'
import {bloom} from 'three/addons/tsl/display/BloomNode.js'

let camera, scene, renderer;
let loader;
let sideCount = 50;
let renderPipeline;

let model, mixer, timer, handBone;
let drawAnim, lowerAnim, gun;
let controls;

let monitorMesh;

const GUNSTATES = {
    DRAWING: "drawing",
    AIMING: "aiming",
    LOWERING: "lowering",
    LOWERED: "lowered"
};
let gunState = GUNSTATES.LOWERED;

let decals = [];
let decalDiffuse, decalMaterial, decalMaterialB;

let matrices = [];
let dummyObjs = [];
let instances = [];

let raycaster;
let arrowHelper;
let intersects = new Array();
let shatter;

const sceneMeshes = new Array();

init();

function lowerGun() {
    if (gunState === GUNSTATES.AIMING) {
        drawAnim.stop();
        lowerAnim.reset();
        lowerAnim.play();
        gunState = GUNSTATES.LOWERING;
    }
}

function drawGun() {
    if (gunState === GUNSTATES.LOWERED) {
        lowerAnim.stop();
        drawAnim.reset();
        drawAnim.play();
        gunState = GUNSTATES.DRAWING;
    }
}

function shoot(event) {
    if (raycastTarget(event)) {
        const normal = intersects[0].face.normal.clone();
        normal.transformDirection(intersects[0].object.matrixWorld);
        const orientation = new THREE.Euler();
        const quat       = new THREE.Quaternion();
        const roll = new THREE.Quaternion();
        roll.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.random() * 2 * Math.PI);
        quat.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            normal                             
        );
        quat.multiply(roll);
        orientation.setFromQuaternion(quat);
        let randomScale = (Math.random() * 0.75) + 0.75;
        let materialChoice = Math.random() < 0.5 ? decalMaterial : decalMaterialB;
        if (materialChoice === decalMaterialB) {
            randomScale *= 0.25;
        }
        const size = new THREE.Vector3(randomScale, randomScale, randomScale);
        const decalGeom = new DecalGeometry( monitorMesh, intersects[0].point, orientation, size);
        const mesh = new THREE.Mesh( decalGeom, materialChoice);
        decals.push(mesh);
        monitorMesh.attach(mesh);
    }
}

function onMouseDown(event) {
    if (event.button === 0) {
        if (!decalDiffuse || !decalMaterial) return;

        if (gunState != GUNSTATES.AIMING) {
            return;
        }

        shoot(event);
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
    if (!monitorMesh) {
        return;
    }
    raycaster.setFromCamera(
        {
            x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
        },
        camera
    );
    intersects = raycaster.intersectObject(monitorMesh, false);
    if (intersects.length > 0) {
        let n = new THREE.Vector3();
        n.copy(intersects[0].face.normal);
        n.transformDirection(intersects[0].object.matrixWorld);
        if (shatter) {
            arrowHelper.setDirection(n);
            arrowHelper.position.copy(intersects[0].point);
        }
        drawGun();
        return true;
    } else {
        lowerGun();
    }
    return false;
}

function onMouseMove(event) {
    raycastTarget(event);
}

async function initModels() {
    const [characterGLTF, monitorGLTF, gunGLTF, shatterGLTF] = await Promise.all([
        loadGLTF('./models/character_animated.glb'),
        loadGLTF('./models/monitor.glb'),
        loadGLTF('./models/gun.glb'),
        loadGLTF('./models/shatter.glb')
    ]);

    model = characterGLTF.scene;
    scene.add(model);

    const animations = characterGLTF.animations;
    mixer = new THREE.AnimationMixer(model);
    mixer.addEventListener('finished', (e) => {
        if (e.action === drawAnim) {
            gunState = GUNSTATES.AIMING;
        } else if (e.action === lowerAnim) {
            gunState = GUNSTATES.LOWERED;
        }
    });

    drawAnim = mixer.clipAction(animations[0]);
    drawAnim.setEffectiveTimeScale(0.75);
    drawAnim.setLoop(THREE.LoopOnce, 1);
    drawAnim.clampWhenFinished = true;

    lowerAnim = mixer.clipAction(animations[1]);
    lowerAnim.setEffectiveTimeScale(0.75);
    lowerAnim.setLoop(THREE.LoopOnce, 1);
    lowerAnim.clampWhenFinished = true;

    handBone = model.getObjectByName("handR");

    const monitor = monitorGLTF.scene;
    monitor.position.set(0, 0, -3.4);
    monitorMesh = monitor.getObjectByName("screen");
    scene.add(monitor);

    gun = gunGLTF.scene;
    if (handBone) {
        handBone.attach(gun);
    }

    shatter = shatterGLTF.scene;
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

    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.update();

    const textureLoader = new THREE.TextureLoader();
    decalDiffuse = textureLoader.load( './textures/shatter3.png');
    decalDiffuse.colorSpace = THREE.SRGBColorSpace;
    decalMaterial = new THREE.MeshLambertMaterial( {
        map: decalDiffuse,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: decalDiffuse,
        emissiveIntensity: 1
    });
    let decalDiffuseB = textureLoader.load( './textures/shatter2.png');
    decalDiffuseB.colorSpace = THREE.SRGBColorSpace;
    decalMaterialB = new THREE.MeshLambertMaterial( {
        map: decalDiffuseB,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: decalDiffuseB,
        emissiveIntensity: 1
    });

    window.addEventListener( 'resize', onWindowResize );
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);

    raycaster = new THREE.Raycaster();
    arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 1, 0xffffff);
    scene.add(arrowHelper);

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
    // controls.update();
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