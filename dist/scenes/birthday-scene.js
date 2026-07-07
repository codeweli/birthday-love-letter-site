"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdayScene = void 0;
const THREE = __importStar(require("three"));
class BirthdayScene {
    constructor(root) {
        this.balloons = [];
        this.stars = [];
        this.root = root;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.init();
    }
    init() {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
        this.root.appendChild(this.renderer.domElement);
        this.scene.background = null;
        this.camera.position.set(0, 0.5, 8);
        this.camera.lookAt(0, 0.4, 0);
        this.createLights();
        this.createSceneObjects();
        this.animate();
        window.addEventListener('resize', () => this.handleResize());
    }
    createLights() {
        this.ambientLight = new THREE.AmbientLight(0xffd8d8, 1.2);
        this.pointLight = new THREE.PointLight(0xffcfcf, 22, 30);
        this.pointLight.position.set(0, 4, 6);
        this.scene.add(this.ambientLight, this.pointLight);
    }
    createSceneObjects() {
        const floorGeometry = new THREE.CircleGeometry(4, 64);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3b1730, roughness: 0.8, metalness: 0.1 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.4;
        this.scene.add(floor);
        const cakeBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1.1, 48), new THREE.MeshStandardMaterial({ color: 0xff7d98, roughness: 0.3, emissive: 0x28111f, emissiveIntensity: 0.2 }));
        cakeBody.position.y = -0.1;
        this.scene.add(cakeBody);
        const cakeTop = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.18, 48), new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.3 }));
        cakeTop.position.y = 0.65;
        this.scene.add(cakeTop);
        const candleGroup = new THREE.Group();
        for (let i = 0; i < 8; i += 1) {
            const candle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.06), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xfff7b2 : 0xffb6c1 }));
            candle.position.set(-0.55 + i * 0.15, 0.95, 0);
            candleGroup.add(candle);
        }
        this.scene.add(candleGroup);
        this.birthdayCake = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.35), new THREE.MeshStandardMaterial({ color: 0xfff9fb, roughness: 0.15 }));
        this.birthdayCake.position.set(0, 1.1, 0.2);
        this.scene.add(this.birthdayCake);
        for (let i = 0; i < 14; i += 1) {
            const balloonGeometry = new THREE.OctahedronGeometry(0.2, 0);
            const balloonMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 14, 0.7, 0.65) });
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
    animate() {
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
    handleResize() {
        this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
        this.camera.aspect = this.root.clientWidth / this.root.clientHeight;
        this.camera.updateProjectionMatrix();
    }
    update(scrollY) {
        const parallax = scrollY * 0.004;
        this.camera.position.y = 0.5 + parallax * 0.35;
        this.camera.position.z = 8 - Math.min(scrollY * 0.003, 2.4);
        this.camera.lookAt(0, 0.4, 0);
        this.scene.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child !== this.birthdayCake) {
                child.rotation.x += 0.001;
            }
        });
    }
}
exports.BirthdayScene = BirthdayScene;
