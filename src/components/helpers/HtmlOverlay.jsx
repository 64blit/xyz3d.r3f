import { Suspense, useEffect, useRef, useState } from "react";

export const HtmlOverlay = (props) =>
{
    const iframeRef = useRef();
    const opacityDivRef = useRef(null);
    const [ mainClasses, setMainClasses ] = useState("transition-all duration-1000 opacity-100 fixed top-0 left-0 w-full h-full");

    useEffect(() =>
    {
        if (props.showPopup)
        {
            setMainClasses("transition-all duration-1000 opacity-100 fixed top-0 left-0 w-full h-full z-50 bg-black");
        }
        else
        {
            setMainClasses("transition-all duration-1000 opacity-0 fixed top-0 left-0 w-full h-full z-50 bg-black");
        }

    }, [ props.showPopup, opacityDivRef.current ]);

    useEffect(() =>
    {
        const handleKeyDown = (event) =>
        {
            if (event.key === "Escape")
            {
                props.setShowPopup(false);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    ;

    return (

        <>
            {props.showPopup &&
                <div ref={opacityDivRef} className={mainClasses}>

                    <div className="flex flex-col items-center justify-center w-full h-full bg-black">
                        <button className="absolute top-0 left-0 h-[2.5rem] w-[2.5rem] text-gray-900 group  hover:text-white dark:text-white focus:ring-4 focus:outline-none"
                            onClick={() => { props.setShowPopup(false); }}>
                            <span className="relative transition-all text-7xl ease-in duration-75 bg-white group-hover:bg-opacity-25 rounded-sm text-black hover:text-white group-hover:bg-gray-900">
                                ⇠
                            </span>
                        </button>

                        <div className=" w-full h-full flex flex-col justify-center items-center bg-black">


                            <Suspense fallback={<div className="bg-black text-black text-9xl ">Loading...</div>}>
                                <iframe ref={iframeRef} src={props.content} className="w-full h-full bg-black"></iframe>
                            </Suspense>

                        </div>

                    </div>
                </div>
            }
        </>
    );
};

