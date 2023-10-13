import { usePlane } from "@react-three/cannon";
import { useRef } from "react";

type TransparentFloorProps = { opacity?: number };

export default function TransparentFloor(props: TransparentFloorProps)
{
  const [ ref ] = usePlane(() => ({ rotation: [ -Math.PI / 2, 0, 0 ], ...props }))
  return (
    <mesh ref={ref}>
      <planeGeometry args={[ 1000, 1000, 1000, 1000 ]} />
      <meshStandardMaterial color="#aeaeae" wireframe />
    </mesh>
  )
}
