import { useFrame } from "@react-three/fiber"

export function CameraAudioReactor({ url })
{
    // This will *not* re-create a new audio source, suspense is always cached,
    // so this will just access (or create and then cache) the source according to the url
    const { data } = suspend(() => createAudio(url), [ url ])
    return useFrame((state) =>
    {
        // Set the cameras field of view according to the frequency average
        state.camera.fov = 25 - data.avg / 15
        state.camera.updateProjectionMatrix()
    })
}

async function createAudio(url)
{
    // Fetch audio data and create a buffer source
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const context = new (window.AudioContext || window.webkitAudioContext)()
    const source = context.createBufferSource()
    source.buffer = await new Promise((res) => context.decodeAudioData(buffer, res))
    source.loop = true
    // This is why it doesn't run in Safari 🍏🐛. Start has to be called in an onClick event
    // which makes it too awkward for a little demo since you need to load the async data first
    source.start(0)
    // Create gain node and an analyser
    const gain = context.createGain()
    const analyser = context.createAnalyser()
    analyser.fftSize = 64
    source.connect(analyser)
    analyser.connect(gain)
    // The data array receive the audio frequencies
    const data = new Uint8Array(analyser.frequencyBinCount)
    return {
        context,
        source,
        gain,
        data,
        // This function gets called every frame per audio source
        update: () =>
        {
            analyser.getByteFrequencyData(data)
            // Calculate a frequency average
            return (data.avg = data.reduce((prev, cur) => prev + cur / data.length, 0))
        },
    }
}
