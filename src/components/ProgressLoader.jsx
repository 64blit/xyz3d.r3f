import
{
    Html,
    useProgress
} from "@react-three/drei";
import CubeLoader from "./CubeLoader";


export function ProgressLoader()
{
    const { active, progress, errors, item, loaded, total } = useProgress();

    return (
        <>
            <Html center>
                <CubeLoader progress={Math.floor(progress)} />
            </Html>
        </>
    );
}

