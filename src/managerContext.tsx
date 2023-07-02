import React from "react";
import { EntityManager } from "./simulator";
import { Food, Prey, Predator } from "./simulator/entities";

export const createManager = () => {
  const mng = new EntityManager({ foodPerTurn: 20, mapSize: 50 });
  const entities = [
    ...Array.from({ length: 30 }).map(_ => new Food(mng.randomPos())),
    ...Array.from({ length: 30 }).map(_ => new Prey(mng.randomPos())),
    ...Array.from({ length: 15 }).map(_ => new Predator(mng.randomPos())),
  ];
  entities.forEach(e => mng.spawn(e));
  return mng;
};

export const ManagerContext = React.createContext<EntityManager>(createManager());
