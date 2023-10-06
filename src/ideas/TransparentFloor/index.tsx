type TransparentFloorProps = { opacity?: number };

export default function TransparentFloor(props: TransparentFloorProps) {
  const { opacity = 0.6 } = props;

  return (
    <>
    <group name="transparent-floor" rotation-x={-Math.PI / 2}>
      <mesh >
        <planeBufferGeometry args={[500, 500]} />
        <meshStandardMaterial color="white" transparent opacity={opacity} />
      </mesh>
      <mesh>
        <planeBufferGeometry args={[500, 500, 500, 500]} />
        <meshStandardMaterial color="#ddd" wireframe />
      </mesh> 
    </group>
    </>
  );
}
