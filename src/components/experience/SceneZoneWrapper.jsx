// a react component that passes useScroll to the parent

import { useScroll } from "@react-three/drei";
import { useEffect } from "react";

export function SceneZoneWrapper(props)
{

    const scroll = useScroll();

    useEffect(() =>
    {
        props.setScroll(scroll);
    }, [ scroll ]);


    return (<>{props.children}</>);
}
