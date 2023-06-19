import { BoxGeometry, Color, Mesh, MeshStandardMaterial } from "three";

const boxMaterial = new MeshStandardMaterial({ color: new Color("grey") });
const boxGeometry = new BoxGeometry(100, 100, 100);
const BoxMesh = new Mesh(boxGeometry, boxMaterial);
BoxMesh.castShadow = true;
BoxMesh.receiveShadow = true;
export default BoxMesh;
