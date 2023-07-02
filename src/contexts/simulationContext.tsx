import React from "react";
import { EntityManager } from "../simulator";
import { Food, Prey, Predator, Entity } from "../simulator/entities";

export type SimulationControls = {
  manager: EntityManager;
  stepInterval: number;
  setStepInterval: (value: number) => void;
  selectedEntity?: Entity;
  setSelectedEntity: (entity?: Entity) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
};

export const createManager = () => {
  const mng = new EntityManager({
    foodPerTurn: 30,
    mapSize: 80,
    geneotypeLength: 20,
    specialGeneCount: 2,
  });
  const entities = [
    ...Array.from({ length: 60 }).map(_ => new Food(mng.randomPos(), mng.randomGenotype())),
    ...Array.from({ length: 50 }).map(_ => new Prey(mng.randomPos(), mng.randomGenotype())),
    ...Array.from({ length: 30 }).map(_ => new Predator(mng.randomPos(), mng.randomGenotype())),
  ];
  entities.forEach(e => mng.spawn(e));
  return mng;
};

export const SimulationContext = React.createContext<SimulationControls>({} as SimulationControls);

export const useSimulationControls = (): SimulationControls => {
  const manager = React.useRef<EntityManager>(createManager());
  const [stepInterval, setStepInterval] = React.useState(0.2);
  const [selectedEntity, setSelectedEntity] = React.useState<Entity>();
  const [showRings, setShowRings] = React.useState(true);

  return {
    manager: manager.current,
    stepInterval,
    setStepInterval,
    selectedEntity,
    setSelectedEntity,
    showRings,
    setShowRings,
  };
};
