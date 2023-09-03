import React, { useEffect, useState } from 'react';

export function NavBar(props)
{
    const [ sceneManagerInitialized, setSceneManagerInitialized ] = useState(false);
    const [ sceneZones, setSceneZones ] = useState(null);

    useEffect(() =>
    {
        const sceneManager = props.xyzRef.getSceneManager();

        setSceneManagerInitialized(true);
        // remove the scenezone named "_default_animations_zone" or "_default_interactable_zone"
        const filteredZones = sceneManager.sceneZones.filter((sceneZone) => sceneZone.name != "_default_animations_zone" || sceneZone.name != "_default_interactable_zone");
        setSceneZones(filteredZones);
    }, []);

    const navigateTo = (name) => (event) =>
    {
        event.preventDefault();
        props.xyzRef.goToSceneZoneByName(name);
    }

    return (
        <nav className="fixed top-0 right-0 flex flex-row justify-between p-4 bg-transparent text-white">
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
            <div className="flex flex-row space-x-4 h-12 min-w-[20rem]">
                {sceneManagerInitialized &&
                    sceneZones?.map((sceneZone, index) => (
                        <a href="#" onClick={navigateTo(sceneZone.name)} className="hover:text-gray-600 content-center nav-link text-3xl" key={index}>
                            {sceneZone.name}
                        </a>
                    ))}
            </div>
        </nav>
    );
}
