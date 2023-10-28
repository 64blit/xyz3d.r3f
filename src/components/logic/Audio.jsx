// A react component function that plays audio when clicked on

import React, { useState, useEffect } from 'react';

// eslint-disable-next-line react/prop-types
export const Audio = ({ obj, url }) =>
{
    const [ audio ] = useState(new Audio(url));
    const [ playing, setPlaying ] = useState(false);

    const toggle = () =>
    {
        setPlaying(!playing);
    };

    useEffect(() =>
    {
        playing ? audio.play() : audio.pause();
    },
        [ playing ]);

    useEffect(() =>
    {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => audio.removeEventListener('ended', () => setPlaying(false));
    }, []);

    return (
        <primitive onClick={toggle} object={props.obj}>
        </primitive>
    );
};

