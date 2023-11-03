import React, { useEffect } from 'react';


const LoadingScreen = ({ progress }) =>
{

    return (
        <>
            {
                progress > 0 && <div className="flex h-[100%] w-[100%] items-center justify-center flex-col ">
                    <span className="text-white text-center font-mono min-w-max">
                        [{Math.floor(progress)}%]
                    </span>
                </div>
            }
        </>
    );
};

export default LoadingScreen;
