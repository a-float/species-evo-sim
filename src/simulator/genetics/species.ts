import { Entity } from "../entities";
import { EntityStats } from "./genotype";
import skmeans from "skmeans";

export class Species {
  static maxDiversity = 28;
  id: string;
  name: string;
  parentId?: string;
  members: Entity[];
  size = 0;
  constructor(name: string, members: Entity[], parentId?: string) {
    this.id = Math.random().toString(36);
    this.name = name;
    this.parentId = parentId;
    this.members = members;
    for (const member of members) {
      member.speciesId = this.id;
    }
  }

  add(entity: Entity): Species[] {
    if (entity.speciesId === this.id) {
      throw new Error(
        `Species add: trying to add an entity that already belongs to the species ${this.id}`
      );
    }
    let canAdd = true;
    for (const member of this.members) {
      if (Species.distanceMetric(entity.stats, member.stats) > Species.maxDiversity) {
        canAdd = false;
        break;
      }
    }
    this.members.push(entity);
    entity.speciesId = this.id;
    return canAdd ? [] : this.bisect();
  }

  private bisect(): [Species, Species] {
    const data = this.members.flatMap(m => Object.values(m.stats));
    const result = skmeans(data, 2);
    console.log(`Bisected species ${this.name} of size ${this.members.length}`);
    return [
      new Species(
        this.name + ".1",
        this.members.filter((_, i) => result.idxs[i] === 0),
        this.id
      ),
      new Species(
        this.name + ".2",
        this.members.filter((_, i) => result.idxs[i] === 1),
        this.id
      ),
    ];
  }

  static distanceMetric(a: EntityStats, b: EntityStats) {
    let x = 0;
    if (a.specials.length !== b.specials.length) {
      throw new Error(
        `Species distance: EntityStats special genes count not equal ${a.specials.length} != ${b.specials.length}`
      );
    }
    x += Math.pow(a.speed - b.speed, 2);
    x += Math.pow(a.vision - b.vision, 2);
    x += Math.pow(a.efficiency - b.efficiency, 2);
    x += Math.pow(a.maxOffspring - b.maxOffspring, 2);
    x += a.cost - b.cost;
    for (let i = 0; i < a.specials.length; i++) {
      x += Math.pow(a.specials[i] - b.specials[i], 2);
    }
    return x;
  }
}
