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

    const [ currentIndex, setCurrentIndex ] = useState(0);
    const [ currentArtist, setCurrentArtist ] = useState("");


    const handleLeftClick = () =>
    {
        setCurrentIndex(prevIndex =>
        {
            const newIndex = (prevIndex - 1 + artists.length) % artists.length;
            playSample(newIndex);

            return newIndex;
        });
        setCurrentArtist("▶ " + artists[ currentIndex ].userData?.artistName);
    };

    const handleRightClick = () =>
    {
        setCurrentIndex(prevIndex =>
        {
            const newIndex = (prevIndex + 1) % artists.length;
            playSample(newIndex);
            return newIndex;
        });

        setCurrentArtist("▶ " + artists[ currentIndex ].userData?.artistName);
    };

    const playSample = (index) =>
    {
        const artist = artists[ index ];
        const startZ = artist.position.z;
        gsap.to(artist.scale, { x: 4, y: 4, z: 4, duration: 1, onComplete: () => gsap.to(artist.scale, { x: 1, y: 1, z: 1, duration: 0.5 }) });
        gsap.to(artist.position, { z: 4, duration: .5, onComplete: () => gsap.to(artist.position, { z: startZ, duration: 0.5 }) });
        sceneManager.playSound(artist.userData?.mediaSrc);
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[20vh]">

            <div className="flex flex-col justify-evenly items-center h-full bg-transparent transform ">

                {currentArtist &&
                    <span className="bg-blue-500 text-white font-bold py-2 px-4 rounded-none"> {currentArtist} </span>
                }

                <div>
                    <div className="flex h-full items-center">


                        <button onClick={handleLeftClick} className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded-l-full transition-all duration-300 hover:scale-125">
                            <i className="fas fa-arrow-right"> {"<"} </i>
                        </button>

                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 selection:">
                            Select an artist
                        </button>

                        <button onClick={handleRightClick} className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded-r-full transition-all duration-300 hover:scale-125">
                            <i className="fas fa-arrow-right"> {">"} </i>
                        </button>

                    </div>
                </div>


                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 hover:scale-125">
                    BUY TICKETS
                </button>
            </div>
        </div>
    );
};

