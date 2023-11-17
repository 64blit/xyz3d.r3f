import React from 'react';

const OnScreenControls = () =>
{
    return (
        <div className="fixed bottom-0 left-0 right-0 w-96 h-36 m-auto transform scale-150 ">

            <div className="flex flex-col justify-center items-center  bg-transparent transform ">


                <div>
                    <div className="flex items-center m-3">
                        <button className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded-l-full transition-all duration-300 hover:scale-125">
                            <i className="fas fa-arrow-right"> {"<"} </i>
                        </button>
                        <div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ">
                            PLAY SAMPLE
                        </div>
                        <button className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded-r-full transition-all duration-300 hover:scale-125">
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

export default OnScreenControls;
