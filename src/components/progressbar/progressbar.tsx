import { HStack, Box, Image, Text } from "@chakra-ui/react";

const wstring = (value: number) => {
  //Creating a % string for width size
  let val = value * 100;
  let w = val.toFixed(0) + "%";
  return w;
};

const ProgressComparison = ({
  uservalues,
  groupvalues,
  uLabel,
  gLabel,
}: {
  uservalues: number;
  groupvalues: number;
  uLabel?: string;
  gLabel?: string;
}) => {
  let pw = wstring(uservalues);
  let pwg = wstring(groupvalues);

  let label1 = "Yo: " + pw;
  if (uLabel) label1 = uLabel;

  let label2 = "Grupo: " + pwg;
  if (gLabel) label2 = gLabel;

  return (
    <>
      <HStack w={"100%"} align="center" justify="center">
        <Box w="65%" bg={"white"} border={"2px"} borderColor={"white"}>
          <Box bg={"green.300"} w={pw} textAlign="center" h={"8px"} />
        </Box>
        <Text w={"35%"} color={"white"} fontSize="sm">
          {label1}
        </Text>
      </HStack>
      <HStack w={"100%"} align="center" justify="center">
        <Box w="65%" bg={"white"} border={"2px"} borderColor={"white"}>
          <Box bg={"gray.500"} w={pwg} textAlign="center" h={"8px"} />
        </Box>
        <Text w={"35%"} color={"white"} fontSize="sm">
          {label2}
        </Text>
      </HStack>
    </>
  );
};

const Progress = ({ uservalues, uLabel }: { uservalues: number; uLabel?: string }) => {
  let pw = wstring(uservalues);
  let label1 = "Yo: " + pw;
  if (uLabel) label1 = uLabel;
  return (
    <>
      <HStack w={"100%"} align="center" justify="center">
        <Box w="70%" bg={"white"} border={"2px"} borderColor={"white"}>
          <Box bg={"green.300"} w={pw} textAlign="center" h={"8px"} />
        </Box>
        <Text w={"30%"} color={"white"} fontSize="sm">
          {label1}
        </Text>
      </HStack>
    </>
  );
};

const before2 = {
  content: "",
  width: "0px",
  height: "0px",
  "border-right": "7px solid white",
  "border-left": "7px solid transparent",
  "border-bottom": "7px solid white",
  "border-top": "7px solid transparent",
};

const Encouragement = (msg: string, maxW?: string) => {
  return (
    <HStack p={0} spacing={0} maxW={maxW}>
      <Image src="/img/mateo.png" alt="Logo" w="28px" h="28px" align={"left"} />
      <Box style={before2}></Box>
      <Box bg={"white"} borderRadius="md" p={1} w={"80%"}>
        <Text noOfLines={[3]} color="black">
          {msg}
        </Text>
      </Box>
    </HStack>
  );
};

export const Progressbar = ({
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
  let minw = "240px";
  let minh = "50px";

  return (
    <Box minW={minw} minH={minh} p={1}>
      {groupvalues ? (
        <ProgressComparison
          uservalues={uservalues}
          groupvalues={groupvalues}
          uLabel={uLabel}
          gLabel={gLabel}
        />
      ) : (
        <Progress uservalues={uservalues} uLabel={uLabel} />
      )}
      {msg ? Encouragement(msg, dMaxW) : <></>}
    </Box>
  );
};

export default Progressbar;
