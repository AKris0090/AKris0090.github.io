import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

import { RenderPipeline } from 'three/webgpu'
import { pass } from 'three/tsl'
import {bloom} from 'three/addons/tsl/display/BloomNode.js'

import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

let camera, scene, renderer;
let loader;
let renderPipeline;

let model, chracterMixer, gunMixer, timer, handBone, shoulderBone;
let drawAnim, lowerAnim, shootAnim, liedownAnim; 
let gun;
let controls;
let arrowHelper;

let muzzleFlash;

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

let dummyObjs = [];
let instances = [];

let raycaster;
let intersects = new Array();

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
        gun.visible = true;
        lowerAnim.stop();
        drawAnim.reset();
        drawAnim.play();
        gunState = GUNSTATES.DRAWING;
    }
}

function turnOffMuzzleFlash() {
    muzzleFlash.intensity = 0;
}

function adjustArm(targetPosition) {
    if (arrowHelper == null || shoulderBone == null) return;
    const shoulderWorldPos = shoulderBone.getWorldPosition(new THREE.Vector3());

    const targetDir = targetPosition.clone().sub(shoulderWorldPos).normalize();

    const shoulderQuat = new THREE.Quaternion();
    shoulderBone.getWorldQuaternion(shoulderQuat);
    const currentArmDir = new THREE.Vector3(0, 1, 0).applyQuaternion(shoulderQuat);

    const correctionQuat = new THREE.Quaternion();
    correctionQuat.setFromUnitVectors(currentArmDir, targetDir);

    const newWorldQuat = correctionQuat.multiply(shoulderQuat);

    const parentWorldQuat = new THREE.Quaternion();
    shoulderBone.parent.getWorldQuaternion(parentWorldQuat);
    const localQuat = parentWorldQuat.invert().multiply(newWorldQuat);

    shoulderBone.quaternion.copy(localQuat);
}

let originKickBackLocalRotation;
let targetKickBackLocalRotation;
let needsKickBackReset = false;
let kickbackAnimUpdate = 0;

function initiateKickBack() {
    if (!originKickBackLocalRotation) {
        const handBoneRotation = new THREE.Euler().setFromQuaternion(handBone.quaternion);
        originKickBackLocalRotation = new THREE.Euler();
        originKickBackLocalRotation.copy(handBoneRotation);
        targetKickBackLocalRotation = new THREE.Euler();
        targetKickBackLocalRotation.copy(handBoneRotation);
        targetKickBackLocalRotation.x += THREE.MathUtils.degToRad(45);
    }
    kickbackAnimUpdate = 0;
    needsKickBackReset = true;
}

function shoot(event) {
    if (raycastTarget(event)) {
        const normal = intersects[0].face.normal.clone();
        normal.transformDirection(intersects[0].object.matrixWorld);
        const orientation = new THREE.Euler();
        const quat = new THREE.Quaternion();
        const roll = new THREE.Quaternion();
        roll.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.random() * 2 * Math.PI);
        quat.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            normal                             
        );
        quat.multiply(roll);
        orientation.setFromQuaternion(quat);
        let randomScale = (Math.random() * 0.5) + 0.35;
        let materialChoice = Math.random() < 0.5 ? decalMaterial : decalMaterialB;
        if (materialChoice === decalMaterialB) {
            randomScale *= 0.25;
        }
        const size = new THREE.Vector3(randomScale, randomScale, randomScale);
        const decalGeom = new DecalGeometry( monitorMesh, intersects[0].point, orientation, size);
        const mesh = new THREE.Mesh( decalGeom, materialChoice);
        decals.push(mesh);
        monitorMesh.attach(mesh);

        arrowHelper.position.copy(handBone.getWorldPosition(new THREE.Vector3()));
        const forward = new THREE.Vector3(0, 1, 0);
        forward.applyQuaternion(handBone.getWorldQuaternion(new THREE.Quaternion()));
        console.log(handBone);
        arrowHelper.setDirection(forward);

        muzzleFlash.intensity = 50;
        window.setTimeout(turnOffMuzzleFlash, 50);

        if (shootAnim) {
            initiateKickBack();
            shootAnim.reset();
            shootAnim.play();
        }
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

