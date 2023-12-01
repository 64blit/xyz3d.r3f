import React, { useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';

export const OnScreenControls = ({ xyzAPI, isLoaded, setScreenClicked }) =>
{
    if (!xyzAPI) return null;

    // Only show controls after user clicks anywhere on screen
    const [ showControls, setShowControls ] = useState(false);

    useEffect(() =>
    {
        const cameraManager = xyzAPI.getCameraManager();
        const handleClick = () =>
        {
            // scroll to the bottom of the page
            cameraManager.scroll.el.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

            setTimeout(() =>
            {
                cameraManager.scroll.el.scrollTo({ top: document.body.scrollHeight * 2, behavior: 'smooth' });
                setShowControls(true);
                setScreenClicked(true);
            }, 1000);
        };
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

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

        let newIndex = currentIndex;
        setCurrentIndex(prevIndex =>
        {
            newIndex = (prevIndex - 1 + artists.length) % artists.length;
            playSample(newIndex);

            return newIndex;
        });
        setCurrentArtist("▶ " + artists[ newIndex ].userData?.artistName);
    };

    const handleRightClick = () =>
    {
        let newIndex = currentIndex;
        setCurrentIndex(prevIndex =>
        {
            newIndex = (prevIndex + 1) % artists.length;
            playSample(newIndex);
            return newIndex;
        });

        setCurrentArtist("▶ " + artists[ newIndex ].userData?.artistName);
    };

    const playSample = (index) =>
    {
        const artistObj = artists[ index ];
        const startZ = artistObj.position.z;
        gsap.to(artistObj.scale, { x: 4, y: 4, z: 4, duration: 1, onComplete: () => gsap.to(artistObj.scale, { x: 1, y: 1, z: 1, duration: 0.5 }) });
        gsap.to(artistObj.position, { z: 4, duration: .5, onComplete: () => gsap.to(artistObj.position, { z: startZ, duration: 0.5 }) });
        console.log(artistObj.userData?.mediaSrc);
        sceneManager.playSound(artistObj);
    }

    const styles = {
        transition: 'height 0.5s ease-in-out'
    };

    return (
        <div id="onscreen" className={`flex-grow w-full transition-all delay-300 ${(isLoaded && showControls) ? 'h-1/4' : 'h-0'} `} style={styles}>

            <div className="flex flex-col justify-evenly items-center h-full bg-transparent transform transition-all delay-500 ">

                {currentArtist &&
                    <span className="bg-blue-500 text-white font-bold py-2 px-4 rounded-none"> {currentArtist} </span>
                }

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


                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 hover:scale-125">
                    BUY TICKETS
                </button>

                {/* <iframe
                    width="30%"
                    height="152"
                    title="Spotify Embed: My Path to Spotify: Women in Engineering"
                    style={{ borderRadius: '12px' }}
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    src="https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5?utm_source=oembed"
                ></iframe> */}
            </div>


        </div>
    );
};

