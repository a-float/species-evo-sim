import * as THREE from "three";

export class EntityManager {
  entities: Map<any, any>;
  currentStep: number;
  arrayEntities: Entity[];
  foodPerTurn: number;
  mapSize: number;
  constructor({ foodPerTurn = 2, mapSize = 10 }) {
    this.entities = new Map<EntityType, Entity>();
    this.arrayEntities = [];
    this.currentStep = 0;
    this.foodPerTurn = foodPerTurn;
    this.mapSize = mapSize;
  }

  clear() {
    this.entities.clear();
  }

  step() {
    for (const entity of this.arrayEntities) {
      if (!entity.getInterests()) {
        entity.update([], this);
        continue;
      }
      const neighbours = this.arrayEntities.filter(
        other =>
          !other.isDead &&
          other !== entity &&
          entity.getInterests().includes(other.type) &&
          entity.position.distanceToSquared(other.position) <= Math.pow(entity.stats.vision, 2)
      );
      entity.update(neighbours, this);
      if (entity.type !== EntityType.FOOD) {
        entity.energy -= entity.stepEnergyCost;
        if (entity.energy <= 0) entity.isDead = true;
      }
    }
    this.arrayEntities = this.arrayEntities.filter(e => !e.isDead);
    this.currentStep += 1;
    for (let i = 0; i < this.foodPerTurn; i++) this.spawn(new Food(this.randomPos()));
  }

  spawn(entity: Entity): Entity {
    entity.setId(Math.random().toString(36));
    this.entities.set(entity.id, entity);
    this.arrayEntities.push(entity);
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

export enum EntityType {
  FOOD,
  PREY,
  PREDATOR,
}

type Stats = {
  vision: number;
  speed: number;
};

const defaultStats: Record<EntityType, Stats> = {
  [EntityType.FOOD]: {
    vision: 0,
    speed: 0,
  },
  [EntityType.PREY]: {
    vision: 3,
    speed: 1,
  },
  [EntityType.PREDATOR]: {
    vision: 6,
    speed: 1.4,
  },
};

class Genotype extends String {
  constructor(g1?: Genotype, g2?: Genotype) {
    if (g1) {
      if (g2) {
        super(g1.slice(g1.length / 2) + g2.slice(g2.length / 2, -1));
      }
      super(g1);
    } else {
      super(Genotype.randomString());
    }
  }

  private static randomString(): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 100) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  toStats(type: EntityType) {
    const countMap = new Map<string, number>();
    for (const letter of this.toLowerCase()) {
      countMap.set(letter, (countMap.get(letter) ?? 0) + 1);
    }
    return {
      vision: defaultStats[type].vision + (countMap.get("v") ?? 0) / 5,
      speed: defaultStats[type].speed + (countMap.get("s") ?? 0) / 5,
    };
  }
}

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
    this.id = "?";
    this.genotype = genotype ?? new Genotype();
    this.position = position;
    this.type = type;
    this.stats = this.genotype.toStats(this.type);
    this.age = 0;
  }

  abstract getInterests(): EntityType[];

  update(neighbours?: Entity[], manager?: EntityManager) {
    this.age++;
  }

  getTypeByDistance(entities: Entity[], type: EntityType) {
    const withDist = entities
      .filter(e => e.type === type)
      .map(e => [e, this.position.distanceToSquared(e.position)] as const);
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

export class Food extends Entity {
  constructor(position: THREE.Vector3) {
    super(EntityType.FOOD, position);
  }

  getInterests(): EntityType[] {
    return [];
  }
}

export class Prey extends Entity {
  constructor(position: THREE.Vector3) {
    super(EntityType.PREY, position);
  }

  getInterests(): EntityType[] {
    return [EntityType.FOOD, EntityType.PREY, EntityType.PREDATOR];
  }

  update(neighbours: Entity[], manager: EntityManager) {
    super.update();
    const threats = this.getTypeByDistance(neighbours, EntityType.PREDATOR);
    if (threats.length) {
      const diff = new THREE.Vector3();
      diff.subVectors(this.position, threats[0].position);
      diff.normalize();
      return this.position.addScaledVector(diff, this.stats.speed);
    }
    if (this.canBreed()) {
      const mates = this.getTypeByDistance(neighbours, EntityType.PREY);
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
    const food = this.getTypeByDistance(neighbours, EntityType.FOOD);
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

export class Predator extends Entity {
  constructor(position: THREE.Vector3) {
    super(EntityType.PREDATOR, position);
    this.stepEnergyCost = 0.02;
  }

  getInterests(): EntityType[] {
    return [EntityType.PREY, EntityType.PREDATOR];
  }

  update(neighbours: Entity[], manager: EntityManager) {
    super.update();
    if (this.canBreed()) {
      const mates = this.getTypeByDistance(neighbours, EntityType.PREDATOR);
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
    const prey = this.getTypeByDistance(neighbours, EntityType.PREY);
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
