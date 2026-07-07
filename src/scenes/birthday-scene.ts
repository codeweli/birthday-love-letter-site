import * as THREE from 'three';

export class BirthdayScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private root: HTMLElement;
  private birthdayCake!: THREE.Mesh;
  private balloons: THREE.Mesh[] = [];
  private stars: THREE.Mesh[] = [];
  private ambientLight!: THREE.AmbientLight;
  private pointLight!: THREE.PointLight;

  constructor(root: HTMLElement) {
    this.root = root;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.init();
  }

  private init(): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
    this.renderer.setClearColor(0x071829, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.root.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x071829);
    this.scene.fog = new THREE.FogExp2(0x071829, 0.05);
    this.camera.position.set(0, 0.5, 8);
    this.camera.lookAt(0, 0.4, 0);

    this.createLights();
    this.createSceneObjects();
    this.animate();
    window.addEventListener('resize', () => this.handleResize());
  }

  private createLights(): void {
    this.ambientLight = new THREE.AmbientLight(0xffd8d8, 1.1);
    const hemisphereLight = new THREE.HemisphereLight(0xff9fb9, 0x221028, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffd4a8, 1.4);
    directionalLight.position.set(4, 6, 4);
    this.pointLight = new THREE.PointLight(0xff8fb2, 24, 30);
    this.pointLight.position.set(0, 4, 6);
    this.scene.add(this.ambientLight, hemisphereLight, directionalLight, this.pointLight);
  }

  private createSceneObjects(): void {
    const floorGeometry = new THREE.CircleGeometry(4, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x16334f, roughness: 0.8, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.4;
    this.scene.add(floor);

    const cakeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 1.1, 48),
      new THREE.MeshStandardMaterial({ color: 0xe8c28b, roughness: 0.28, emissive: 0x402b12, emissiveIntensity: 0.08 })
    );
    cakeBody.position.y = -0.1;
    this.scene.add(cakeBody);

    const cakeTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.18, 48),
      new THREE.MeshStandardMaterial({ color: 0xf7ead1, roughness: 0.25, emissive: 0x6e3a1d, emissiveIntensity: 0.06 })
    );
    cakeTop.position.y = 0.65;
    this.scene.add(cakeTop);

    const candleGroup = new THREE.Group();
    for (let i = 0; i < 8; i += 1) {
      const candle = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.34, 0.06),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xfff7b2 : 0x7acbff, emissive: i % 2 === 0 ? 0xfff2a8 : 0x4f9dff, emissiveIntensity: 0.5 })
      );
      candle.position.set(-0.55 + i * 0.15, 0.95, 0);
      candleGroup.add(candle);
    }
    this.scene.add(candleGroup);

    this.birthdayCake = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xf5e3bf, roughness: 0.12, emissive: 0x7b4b1f, emissiveIntensity: 0.08 })
    );
    this.birthdayCake.position.set(0, 1.1, 0.2);
    this.scene.add(this.birthdayCake);

    for (let i = 0; i < 14; i += 1) {
      const balloonGeometry = new THREE.OctahedronGeometry(0.2, 0);
      const balloonMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 14, 0.7, 0.65), emissive: 0x6fd5ff, emissiveIntensity: 0.25 });
      const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
      balloon.position.set((i - 7) * 0.55, 1.8 + Math.random() * 1.4, (Math.random() - 0.5) * 2.5);
      balloon.rotation.set(Math.random(), Math.random(), Math.random());
      this.scene.add(balloon);
      this.balloons.push(balloon);
    }

    for (let i = 0; i < 60; i += 1) {
      const starGeometry = new THREE.BoxGeometry(0.03, 0.03, 0.03);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set((Math.random() - 0.5) * 16, 2 + Math.random() * 5, (Math.random() - 0.5) * 20);
      this.scene.add(star);
      this.stars.push(star);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    const time = performance.now() * 0.0004;
    this.birthdayCake.rotation.y = Math.sin(time) * 0.18;

    this.balloons.forEach((balloon, index) => {
      balloon.position.y += Math.sin(time + index * 0.5) * 0.0012;
      balloon.rotation.y += 0.003 + index * 0.0002;
    });

    this.stars.forEach((star, index) => {
      star.position.y += Math.sin(time + index * 0.2) * 0.001;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
    this.camera.aspect = this.root.clientWidth / this.root.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  public update(scrollY: number): void {
    const parallax = scrollY * 0.004;
    this.camera.position.y = 0.5 + parallax * 0.35;
    this.camera.position.z = 8 - Math.min(scrollY * 0.003, 2.4);
    this.camera.lookAt(0, 0.4, 0);
    this.scene.children.forEach((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child !== this.birthdayCake) {
        child.rotation.x += 0.001;
      }
    });
  }
}