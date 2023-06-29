// a react component that wraps the drei Environment
import React from 'react';
import { Environment, useEnvironment } from '@react-three/drei';

export default function EnvironmentXyz3D(props)
{
    return (<Environment  {...props} />);
}
