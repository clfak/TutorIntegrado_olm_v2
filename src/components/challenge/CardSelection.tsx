import { Heading, Text, useColorModeValue, HStack, Center, Divider, Box } from "@chakra-ui/react";

//import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { selectionDataType, sessionState, sessionStateBD } from "../SessionState";
import type { ExType } from "../../components/lvltutor/Tools/ExcerciseType";
//import { MathComponent } from "mathjax-react";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import { useAction } from "../../utils/action";
import parameters from "../contentSelectComponents/parameters.json";

const MathComponent = dynamic<ComponentProps<typeof import("mathjax-react").MathComponent>>(
  () => import("mathjax-react").then(v => v.MathComponent),
  {
    ssr: false,
  },
);
export const CardSelection = ({
  id,
  code,
  description,
  label,
  json,
  kcs,
  selectionTitle,
  selectionText,
  selectionBest,
  registerTopic,
  nextContentPath,
  selectionData,
  indexSelectionData,
  setShowContent,
}: {
  id: string;
  code: string | undefined;
  description: string | undefined;
  label: string | undefined;
  json: ExType | undefined;
  kcs: Object[];
  selectionTitle: string | undefined;
  selectionText: string | undefined;
  selectionBest: boolean;
  registerTopic: string;
  nextContentPath: string | undefined;
  selectionData: selectionDataType[];
  indexSelectionData: number;
  setShowContent: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const action = useAction();

  return (
    <>
      <Box
        color="white"
        bg={useColorModeValue("blue.700", "gray.800")}
        _hover={{
          color: "white",
          bg: useColorModeValue("blue.900", "gray.600"),
        }}
        as="article"
        maxW="sm"
        p="3"
        borderWidth="1px"
        rounded="md"
        textAlign="center"
        onClick={() => {
          setShowContent(true);
          sessionState.currentContent.id = id; //identificador del ejercicio
          sessionState.currentContent.code = code; //code de sessionState
          sessionState.currentContent.description = description; //descripcion del ejercicio ofrecido
          sessionState.currentContent.label = label; //enunciado o tipo de ejercicio
          sessionState.currentContent.json = json; //json del ejercicio
          sessionState.currentContent.kcs = kcs; //kcs del ejercicio
          sessionState.selectionData = selectionData;
          sessionState.selectionData[indexSelectionData].optionSelected = true;
          sessionStateBD.setItem(
            "currentContent",
            JSON.parse(JSON.stringify(sessionState.currentContent)),
          );
          sessionStateBD.setItem(
            "selectionData",
            JSON.parse(JSON.stringify(sessionState.selectionData)),
          );

          sessionState.topic = registerTopic;
          sessionStateBD.setItem("topic", sessionState.topic);

          sessionState.nextContentPath = nextContentPath;
          sessionStateBD.setItem("nextContentPath", sessionState.nextContentPath);

          action({
            verbName: "selectContent",
            contentID: code,
            topicID: registerTopic,
            extra: { selectionData: sessionState.selectionData },
          });
        }}
      >
        <Center>
          <HStack>
            <Heading size="md" my="2" textAlign="center">
              {selectionTitle}
            </Heading>
            {selectionBest && <FaStar size={20} color="yellow" />}
          </HStack>
        </Center>

        <Text fontSize={"sm"}>{selectionText}</Text>

        <Divider my="3" />

        {json.type == "ecc5s" || json.type == "secl5s" || json.type == "ecl2s" ? (
          <TeX>{json.title}</TeX>
        ) : json.type == "wordProblem" ? (
          <Text fontSize=".8em">
            {parameters.card.text}{" "}
            <span style={{ fontWeight: "bold" }}>{json.presentation.title}</span>
          </Text>
        ) : (
          <Text fontSize=".8em">
            {parameters.card.text} <span style={{ fontWeight: "bold" }}>{json.title}</span>
          </Text>
        )}

        <Text paddingTop={"2"} fontSize={"sm"}>
          {json.text}
        </Text>

        <Center fontSize={"1xl"} paddingBottom={"3"} paddingTop={"1"}>
          {json.type == "ecc5s" || json.type == "secl5s" || json.type == "ecl2s" ? (
            <MathComponent tex={String.raw`${json.eqc}`} display={false} />
          ) : json.type === "wordProblem" ? (
            <MathComponent tex={String.raw`${""}`} display={false} />
          ) : json.initialExpression ? (
            <MathComponent tex={String.raw`${json.initialExpression}`} display={false} />
          ) : (
            <MathComponent tex={String.raw`${json.steps[0].expression}`} display={false} />
          )}
        </Center>
      </Box>
    </>
  );
};
