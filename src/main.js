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
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gunModel from "../assets/models/shotgun.glb?url";
import CannonDebugger from "cannon-es-debugger";

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
const pointer = new THREE.Vector2();
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

// GUI settings
const gui = new GUI();
const gunFolder = gui.addFolder("Gun");
const scaleFolder = gunFolder.addFolder("Scale");
const quaternionFolder = gunFolder.addFolder("Querternion");
const worldFolder = gui.addFolder("World");
worldFolder.add(world.gravity, "x", -20, 20, 1);
worldFolder.add(world.gravity, "y", -20, 20, 1);
worldFolder.add(world.gravity, "z", -20, 20, 1);

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

let gun;

const gunLoader = new GLTFLoader();
gunLoader.load(gunModel, function (gltf) {
	const initialGunRotation = new THREE.Euler(0, Math.PI / 2, 0);
	gun = gltf.scene;
	gun.scale.set(0.05, 0.05, 0.05);
	gun.position.set(0, -2, 5);

	gun.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});

	console.log(gun.position);
	scene.add(gun);

	// Add the gun properties to dat.gui()
	scaleFolder.add(gun.scale, "x", 0.01, 1, 0.01);
	scaleFolder.add(gun.scale, "y", 0.01, 1, 0.01);
	scaleFolder.add(gun.scale, "z", 0.01, 1, 0.01);
	quaternionFolder.add(gun.quaternion, "x", 0.01, 0.001, 0.01);
	quaternionFolder.add(gun.quaternion, "y", 0.01, 0.001, 0.01);
	quaternionFolder.add(gun.quaternion, "z", 0.01, 0.001, 0.01);
});

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

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	controls.handleResize();
}

window.addEventListener("click", (event) => {
	if (controls.isLocked) {
		console.log("Locked");
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
		// update the picking ray with the camera and pointer position
		raycaster.setFromCamera(pointer, camera);

		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(scene.children);

		for (let i = 0; i < intersects.length; i++) {
			intersects[i].object.material.color.set(0xff0000);
		}
	}
});

console.log(controls);

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

	if (gun && camera) {
		// Set the initial position relative to the camera
		const offset = new THREE.Vector3(2, -2, -2.5); // Adjust the offset as needed
		const relativeOffset = offset.clone();

		// Rotate the relative offset to match the camera's rotation
		relativeOffset.applyQuaternion(camera.quaternion);

		// Calculate the new position of the gun
		const newPosition = camera.position.clone().add(relativeOffset);

		// Set the gun's position and rotation
		gun.position.copy(newPosition);
		gun.rotation.copy(camera.rotation);
	}

	requestAnimationFrame(animate);

	cannonDebugger.update();
	renderer.render(scene, camera);
}

animate();

export { animate };
