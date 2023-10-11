import { Suspense, useEffect, useRef } from "react";

export const HtmlOverlay = (props) =>
{

    const opacityDivRef = useRef(null);

    useEffect(() =>
    {
        if (props.showPopup)
        {
            opacityDivRef.current.classList.remove("opacity-0");
            opacityDivRef.current.classList.add("opacity-100");
        }
        else
        {
            opacityDivRef.current.classList.remove("opacity-100");
            opacityDivRef.current.classList.add("opacity-0");
        }

    }, [ props.showPopup ]);

    return (

        <>
            {props.showPopup &&
                <div ref={opacityDivRef} className={"transition-all duration-1000 fixed top-0 left-0 w-full h-full opacity-0 "}>

                    <div className="flex flex-col items-center justify-center w-full h-full bg-black">

                        <button className="absolute top-2 right-2 p-0.5 mb-2 mr-2 overflow-hidden h-[2.5rem]  text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                            onClick={() => { props.setShowPopup(false) }}>
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                X
                            </span>
                        </button>


                        <Suspense fallback={null}>
                            <iframe src={props.content} className="w-full h-full"></iframe>
                        </Suspense>

                    </div>
                </div>
            }
        </>
    );
};
