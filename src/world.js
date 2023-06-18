import {
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PlaneGeometry,
  Color,
  DoubleSide,
} from "three";

const worldWidth = 800;
const cubeGeometry = new BoxGeometry(worldWidth, 800, 800);
const cubeMaterial = new MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const cube = new Mesh(cubeGeometry, cubeMaterial);

const planeGeometry = new PlaneGeometry(worldWidth, 800, 80);
const planeMaterial = new MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
  side: DoubleSide,
});
const ground = new Mesh(planeGeometry, planeMaterial);
cube.add(ground);

cube.position.set(0, 400, 0);
export default cube;
