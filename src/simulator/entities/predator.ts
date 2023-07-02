import * as THREE from "three";
import { EntityManager } from "../manager";
import { Entity, EntityType, GroupedEntities } from "./entity";

export class Predator extends Entity {
  constructor(position: THREE.Vector3) {
    super("predator", position);
    this.stepEnergyCost = 0.02;
  }

  getInterests(): EntityType[] {
    return ["prey", "predator"];
  }

  update(neighbours: GroupedEntities, manager: EntityManager) {
    super.update();
    if (this.canBreed()) {
      const mates = this.sortByDistance(neighbours.predator);
      if (mates.length && mates[0].canBreed()) {
        const diff = new THREE.Vector3();
        diff.subVectors(mates[0].position, this.position);
        if (diff.lengthSq() <= this.interactRange) {
          this.energy -= 0.25;
          mates[0].energy -= 0.25;
          manager.spawn(new Predator(this.position.clone())).energy = 0.5;
          return;
        }
        diff.clampLength(0, this.stats.speed);
        return this.position.add(diff);
      }
    }
    const prey = this.sortByDistance(neighbours.prey);
    if (prey.length) {
      const diff = new THREE.Vector3();
      diff.subVectors(prey[0].position, this.position);
      if (diff.lengthSq() <= Math.pow(this.interactRange, 2)) {
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
