import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls";
import * as POSTPROCESSING from "postprocessing";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GUI } from "dat.gui";
import cube, { ground } from "./world";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import skyImage from "../assets/images/sky.hdr?url";
import { groundBody, world } from "./physics/worldPhysics";
import BoxMesh from "./objects/centerBox";
import centerBoxBody from "./physics/centerBoxPhysics";
import player from "./objects/player";
import playerBody from "./physics/playerPhysics";

let orbitControlsActive = true;

// instantiate Scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
camera.position.set(0, 600, 300);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.castShadow = true;
directionalLight.position.set(1000, 1000, -500);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(cube, ambientLight, directionalLight, ground, BoxMesh);
scene.add(player);

const newControls = (string) => {
  if (string === "orbit") {
    return new OrbitControls(camera, renderer.domElement);
  } else {
    const controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 1000;
    controls.lookSpeed = 0.8;
    controls.lookVertical = true;
    orbitControlsActive = false;
    return controls;
  }
};

const backgroundLoader = new RGBELoader();
backgroundLoader.load(skyImage, (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
});

const controls = newControls("orbit");

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

const clock = new THREE.Clock();

let t = 0;
const timeStep = 1 / 60;
function animate() {
  t += 0.005;
  world.step(timeStep);

  BoxMesh.position.copy(centerBoxBody.position);
  BoxMesh.quaternion.copy(centerBoxBody.quaternion);

  ground.position.copy(groundBody.position);
  ground.quaternion.copy(groundBody.quaternion);

  player.position.copy(playerBody.position);
  player.quaternion.copy(playerBody.quaternion);
  // playerBody.position.copy(camera.position);

  orbitControlsActive ? null : camera.position.copy(playerBody.position);
  requestAnimationFrame(animate);

  orbitControlsActive ? controls.update() : controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

animate();

export { scene };
