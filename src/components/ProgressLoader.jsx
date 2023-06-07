import
{
    Html,
    useProgress
} from "@react-three/drei";

export function ProgressLoader()
{
    const { active, progress, errors, item, loaded, total } = useProgress();
    return <Html center>{Math.floor(progress)} % loaded</Html>;
}

