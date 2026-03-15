import * as THREE from 'three';

export const casingArr = [];
export let casingMesh;

export class Casing {
    constructor(position) {
        this.vel = new THREE.Vector3(-Math.random() - 1.25, 2.5, 0);
        this.pos = position;
        this.rot = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    }

    updatePos(timeDelta) {
        this.vel.y -= 9.81 * 1.5 * timeDelta;
        this.pos.addScaledVector(this.vel, timeDelta);
    }
}

export async function initCasings(gltfLoader, scene) {
    await gltfLoader.load('./models/shellCasing.glb', (gltf) => {
        const model = gltf.scene.children[0];
        casingMesh = new THREE.InstancedMesh(
            model.geometry,
            model.material,
            50
        );
        casingMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(casingMesh);
    });
}

function convertCasingPosition(position) {
    return new THREE.Vector3(position.x + 0.2, position.y + 0.1, position.z);
}

export function addCasing(position) {
    const newCasing = new Casing(convertCasingPosition(position));
    casingArr.unshift(newCasing);
}

export function updateCasings(timeDelta) {
    if (casingArr.length === 0) return;
    if (!casingMesh) return;
    for (let i = casingArr.length - 1; i >= 0; i--) {
        if (casingArr[i].pos.y <= 0) {
            casingArr.splice(i, 1);
            continue;
        }
        casingArr[i].updatePos(timeDelta);
        const dummy = new THREE.Object3D();
        dummy.position.set(casingArr[i].pos.x, casingArr[i].pos.y, casingArr[i].pos.z);
        dummy.rotation.set(casingArr[i].rot.x, casingArr[i].rot.y, casingArr[i].rot.z);
        dummy.updateMatrix();
        casingMesh.setMatrixAt(i, dummy.matrix);
    }
    casingMesh.count = casingArr.length;
    casingMesh.instanceMatrix.needsUpdate = true;
}