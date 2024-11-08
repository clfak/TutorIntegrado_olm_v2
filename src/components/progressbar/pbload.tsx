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
  msg,
}: {
  uservalues: number;
  groupvalues?: number;
  msg?: { lt: string; gt: string };
}) => {
  return uservalues ? (
    msg ? (
      <Progressbar uservalues={uservalues} groupvalues={groupvalues} msg={msg} />
    ) : (
      <Progressbar uservalues={uservalues} groupvalues={groupvalues} />
    )
  ) : (
    <>potato fail:values not provided</>
  );
};

export default PBLoad;
