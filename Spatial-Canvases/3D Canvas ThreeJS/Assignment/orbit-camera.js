(function () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0x000000); // 星空背景黑

  document.getElementById('threejs-container-2').appendChild(renderer.domElement);

  // 缩放设置
  const SIZE_SCALE = 0.5;
  const BASE_DISTANCE = 7; // 第一颗行星与太阳距离

  // 星球数据
  const rawSizes = {
    sun: 3.5,
    mercury: 0.38,
    venus: 0.95,
    earth: 1.0,
    mars: 0.53,
    jupiter: 11.2,
    saturn: 9.45,
    uranus: 4.0,
    neptune: 3.9,
  };

  const planetNames = [
    'mercury', 'venus', 'earth', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune'
  ];

  const colors = {
    sun: 0xffdd66,
    mercury: 0xaaaaaa,
    venus: 0xc2b280,
    earth: 0x3399ff,
    mars: 0xcc3300,
    jupiter: 0xd2b48c,
    saturn: 0xf5deb3,
    uranus: 0x66cccc,
    neptune: 0x3366cc,
  };

  // 星球生成函数
  function createPlanet(name, size, distance, color, emissive = false) {
    const material = emissive
      ? new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 })
      : new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });

    const geometry = new THREE.SphereGeometry(size * SIZE_SCALE, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      orbitRadius: distance,
      size: size * SIZE_SCALE,
    };
    scene.add(mesh);
    return mesh;
  }

  // 添加太阳
  const sun = createPlanet('sun', rawSizes.sun, 0, colors.sun, true);
  sun.position.set(0, 0, 0);

  // 光源位于太阳中心
  const sunlight = new THREE.PointLight(0xffffff, 2, 1000);
  sunlight.position.set(0, 0, 0);
  scene.add(sunlight);

  // 添加行星 + 安全轨道计算
  const planets = {};
  const orbits = [];
  let currentDistance = BASE_DISTANCE;

  for (let i = 0; i < planetNames.length; i++) {
    const name = planetNames[i];
    const size = rawSizes[name];

    // 每个轨道距离 = 前一距离 + 当前行星直径 + 缓冲
    const safeMargin = size * SIZE_SCALE * 2 + 1.5;
    currentDistance += safeMargin;

    const planet = createPlanet(name, size, currentDistance, colors[name]);
    planet.position.set(currentDistance, 0, 0);
    planet.userData.orbitRadius = currentDistance;
    planets[name] = planet;

    // 轨道环
    const orbitPoints = [];
    const segments = 100;
    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(angle) * currentDistance, 0, Math.sin(angle) * currentDistance));
    }
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(orbitPoints),
      new THREE.LineBasicMaterial({ color: 0x444444 })
    );
    scene.add(orbit);
    orbits.push(currentDistance);
  }

  // 添加星空背景
  function addStars(num = 400) {
    const starColors = [
      { color: 0xffffff, weight: 0.5 },
      { color: 0x99ccff, weight: 0.2 }, // 蓝星
      { color: 0xffee99, weight: 0.2 }, // 黄星
      { color: 0xff6666, weight: 0.1 }, // 红星
    ];

    // 构建累加权重
    const cumulative = [];
    let sum = 0;
    for (let s of starColors) {
      sum += s.weight;
      cumulative.push({ color: s.color, threshold: sum });
    }

    function getRandomColor() {
      const r = Math.random();
      return cumulative.find(c => r <= c.threshold).color;
    }

    for (let i = 0; i < num; i++) {
      const starGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const starMat = new THREE.MeshBasicMaterial({ color: getRandomColor() });
      const star = new THREE.Mesh(starGeo, starMat);

      // 随机位置，离中心较远
      const r = THREE.MathUtils.randFloat(80, 150);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      star.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      scene.add(star);
    }
  }

  addStars();

  // 相机与控制
  camera.position.set(0, 30, 80);
  camera.lookAt(0, 0, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.target.set(0, 0, 0);
  controls.update();

  // 动画
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

    Object.values(planets).forEach((planet, i) => {
      const angle = time * (0.2 + i * 0.03); // 不同速度
      const r = planet.userData.orbitRadius;
      planet.position.x = Math.cos(angle) * r;
      planet.position.z = Math.sin(angle) * r;
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
})();