import { Body, Plane, Vec3, World } from "cannon-es";
import centerBox from "./centerBoxPhysics";
import playerBody from "./playerPhysics";
const world = new World({
  gravity: new Vec3(0, -9.8, 0),
});

const groundBody = new Body({
  shape: new Plane(),
  type: Body.STATIC,
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(0, 0, 0);
world.addBody(groundBody);
world.addBody(centerBox);
world.addBody(playerBody);

export { world, groundBody };
