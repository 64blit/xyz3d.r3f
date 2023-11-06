import { Html } from '@react-three/drei';
import React, { useEffect, useState } from 'react';

const generateKey = (pre) =>
{
    return `${pre}_${new Date().getTime()}`;
}


export function NavBar(props)
{
    const [ sceneZones, setSceneZones ] = useState([]);
    const [ navStyles, setNavStyles ] = useState(null);
    const [ sceneManager, setSceneManager ] = useState(null);

    useEffect(() =>
    {
        if (props.xyzAPI == null) return;

        const tempSceneMan = props.xyzAPI.getSceneManager();
        if (!tempSceneMan) return;

        let filteredZones = [];

        // remove the scenezone named "_default_animations_zone" or "_default_interactable_zone"
        for (let i = 0; i < tempSceneMan.sceneZones.length; i++)
        {
            const sceneZone = tempSceneMan.sceneZones[ i ];

            if (sceneZone.name != "_default_animations_zone" && sceneZone.name != "_default_interactable_zone")
            {
                filteredZones.push(sceneZone);
            }
        }

        if (filteredZones.length > 0)
        {
            setNavStyles("flex flex-row space-x-4 h-12 rounded-none border-x-2 border-black")
        }

        setSceneZones(filteredZones);
        setSceneManager(tempSceneMan);
    }, [ props.xyzAPI ]);

    const navigateTo = (name) => (event) =>
    {
        event.preventDefault();
        props.xyzAPI.goToSceneZoneByName(name);
    }

    return (
        <>
            {sceneZones.length > 1 && <nav className="fixed top-0 right-0 flex flex-row p-4 w-screen">

                <div className="flex justify-end w-full max-w-full">
                    <ul className="hidden md:flex md:flex-row-reverse items-center text-[18px] font-semibold  w-full max-w-full">
                        {sceneManager &&
                            sceneZones?.map((sceneZone, index) => (
                                <li onClick={navigateTo(sceneZone.name)} key={generateKey(index)} className="text-white  transition duration-1000 ease-in-out border-white hover:italic hover:underline hover:scale-125  bg-black pl-4 pr-4 hover:cursor-pointer hover:text-blue-300"><a
                                    href="#"> {sceneZone.name}</a></li>
                            ))}
                    </ul>

                    <button className="block p-3 mx-10 md:hidden transition duration-500 ease-in-out  hover:bg-gray-200 rounded group bg-white">
                        <div className="z-20 w-5 my-[3px] h-[3px] bg-gray-600 mb-[2px] rounded "></div>
                        <div className="z-20 w-5 my-[3px] h-[3px] bg-gray-600 mb-[2px] rounded "></div>
                        <div className="z-20 w-5 my-[3px] h-[3px] bg-gray-600 rounded "></div>
                        <div
                            className="transition-all ease-in duration-500 absolute top-0 -right-full opacity-0 w-full border bg-white group-focus:right-0 group-focus:opacity-100 h-screen">
                            <ul className="flex flex-col justify-center items-center text-[18px] pt-[1rem] min-w[10rem] h-screen overflow-scroll">
                                <a href="#">
                                    <li onClick={(e) => { console.log(e); e.target.focus() }} key={generateKey("X")} className="text-stone-600 p-5 transition duration-500 ease-in-out  hover:bg-black hover:text-white hover:scale-125 font-medium mx-4 my-1 hover:underline hover:italic rounded-full w-[4rem] h-[4rem]"> X
                                    </li>
                                </a>

                                {sceneManager &&
                                    sceneZones?.map((sceneZone, index) => (
                                        <a href="#" key={generateKey(index)}>
                                            <li onClick={navigateTo(sceneZone.name)} className="text-stone-600 p-5 transition duration-500 ease-in-out  hover:bg-black hover:text-white hover:scale-125 font-medium mx-4 my-1 hover:underline hover:italic"> {sceneZone.name}
                                            </li>
                                        </a>
                                    ))}

                            </ul>
                        </div>
                    </button>


                </div>
            </nav>}
        </>
    );
}
