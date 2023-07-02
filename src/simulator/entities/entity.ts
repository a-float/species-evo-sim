import * as THREE from "three";
import { EntityManager } from "../manager";
import { EntityStats, Genotype } from "../genetics";

export type EntityType = "food" | "prey" | "predator";

export type GroupedEntities = Record<EntityType, Entity[]>;

export abstract class Entity {
  position: THREE.Vector3;
  id: string;
  type: EntityType;
  stats: EntityStats;
  interactRange = 1;
  energy = 1;
  stepEnergyCost = 0.02;
  isDead = false;
  age: number;
  genotype: Genotype;
  generation: number;
  speciesId?: string;
  private wanderDirection: THREE.Vector3;
  private lastReproduction: number;
  constructor(type: EntityType, position: THREE.Vector3, genotype: Genotype) {
    this.id = Math.random().toString(36);
    this.genotype = genotype;
    this.generation = 1;
    this.position = position;
    this.type = type;
    this.lastReproduction = 0;
    this.stats = this.genotype.toStats(this.type);
    this.age = 0;
    this.wanderDirection = this.getRandomVector2();
    this.speciesId = undefined;
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

  getRandomVector2() {
    const diff = new THREE.Vector3().randomDirection();
    diff.y = 0;
    return diff.normalize();
  }

  wander() {
    const diff = this.getRandomVector2();
    this.wanderDirection.addScaledVector(diff, 0.7).normalize();
    this.position.addScaledVector(this.wanderDirection, this.stats.speed);
  }

  eat(target: Entity) {
    const toTake = Math.min(1 - this.energy, target.energy);
    this.energy += toTake;
    target.energy -= toTake;
    target.isDead = true;
  }

  canReproduce() {
    return this.age > 6 && this.energy > 0.6 && this.lastReproduction + 6 < this.age;
  }

  protected reproduce(
    other: Entity,
    manager: EntityManager,
    createOffspring: (pos: THREE.Vector3, gen: Genotype) => Entity
  ) {
    this.energy *= 0.5;
    other.energy *= 0.5;
    const energy = this.energy + other.energy;
    this.lastReproduction = this.age;
    other.lastReproduction = other.age;

    const avgMaxOffspring = (this.stats.maxOffspring + other.stats.maxOffspring) / 2;
    const offspringCount = Math.ceil(Math.random() * avgMaxOffspring);
    const offspring = Array.from({ length: offspringCount })
      .map(_ => this.genotype.crossover(other.genotype))
      .map(g => g.mutate(manager.mutationChance))
      .map(g => {
        const diff = new THREE.Vector3().randomDirection();
        diff.y = 0;
        diff.normalize();
        const pos = this.position.clone().add(diff.multiplyScalar(0.2));
        const o = createOffspring(pos, g);
        o.energy = energy / offspringCount;
        o.generation = this.generation + 1;
        return o;
      })
      .forEach(offspring => manager.spawn(offspring, this.speciesId));
  }
}
