import * as THREE from 'three';

export const casingArr = [];
export let casingMesh;

export class Casing {
    constructor(position, scene, trailColor) {
        this.vel = new THREE.Vector3(-Math.random() - 1.25, 2.5, 0);    
        this.pos = position;
        this.rot = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        
        this.maxTrailLength = 20;
        this.trailPositions = new Float32Array(this.maxTrailLength * 3);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        lineGeo.setDrawRange(0, 0);
        const lineMat = new THREE.LineBasicMaterial({
            color: trailColor,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.lineTrail = new THREE.Line(lineGeo, lineMat);
        this.trailPointCount = 0;
    
        scene.add(this.lineTrail);
    }

    updatePos(timeDelta) {
        this.vel.y -= 9.81 * 1.5 * timeDelta;
        this.pos.addScaledVector(this.vel, timeDelta);

        this.trailPositions.copyWithin(3, 0, (this.maxTrailLength - 1) * 3);

        this.trailPositions[0] = this.pos.x;
        this.trailPositions[1] = this.pos.y;
        this.trailPositions[2] = this.pos.z;

        this.trailPointCount = Math.min(this.trailPointCount + 1, this.maxTrailLength);
        this.lineTrail.geometry.setDrawRange(0, this.trailPointCount);
        this.lineTrail.geometry.attributes.position.needsUpdate = true;
    }

    dispose(scene) {
        scene.remove(this.lineTrail);
        this.lineTrail.geometry.dispose();
        this.lineTrail.material.dispose();
    }
}

export function initCasings(gltfLoader, scene) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            './models/shellCasing.glb',
            (gltf) => {
                const model = gltf.scene.children[0];
                casingMesh = new THREE.InstancedMesh(
                    model.geometry,
                    model.material,
                    50
                );
                casingMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                scene.add(casingMesh);
                resolve();
            },
            undefined,
            reject
        );
    });
}

function convertCasingPosition(position) {
    return new THREE.Vector3(position.x + 0.2, position.y + 0.1, position.z);
}

export function addCasing(position, scene, trailColor = 0xFF0000) {
    const newCasing = new Casing(convertCasingPosition(position), scene, trailColor);
    casingArr.unshift(newCasing);
}

const dummy = new THREE.Object3D();

export function updateCasings(timeDelta, scene) {
    if (casingArr.length === 0) return;
    if (!casingMesh) return;

    for (let i = casingArr.length - 1; i >= 0; i--) {
        if (casingArr[i].pos.y <= 0) {
            casingArr[i].dispose(scene);
            casingArr.splice(i, 1);
            continue;
        }

        casingArr[i].updatePos(timeDelta);

        dummy.position.set(casingArr[i].pos.x, casingArr[i].pos.y, casingArr[i].pos.z);
        dummy.rotation.set(casingArr[i].rot.x, casingArr[i].rot.y, casingArr[i].rot.z);
        dummy.updateMatrix();
        casingMesh.setMatrixAt(i, dummy.matrix);
    }

    casingMesh.count = casingArr.length;
    casingMesh.instanceMatrix.needsUpdate = true;
    
}