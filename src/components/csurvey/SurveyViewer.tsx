import {
  VStack,
  Center,
  Text,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import Choice from "./Choice";
import Ranked from "./Ranked";
import { Answers, SVP, reset } from "./Answers";
import dynamic from "next/dynamic";
import { ComponentProps, useEffect, useState } from "react";
import type { ExType } from "../lvltutor/Tools/ExcerciseType";
import { useAction } from "../../utils/action";

export interface SD {
  title: string;
  code: string;
  description?: string;
  items: Array<{
    id: string;
    index: number;
    content: {
      type: string;
      text?: string;
      rankedLabel?: Array<string>;
      options?: Array<string>;
      expression?: string;
    };
  }>;
  tags: Array<string>;
}

export function handleInitialexpresion(e: ExType, svd: SD) {
  let ejercicio = e;
  let exp = "";
  if (
    ejercicio.type.localeCompare("ecc5s") == 0 ||
    ejercicio.type.localeCompare("secl5s") == 0 ||
    ejercicio.type.localeCompare("ecl2s") == 0
  )
    exp = ejercicio.eqc;
  else if (ejercicio.type.localeCompare("wordProblem") == 0) exp = "";
  else if (ejercicio.initialExpression != undefined) exp = ejercicio.initialExpression;
  else exp = ejercicio.steps[0].expression;

  //deep copy needed --generates converting civular structure to json error?
  //var d = JSON.stringify(svd);
  //var dd = JSON.parse(d);
  let d: Partial<SD> = {};
  for (const key in svd) {
    d[key] = svd[key];
  }
  d.items.unshift({ id: "-1", index: -1, content: { type: "expression", expression: exp } });
  d.items.unshift({ id: "-1", index: -1, content: { type: "text", text: ejercicio.text } });

  return d;
}

const MathComponent = dynamic<ComponentProps<typeof import("mathjax-react").MathComponent>>(
  () => import("mathjax-react").then(v => v.MathComponent),
  {
    ssr: false,
  },
);

const SurveyContent = ({ data }: { data: SD }) => {
  return (
    <VStack align={"center"}>
      {data.items && data.items.length > 0
        ? data.items.map((e, i) => {
            if (e.content.type.localeCompare("slider100") == 0)
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
                      {e.content.text}
                    </Text>
                  </>
                  <>
                    <Ranked index={i} key={"sbq" + i} itemText={e.content.text} itemId={e.id} />
                  </>
                  <Grid
                    key={"GSV" + i}
                    color="white"
                    templateColumns="repeat(11, 1fr)"
                    pt="2"
                    fontSize={["xs", "xs", "xs", "md"]}
                  >
                    <GridItem textAlign="left" colSpan={3} key={"GiSV1" + i}>
                      {e.content.rankedLabel ? e.content.rankedLabel[0] : ""}
                    </GridItem>
                    <GridItem colSpan={1} key={"GiSV2" + i} />
                    <GridItem textAlign="center" colSpan={3} key={"GiSV3" + i}>
                      {e.content.rankedLabel ? e.content.rankedLabel[1] : ""}
                    </GridItem>
                    <GridItem colSpan={1} key={"GiSV4" + i} />
                    <GridItem textAlign="right" colSpan={3} key={"GiSV5" + i}>
                      {e.content.rankedLabel ? e.content.rankedLabel[2] : ""}
                    </GridItem>
                  </Grid>
                </VStack>
              );
            if (e.content.type.localeCompare("choice") == 0)
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
                      {e.content.text}
                    </Text>
                  </>
                  <Choice
                    index={i}
                    key={"sbq" + i}
                    options={e.content.options ? e.content.options : ["no options"]}
                    itemText={e.content.text}
                    itemId={e.id}
                  />
                </VStack>
              );
            if (e.content.type.localeCompare("expression") == 0)
              return (
                <Center
                  key={"BSV1" + i}
                  borderRadius={"md"}
                  px={2}
                  py={2}
                  w={["340px", "340px", "480px", "480px"]}
                  textAlign={"center"}
                >
                  <MathComponent tex={String.raw`${e.content.expression}`} display={false} />
                </Center>
              );
            if (e.content.type.localeCompare("text") == 0)
              return (
                <Text key={"TSV1" + i} fontWeight="bold">
                  {e.content.text}
                </Text>
              );
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
    required = Answers.ans[e].didreply && required;
  }
  return close ? required : false;
}

function BasicUsage({ data, topicId }: { data: SD; topicId: string }) {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const action = useAction();

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
          <ModalHeader alignSelf={"center"}>{data.title}</ModalHeader>
          <ModalBody>
            <SurveyContent data={data} />
            <Center pt="4">
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  if (handleAnswer()) {
                    let ak = [];
                    console.log(Answers.ans);
                    for (var e in Answers.ans) {
                      ak.push(Answers.ans[e]);
                    }
                    action({
                      verbName: "pollResponse",
                      topicID: topicId,
                      extra: {
                        pollCode: data.code,
                        context: data.items[0].content.expression
                          ? data.items[0].content.expression
                          : "-1",
                        responses: ak,
                      },
                    });
                    onClose();
                    SVP.topicselect = false;
                  }
                  Answers.sumbmit = true;
                }}
              >
                Enviar
              </Button>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export const SurveyViewer = ({
  data,
  topicId,
  iExp,
}: {
  data: SD;
  topicId: string;
  iExp?: ExType;
}) => {
  const [d, setD] = useState<SD>();
  useEffect(() => {
    reset();
    if (iExp != undefined) setD(handleInitialexpresion(iExp, data) as SD);
    else setD(data);
  }, []);
  return <>{d != undefined ? <BasicUsage data={d} topicId={topicId} /> : null}</>;
};
