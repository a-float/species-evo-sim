import React from "react";
import { Html } from "@react-three/drei";
import { Entity } from "../simulator/entities";
import { styled } from "goober";

export const EntityDetails = (props: { entity: Entity }) => {
  const entity = props.entity;
  return (
    <Html>
      <Panel>
        <table>
          <tbody>
            <tr>
              <td>type</td>
              <td>{entity.type}</td>
            </tr>
            <tr>
              <td>energy:</td>
              <td>{Math.round(entity.energy * 100) + "%"}</td>
            </tr>
            <tr>
              <td>isDead:</td>
              <td>{JSON.stringify(entity.isDead)}</td>
            </tr>
            <tr>
              <td>generation:</td>
              <td>{entity.generation}</td>
            </tr>
            {Object.entries(entity.stats).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  {typeof value === "number"
                    ? Math.round(value * 100) / 100
                    : JSON.stringify(value)}
                </td>
              </tr>
            ))}
            <tr>
              <td>genotype:</td>
              <td>{entity.genotype.valueOf()}</td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </Html>
  );
};

const Panel = styled("div")`
  font-family: Courier;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.33rem;
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  color: #eee;
`;
