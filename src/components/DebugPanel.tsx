import { Html } from "@react-three/drei";
import { styled } from "goober";

export const DebugPanel = (props: { data: [string, string | number][] }) => (
  <Html fullscreen prepend>
    <CornerPanel>
      <tbody>
        {props.data.map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </CornerPanel>
  </Html>
);

const CornerPanel = styled("table")`
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
