import { Body, Material, Plane, Vec3, World, ContactMaterial } from "cannon-es";
import centerBox from "./centerBoxPhysics";
const world = new World({
	gravity: new Vec3(0, -9.8, 0),
});

const groundBody = new Body({
	shape: new Plane(),
	type: Body.STATIC,
	material: new Material("ground"),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(0, 0, 0);
world.addBody(groundBody);
world.addBody(centerBox);

// Adjust constraint equation parameters for ground/ground contact
const ground_ground = new ContactMaterial(
	new Material("ground"),
	new Material("ground"),
	{
		friction: 0.4,
		restitution: 0.3,
		contactEquationStiffness: 1e8,
		contactEquationRelaxation: 3,
		frictionEquationStiffness: 1e8,
		frictionEquationRegularizationTime: 3,
	}
);

// Add contact material to the world
world.addContactMaterial(ground_ground);

export { world, groundBody };
