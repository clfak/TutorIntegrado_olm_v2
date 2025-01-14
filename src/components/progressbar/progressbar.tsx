import {
  HStack,
  Box,
  Image,
  Text,
  Grid,
  GridItem,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  Button,
} from "@chakra-ui/react";

function Pbinfo() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button size="xs" borderRadius={"full"} bg="teal.500" fontSize={"xs"}>
          i
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody textColor={"black"}>potato</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

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
  deltau,
}: {
  uservalues: number;
  groupvalues: number;
  uLabel?: string;
  gLabel?: string;
  deltau?: string;
}) => {
  let pw = wstring(uservalues);
  let pwg = wstring(groupvalues);

  let label1 = pw;
  if (uLabel) label1 = uLabel;

  let label2 = pwg;
  if (gLabel) label2 = gLabel;
  return (
    <>
      <Grid
        color="white"
        templateColumns={[
          "repeat(13, 1fr)",
          "repeat(13, 1fr)",
          "repeat(13, 1fr)",
          "repeat(12, 1fr)",
        ]}
        pt={["0", "0", "0", "2"]}
        fontSize={["xs", "xs", "xs", "md"]}
        templateRows="repeat(3, 1fr)"
        w={["90%", "90%", "90%", "100%"]}
      >
        <GridItem textAlign="right" colSpan={[4, 4, 4, 3]}>
          <Text pr="2" alignSelf="center">
            Yo
          </Text>
        </GridItem>
        <GridItem textAlign="center" colSpan={[5, 5, 5, 6]} pt={["1", "1", "1", "2"]}>
          <Box w="100%" bg={"white"} border={"2px"} borderColor={"white"}>
            <Box bg={"green.300"} w={pw} textAlign="center" h={"8px"} />
          </Box>
        </GridItem>
        <GridItem textAlign="left" colSpan={1}>
          <Text pl="1" color={"white"}>
            {label1}
          </Text>
        </GridItem>
        <GridItem
          textAlign="center"
          alignSelf={"center"}
          colSpan={[2, 2, 2, 1]}
          pt={["0", "0", "0", "1"]}
          pl={"2"}
        >
          {deltau != undefined ? (
            <Text
              color={"white"}
              bg={Number(deltau) >= 0 ? "green.500" : "red.500"}
              borderRadius="md"
              fontSize={"xs"}
            >
              {Number(deltau) > 0 ? "+" + deltau : deltau}
            </Text>
          ) : (
            ""
          )}
        </GridItem>
        <GridItem pl="4" colSpan={1} rowSpan={2} pt={["1.5", "1.5", "1.5", "2"]}>
          {Pbinfo()}
        </GridItem>
        <GridItem textAlign="right" colSpan={[4, 4, 4, 3]}>
          <Text pr="2" alignSelf="center">
            Grupo
          </Text>
        </GridItem>
        <GridItem textAlign="center" colSpan={[5, 5, 5, 6]} pt={["1", "1", "1", "2"]}>
          <Box w="100%" bg={"white"} border={"2px"} borderColor={"white"}>
            <Box bg={"gray.500"} w={pwg} textAlign="center" h={"8px"} />
          </Box>
        </GridItem>
        <GridItem textAlign="left" colSpan={1}>
          <Text pl="1" color={"white"}>
            {label2}
          </Text>
        </GridItem>
        <GridItem textAlign="left" colSpan={1} pt="1" />
      </Grid>
    </>
  );
};

const Progress = ({
  uservalues,
  uLabel,
  deltau,
}: {
  uservalues: number;
  uLabel?: string;
  deltau?: string;
}) => {
  let pw = wstring(uservalues);
  let label1 = pw;
  if (uLabel) label1 = uLabel;
  return (
    <>
      <Grid
        color="white"
        templateColumns={[
          "repeat(13, 1fr)",
          "repeat(13, 1fr)",
          "repeat(13, 1fr)",
          "repeat(12, 1fr)",
        ]}
        pt={["0", "0", "0", "2"]}
        fontSize={["xs", "xs", "xs", "md"]}
        w={["90%", "90%", "90%", "100%"]}
      >
        <GridItem textAlign="right" colSpan={[4, 4, 4, 3]}>
          <Text pr="2" alignSelf="center">
            Yo
          </Text>
        </GridItem>
        <GridItem textAlign="center" colSpan={[5, 5, 5, 6]} pt={["1", "1", "1", "2"]}>
          <Box w="100%" bg={"white"} border={"2px"} borderColor={"white"}>
            <Box bg={"green.300"} w={pw} textAlign="center" h={"8px"} />
          </Box>
        </GridItem>
        <GridItem textAlign="left" colSpan={1}>
          <Text pl="1" color={"white"}>
            {label1}
          </Text>
        </GridItem>
        <GridItem textAlign="center" colSpan={[2, 2, 2, 1]} pt={["0", "0", "0", "1"]} pl={"2"}>
          {deltau != undefined ? (
            <Text
              color={"white"}
              bg={Number(deltau) >= 0 ? "green.500" : "red.500"}
              borderRadius="md"
              fontSize={"xs"}
            >
              {Number(deltau) > 0 ? "+" + deltau : deltau}
            </Text>
          ) : (
            ""
          )}
        </GridItem>
        <GridItem pl="4" colSpan={1}>
          {Pbinfo()}
        </GridItem>
      </Grid>
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
    <HStack p={0} spacing={0} maxW={maxW} paddingTop="2">
      <Image src="/img/mateo.png" alt="Logo" w="28px" h="28px" align={"left"} />
      <Box style={before2}></Box>
      <Box bg={"white"} borderRadius="md" p={1} w={["70%", "70%", "70%", "80%"]}>
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
  deltau,
}: {
  uservalues: number;
  groupvalues?: number;
  msg?: string;
  dMaxW?: string;
  uLabel?: string;
  gLabel?: string;
  deltau?: string;
}) => {
  let minw = "275px";
  let minh = "50px";

  return (
    <Box minW={minw} minH={minh} p={1}>
      {groupvalues ? (
        <ProgressComparison
          uservalues={uservalues}
          groupvalues={groupvalues}
          uLabel={uLabel}
          gLabel={gLabel}
          deltau={deltau}
        />
      ) : (
        <Progress uservalues={uservalues} uLabel={uLabel} deltau={deltau} />
      )}
      {msg ? Encouragement(msg, dMaxW) : <></>}
    </Box>
  );
};

export default Progressbar;
