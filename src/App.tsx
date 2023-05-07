import React, { ReactNode } from "react";
import * as THREE from "three";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { Box, Circle, OrbitControls, Plane, Ring, Stats } from "@react-three/drei";
import { Entity, EntityManager, EntityType, Food, Predator, Prey } from "./simulator/manager";

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

type EntityProps = { entity: Entity; step: number; stepInterval: number };

const EntityAvatar: React.FC<EntityProps> = props => {
  const entity = props.entity;
  const ref = React.useRef<THREE.Mesh>(null);
  const color =
    entity.type === EntityType.PREY
      ? "blue"
      : entity.type === EntityType.PREDATOR
      ? "orange"
      : "green";

  useFrame((state, delta) => {
    if (props.stepInterval >= 0.4) {
      ref.current?.position.lerp(entity.position, (delta * 4) / props.stepInterval);
    } else {
      ref.current?.position.copy(entity.position);
    }
  });

  return (
    <Box ref={ref} castShadow args={[0.5, 0.5, 0.5]} position={entity.position}>
      {entity.type !== EntityType.FOOD && (
        <Ring
          args={[entity.stats.vision - 0.01, entity.stats.vision, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <lineBasicMaterial />
        </Ring>
      )}
      <meshStandardMaterial color={color} transparent opacity={entity.energy} />
    </Box>
  );
};

const ManagerContext = React.createContext<EntityManager | null>(null);

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

type SimulationProps = { stepInterval: number; children: ReactNode };
const Simulation = (props: SimulationProps) => {
  const entityManager = React.useRef(prepareManager());
  const [step, setStep] = React.useState(0);
  const lastTime = React.useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (time - lastTime.current > props.stepInterval) {
      entityManager.current.step();
      setStep(prev => prev + 1);
      console.log(`Step: ${entityManager.current.currentStep}`);
      lastTime.current = time;
    }
  });

  return (
    <ManagerContext.Provider value={entityManager.current}>
      <group position={[0, 1.02 / 4, 0]}>
        {entityManager.current.arrayEntities.map(e => (
          <EntityAvatar
            key={e.id}
            entity={e}
            step={entityManager.current.currentStep}
            stepInterval={props.stepInterval}
          />
        ))}
      </group>
      <Scene />
    </ManagerContext.Provider>
  );
};

const App = () => {
  return (
    <Canvas camera={{ fov: 70, position: [0, 20, 20] }} shadows>
      <Simulation stepInterval={0.5}>
        <Scene />
      </Simulation>
      <OrbitControls />
      <Stats />
    </Canvas>
  );
};

export default App;
