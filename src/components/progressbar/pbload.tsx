import dynamic from "next/dynamic";

const Progressbar = dynamic(
  () => {
    return import("./progressbar");
  },
  { ssr: false },
);

export const PBLoad = ({
  uservalues,
  groupvalues,
}: {
  uservalues: number;
  groupvalues?: number;
}) => {
  return uservalues ? (
    <Progressbar uservalues={uservalues} groupvalues={groupvalues} />
  ) : (
    <>potato fail:kcnames or values not provided</>
  );
};

export default PBLoad;
