// three-sketch.js
// This script creates a Three.js scene with a rotating box on a wireframe grid

(function () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0xf0f0f0);

  document.getElementById('threejs-container-1').appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 10, 7);
  scene.add(light);

  // Grid
  scene.add(new THREE.GridHelper(20, 20, 0x888888, 0x888888));

  // Texture or color setup
  const useTexture = true; 
  const textureUrl = 'beef_texture.jpg';
  const colors = [0xff6347, 0x3cb371, 0xffa500, 0x8a2be2, 0x3264a8];

  const boxes = [];
  const rows = 5;
  const cols = 5;
  const spacing = 2;

  const createBox = (x, z, material) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const box = new THREE.Mesh(geometry, material);
    box.position.set(x, 0.5, z);
    scene.add(box);
    boxes.push(box);
  };

  if (useTexture) {
    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 60 });

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          createBox((j - cols / 2) * spacing, (i - rows / 2) * spacing, material);
        }
      }
    });
  } else {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const color = colors[(i * cols + j) % colors.length];
        const material = new THREE.MeshPhongMaterial({ color: color, shininess: 80 });
        createBox((j - cols / 2) * spacing, (i - rows / 2) * spacing, material);
      }
    }
  }

  // Camera
  camera.position.set(5, 4, 6); 
  camera.lookAt(0, 0.5, 0);  

  // Animation
  function animate() {
    requestAnimationFrame(animate);
    boxes.forEach((box, i) => {
      box.rotation.x += 0.01 + (i % 5) * 0.001;
      box.rotation.y += 0.01 + (i % 5) * 0.001;
    });
    renderer.render(scene, camera);
  }
  animate();
})();