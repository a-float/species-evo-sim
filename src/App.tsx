import React from "react";
import * as THREE from "three";
import { setup } from "goober";
import { OrbitControls, Ring, Stats } from "@react-three/drei";
import { Entity } from "./simulator/entities";
import { DebugPanel } from "./components/DebugPanel";
import { useFrame, Canvas } from "@react-three/fiber";
import { SimulationContext, useSimulationControls } from "./contexts/simulationContext";
import { Scene } from "./components/Scene";
import { EntityDetails } from "./components/EntityDetails";
import { SpeciesGraph } from "./components/SpeciesGraph";

THREE.ColorManagement.enabled = true;
setup(React.createElement);

const foodMat = new THREE.MeshStandardMaterial({ color: "green" });
const predatorMat = new THREE.MeshStandardMaterial({
  color: "orange",
  transparent: true,
  opacity: 1,
});
const preyMat = new THREE.MeshStandardMaterial({ color: "blue", transparent: true, opacity: 1 });
const deadPreyMat = new THREE.MeshStandardMaterial({
  color: "blue",
  transparent: true,
  opacity: 0.5,
});
const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const ringMat = new THREE.LineBasicMaterial();

const EntityAvatar = (props: { entity: Entity; step: number; stepFactor: number }) => {
  const entity = props.entity;
  const { selectedEntity, setSelectedEntity, showRings } = React.useContext(SimulationContext);
  const prevStep = React.useRef(props.step);
  const prevPos = React.useRef<THREE.Vector3>(entity.position.clone());
  const ref = React.useRef<THREE.Mesh>(null);
  const mat = entity.type === "predator" ? predatorMat : entity.isDead ? deadPreyMat : preyMat;

  React.useEffect(() => {
    prevStep.current = props.step;
    if (!ref.current) return;
    if (!prevPos.current) {
      prevPos.current = ref.current.position.clone();
    } else {
      prevPos.current.copy(ref.current.position);
    }
  }, [props.step]);

  if (props.step === prevStep.current) {
    ref.current?.position.copy(
      new THREE.Vector3().lerpVectors(
        prevPos.current,
        entity.position,
        1 - Math.pow(1 - props.stepFactor, 2) // easeOutCubic
      )
    );
  }

  return (
    <mesh
      ref={ref}
      castShadow
      position={entity.position}
      geometry={cubeGeo}
      material={mat}
      onClick={() => setSelectedEntity(entity)}
    >
      {showRings && (
        <>
          <Ring
            args={[entity.interactRange - 0.01, entity.interactRange, 50]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={ringMat}
          />
          <Ring
            args={[entity.stats.vision - 0.01, entity.stats.vision, 50]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={ringMat}
          />
        </>
      )}
      {selectedEntity?.id === entity.id && <EntityDetails entity={entity} />}
    </mesh>
  );
};

const InstancedEntity = (props: { entities: Entity[]; step: number; material: THREE.Material }) => {
  const temp = React.useRef(new THREE.Object3D());
  const instancedMeshRef = React.useRef<THREE.InstancedMesh>();
  React.useEffect(() => {
    if (!instancedMeshRef.current) return;
    for (let i = 0; i < props.entities.length; i++) {
      temp.current.position.copy(props.entities[i].position);
      temp.current.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, temp.current.matrix);
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [props.step]);

  return (
    <instancedMesh
      ref={instancedMeshRef as any}
      args={[cubeGeo, props.material, 10000]}
    ></instancedMesh>
  );
};

type SimulationProps = { stepInterval: number };

const Simulation = (props: SimulationProps) => {
  const { manager } = React.useContext(SimulationContext);
  if (!manager) {
    throw new Error("Simulation must be placed inside ManagerContext");
  }
  const [stepFactor, setStepFactor] = React.useState(0);
  const lastTime = React.useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (time - lastTime.current > props.stepInterval) {
      manager.step();
      lastTime.current = time;
    }
    setStepFactor((time - lastTime.current) / props.stepInterval);
  });

  const arrayEntities = manager.arrayEntities;

  return (
    <>
      <group position={[0, 1.02 / 4, 0]}>
        {manager.arrayEntities.prey.map(e => (
          <EntityAvatar key={e.id} entity={e} step={manager.currentStep} stepFactor={stepFactor} />
        ))}
        {manager.arrayEntities.predator.map(e => (
          <EntityAvatar key={e.id} entity={e} step={manager.currentStep} stepFactor={stepFactor} />
        ))}
        {/* <InstancedEntity entities={arrayEntities.predator} step={step} material={predatorMat} />
        <InstancedEntity entities={arrayEntities.prey} step={step} material={preyMat} /> */}
        <InstancedEntity
          entities={arrayEntities.food}
          step={manager.currentStep}
          material={foodMat}
        />
      </group>
      <DebugPanel
        rows={[
          ["Step:", manager.currentStep],
          ["Last step time:", manager.lastStepDuration + " ms"],
          ["Objects:", manager.entityMap.size],
          ["Food:", manager.arrayEntities.food.length],
          ["Prey species:", manager.speciesMaps.prey.size],
          ["Predator species:", manager.speciesMaps.predator.size],
          ["Prey:", manager.arrayEntities.prey.length],
          ["Predators:", manager.arrayEntities.predator.length],
        ]}
        populations={manager.populationHistory}
      />
    </>
  );
};

const App = () => {
  const controls = useSimulationControls();
  const { graphOpen } = controls;
  return (
    <SimulationContext.Provider value={controls}>
      {graphOpen ? (
        <SpeciesGraph />
      ) : (
        <Canvas camera={{ fov: 70, position: [0, 20, 20] }} shadows>
          <Simulation stepInterval={controls.stepInterval} />
          <Scene />
          <OrbitControls onClick={() => controls.setSelectedEntity(undefined)} />
          <Stats />
        </Canvas>
      )}
    </SimulationContext.Provider>
  );
};

export default App;
