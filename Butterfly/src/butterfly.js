import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { Bullet } from './bullet.js';

import { RenderPipeline } from 'three/webgpu'
import { pass } from 'three/tsl'
import {bloom} from 'three/addons/tsl/display/BloomNode.js'

import { addCasing, updateCasings, initCasings } from './shellCasing.js';

let camera, scene, renderer;
let loader;
let renderPipeline;
let rect;

const flowerSideNum = 75;
const flowerSpacing = 0.25;
const flowerOffsetX = -4.5;
const flowerOffsetY = 7;
const DECAL_LIFETIME = 5;

let loadingComplete = false;
let loadingTimeoutId;

let model, chracterMixer, gunMixer, timer, handBone, shoulderBone;
let drawAnim, lowerAnim, shootAnim, liedownAnim; 
let gun;

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

let raycaster;
let intersects = new Array();

let originCamRot;
let targetCamRot;
let camAnimUpdate = 0;
let needsCamReset = false;

let matrices = [];
let bullets = [];
let originKickBackLocalRotation;
let targetKickBackLocalRotation;
let needsKickBackReset = false;
let kickbackAnimUpdate = 0;

await init();
if (loadingComplete) {
    requestAnimationFrame(animate);
} else {
    mobileVersion();
}

function updateDecals(timerDelta) {
    for (let i = decals.length - 1; i >= 0; i--) {
        const entry = decals[i];
        entry.decalLife -= timerDelta;

        if (entry.decalLife <= 0) {
            monitorMesh.remove(entry.decal);
            entry.decal.geometry.dispose();
            entry.decal.material.dispose();
            decals.splice(i, 1);
        }
    }
}

function initiateCamShake() {
    if (!originCamRot) {
        const camRotation = new THREE.Euler().setFromQuaternion(camera.quaternion);
        originCamRot = new THREE.Euler().copy(camRotation);
        targetCamRot = new THREE.Euler().copy(camRotation);
        targetCamRot.x += THREE.MathUtils.degToRad(-0.15);
    }
    camAnimUpdate = 0;
    needsCamReset = true;
}

function updateCameraAnim(timeDelta) {
    if (!needsCamReset) return;
    camAnimUpdate += timeDelta * 5;
    const newRotation = new THREE.Euler().set(
        THREE.MathUtils.lerp(targetCamRot.x, originCamRot.x, camAnimUpdate),
        THREE.MathUtils.lerp(targetCamRot.y, originCamRot.y, camAnimUpdate),
        THREE.MathUtils.lerp(targetCamRot.z, originCamRot.z, camAnimUpdate)
    );
    camera.rotation.set(newRotation.x, newRotation.y, newRotation.z);
    if (camAnimUpdate >= 1.0) {
        camera.rotation.set(originCamRot.x, originCamRot.y, originCamRot.z);
        needsCamReset = false;
    }
}

function setCursorToImage(url, size = 32) {
    const half = size / 2;
    document.body.style.cursor = `url('${url}') ${half} ${half}, auto`;
}

function resetCursor() {
    document.body.style.cursor = '';
}

function lowerGun() {
    if (gunState === GUNSTATES.AIMING) {
        drawAnim.stop();
        lowerAnim.reset();
        lowerAnim.play();
        gunState = GUNSTATES.LOWERING;
        resetCursor();
    }
}

function drawGun() {
    if (gunState === GUNSTATES.LOWERED) {
        gun.visible = true;
        lowerAnim.stop();
        drawAnim.reset();
        drawAnim.play();
        gunState = GUNSTATES.DRAWING;
        setCursorToImage('./textures/crosshair6.png', 64);
    }
}

function turnOffMuzzleFlash() {
    muzzleFlash.intensity = 0;
}

