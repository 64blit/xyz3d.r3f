import
{
    BufferAttribute,
    BufferGeometry,
    InterleavedBufferAttribute,
} from "three";
import { Triplet, useTrimesh } from "@react-three/cannon";

export const useTrimeshCollision = (geometry: BufferGeometry, mass: number, position: Triplet, collisionType: "Dynamic" | "Static" | "Kinematic") =>
{
    const indices = (geometry.index as BufferAttribute).array as number[];

    const isInterleaved =
        // @ts-ignore
        geometry.attributes.position.isInterleavedBufferAttribute;

    let vertices: number[] = [];
    if (isInterleaved)
    {
        const attr = geometry.attributes.position as InterleavedBufferAttribute;
        const data = attr.data;
        for (let i = attr.offset; i < data.array.length; i += data.stride)
        {
            for (let x = 0; x < attr.itemSize; x++)
            {
                vertices.push(data.array[ i + x ]);
            }
        }
    } else
    {
        vertices = (geometry.attributes.position as BufferAttribute)
            .array as number[];
    }

    const [ hitbox, api ] = useTrimesh(() => ({
        type: collisionType,
        linearDamping: .8,
        angularDamping: .2,
        mass: mass,
        position: position,
        args: [ vertices, indices ],
    }));

    return [ hitbox, api ];
};
