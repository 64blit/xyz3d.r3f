import { usePlane } from "@react-three/cannon";
import { useRef } from "react";
import { Mesh } from "three";

type TransparentFloorProps = { opacity?: number };

export default function TransparentFloor(props: TransparentFloorProps)
{
  const [ planeRef ] = usePlane(() => ({ rotation: [ -Math.PI / 2, 0, 0 ], ...props }), useRef<Mesh>(null))
  return (
    <mesh ref={planeRef}>
      <planeGeometry args={[ 1000, 1000, 1000, 1000 ]} />
      <meshStandardMaterial color="#aeaeae" wireframe />
    </mesh>
  )
}
