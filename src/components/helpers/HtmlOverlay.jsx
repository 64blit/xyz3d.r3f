import { Suspense, useEffect, useRef, useState } from "react";

export const HtmlOverlay = (props) =>
{
    const [ loading, setLoading ] = useState(true);
    const iframeRef = useRef();

    useEffect(() =>
    {
        try
        {
            const iframe = iframeRef.current;
            iframe.onload = () =>
            {
                setLoading(false);
            };
        } catch (error)
        {
            setLoading(false);
        }
    }, [ iframeRef ]);


    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-black">
            <button className="absolute top-0 left-0 h-[2.5rem] w-[2.5rem] text-gray-900 group  hover:text-white dark:text-white focus:ring-4 focus:outline-none"
                onClick={() => { props.setShowPopup(false); setLoading(true); }}>
                <span className="relative -top-4 -left-2 pl-2 transition-all text-7xl ease-in duration-75 bg-white group-hover:bg-opacity-0 rounded-r-3xl">
                    ⇠
                </span>
            </button>

            <div className=" w-full h-full flex flex-col justify-center items-center">

                {
                    loading ?
                        <div className="bg-white text-black text-9xl ">Loading...</div>
                        : <iframe ref={iframeRef} src={props.content} className="w-full h-full"></iframe>
                }

            </div>
        </div>
    );
};
