import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import * as POSTPROCESSING from "postprocessing";
import { GUI } from "dat.gui";
import cube, { ground } from "./world";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import skyImage from "../assets/images/sky.hdr?url";
import { groundBody, world } from "./physics/worldPhysics";
import BoxMesh from "./objects/centerBox";
import centerBoxBody from "./physics/centerBoxPhysics";
// import player from "./objects/player";
import playerBody from "./physics/playerPhysics";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import soldierModel from "../assets/models/Soldier.glb?url";
import CannonDebugger from "cannon-es-debugger";

let model, skeleton, mixer;
const crossFadeControls = [];
let player;

let idleAction, walkAction, runAction;
let idleWeight, walkWeight, runWeight;
let actions, settings;

let singleStepMode = false;
let sizeOfNextStep = 0;
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
const objects = [];

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
let controls;

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
camera.position.set(150, 10, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.castShadow = true;
directionalLight.position.set(1000, 1000, -500);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(cube, ambientLight, directionalLight, ground, BoxMesh);

const backgroundLoader = new RGBELoader();
backgroundLoader.load(skyImage, (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
});

controls = new PointerLockControls(camera, renderer.domElement);
window.addEventListener("click", () => {
  controls.lock();
});

scene.add(controls.getObject());

const cannonDebugger = new CannonDebugger(scene, world, {
  color: new THREE.Color("red"),
});
raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0),
  0,
  10
);

const onKeyDown = function (event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = true;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = true;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = true;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = true;
      break;

    case "Space":
      if (canJump === true) velocity.y += 350;
      canJump = false;
      break;
  }
};

const onKeyUp = function (event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = false;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = false;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = false;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = false;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// Loading the player
const loader = new GLTFLoader();
loader.load(soldierModel, function (gltf) {
  player = gltf.scene;
  scene.add(player);

  console.log(player);

  player.traverse(function (object) {
    if (object.isMesh) object.castShadow = true;
  });

  player.scale.x = 7;
  player.scale.y = 7;
  player.scale.z = 7;
  skeleton = new THREE.SkeletonHelper(player);
  skeleton.visible = false;
  scene.add(skeleton);

  //

  const animations = gltf.animations;

  mixer = new THREE.AnimationMixer(player);

  idleAction = mixer.clipAction(animations[0]);
  walkAction = mixer.clipAction(animations[3]);
  runAction = mixer.clipAction(animations[1]);

  actions = [idleAction, walkAction, runAction];

  // activateAllActions();

  animate();
});

function deactivateAllActions() {
  actions.forEach(function (action) {
    action.stop();
  });
}

function activateAllActions() {
  setWeight(idleAction, settings["modify idle weight"]);
  setWeight(walkAction, settings["modify walk weight"]);
  setWeight(runAction, settings["modify run weight"]);

  actions.forEach(function (action) {
    action.play();
  });
}

function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

const clock = new THREE.Clock();

const timeStep = 1 / 60;
function animate() {
  const time = performance.now();
  world.step(timeStep);

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  BoxMesh.position.copy(centerBoxBody.position);
  BoxMesh.quaternion.copy(centerBoxBody.quaternion);

  ground.position.copy(groundBody.position);
  ground.quaternion.copy(groundBody.quaternion);

  player == undefined ? null : (player.position.x = playerBody.position.x);
  player == undefined ? null : (player.position.z = playerBody.position.z);
  player == undefined ? null : (player.position.y = playerBody.position.y - 6);
  player == undefined ? null : player.quaternion.copy(playerBody.quaternion);
  playerBody.position.x = camera.position.x;
  playerBody.position.z = camera.position.z;
  camera.position.y = playerBody.position.y + 7;
  playerBody.quaternion.y = camera.quaternion.y;

  playerBody.position.x += 0.01;
  requestAnimationFrame(animate);

  cannonDebugger.update();
  renderer.render(scene, camera);
}

animate();

export { animate };
