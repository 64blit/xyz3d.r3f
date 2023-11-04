import { Html } from "@react-three/drei";
import { useState } from "react";

export const ScrollIndicator = (props) =>
{
    const [ active, setActive ] = useState(true);

    return (
        <>
            {active &&
                <div className="flex h-full w-full items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto" data-pg-collapsed>
                        <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white pb-4 pt-5 px-4 sm:p-6 sm:pb-4">
                                    <div className="mt-3 text-center">
                                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">WebCrafter: 3D Website</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">Scroll down!</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-col sm:px-6">

                                    <button type="button" className="bg-green-500 font-semibold hover:bg-green-800 inline-flex justify-center px-3 py-2 rounded-md shadow-sm text-sm text-white w-full sm:ml-3 sm:w-auto" onClick={() => { setActive(false) }}>Start</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};
