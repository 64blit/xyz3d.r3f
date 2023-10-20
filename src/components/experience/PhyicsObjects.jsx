import React from 'react';
import { Physics } from '@react-three/rapier';
import { GenerateKey } from '../../utils/BaseUtils.js';

export function PhysicsObjects({ sceneManager })
{

    const physicsNodes = React.useEffect(() => getPhyicsNodes(), [ sceneManager ]);

    const getPhyicsNodes = () =>
    {
        console.log(sceneManager)
        const physicsNodes = [];
        const physicsObjects =
            sceneManager.getPhysicsObjects();

        if (physicsObjects.length() <= 0)
        {
            return null;
        }

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
                // node = <PhysicsBall obj={obj} mass={dynamicMass} invisible={invisible} key={generateKey(obj.name)} />;
            }

            physicsNodes.push(node);
        });
        return physicsNodes;
    }


    return (
        { physicsNodes }
    );
}
