(function () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 800 / 400, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0xe6f3ff);
  document.getElementById('threejs-container-3').appendChild(renderer.domElement);

  scene.fog = new THREE.Fog(0xe6f3ff, 3, 20);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  const grassMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
  const dirtMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0xA0522D });
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xEDC9AF });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });

  function createBlock(x, y, z, mat) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
    cube.position.set(x, y, z);
    scene.add(cube);
    return cube;
  }

  const blocks = [];
  const size = 8;

  for (let i = -size; i <= size; i++) {
    for (let j = -size; j <= size; j++) {
      const height = Math.floor(Math.random() * 3);
      for (let h = 0; h <= height; h++) {
        const mat = (h === height)
          ? (Math.random() < 0.3 ? sandMat : grassMat)
          : (h === 0 ? stoneMat : dirtMat);
        blocks.push(createBlock(i, h, j, mat));
      }
    }
  }

  const treePositions = [
    { x: -4, z: -4 },
    { x: 5, z: 5 }
  ];

  treePositions.forEach(pos => {
    const baseY = 3;
    const height = 5;
    for (let y = 0; y < height; y++) {
      blocks.push(createBlock(pos.x, baseY + y, pos.z, woodMat));
    }
    const topY = baseY + height;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = 0; dy <= 2; dy++) {
        for (let dz = -2; dz <= 2; dz++) {
          const dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
          if (dist <= 4 && !(dx === 0 && dz === 0 && dy === 0)) {
            blocks.push(createBlock(pos.x + dx, topY + dy, pos.z + dz, leafMat));
          }
        }
      }
    }
  });

  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.screenSpacePanning = false;
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.target.set(0, 0, 0);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
})();