function adjustArm(targetPosition) {
    if (shoulderBone == null) return;

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
    const parentWorldQuatInv = parentWorldQuat.clone().invert().multiply(newWorldQuat);

    const euler = new THREE.Euler().setFromQuaternion(parentWorldQuatInv, 'YXZ'); // isolate Y axis rotation by applying it first
    euler.y = shoulderBone.rotation.y; // preserve original Y rotation so that small twist doesnt apply

    shoulderBone.rotation.copy(euler);
}

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
        decals.push({decal: mesh, decalLife: DECAL_LIFETIME});
        monitorMesh.attach(mesh);

        const forward = new THREE.Vector3(0, 1, 0);
        forward.applyQuaternion(handBone.getWorldQuaternion(new THREE.Quaternion()));

        muzzleFlash.intensity = 50;
        window.setTimeout(turnOffMuzzleFlash, 50);

        initiateCamShake();

        if (shootAnim) {
            addCasing(handBone.getWorldPosition(new THREE.Vector3()), scene);

            const muzzlePos = muzzleFlash.getWorldPosition(new THREE.Vector3());
            const bulletDir = intersects[0].point.clone().sub(muzzlePos).normalize();
            const b = new Bullet(muzzlePos.sub(bulletDir.clone().multiplyScalar(0.8)), bulletDir, scene, 0xffdd44);
            bullets.push(b);

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

function loadMatrices(sideCount, spacing, offsetX, offsetY) {
    for(let i = -sideCount / 2; i < sideCount / 2; i++) {
        for(let j = -sideCount / 2; j < sideCount / 2; j++) {
            const dummy = new THREE.Object3D();
            dummy.position.set(i * spacing + (Math.random() * 0.25) + offsetX, 0.05, j * spacing + (Math.random() * 0.25) + offsetY);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.setScalar((Math.random() * 0.5) + 0.4);
            dummy.updateMatrix();
            matrices.push(dummy.matrix.clone());
        }
    }
}

function addInstancedMeshes(mesh, sideCount) {
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

    rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    raycaster.setFromCamera(
        {
            x: (x / rect.width) * 2 - 1,
            y: -(y / rect.height) * 2 + 1,
        },
        camera
    );
    intersects = raycaster.intersectObject(monitorMesh, false);
    if (intersects.length > 0) {
        let n = new THREE.Vector3();
        n.copy(intersects[0].face.normal);
        n.transformDirection(intersects[0].object.matrixWorld);
        drawGun();
        if (gunState === GUNSTATES.AIMING) {
            adjustArm(intersects[0].point);
        }
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
        loadGLTF('./models/monitorbetter2.glb'),
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
    muzzleFlash = new THREE.PointLight(0x0096FF, 50, 15);
    muzzleFlash.intensity = 0;
    const gunAnims = gunGLTF.animations;
    gunMixer = new THREE.AnimationMixer(gun);
    if (handBone) {
        handBone.attach(gun);
        handBone.attach(muzzleFlash);
        muzzleFlash.position.set(0.3, 0.55, 0);
    }

    shootAnim = gunMixer.clipAction(gunAnims[3]);
    shootAnim.setEffectiveTimeScale(3);
    shootAnim.setLoop(THREE.LoopOnce, 1);
    shootAnim.clampWhenFinished = true;

    groundGLTF.scene.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.color.multiplyScalar(1);
        }
    });
    scene.add(groundGLTF.scene);

    await Promise.all([initCasings(loader, scene)]);
}

function isMobile() {
    const hasTouch = window.matchMedia("(pointer: coarse)").matches;
    const smallScreen = window.innerWidth <= 768;
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    const uaMobile =
        /android|iphone|ipad|ipod|mobile/i.test(ua);

    return (hasTouch && smallScreen) || uaMobile;
}

function mobileVersion() {
    const canvas = document.getElementById('viewport');
    canvas.style.display = 'none';
    const header = document.getElementById('mobile_header');
    header.style.display = 'block';
}

async function init() {
    if (isMobile()) {
        mobileVersion();
        return;
    }

    loadingTimeoutId = setTimeout(() => {
        if (!loadingComplete) {
            mobileVersion();
        }
    }, 6000);

    loader = new GLTFLoader();

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

    const canvas = document.getElementById('viewport');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer = new WebGPURenderer( { antialias: true, canvas: canvas } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( canvas.width, canvas.height );

    await renderer.init();

    const textureLoader = new THREE.TextureLoader();
    decalDiffuse = textureLoader.load( './textures/shatter2.png');
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
        emissiveIntensity: 4
    });
    let decalDiffuseB = textureLoader.load( './textures/shatter.png');
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

    loadMatrices(flowerSideNum, flowerSpacing, flowerOffsetX, flowerOffsetY);

    let mesh;
    loader.load('./models/purple.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (!child.isMesh) return;

            mesh = {
                geometry: child.geometry,
                material: child.material
            };

            addInstancedMeshes(mesh, flowerSideNum);
        });
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
    bloomPass.strength = 0.1;
    bloomPass.radius = 0.1;

    renderPipeline.outputNode = scenePassColor.add( bloomPass );

    loadingComplete = true;
    clearTimeout(loadingTimeoutId);
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
    timer.update();
    let timerDelta = timer.getDelta();
    if ((chracterMixer != null) && (gunMixer != null)) {
        chracterMixer.update( timerDelta );
        gunMixer.update( timerDelta );
        updateCasings(timerDelta, scene);
        updateKickBackAnim(timerDelta);
        updateCameraAnim(timerDelta);
    }
    bullets.forEach(b => b.update(timerDelta));
    bullets.forEach((b, index) => {
        if (b.lifeTime <= 0) {
            b.destroy(scene);
            bullets.splice(index, 1);
        }
    });
    updateDecals(timerDelta);
    scene.backgroundRotation.set(-0.1, -0.3, 0);
    renderPipeline.render();
    requestAnimationFrame(animate);
}