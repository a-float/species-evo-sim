import { Handle, NodeProps, Position } from "reactflow";
import { Species } from "../simulator/genetics";
import { styled } from "goober";

export const SpeciesNode = (props: NodeProps<Species>) => (
  <>
    <Handle type='source' position={Position.Top} id='a' />
    <Body>
      <Name>
        {props.data.name} ({props.data.members.length})
      </Name>
      {props.data.centroid.length > 0 && (
        <table>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td>{Object.keys(props.data.members[0].stats)[i]}</td>
                <td>{Math.round(props.data.centroid[i] * 100) / 100}</td>
              </tr>
            ))}
            <tr>
              <td>specials</td>
              <td>
                {props.data.centroid
                  .slice(5)
                  .map(x => Math.round(x * 10) / 10)
                  .toString()}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </Body>
    <Handle type='target' position={Position.Bottom} />
  </>
);

const Body = styled("div")`
  background-color: #eee;
  border-radius: 1rem;
  min-width: 160px;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  padding: 0.2rem 0;
  line-height: 0.95;
  td:nth-child(2) {
    text-align: right;
  }
`;

const Name = styled("span")`
  font-size: 1rem;
  line-height: 1;
  margin: 0.2rem 0;
`;
