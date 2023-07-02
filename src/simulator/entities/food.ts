import type { EntityType } from "./entity";
import { Entity } from "./entity";

export class Food extends Entity {
  constructor(position: THREE.Vector3) {
    super("food", position);
    this.stepEnergyCost = 0;
  }

  getInterests(): EntityType[] {
    return [];
  }
}
