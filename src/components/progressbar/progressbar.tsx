import { HStack, Box, Image, Text } from "@chakra-ui/react";

const wstring = (value: number) => {
  //Creating a % string for width size
  let val = Number(value.toPrecision(2)) * 100;
  let w = String(val) + "%";
  return w;
};

const ProgressComparison = ({
  uservalues,
  groupvalues,
}: {
  uservalues: number;
  groupvalues: number;
}) => {
  let pw = wstring(uservalues);
  let pwg = wstring(groupvalues);

  return (
    <>
      <HStack w={"100%"} align="center" justify="center">
        <Box w="65%" bg={"white"} border={"2px"} borderColor={"white"}>
          <Box bg={"green.300"} w={pw} textAlign="center" h={"8px"} />
        </Box>
        <Text w={"35%"} color={"white"} fontSize="sm">
          Yo: {pw}
        </Text>
      </HStack>
      <HStack w={"100%"} align="center" justify="center">
        <Box w="65%" bg={"white"} border={"2px"} borderColor={"white"}>
          <Box bg={"gray.500"} w={pwg} textAlign="center" h={"8px"} />
        </Box>
        <Text w={"35%"} color={"white"} fontSize="sm">
          Grupo: {pwg}
        </Text>
      </HStack>
    </>
  );
};

const Progress = ({ uservalues }: { uservalues: number }) => {
  let pw = wstring(uservalues);

  return (
    <>
      <HStack w={"100%"} align="center" justify="center">
        <Box w="70%" bg={"white"} border={"2px"} borderColor={"white"}>
          <Box bg={"green.300"} w={pw} textAlign="center" h={"8px"} />
        </Box>
        <Text w={"30%"} color={"white"} fontSize="sm">
          Yo: {pw}
        </Text>
      </HStack>
      <HStack>
        <Image src="/img/mateo.png" alt="Logo" w="28px" h="28px" align={"left"} />
        <Box
          w={"200px"}
          h={"50px"}
          bgImage={"url('/img/dialogbubble2.png')"}
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize={"cover"}
        >
          <Text fontSize="sm" paddingLeft={5} paddingRight={1} paddingTop={0.5}>
            ¡Vamos, con un par de ejercicio mas los alcanzas!
          </Text>
        </Box>
      </HStack>
    </>
  );
};

const Encouragement = (msg: string) => {
  return (
    <HStack>
      <Image src="/img/mateo.png" alt="Logo" w="28px" h="28px" align={"left"} />
      <Box
        w={"200px"}
        h={"50px"}
        bgImage={"url('/img/dialogbubble2.png')"}
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize={"cover"}
      >
        <Text fontSize="sm" paddingLeft={5} paddingRight={1} paddingTop={0.5}>
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
}: {
  uservalues: number;
  groupvalues?: number;
  msg?: { lt: string; gt: string };
}) => {
  let enc = false;
  let emsg = "";
  let w = "240px";
  let h = "50px";

  if (msg) {
    enc = true;
    h = "100px";
    if (uservalues < groupvalues) emsg = msg.lt;
    else emsg = msg.gt;
  }
  return (
    <Box w={w} h={h} p={0}>
      {groupvalues ? (
        <ProgressComparison uservalues={uservalues} groupvalues={groupvalues} />
      ) : (
        <Progress uservalues={uservalues} />
      )}
      {enc ? Encouragement(emsg) : <></>}
    </Box>
  );
};

export default Progressbar;
