import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

const playerGeometry = new SphereGeometry(10, 10, 10);
const playerMaterial = new MeshBasicMaterial({ color: 0xff0000 });
const player = new Mesh(playerGeometry, playerMaterial);
export default player;
