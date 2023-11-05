// a react component that passes useScroll to the parent

import { useScroll } from "@react-three/drei";
import { useEffect } from "react";

export function ScrollWrapper(props)
{

    const scroll = useScroll();

    useEffect(() =>
    {
        props.onReady(scroll);
    }, [ scroll ]);


    return (<>{props.children}</>);
}
