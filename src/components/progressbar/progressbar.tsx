import { HStack, Box, Tooltip, Image, Text } from "@chakra-ui/react";

interface model {
  mth: number;
  level: number;
}

const pval = (kcnames: Array<string>, uservalues: Record<string, model>): number => {
  let val = 0;
  let length = kcnames.length;
  if (length > 1) {
    for (var k of kcnames) {
      let value = uservalues[k];
      if (!value) continue;
      let value2 = value.level;
      if (!value || !value2) {
        length = length - 1;
        continue;
      }
      val = val + value2;
    }
    if (length > 0) val = val / length;
    else val = 0;
  } else {
    let value = uservalues[kcnames[0]];
    if (value) val = value.level;
  }
  return val;
};

const wstring = (value: number) => {
  //Creating a % string for width size
  let val = Number(value.toPrecision(2)) * 100;
  let w = String(val) + "%";
  return w;
};

const ProgressComparison = ({
  kcnames,
  uservalues,
  groupvalues,
}: {
  kcnames: Array<string>;
  uservalues: Record<string, model>;
  groupvalues: Record<string, model>;
}) => {
  let v = pval(kcnames, uservalues);
  let ov = pval(kcnames, groupvalues);

  let maxw = wstring(v);
  let diffw = wstring(v - ov);
  let bgc = "teal.300";
  let label = "Tu dominio aumento un ";

  if (ov > v) {
    maxw = wstring(ov);
    diffw = wstring(ov - v);
    bgc = "red.300";
    label = "Tu dominio disminuyo un ";
  }

  return (
    <HStack w={"240px"} bg={"gray.50"} h={"40px"} borderRadius="md" padding={1}>
      <HStack border={"1px"} borderRadius="md" bg={"gray.300"} w={"100%"} spacing={0}>
        <Tooltip label="Este es tu progreso de dominio Anterior">
          <Box borderLeftRadius="md" bg={"green.300"} w={maxw} textAlign="center" minW={12}>
            {maxw}
          </Box>
        </Tooltip>
        <Tooltip label={label + diffw}>
          <Box borderRightRadius="md" bg={bgc} w={diffw} textAlign="center" minW={12}>
            {diffw}
          </Box>
        </Tooltip>
      </HStack>
    </HStack>
  );
};

const Progress = ({
  kcnames,
  uservalues,
}: {
  kcnames: Array<string>;
  uservalues: Record<string, model>;
}) => {
  let v = pval(kcnames, uservalues);

  let pw = wstring(v);

  return (
    <Box w={"240px"} h={"100px"} p={0}>
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
    </Box>
  );
};

export const Progressbar = ({
  kcnames,
  uservalues,
  groupvalues,
}: {
  kcnames: Array<string>;
  uservalues: Record<string, model>;
  groupvalues?: Record<string, model>;
}) => {
  return (
    <>
      {groupvalues ? (
        <ProgressComparison kcnames={kcnames} uservalues={uservalues} groupvalues={groupvalues} />
      ) : (
        <Progress kcnames={kcnames} uservalues={uservalues} />
      )}
    </>
  );
};

export default Progressbar;
