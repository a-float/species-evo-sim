import React from "react";
import { styled } from "goober";
import { SimulationContext } from "../contexts/simulationContext";
import ReactFlow, { Background, Controls, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Species } from "../simulator/genetics";
import dagre from "dagre";
import { SpeciesNode } from "./SpeciesGraph.Node";

export const SpeciesGraph = () => {
  const { manager, setGraphOpen } = React.useContext(SimulationContext);
  const [showPrey, setShowPrey] = React.useState(true);
  const nodeTypes = React.useMemo(() => ({ speciesNode: SpeciesNode }), []);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const species: Species[] = [...manager.speciesMaps[showPrey ? "prey" : "predator"].values()];

  const initialNodes = species.map(species => ({
    id: species.id,
    type: "speciesNode",
    data: species,
  }));

  const initialEdges = species
    .filter(species => !!species.parentId)
    .map(species => ({
      id: `${species.parentId}-${species.id}`,
      source: species.id,
      target: species.parentId!,
    }));

  const nodeWidth = 172;
  const nodeHeight = 100;

  const getLayoutedElements = (nodes: any, edges: any, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node: any) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge: any) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node: any) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: -nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  return (
    <>
      <CornerPanel>
        <Button onClick={() => setShowPrey(prev => !prev)}>
          {showPrey ? "Show predators" : "Show prey"}
        </Button>
        <Button onClick={() => setGraphOpen(false)}>X</Button>
      </CornerPanel>
      <ReactFlow nodes={layoutedNodes} edges={layoutedEdges} nodeTypes={nodeTypes}>
        <Background />
        <Controls />
      </ReactFlow>
    </>
  );
};

const CornerPanel = styled("div")`
  z-index: 100;
  font-family: Courier;
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.33rem;
  display: flex;
  font-size: 0.8rem;
  gap: 0.5rem;
`;

const Button = styled("button")`
  height: 1rem;
  line-height: 0;
  padding-bottom: 0.1rem;
`;
