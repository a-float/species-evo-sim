import React from "react";
import { EntityManager } from "../simulator";
import { Food, Prey, Predator, Entity } from "../simulator/entities";
import { Genotype } from "../simulator/genetics";
import { useSessionStorage } from "../hooks/useSessionStorage";

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
    foodPerTurn: 10,
    mapSize: 100,
    geneotypeLength: 25,
    specialGeneCount: 2,
    mutationChange: 0.05,
  });
  const makeGenotype = () => Genotype.createEmpty(mng.genotypeLength, mng.specialGeneCount);
  const entities = [
    ...Array.from({ length: 60 }).map(_ => new Food(mng.randomPos(), makeGenotype())),
    ...Array.from({ length: 50 }).map(_ => new Prey(mng.randomPos(), makeGenotype())),
    ...Array.from({ length: 30 }).map(_ => new Predator(mng.randomPos(), makeGenotype())),
  ];
  entities.forEach(e => mng.spawn(e));
  return mng;
};

export const SimulationContext = React.createContext<SimulationControls>({} as SimulationControls);

export const useSimulationControls = (): SimulationControls => {
  const manager = React.useRef<EntityManager>(createManager());
  const [stepInterval, setStepInterval] = useSessionStorage("step-interval", 0.2);
  const [selectedEntity, setSelectedEntity] = React.useState<Entity>();
  const [showRings, setShowRings] = useSessionStorage("show-rings", true);

  const handleClick: EventListener = React.useCallback(
    (e: Event) => setSelectedEntity(undefined),
    [setSelectedEntity]
  );

  React.useEffect(() => {
    document.addEventListener("contextmenu", handleClick);
    return () => document.removeEventListener("contextmenu", handleClick);
  }, []);

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
