import * as THREE from "three";
import { EntityManager } from "../manager";
import { Genotype, Stats } from "../genetics";
import { Predator } from "./predator";
import { Prey } from "./prey";

export type EntityType = "food" | "prey" | "predator";

export type GroupedEntities = Record<EntityType, Entity[]>;

export abstract class Entity {
  position: THREE.Vector3;
  id: string;
  type: EntityType;
  stats: Stats;
  interactRange = 1;
  energy = 1;
  stepEnergyCost = 0.04;
  isDead = false;
  age: number;
  genotype: Genotype;
  generation: number;
  constructor(type: EntityType, position: THREE.Vector3, genotype: Genotype) {
    this.id = Math.random().toString(36);
    this.genotype = genotype;
    this.generation = 1;
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

  canReproduce() {
    return this.age > 7 && this.energy > 0.77;
  }

  protected reproduce(
    other: Entity,
    manager: EntityManager,
    createOffspring: (pos: THREE.Vector3, gen: Genotype) => Entity
  ) {
    this.energy *= 0.5;
    other.energy *= 0.5;
    const energy = this.energy + other.energy;

    const avgMaxOffspring = (this.stats.maxOffspring + other.stats.maxOffspring) / 2;
    const offspringCount = Math.floor(Math.random() * avgMaxOffspring);
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
      .forEach(offspring => manager.spawn(offspring));
  }
}
