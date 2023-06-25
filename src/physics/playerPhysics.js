import { Body, Box, Sphere, Vec3 } from "cannon-es";

const playerBody = new Body({
  shape: new Box(new Vec3(2, 6.5, 1.3)),
  mass: 10,
});
playerBody.position.set(150, 10, 0);

export default playerBody;
