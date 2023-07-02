import React from "react";
import * as THREE from "three";
import { Plane } from "@react-three/drei";
import { SimulationContext } from "../contexts/simulationContext";

export const Scene = () => {
  const planeRef = React.useRef<THREE.Mesh>(null);
  const { manager } = React.useContext(SimulationContext)!;
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
