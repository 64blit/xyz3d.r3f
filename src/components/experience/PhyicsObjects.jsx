import React, { useState } from 'react';
import { Physics } from '@react-three/rapier';
import { generateKey } from '../../utils/BaseUtils.js';

export function PhysicsObjects({ sceneManager })
{

    const [ physicsNodes, setPhysicsNodes ] = useState(null);
    React.useEffect(() =>
    {
        if (sceneManager === null || sceneManager === undefined)
        {
            return;
        }

        setPhysicsNodes(getPhyicsNodes())
    }, [ sceneManager ]);

    const getPhyicsNodes = () =>
    {
        let physicsNodes = [];

        const physicsObjects = sceneManager.getPhysicsObjects();
        console.log("getPhyicsNodes", physicsObjects)

        if (physicsObjects.length <= 0)
        {
            return null;
        }

        //  add a child node to the physics node parent
        //  for each physics object in the scene
        physicsObjects.forEach((obj) =>
        {
            const dynamicMass = parseInt(obj.userData[ "Dynamic" ]) || 0;
            const collides = obj.userData[ "Static" ] === "true";
            const invisible = obj.userData[ "Invisible" ] === "true";

            let node = null;
            console.log(obj, dynamicMass, collides, invisible)

            if (collides)
            {
                // node = <PhysicsCollidable obj={obj} key={generateKey(obj.name)} invisible={invisible} />;
            }
            else if (dynamicMass > 0)
            {
                node =
                    <RigidBody  mass={dynamicMass}>
                        {obj}
                    </RigidBody>;
                // node = <PhysicsBall obj={obj} mass={dynamicMass} invisible={invisible} key={generateKey(obj.name)} />;
            }

            if (node !== null)
            {
                physicsNodes.push(node);
            }


        });
        return (<Phyics>{physicsNodes}</Phyics>);
    }


    return (
        <>
            {physicsNodes}
        </>
    );
}
