import dynamic from "next/dynamic";

import type { ExType } from "./Tools/ExcerciseType";

const Lvltutor = dynamic(
  () => {
    return import("./Tools/Solver2");
  },
  { ssr: false },
);

export const Plain = ({ topicId, steps }: { topicId: string; steps: ExType }) => {
  
  return (
    <>
      {steps?.type == "lvltutor" ? (
        <Lvltutor key={steps.code} topicId={topicId} steps={steps} />
      ) : (
        "potato"
      )}
    </>
  );
};

export default Plain;
