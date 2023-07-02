import { EntityType } from "../entities";
import { gaussianRandom as n } from "./normal";

type BaseStats = {
  speed: number; // s
  vision: number; // v
  efficiency: number; // e
  maxOffspring: number; // o
  specials: number[]; // 1 2 3 ... 9
};

export type EntityStats = BaseStats & {
  cost: number; // number of non empty genes
};

const defaultStats: Record<EntityType, BaseStats> = {
  food: {
    speed: 0,
    vision: 0,
    efficiency: 0,
    maxOffspring: 0,
    specials: [],
  },
  prey: {
    speed: 0.6,
    vision: 3,
    efficiency: 0,
    maxOffspring: 5,
    specials: [],
  },
  predator: {
    speed: 0.7,
    vision: 6.5,
    efficiency: 0,
    maxOffspring: 1,
    specials: [],
  },
};

export class Genotype extends String {
  specialsCount: number;
  private static geneChars = "sv.eo";
  constructor(genotype: string, specialsCount: number) {
    super(genotype);
    this.specialsCount = specialsCount;
  }

  static createEmpty(geneLength: number, specialsCount: number): Genotype {
    const result = Array.from({ length: geneLength })
      .map(() => ".")
      .join("");
    return new Genotype(result, specialsCount);
  }

  static createRandom(geneLength: number, specialsCount: number): Genotype {
    if (specialsCount > 9) {
      throw new Error("There can be at most 9 special features in a genotype.");
    }
    const characters = Genotype.geneChars + "123456789".slice(0, specialsCount);
    let result = "";
    for (let i = 0; i < geneLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return new Genotype(result, specialsCount);
  }

  crossover(other: Genotype) {
    if (this.length !== other.length) {
      throw new Error(`Genotypes length are not equal ${this.length} != ${other.length}`);
    }
    if (this.specialsCount !== other.specialsCount) {
      throw new Error(
        `Genotypes specials counts are not equal ${this.specialsCount} != ${other.specialsCount}`
      );
    }
    const result = [];
    for (let i = 0; i < this.length; i++) {
      result.push((Math.random() < 0.5 ? this : other).charAt(i));
    }
    return new Genotype(result.join(""), this.specialsCount);
  }

  mutate(mutationChange: number): Genotype {
    const chars = Genotype.geneChars + "123456789".slice(0, this.specialsCount);
    const copy = this.split("");
    for (let i = 0; i < this.length; i++) {
      if (Math.random() < mutationChange) {
        copy[i] = chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return new Genotype(copy.join(""), this.specialsCount);
  }

  toStats(type: EntityType): EntityStats {
    const countMap = new Map<string, number>();
    for (const letter of this.toLowerCase()) {
      countMap.set(letter, (countMap.get(letter) ?? 0) + 1);
    }
    return {
      speed: n(defaultStats[type].speed) + (countMap.get("s") ?? 0) / this.length,
      vision: n(defaultStats[type].vision) + (countMap.get("v") ?? 0) / this.length,
      efficiency: defaultStats[type].speed + (countMap.get("s") ?? 0),
      maxOffspring: defaultStats[type].maxOffspring + (countMap.get("o") ?? 0),
      specials: Array.from({ length: this.specialsCount }).map(
        (_, i) => countMap.get(i + 1 + "") ?? 0
      ),
      cost: this.length - (countMap.get(".") ?? 0),
    };
  }
}
