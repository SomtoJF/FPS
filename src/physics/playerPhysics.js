import { Body, Box, Material, Sphere, Vec3 } from "cannon-es";

const playerBody = new Body({
  shape: new Box(new Vec3(2, 6, 1.3)),
  mass: 100,
  material: new Material("ground"),
});
playerBody.position.set(150, 10, 0);

export default playerBody;
