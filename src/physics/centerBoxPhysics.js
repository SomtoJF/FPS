import { Body, Box, Vec3 } from "cannon-es";

const centerBoxBody = new Body({
  shape: new Box(new Vec3(50, 50, 50)),
  mass: 1,
});
centerBoxBody.position.set(0, 400, 0);

export default centerBoxBody;
