import * as THREE from "three";
import { EntityManager } from "../manager";
import { Entity, EntityType, GroupedEntities } from "./entity";
import { Genotype } from "../genetics";

export class Prey extends Entity {
  constructor(position: THREE.Vector3, genotype: Genotype) {
    super("prey", position, genotype);
  }

  getInterests(): EntityType[] {
    return ["food", "prey", "predator"];
  }

  update(neighbours: GroupedEntities, manager: EntityManager) {
    super.update();
    const diff = new THREE.Vector3();
    const threats = this.sortByDistance(neighbours.predator);
    if (threats.length) {
      diff.subVectors(this.position, threats[0].position).normalize();
      return this.position.addScaledVector(diff, this.stats.speed);
    }
    if (this.canReproduce()) {
      const mates = this.sortByDistance(neighbours.prey);
      if (mates.length && mates[0].canReproduce()) {
        diff.subVectors(mates[0].position, this.position);
        if (diff.lengthSq() <= this.interactRange) {
          this.reproduce(mates[0], manager, (p, g) => new Prey(p, g));
          return;
        }
        diff.clampLength(0, this.stats.speed);
        return this.position.add(diff);
      }
    }
    if (this.energy < 0.75) {
      const food = this.sortByDistance(neighbours.food);
      if (food.length) {
        diff.subVectors(food[0].position, this.position);
        if (diff.lengthSq() <= this.interactRange) return this.eat(food[0]);
        diff.subVectors(food[0].position, this.position);
        diff.clampLength(0, this.stats.speed);
        return this.position.add(diff);
      }
    }
    this.wander();
  }
}
