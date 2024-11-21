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
  dMaxW,
  uLabel,
  gLabel,
}: {
  uservalues: number;
  groupvalues?: number;
  msg?: string;
  dMaxW?: string;
  uLabel?: string;
  gLabel?: string;
}) => {
  return uservalues ? (
    <Progressbar
      uservalues={uservalues}
      groupvalues={groupvalues}
      msg={msg}
      dMaxW={dMaxW}
      uLabel={uLabel}
      gLabel={gLabel}
    />
  ) : (
    <>potato fail:values not provided</>
  );
};

export default PBLoad;
