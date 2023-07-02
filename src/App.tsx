import React from "react";
import * as THREE from "three";
import { setup } from "goober";
import { OrbitControls, Plane, Stats } from "@react-three/drei";
import { Entity, Food, Predator, Prey } from "./simulator/entities";
import { EntityManager } from "./simulator";
import { DebugPanel } from "./components/DebugPanel";
import { useFrame, Canvas } from "@react-three/fiber";

// r139-r149
THREE.ColorManagement.enabled = true;
// r139-r149
// THREE.ColorManagement.legacyMode = false;
setup(React.createElement);

const foodMat = new THREE.MeshStandardMaterial({ color: "green" });
const predatorMat = new THREE.MeshStandardMaterial({
  color: "orange",
  transparent: true,
  opacity: 1,
});
const preyMat = new THREE.MeshStandardMaterial({ color: "blue", transparent: true, opacity: 1 });
const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);

const Scene = () => {
  const planeRef = React.useRef<THREE.Mesh>(null);
  const manager = React.useContext(ManagerContext)!;
  return (
    <>
      <Plane
        ref={planeRef}
        args={[manager.mapSize, manager.mapSize]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color='#273727' side={THREE.DoubleSide} />
      </Plane>
      <ambientLight intensity={0.5} />
      <directionalLight
        // castShadow
        position={[3, 5, 2.5]}
        intensity={0.9}
        // shadow-mapSize-height={512}
        // shadow-mapSize-width={512}
      />
    </>
  );
};

const Grass = (props: { entity: Entity }) => {
  return <mesh position={props.entity.position} geometry={cubeGeo} material={foodMat}></mesh>;
};

type EntityProps = { entity: Entity; step: number; stepFactor: number };

const EntityAvatar: React.FC<EntityProps> = props => {
  const entity = props.entity;
  const prevStep = React.useRef(props.step);
  const prevPos = React.useRef<THREE.Vector3>(entity.position.clone());
  const ref = React.useRef<THREE.Mesh>(null);
  const mat = entity.type === "prey" ? preyMat : predatorMat;

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
        // props.stepFactor
        1 - Math.pow(1 - props.stepFactor, 3) // easeOutCubic
      )
    );
  }

  return (
    <mesh ref={ref} castShadow position={entity.position} geometry={cubeGeo} material={mat}>
      {/* {(
        <Ring
          args={[entity.stats.vision - 0.01, entity.stats.vision, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <lineBasicMaterial />
        </Ring>
      )} */}
      {/* <meshStandardMaterial color={color} transparent opacity={entity.energy} /> */}
    </mesh>
  );
};

const InstancedFood = (props: { entities: Entity[] }) => {
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
  });

  return (
    <instancedMesh
      ref={instancedMeshRef as any}
      args={[cubeGeo, foodMat, props.entities.length]}
    ></instancedMesh>
  );
};

const prepareManager = () => {
  const mng = new EntityManager({ foodPerTurn: 20, mapSize: 50 });
  const entities = [
    ...Array.from({ length: 30 }).map(_ => new Food(mng.randomPos())),
    ...Array.from({ length: 30 }).map(_ => new Prey(mng.randomPos())),
    ...Array.from({ length: 15 }).map(_ => new Predator(mng.randomPos())),
  ];
  entities.forEach(e => mng.spawn(e));
  return mng;
};
const ManagerContext = React.createContext<EntityManager>(prepareManager());

type SimulationProps = { stepInterval: number };

const Simulation = (props: SimulationProps) => {
  const manager = React.useContext(ManagerContext);
  if (!manager) {
    throw new Error("Simulation must be placed inside ManagerContext");
  }
  const [step, setStep] = React.useState(0);
  const [stepFactor, setStepFactor] = React.useState(0);
  const lastTime = React.useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (time - lastTime.current > props.stepInterval) {
      manager.step();
      setStep(prev => prev + 1);
      lastTime.current = time;
    }
    setStepFactor((time - lastTime.current) / props.stepInterval);
  });

  return (
    <>
      <group position={[0, 1.02 / 4, 0]}>
        {manager.arrayEntities.prey.map(e => (
          <EntityAvatar key={e.id} entity={e} step={manager.currentStep} stepFactor={stepFactor} />
        ))}
        {manager.arrayEntities.predator.map(e => (
          <EntityAvatar key={e.id} entity={e} step={manager.currentStep} stepFactor={stepFactor} />
        ))}
        <InstancedFood entities={manager.arrayEntities.food} />
        {/* {manager.arrayEntitiesfood.map(e => (
          <Grass key={e.id} entity={e} />
        ))} */}
      </group>
      <Scene />
    </>
  );
};

const App = () => {
  const manager = React.useRef<EntityManager>(prepareManager());
  return (
    <ManagerContext.Provider value={manager.current}>
      <Canvas camera={{ fov: 70, position: [0, 20, 20] }} shadows>
        <Simulation stepInterval={0.5} />
        <OrbitControls />
        <Stats />
      </Canvas>
    </ManagerContext.Provider>
  );
};

export default App;
