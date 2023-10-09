import dynamic from "next/dynamic";
import { useMemo } from "react";

const Xyz3DWorld = dynamic(import("worlds/Xyz3DWorld"), { ssr: false });

export default function StarterPage()
{
  return <Xyz3DWorld />;
};
