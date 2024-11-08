import dynamic from "next/dynamic";

interface model {
  mth: number;
  level: number;
}

const Progressbar = dynamic(
  () => {
    return import("./progressbar");
  },
  { ssr: false },
);

export const PBLoad = ({
  kcnames,
  uservalues,
  groupvalues,
}: {
  kcnames: Array<string>;
  uservalues: Record<string, model>;
  groupvalues?: Record<string, model>;
}) => {
  return kcnames && uservalues ? (
    <Progressbar kcnames={kcnames} uservalues={uservalues} groupvalues={groupvalues} />
  ) : (
    <>potato fail:kcnames or values not provided</>
  );
};

export default PBLoad;
