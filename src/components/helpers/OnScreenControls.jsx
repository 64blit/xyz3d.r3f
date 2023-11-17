import React, { useMemo, useState } from 'react';
import gsap from 'gsap';

export const OnScreenControls = ({ xyzAPI }) =>
{
    if (!xyzAPI) return null;

    const { artists, sceneManager } = useMemo(() =>
    {
        const sceneManager = xyzAPI.getSceneManager();
        const scene = sceneManager.scene;
        let artists = [];

        scene.traverse((child) =>
        {
            if (child.userData?.mediaTrigger)
            {
                artists.push(child);
            }
        });

        artists.sort((a, b) => a.name - b.name);
        return { artists, sceneManager };
    });

    const { count, setCount } = useState(0);
    const [ currentIndex, setCurrentIndex ] = useState(0);


    const handleLeftClick = () =>
    {
        setCurrentIndex(prevIndex =>
        {
            const newIndex = (prevIndex - 1 + artists.length) % artists.length;
            playSample(newIndex);
            return newIndex;
        });
    };

    const handleRightClick = () =>
    {
        setCurrentIndex(prevIndex =>
        {
            const newIndex = (prevIndex + 1) % artists.length;
            playSample(newIndex);
            return newIndex;
        });
    };

    const playSample = (index) =>
    {
        const artist = artists[ index ];
        const startZ = artist.position.z;
        gsap.to(artist.scale, { x: 4, y: 4, z: 4, duration: 1, onComplete: () => gsap.to(artist.scale, { x: 1, y: 1, z: 1, duration: 0.5 }) });
        gsap.to(artist.position, { z: 4, duration: .5, onComplete: () => gsap.to(artist.position, { z: startZ, duration: .5, duration: 0.5 }) });
        sceneManager.playSound(artist.userData?.mediaSrc);
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 w-96 h-36 m-auto transform scale-150 ">

            <div className="flex flex-col justify-center items-center  bg-transparent transform ">
                <div>
                    <div className="flex items-center m-3">
                        <button onClick={handleLeftClick} className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded-l-full transition-all duration-300 hover:scale-125">
                            <i className="fas fa-arrow-right"> {"<"} </i>
                        </button>
                        <div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ">
                            PLAY SAMPLE
                        </div>
                        <button onClick={handleRightClick} className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded-r-full transition-all duration-300 hover:scale-125">
                            <i className="fas fa-arrow-right"> {">"} </i>
                        </button>
                    </div>
                </div>


                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-3 transition-all duration-300 hover:scale-125">
                    BUY TICKETS
                </button>
            </div>
        </div>
    );
};

