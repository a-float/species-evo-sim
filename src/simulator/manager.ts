import * as THREE from "three";
import type { EntityType, GroupedEntities } from "./entities";
import { Entity, Food } from "./entities";

export class EntityManager {
  currentStep: number;
  entityMap: Map<string, Entity>;
  arrayEntities: GroupedEntities;
  foodPerTurn: number;
  mapSize: number;
  lastStepDuration: number;
  populationHistory: Record<EntityType, number>[];
  constructor({ foodPerTurn = 2, mapSize = 10 }) {
    this.entityMap = new Map<Entity["id"], Entity>();
    this.arrayEntities = {
      food: [],
      prey: [],
      predator: [],
    };
    this.currentStep = 0;
    this.foodPerTurn = foodPerTurn;
    this.mapSize = mapSize;
    this.lastStepDuration = 0;
    this.populationHistory = [];
  }

  filterDead(type: EntityType) {
    this.arrayEntities[type] = this.arrayEntities[type]
      .map(e => {
        if (e.isDead) {
          this.entityMap.delete(e.id);
        }
        return e;
      })
      .filter(e => !e.isDead);
  }

  clearArrays() {
    this.arrayEntities.food = [];
    this.arrayEntities.prey = [];
    this.arrayEntities.predator = [];
  }

  clear() {
    this.entityMap.clear();
    this.clearArrays();
  }

  private getInterestsInRange(entity: Entity, neighbours: Entity[]) {
    return neighbours.filter(
      other =>
        !other.isDead &&
        other !== entity &&
        entity.position.distanceToSquared(other.position) <= Math.pow(entity.stats.vision, 2)
    );
  }

  step() {
    const t = performance.now();
    for (const entity of this.entityMap.values()) {
      const interests = entity.getInterests();
      const neighbours: GroupedEntities = {
        food: interests.includes("food")
          ? this.getInterestsInRange(entity, this.arrayEntities.food)
          : [],
        prey: interests.includes("prey")
          ? this.getInterestsInRange(entity, this.arrayEntities.prey)
          : [],
        predator: interests.includes("predator")
          ? this.getInterestsInRange(entity, this.arrayEntities.predator)
          : [],
      };
      entity.update(neighbours, this);
      entity.energy -= entity.stepEnergyCost;
      if (entity.energy <= 0) {
        entity.isDead = true;
      }
    }

    this.filterDead("food");
    this.filterDead("prey");
    this.filterDead("predator");

    for (let i = 0; i < this.foodPerTurn; i++) this.spawn(new Food(this.randomPos()));
    this.lastStepDuration = performance.now() - t;
    this.currentStep += 1;
    this.populationHistory.push({
      food: this.arrayEntities.food.length,
      prey: this.arrayEntities.prey.length,
      predator: this.arrayEntities.predator.length,
    });
  }

  spawn(entity: Entity): Entity {
    entity.setId(Math.random().toString(36));
    this.entityMap.set(entity.id, entity);
    this.arrayEntities[entity.type].push(entity);
    return entity;
  }

  randomPos() {
    return new THREE.Vector3(
      (Math.random() - 0.5) * this.mapSize,
      0,
      (Math.random() - 0.5) * this.mapSize
    );
  }
}
