import { EntityType } from "../entity";

export type Stats = {
  vision: number;
  speed: number;
};

const defaultStats: Record<EntityType, Stats> = {
  food: {
    vision: 0,
    speed: 0,
  },
  prey: {
    vision: 3,
    speed: 1,
  },
  predator: {
    vision: 6,
    speed: 1.4,
  },
};

export class Genotype extends String {
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
