import * as THREE from "three";
import { EntityManager } from "../manager";
import { Entity, EntityType, GroupedEntities } from "./entity";
import { Genotype } from "../genetics";

export class Predator extends Entity {
  constructor(position: THREE.Vector3, genotype: Genotype) {
    super("predator", position, genotype);
    this.stepEnergyCost = 0.011;
  }

  getInterests(): EntityType[] {
    return ["prey", "predator"];
  }

  update(neighbours: GroupedEntities, manager: EntityManager) {
    super.update();
    const diff = new THREE.Vector3();
    if (this.canReproduce()) {
      const mates = this.sortByDistance(neighbours.predator);
      if (mates.length && mates[0].canReproduce()) {
        diff.subVectors(mates[0].position, this.position);
        if (diff.lengthSq() <= this.interactRange) {
          this.reproduce(mates[0], manager, (p, g) => new Predator(p, g));
          return;
        }
        diff.clampLength(0, this.stats.speed);
        return this.position.add(diff);
      }
    }
    const prey = this.sortByDistance(neighbours.prey);
    if (this.energy < 0.7 && prey.length) {
      diff.subVectors(prey[0].position, this.position);
      if (diff.lengthSq() <= Math.pow(this.interactRange, 2)) {
        if (!prey[0].isDead) this.energy = 1;
        this.eat(prey[0]);
      } else {
        diff.clampLength(0, this.stats.speed);
        this.position.add(diff);
      }
      return;
    }
    this.wander();
  }
}
