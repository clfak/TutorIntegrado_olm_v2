import {
  VStack,
  Center,
  Text,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import Choice from "./Choice";
import Ranked from "./Ranked";
import { Answers, SVP } from "./Answers";
import { kcsyejercicio } from "../../utils/startModel";
import type { ExType } from "../lvltutor/Tools/ExcerciseType";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

interface SD {
  name: string;
  code: string;
  questions: Array<{
    type: string;
    label?: string;
    imgurl?: string;
    rankedLabel?: Array<string>;
    option?: Array<string>;
    expression?: string;
  }>;
}

const MathComponent = dynamic<ComponentProps<typeof import("mathjax-react").MathComponent>>(
  () => import("mathjax-react").then(v => v.MathComponent),
  {
    ssr: false,
  },
);

const SurveyContent = ({ data }: { data: SD }) => {
  let ejercicio = kcsyejercicio.ejercicio as ExType;
  return (
    <VStack align={"center"}>
      {data.questions && data.questions.length > 0
        ? data.questions.map((e, i) => {
            if (e.type.localeCompare("ranked") == 0)
              return (
                <VStack
                  key={"VSSV" + i}
                  borderRadius={"md"}
                  bg={"blue.700"}
                  px={2}
                  py={2}
                  align={"center"}
                  maxH={"240px"}
                  w={["340px", "340px", "480px", "480px"]}
                >
                  <>
                    <Text
                      key={"TSV1" + i}
                      color={"white"}
                      fontSize={["xs", "xs", "xs", "md"]}
                      w={"90%"}
                      noOfLines={3}
                    >
                      {e.label}
                    </Text>
                  </>
                  <>
                    <Ranked index={i} key={"sbq" + i} />
                  </>
                  <Grid
                    key={"GSV" + i}
                    color="white"
                    templateColumns="repeat(11, 1fr)"
                    pt="2"
                    fontSize={["xs", "xs", "xs", "md"]}
                  >
                    <GridItem textAlign="left" colSpan={3} key={"GiSV1" + i}>
                      {e.rankedLabel ? e.rankedLabel[0] : ""}
                    </GridItem>
                    <GridItem colSpan={1} key={"GiSV2" + i} />
                    <GridItem textAlign="center" colSpan={3} key={"GiSV3" + i}>
                      {e.rankedLabel ? e.rankedLabel[1] : ""}
                    </GridItem>
                    <GridItem colSpan={1} key={"GiSV4" + i} />
                    <GridItem textAlign="right" colSpan={3} key={"GiSV5" + i}>
                      {e.rankedLabel ? e.rankedLabel[2] : ""}
                    </GridItem>
                  </Grid>
                </VStack>
              );
            if (e.type.localeCompare("choice") == 0)
              return (
                <VStack
                  key={"VSSV" + i}
                  borderRadius={"md"}
                  bg={"blue.700"}
                  px={2}
                  py={2}
                  align={"center"}
                  w={["340px", "340px", "480px", "480px"]}
                >
                  <>
                    <Text
                      key={"TSV1" + i}
                      color={"white"}
                      fontSize={["xs", "xs", "xs", "md"]}
                      w={"90%"}
                      noOfLines={3}
                    >
                      {e.label}
                    </Text>
                  </>
                  <Choice
                    index={i}
                    key={"sbq" + i}
                    options={e.option ? e.option : ["no options"]}
                  />
                </VStack>
              );
            if (e.type.localeCompare("expression") == 0)
              return (
                <Center
                  key={"BSV1" + i}
                  borderRadius={"md"}
                  bg={"blue.700"}
                  px={2}
                  py={2}
                  w={["340px", "340px", "480px", "480px"]}
                  textAlign={"center"}
                  textColor={"white"}
                >
                  {ejercicio.type == "ecc5s" ||
                  ejercicio.type == "secl5s" ||
                  ejercicio.type == "ecl2s" ? (
                    <MathComponent tex={String.raw`${ejercicio.eqc}`} display={false} />
                  ) : ejercicio.type === "wordProblem" ? (
                    <MathComponent tex={String.raw`${""}`} display={false} />
                  ) : ejercicio.initialExpression ? (
                    <MathComponent
                      tex={String.raw`${ejercicio.initialExpression}`}
                      display={false}
                    />
                  ) : (
                    <MathComponent
                      tex={String.raw`${ejercicio.steps[0].expression}`}
                      display={false}
                    />
                  )}
                </Center>
              );
            //if (e.type.localeCompare("text")==0) return <TextAnswerView index={i} key={"sbq"+i}/>;
            return 0;
          })
        : 0}
    </VStack>
  );
};

function handleAnswer() {
  var close = false;
  var required = true;
  for (var e in Answers.ans) {
    if (!close) close = true;
    required = Answers.ans[e][0].didreply && required;
  }
  return close ? required : false;
}

function BasicUsage({ data }: { data: SD }) {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        //scrollBehavior="inside"
        size={"full"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{data.name}</ModalHeader>
          <ModalBody>
            <SurveyContent data={data} />
          </ModalBody>

          <ModalFooter alignSelf="center">
            <Center>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  if (handleAnswer()) {
                    onClose();
                    SVP.topicselect = false;
                  }
                  Answers.sumbmit = true;
                }}
              >
                Enviar
              </Button>
            </Center>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export const SurveyViewer = ({ data }: { data: SD }) => {
  return (
    <>
      <BasicUsage data={data} />
    </>
  );
};
