import { Body, Box, Sphere, Vec3 } from "cannon-es";

const playerBody = new Body({
  shape: new Sphere(10),
  mass: 10,
});
playerBody.position.set(150, 10, 0);

export default playerBody;
