import { Html } from "@react-three/drei";
import { styled } from "goober";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { EntityType } from "../simulator/entities";
import { EntityManager } from "../simulator";

const data = Array.from({ length: 50 }).map((_, i) => Math.sin((i / 25) * Math.PI));

type DebugPanelProps = {
  rows: [string, string | number][];
  populations: EntityManager["populationHistory"];
};

export const DebugPanel = (props: DebugPanelProps) => (
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
        <AreaChart height={200} data={props.populations}>
          <defs>
            <linearGradient id='colorFood' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#82ca9d' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#82ca9d' stopOpacity={0} />
            </linearGradient>
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
        </AreaChart>
      </ResponsiveContainer>
    </CornerPanel>
  </Html>
);

const CornerPanel = styled("div")`
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
    min-width: 5ch;
  }
`;