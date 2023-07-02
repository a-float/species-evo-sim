import React from "react";
import { EntityManager } from "../simulator";
import { Food, Prey, Predator, Entity } from "../simulator/entities";
import { Genotype } from "../simulator/genetics";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { simConfig } from "../config";

export type SimulationControls = {
  manager: EntityManager;
  stepInterval: number;
  setStepInterval: (value: number) => void;
  selectedEntity?: Entity;
  setSelectedEntity: (entity?: Entity) => void;
  showRings: boolean;
  setShowRings: (value: boolean) => void;
  graphOpen: boolean;
  setGraphOpen: (value: boolean) => void;
};

export const createManager = () => {
  const mng = new EntityManager({
    foodPerTurn: simConfig.foodPerTurn,
    mapSize: simConfig.mapSize,
    geneotypeLength: simConfig.geneotypeLength,
    specialGeneCount: simConfig.specialGeneCount,
    mutationChance: simConfig.mutationChance,
  });
  const makeGenotype = () => Genotype.createEmpty(mng.genotypeLength, mng.specialGeneCount);
  const entities = [
    ...Array.from({ length: simConfig.startFood }).map(
      _ => new Food(mng.randomPos(), makeGenotype())
    ),
    ...Array.from({ length: simConfig.startPrey }).map(
      _ => new Prey(mng.randomPos(), makeGenotype())
    ),
    ...Array.from({ length: simConfig.startPredator }).map(
      _ => new Predator(mng.randomPos(), makeGenotype())
    ),
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
  const [graphOpen, setGraphOpen] = useSessionStorage("graph-open", false);

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
    graphOpen,
    setGraphOpen,
  };
};
