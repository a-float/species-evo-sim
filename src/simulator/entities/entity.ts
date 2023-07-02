import * as THREE from "three";
import { EntityManager } from "../manager";
import { Genotype, Stats } from "./genetics";

export type EntityType = "food" | "prey" | "predator";

export type GroupedEntities = Record<EntityType, Entity[]>;

export abstract class Entity {
  position: THREE.Vector3;
  id: string;
  type: EntityType;
  stats: Stats;
  interactRange = 1;
  energy = 1;
  stepEnergyCost = 0.05;
  isDead = false;
  age: number;
  genotype: Genotype;
  constructor(type: EntityType, position: THREE.Vector3, genotype?: Genotype) {
    this.id = "?"; // TODO weird?
    this.genotype = genotype ?? new Genotype();
    this.position = position;
    this.type = type;
    this.stats = this.genotype.toStats(this.type);
    this.age = 0;
  }

  abstract getInterests(): EntityType[];

  update(neighbours?: GroupedEntities, manager?: EntityManager) {
    this.age++;
  }

  sortByDistance(entities: Entity[]) {
    const withDist = entities.map(e => [e, this.position.distanceToSquared(e.position)] as const);
    withDist.sort((a, d) => a[1] - d[1]);
    return withDist.map(e => e[0]);
  }

  setId(id: string) {
    this.id = id;
  }

  wander() {
    const diff = new THREE.Vector3().randomDirection();
    diff.y = 0;
    diff.normalize();
    this.position.addScaledVector(diff, this.stats.speed);
  }

  eat(target: Entity) {
    target.isDead = true;
    this.energy = 1;
  }

  canBreed() {
    return this.age > 7 && this.energy > 0.77;
  }
}
