import React, { useEffect, useState } from 'react';

export function NavBar(props)
{
    const [ sceneManagerInitialized, setSceneManagerInitialized ] = useState(false);
    const [ sceneZones, setSceneZones ] = useState(null);

    useEffect(() =>
    {
        const sceneManager = props.xyzRef.getSceneManager();

        setSceneManagerInitialized(true);
        let filteredZones = [];

        // remove the scenezone named "_default_animations_zone" or "_default_interactable_zone"
        for (let i = 0; i < sceneManager.sceneZones.length; i++)
        {
            const sceneZone = sceneManager.sceneZones[ i ];

            if (sceneZone.name != "_default_animations_zone" && sceneZone.name != "_default_interactable_zone")
            {
                filteredZones.push(sceneZone);
            }
        }

        setSceneZones(filteredZones);
    }, []);

    const navigateTo = (name) => (event) =>
    {
        event.preventDefault();
        props.xyzRef.goToSceneZoneByName(name);
    }

    return (
        <nav className="fixed top-0 right-0 flex flex-row justify-between p-4 bg-transparent text-black">
            <style>
                {`
                    /* Import and define the custom font */
                    @font-face {
                        font-family: 'CustomFont';
                        src: url('/Dechorian.otf');
                    }
                    
                    /* Apply the custom font to the navigation links */
                    .nav-link {
                        font-family: 'CustomFont', sans-serif;
                    }
                `}
            </style>
            <div className="flex flex-row space-x-4 h-12 rounded-none border-x-2 border-black">
                {sceneManagerInitialized &&
                    sceneZones?.map((sceneZone, index) => (
                        <div onClick={navigateTo(sceneZone.name)} className="hover:text-gray-600 content-center nav-link text-3xl cursor-pointer p-3 rounded-none border-y-2 border-black" key={index}>
                            {sceneZone.name}
                        </div>
                    ))}
            </div>
        </nav>
    );
}
