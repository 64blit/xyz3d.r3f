// a react component that passes useScroll to the parent

import { useScroll, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function SceneZoneWrapper(props)
{
    const scroll = useScroll();

    return (<>{props.children}</>);
}
