import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

class Player {
  constructor(skin) {
    this.init = (scene) => {
      const loader = new GLTFLoader();
      loader.load(skin, function (gltf) {
        let player = gltf.scene;
        scene.add(player);

        console.log(player);

        player.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
        });

        player.scale.x = 7;
        player.scale.y = 7;
        player.scale.z = 7;
        let skeleton = new THREE.SkeletonHelper(player);
        skeleton.visible = false;
        scene.add(skeleton);

        //

        const animations = gltf.animations;

        // let mixer = new THREE.AnimationMixer(player);

        // idleAction = mixer.clipAction(animations[0]);
        // walkAction = mixer.clipAction(animations[3]);
        // runAction = mixer.clipAction(animations[1]);

        // actions = [idleAction, walkAction, runAction];

        // activateAllActions();

        return player;
      });

      function deactivateAllActions() {
        actions.forEach(function (action) {
          action.stop();
        });
      }

      function activateAllActions() {
        setWeight(idleAction, settings["modify idle weight"]);
        setWeight(walkAction, settings["modify walk weight"]);
        setWeight(runAction, settings["modify run weight"]);

        actions.forEach(function (action) {
          action.play();
        });
      }

      function setWeight(action, weight) {
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);
      }
    };
  }
}

export default Player;
