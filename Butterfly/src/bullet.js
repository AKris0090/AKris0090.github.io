import * as THREE from 'three';

export class BulletTrail {
    constructor(scene) {
        this.scene = scene;
        this.rings = [];

        this.mat = new THREE.MeshStandardMaterial({
            color: 0x0096FF,
            side: THREE.DoubleSide,
            emissive: 0x0096FF,
            emissiveIntensity: 3
        });
    }

    spawnRing(position, bulletDirection, ringNum) {
        const geometry = new THREE.TorusGeometry(0.015, 0.001, 8, 32);

        const ring = new THREE.Mesh(geometry, this.mat);
        ring.position.copy(position.clone().add(bulletDirection.clone().multiplyScalar(0.75 + (0.1 * ringNum))));

        ring.lookAt(ring.position.clone().add(bulletDirection));

        this.scene.add(ring);
        this.rings.push({ mesh: ring, age: 0, maxAge: 0.4, maxScale: ((2 - ringNum) * 3) + 2 });
    }

    update(delta) {
        this.rings = this.rings.filter(r => {
            r.age += delta;
            const t = r.age / r.maxAge;

            r.mesh.scale.setScalar(1 + t * r.maxScale);

            if (r.age >= r.maxAge) {
                this.scene.remove(r.mesh);
                r.mesh.geometry.dispose();
                r.mesh.material.dispose();
                return false;
            }
            return true;
        });
    }
}

export class Bullet {
    constructor(origin, direction, scene, trailColor) {
        this.position = origin.clone();
        this.direction = direction.clone().normalize();
        this.speed = 50;
        this.trail = new BulletTrail(scene);
        this.numRings = 3;
        this.lifeTime = 0.5;
        this.maxTrailLength = 20;

        const bGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8);
        const bMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: trailColor, emissiveIntensity: 3.5 });
        this.mesh = new THREE.Mesh(bGeo, bMat);

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

        scene.add(this.mesh);
        scene.add(this.lineTrail);

        this.trail.spawnRing(this.position, this.direction, 0);
        this.trail.spawnRing(this.position, this.direction, 1);
        this.trail.spawnRing(this.position, this.direction, 2);
    }

    update(delta) {
        this.lifeTime -= delta;

        this.position.addScaledVector(this.direction, this.speed * delta);
        this.trailPositions.copyWithin(3, 0, (this.maxTrailLength - 1) * 3);

        this.trailPositions[0] = this.position.x;
        this.trailPositions[1] = this.position.y;
        this.trailPositions[2] = this.position.z;

        this.trailPointCount = Math.min(this.trailPointCount + 1, this.maxTrailLength);
        this.lineTrail.geometry.setDrawRange(0, this.trailPointCount);
        this.lineTrail.geometry.attributes.position.needsUpdate = true;

        const q = new THREE.Quaternion();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
        this.mesh.quaternion.copy(q);
        this.mesh.position.copy(this.position);

        this.trail.update(delta);
    }

    destroy(scene) {
        scene.remove(this.mesh);
        scene.remove(this.lineTrail);
        this.mesh.geometry.dispose();
        this.lineTrail.geometry.dispose();
    }
}