import React from "react";
import { Html } from "@react-three/drei";
import { styled } from "goober";
import { Area, AreaChart, Label, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { EntityManager } from "../simulator";
import { SimulationContext } from "../contexts/simulationContext";

type DebugPanelProps = {
  rows: [string, string | number][];
  populations: EntityManager["populationHistory"];
};

export const DebugPanel = (props: DebugPanelProps) => {
  const { stepInterval, setStepInterval, showRings, setShowRings, setGraphOpen } =
    React.useContext(SimulationContext);

  return (
    <Html fullscreen prepend>
      <CornerPanel>
        <table>
          <tbody>
            {props.rows.map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ResponsiveContainer width='100%' height={100}>
          <AreaChart height={300} data={props.populations.slice(-400)}>
            <defs>
              {/* <linearGradient id='colorFood' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#82ca9d' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#82ca9d' stopOpacity={0} />
              </linearGradient> */}
              <linearGradient id='colorPray' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='colorPredator' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#e69a37' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#e69a37' stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* <Area
            type='monotone'
            dataKey='food'
            stroke='#82ca9d'
            fillOpacity={1}
            fill='url(#colorFood)'
          /> */}
            <Area
              type='monotone'
              dataKey='prey'
              stroke='#8884d8'
              fillOpacity={1}
              fill='url(#colorPray)'
            />
            <Area
              type='monotone'
              dataKey='predator'
              stroke='#e69a37'
              fillOpacity={1}
              fill='url(#colorPredator)'
            />
            <XAxis>
              <Label value='step' dy={10} />
            </XAxis>
            {/* <YAxis>
              <Label value='population' angle={-90} dx={-10} />
            </YAxis> */}
          </AreaChart>
        </ResponsiveContainer>
        <label>
          Speed:{" "}
          <SpeedInput
            type='number'
            min='0.05'
            step='0.05'
            value={stepInterval}
            onChange={e => {
              !isNaN(parseFloat(e.target.value)) && setStepInterval(parseFloat(e.target.value));
            }}
          />
          steps/s
        </label>
        <Button onClick={() => setStepInterval(stepInterval > 999 ? 0.1 : 1000)}>
          {stepInterval > 999 ? "Resume" : "Pause"}
        </Button>
        <label>
          Show rings:
          <input
            type='checkbox'
            onChange={e => setShowRings(e.target.checked)}
            checked={showRings}
          />
        </label>
        <Button onClick={() => setGraphOpen(true)}>Show species graph</Button>
      </CornerPanel>
    </Html>
  );
};

const Button = styled("button")`
  margin-top: 0.25rem;
  line-height: 1;
  padding: 0 0 0.15rem;
`;

const CornerPanel = styled("div")`
  width: 200px;
  color: white;
  font-family: Courier;
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.33rem;
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  td {
    min-width: 6ch;
  }
`;

const SpeedInput = styled("input")`
  width: 10ch;
  margin: 0.5rem 0.5rem 0 0;
`;
