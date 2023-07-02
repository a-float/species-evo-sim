import type { EntityType } from "./entity";
import { Entity } from "./entity";
import { Genotype } from "../genetics";

export class Food extends Entity {
  constructor(position: THREE.Vector3, genotype: Genotype) {
    super("food", position, genotype);
    this.stepEnergyCost = 0;
  }

  getInterests(): EntityType[] {
    return [];
  }
}
