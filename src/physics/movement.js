import playerBody from "./playerPhysics";

const InputHandler = (controls) => {
  let movementSpeed = 1;
  let phi = 0;
  let theta = 0;
  let current = {
    left: false,
    right: false,
    forward: false,
    backward: false,
    leftClick: false,
    rightClick: false,
    mouseX: 0,
    mouseY: 0,
  };
  let previous = null;
  let keys = {};
  let previousKeys = {};
  function init() {
    document.addEventListener(
      "keydown",
      (e) => {
        keyDown(e, current);
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        keyUp(e, current);
      },
      false
    );
    document.addEventListener(
      "mousedown",
      (e) => {
        mouseDown(e, current);
      },
      false
    );
    document.addEventListener(
      "mouseup",
      (e) => {
        mouseUp(e, current);
      },
      false
    );
    document.addEventListener(
      "mousemove",
      (e) => {
        mouseMove(e, current);
      },
      false
    );
  }

  function keyDown(e, current) {
    if (e.key == "w" || e.key == "ArrowUp") current.forward = true;
    if (e.key == "a" || e.key == "ArrowLeft") current.left = true;
    if (e.key == "s" || e.key == "ArrowDown") current.backward = true;
    if (e.key == "d" || e.key == "ArrowRight") current.right = true;
  }

  function keyUp(e, current) {
    if (e.key == "w" || e.key == "ArrowUp") current.forward = false;
    if (e.key == "a" || e.key == "ArrowLeft") current.left = false;
    if (e.key == "s" || e.key == "ArrowDown") current.backward = false;
    if (e.key == "d" || e.key == "ArrowRight") current.right = false;
  }

  function mouseDown(e, current) {
    if (e.button == 0) current.leftClick = true;
    if (e.button == 2) current.rightClick = true;
  }

  function mouseUp(e, current) {
    if (e.button == 0) current.leftClick = true;
    if (e.button == 2) current.rightClick = true;
  }
  function mouseMove(e, current) {
    current.mouseX = e.pageX - window.innerWidth / 2;
    current.mouseY = e.pageY - window.innerHeight / 2;

    if (previous === null) previous = { ...current };
    current.mouseXDelta = current.mouseX - previous.mouseX;
    current.mouseYDelta = current.mouseY - previous.mouseY;
    console.log(current);
  }

  function update() {
    if (current.left === true)
      playerBody.position.x = playerBody.position.x - movementSpeed;
    if (current.right === true)
      playerBody.position.x = playerBody.position.x + movementSpeed;
    if (current.forward === true)
      playerBody.position.z = playerBody.position.z - movementSpeed;
    if (current.backward === true)
      playerBody.position.z = playerBody.position.z + movementSpeed;
  }

  function updateCamera(camera) {
    const xh = current.mouseXDelta / window.innerWidth;
    const yh = current.mouseYDelta / window.innerHeight;

    this.phi += -xh * 5;
  }
  return { init, movementSpeed, current, update };
};

export default InputHandler;
