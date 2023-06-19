import {
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PlaneGeometry,
  Color,
  DoubleSide,
  MeshStandardMaterial,
  TextureLoader,
  RepeatWrapping,
} from "three";
import normalGround from "../assets/images/floor/monastery_stone_floor_nor_gl_1k.jpg";
import groundMap from "../assets/images/floor/monastery_stone_floor_diff_1k.jpg";
import BoxMesh from "./objects/centerBox";

const worldWidth = 800;
const cubeGeometry = new BoxGeometry(worldWidth, 200, 800);
const cubeMaterial = new MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const cube = new Mesh(cubeGeometry, cubeMaterial);

const groundNormalMap = new TextureLoader().load(normalGround);
groundNormalMap.wrapS = RepeatWrapping;
groundNormalMap.wrapT = RepeatWrapping;
groundNormalMap.repeat.set(10, 10);

const groundTexture = new TextureLoader().load(groundMap);
groundTexture.wrapS = RepeatWrapping;
groundTexture.wrapT = RepeatWrapping;
groundTexture.repeat.set(10, 10);

const groundBump = new TextureLoader().load(
  "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/monastery_stone_floor/monastery_stone_floor_rough_1k.png"
);
groundBump.wrapS = RepeatWrapping;
groundBump.wrapT = RepeatWrapping;
groundBump.repeat.set(10, 10);

const planeGeometry = new PlaneGeometry(worldWidth, 800, 80);
const planeMaterial = new MeshStandardMaterial({
  color: new Color("grey"),
  side: DoubleSide,
  normalMap: groundNormalMap,
  map: groundTexture,
  bumpMap: groundBump,
  bumpScale: 1,
});
const ground = new Mesh(planeGeometry, planeMaterial);
ground.receiveShadow = true;

cube.position.set(0, 100, 0);
// cube.add(BoxMesh);
export { ground };
export default cube;