function addInstancedMeshes(mesh, sideCount, spacing, offsetX, offsetY) {
    let matrices = [];
    for(let i = -sideCount / 2; i < sideCount / 2; i++) {
        for(let j = -sideCount / 2; j < sideCount / 2; j++) {
            const dummy = new THREE.Object3D();
            dummy.position.set(i * spacing + (Math.random() * 0.25) + offsetX, 0.005, j * spacing + (Math.random() * 0.25) + offsetY);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.setScalar((Math.random() * 0.5) + 0.4);
            dummy.updateMatrix();
            dummyObjs.push(dummy);
            matrices.push(dummy.matrix.clone());
        }
    }
    const instancedMesh = new THREE.InstancedMesh(
        mesh.geometry,
        mesh.material,
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
        drawGun();
        adjustArm(intersects[0].point);
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
    const [characterGLTF, monitorGLTF, gunGLTF, groundGLTF] = await Promise.all([
        loadGLTF('./models/character_animated.glb'),
        loadGLTF('./models/monitor.glb'),
        loadGLTF('./models/gun.glb'),
        loadGLTF('./models/ground.glb')
    ]);

    model = characterGLTF.scene;
    scene.add(model);

    const animations = characterGLTF.animations;
    chracterMixer = new THREE.AnimationMixer(model);
    chracterMixer.addEventListener('finished', (e) => {
        if (e.action === drawAnim) {
            gunState = GUNSTATES.AIMING;
        } else if (e.action === lowerAnim) {
            gunState = GUNSTATES.LOWERED;
            gun.visible = false;
        }
    });

    drawAnim = chracterMixer.clipAction(animations[0]);
    drawAnim.setEffectiveTimeScale(0.75);
    drawAnim.setLoop(THREE.LoopOnce, 1);
    drawAnim.clampWhenFinished = true;

    lowerAnim = chracterMixer.clipAction(animations[2]);
    lowerAnim.setEffectiveTimeScale(0.75);
    lowerAnim.setLoop(THREE.LoopOnce, 1);
    lowerAnim.clampWhenFinished = true;

    liedownAnim = chracterMixer.clipAction(animations[1]);
    liedownAnim.setEffectiveTimeScale(0.75);
    liedownAnim.setLoop(THREE.LoopOnce, 1);
    liedownAnim.clampWhenFinished = true;

    handBone = model.getObjectByName("handR");
    shoulderBone = model.getObjectByName("upper_armR");

    const monitor = monitorGLTF.scene;
    monitor.position.set(0.54, 0, -4);
    monitorMesh = monitor.getObjectByName("screen");
    scene.add(monitor);

    gun = gunGLTF.scene;
    muzzleFlash = new THREE.PointLight(0xffaa33, 50, 15);
    muzzleFlash.intensity = 0;
    const gunAnims = gunGLTF.animations;
    gunMixer = new THREE.AnimationMixer(gun);
    if (handBone) {
        handBone.attach(gun);
        handBone.attach(muzzleFlash);
        muzzleFlash.position.set(0.3, 0.55, 0);
    }

    shootAnim = gunMixer.clipAction(gunAnims[2]);
    shootAnim.setEffectiveTimeScale(3.5);
    shootAnim.setLoop(THREE.LoopOnce, 1);
    shootAnim.clampWhenFinished = true;

    groundGLTF.scene.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.color.multiplyScalar(1);
        }
    });
    scene.add(groundGLTF.scene);
}

async function init() {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(1.97, 0.59, -1.73);
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

    await renderer.init();

    const hdrloader = new THREE.TextureLoader();
    const envMap = await hdrloader.loadAsync( './textures/render.png' );
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.colorSpace = THREE.SRGBColorSpace;
    // scene.background = envMap;
    scene.backgroundIntensity = 0.6;

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
    arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 1.0, 0xff0000);
    arrowHelper.position.copy(new THREE.Vector3(0, 0, 0));
    arrowHelper.setDirection(new THREE.Vector3(0, 1, 0));
    // scene.add(arrowHelper);

    let mesh;
    loader = new GLTFLoader();
    loader.load('./models/grass.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (!child.isMesh) return;

            mesh = {
                geometry: child.geometry,
                material: child.material
            };
        });

        addInstancedMeshes(mesh, 25, 0.45, -1.25, 1.25);
    });

    mesh = [];
    loader.load('./models/flower.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (!child.isMesh) return;

            mesh = {
                geometry: child.geometry,
                material: child.material
            };
        });

        addInstancedMeshes(mesh, 100, 0.25, -7.5, 8.5);
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

function updateKickBackAnim(timeDelta) {
    if (!needsKickBackReset) return;
    kickbackAnimUpdate += timeDelta * 5;
    const newRotation = new THREE.Euler().set(
        THREE.MathUtils.lerp(targetKickBackLocalRotation.x, originKickBackLocalRotation.x, kickbackAnimUpdate),
        THREE.MathUtils.lerp(targetKickBackLocalRotation.y, originKickBackLocalRotation.y, kickbackAnimUpdate),
        THREE.MathUtils.lerp(targetKickBackLocalRotation.z, originKickBackLocalRotation.z, kickbackAnimUpdate)
    );
    handBone.rotation.set(newRotation.x, newRotation.y, newRotation.z);
    if (kickbackAnimUpdate >= 1.0) {
        handBone.rotation.set(originKickBackLocalRotation.x, originKickBackLocalRotation.y, originKickBackLocalRotation.z);
        needsKickBackReset = false;
    }
}

function animate() {
    // controls.update();
    // if (arrowHelper) {
    //     arrowHelper.position.copy(muzzleFlash.getWorldPosition(new THREE.Vector3()));
    // }
    if ((timer != null) && (chracterMixer != null) && (gunMixer != null)) {
        timer.update();
        let mixerUpdateDelta = timer.getDelta();
            
        chracterMixer.update( mixerUpdateDelta );
        gunMixer.update( mixerUpdateDelta );
    }
    updateKickBackAnim(timer.getDelta());
    scene.backgroundRotation.set(0, scene.backgroundRotation.y + 0.00005, 0);
    renderPipeline.render();
    requestAnimationFrame(animate);
    // if (dummyObjs.length != 0) {
    //     updateWorld();
    // }
}