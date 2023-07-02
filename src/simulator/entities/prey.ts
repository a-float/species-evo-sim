import * as THREE from "three";
import { EntityManager } from "../manager";
import { Entity, EntityType, GroupedEntities } from "./entity";

export class Prey extends Entity {
  constructor(position: THREE.Vector3) {
    super("prey", position);
  }

  getInterests(): EntityType[] {
    return ["food", "prey", "predator"];
  }

  update(neighbours: GroupedEntities, manager: EntityManager) {
    super.update();
    const threats = this.sortByDistance(neighbours.predator);
    if (threats.length) {
      const diff = new THREE.Vector3();
      diff.subVectors(this.position, threats[0].position);
      diff.normalize();
      return this.position.addScaledVector(diff, this.stats.speed);
    }
    if (this.canBreed()) {
      const mates = this.sortByDistance(neighbours.prey);
      if (mates.length && mates[0].canBreed()) {
        const diff = new THREE.Vector3();
        diff.subVectors(mates[0].position, this.position);
        if (diff.lengthSq() <= this.interactRange) {
          this.energy -= 0.5;
          mates[0].energy -= 0.5;
          manager.spawn(new Prey(this.position.clone())).energy = 0.5;
          manager.spawn(new Prey(mates[0].position.clone())).energy = 0.5;
          return;
        }
        diff.clampLength(0, this.stats.speed);
        return this.position.add(diff);
      }
    }
    const food = this.sortByDistance(neighbours.food);
    if (this.energy < 0.75 && food.length) {
      const diff = new THREE.Vector3();
      if (diff.lengthSq() <= this.interactRange) return this.eat(food[0]);
      diff.subVectors(food[0].position, this.position);
      diff.clampLength(0, this.stats.speed);
      return this.position.add(diff);
    }
    this.wander();
  }
}
