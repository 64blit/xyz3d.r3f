import { Html } from "@react-three/drei";
import { useState } from "react";

export const SplashScreen = (props) =>
{
    const [ active, setActive ] = useState(props.active);

    return (
        <>
            {active &&
                <div className="flex h-full items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black bg-opacity-[90%] transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
                        <div className="flex items-center justify-center min-h-full p-4 text-center text-white sm:p-0">
                            <div className="bg-gray-800 overflow-hidden relative shadow-2xl transform transition-all sm:max-w-md sm:my-8 sm:w-full  text-gray-900 bg-white rounded-lg border border-gray-200 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-900">
                                <div className="pb-10 pt-10 px-10 text-white sm:p-6 sm:pb-4">
                                    <div className="mt-3 text-center text-white">
                                        <h3 className="font-semibold leading-6 text-white" id="modal-title">{props.title}</h3>
                                        <div className="mt-2">
                                            <p className="text-sm">{props.body}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 flex items-center justify-center">
                                    <button type="button" className="hover:bg-green-500 font-semibold bg-green-800 px-3 py-2 rounded-sm shadow-sm text-sm text-white w-full sm:ml-3 w-42 h-16 max-w-[10rem]" onClick={() => { setActive(false) }}>{props.button}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};
