// function hash2(x, y) {
//     return [
//         fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453),
//         fract(Math.sin(x * 269.5 + y * 183.3) * 43758.5453)
//     ];
// }
// 
// function fract(x) {
//     return x - Math.floor(x);
// }
// 
// function voronoi2D(x, y) {
//     const gx = Math.floor(x);
//     const gy = Math.floor(y);
//     const fx = x - gx;
//     const fy = y - gy;
// 
//     let minDist = 1e9;
// 
//     for (let j = -1; j <= 1; j++) {
//         for (let i = -1; i <= 1; i++) {
//             const h = hash2(gx + i, gy + j);
//             const dx = i + h[0] - fx;
//             const dy = j + h[1] - fy;
//             minDist = Math.min(minDist, dx * dx + dy * dy);
//         }
//     }
// 
//     return Math.sqrt(minDist);
// }

// function foliageWind(x, z, time) {
//     const scale = 0.25;
//     const speedX = 0.08;
//     const speedZ = 0.05;
// 
//     return voronoi2D(
//         x * scale + time * speedX,
//         z * scale + time * speedZ
//     );
// }
// 
// function updateWorld() {
//     let time = performance.now() * 0.001;
// 
//     let matrices = [];
//     let index = 0;
// 
//     for(let i = -sideCount / 2; i < sideCount / 2; i++) {
//         for(let j = -sideCount / 2; j < sideCount / 2; j++) {
//             const phase = index * 0.37;
//             const swayAmount = 0.15;
//             const swaySpeed = 1.2;
// 
//             const pos = dummyObjs[index].position;
//             const v = foliageWind(pos.x, pos.z, time);
//             const wind = 1.0 - Math.min(v * 1.8, 1.0);
// 
//             dummyObjs[index].rotation.x = Math.sin(time * swaySpeed + phase) * swayAmount * wind;
//             dummyObjs[index].rotation.z = Math.cos(time * swaySpeed * 0.8 + phase) * swayAmount * 0.6 * wind;
// 
//             dummyObjs[index].updateMatrix();
//             
//             matrices.push(dummyObjs[index].matrix.clone());
// 
//             index++;
//         }
//     }
// 
//     for(let instance of instances) {
//         index = 0;
//         for(let i = -sideCount / 2; i < sideCount / 2; i++) {
//             for(let j = -sideCount / 2; j < sideCount / 2; j++) {
//                 instance.setMatrixAt(index, matrices[index]);
//                 index++;
//             }
//         }
//         instance.instanceMatrix.needsUpdate = true;
//     }
// }