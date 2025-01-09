import { LinkBox, Heading, Center, HStack, LinkOverlay, Text, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import PBLoad from "../progressbar/pbload";
import { progresscalc } from "../progressbar/progresscalc";
import { gModel, kcsyejercicio, selectedExcercise, uModel } from "../../utils/startModel";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const MathComponent = dynamic<ComponentProps<typeof import("mathjax-react").MathComponent>>(
  () => import("mathjax-react").then(v => v.MathComponent),
  {
    ssr: false,
  },
);

const listakcs = (kcs: { code: string }[]): string[] => {
  let kcnames: Array<string> = [];
  for (var kc of kcs) {
    let value = kc.code;
    if (!value) continue;
    kcnames.push(value);
  }
  return kcnames;
};

export const CardSelectionTopic = ({
  id,
  label,
  registerTopic,
  //nextContentPath,
  index,
  KCs,
}: {
  id: string;
  label: string | undefined;
  registerTopic: string;
  //nextContentPath: string | undefined;
  KCs: { code: string }[];
  index: number;
}) => {
  const topicPath = `contentSelect?topic=${id}&registerTopic=${id}`;
  console.log("id topico ", topicPath);

  let pbValues = {
    uservalues: 0,
  };

  if (!uModel.isLoading) {
    pbValues.uservalues = progresscalc(listakcs(KCs), uModel.data);
    if (uModel.osml) pbValues["groupvalues"] = progresscalc(listakcs(KCs), gModel.data);
    if (uModel.motivmsg) pbValues["msg"] = "potato";
  }

  return (
    <Box bg="blue.700" rounded="md">
      <LinkBox
        as="article"
        w={"100%"}
        maxW="md"
        p="4"
        borderRadius="md"
        textAlign="center"
        color="white"
        bg="blue.700"
        _hover={{
          color: "white",
          bg: "blue.900",
        }}
        minH="100px"
        onClick={() => {
          if (KCs && KCs.length > 0) {
            kcsyejercicio.lista = listakcs(KCs);
            kcsyejercicio.ejercicio = selectedExcercise.ejercicio[index];
          }
        }}
      >
        <Center>
          <HStack>
            <Heading size="md" my="2" textAlign="center" minH="70px">
              {label}
            </Heading>
          </HStack>
        </Center>
        {selectedExcercise.ejercicio[index] ? (
          <Center fontSize={"1xl"} paddingBottom={"3"} paddingTop={"1"}>
            {selectedExcercise.ejercicio[index].type == "ecc5s" ||
            selectedExcercise.ejercicio[index].type == "secl5s" ||
            selectedExcercise.ejercicio[index].type == "ecl2s" ? (
              <MathComponent
                tex={String.raw`${selectedExcercise.ejercicio[index].eqc}`}
                display={false}
              />
            ) : selectedExcercise.ejercicio[index].type === "wordProblem" ? (
              <MathComponent tex={String.raw`${""}`} display={false} />
            ) : selectedExcercise.ejercicio[index].initialExpression ? (
              <MathComponent
                tex={String.raw`${selectedExcercise.ejercicio[index].initialExpression}`}
                display={false}
              />
            ) : (
              <MathComponent
                tex={String.raw`${selectedExcercise.ejercicio[index].steps[0].expression}`}
                display={false}
              />
            )}
          </Center>
        ) : (
          <></>
        )}
        {/* Muestra los KCs asociados 
        <VStack spacing={1} align="start" mt={2}>
          {KCs.map(kc => (
            <Text key={kc.code} fontSize={"sm"}>
              {kc.code}
            </Text>
          ))}
        </VStack>*/}

        <NextLink href={topicPath} passHref>
          <LinkOverlay>
            <Text paddingTop={"2"} fontSize={"sm"}></Text>
          </LinkOverlay>
        </NextLink>
        {PBLoad(pbValues)}
      </LinkBox>
    </Box>
  );
};
