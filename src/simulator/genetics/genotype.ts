import { EntityType } from "../entities";

type BaseStats = {
  speed: number; // s
  vision: number; // v
  efficiency: number; // e
  maxOffspring: number; // o
  specials: number[]; // 1 2 3 ... 9
};

export type Stats = BaseStats & {
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
    speed: 0,
    vision: 3,
    efficiency: 0,
    maxOffspring: 5,
    specials: [],
  },
  predator: {
    speed: 0.6,
    vision: 5,
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
    let [a, b] = [this.valueOf(), other.valueOf()];
    if (Math.random() < 0.5) {
      [a, b] = [b, a];
    }
    return new Genotype(
      this.slice(0, Math.floor(this.length / 2)) + other.slice(Math.floor(other.length / 2)),
      this.specialsCount
    );
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

  toStats(type: EntityType): Stats {
    const countMap = new Map<string, number>();
    for (const letter of this.toLowerCase()) {
      countMap.set(letter, (countMap.get(letter) ?? 0) + 1);
    }
    return {
      speed: defaultStats[type].speed + (countMap.get("s") ?? 0) / 5,
      vision: defaultStats[type].vision + (countMap.get("v") ?? 0),
      efficiency: defaultStats[type].speed + (countMap.get("s") ?? 0),
      maxOffspring: defaultStats[type].maxOffspring + (countMap.get("o") ?? 0),
      specials: Array.from({ length: this.specialsCount }).map(
        (_, i) => countMap.get(i + 1 + "") ?? 0
      ),
      cost: this.length - (countMap.get(".") ?? 0),
    };
  }
}
