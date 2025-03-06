import {
  Box,
  useRadio,
  useRadioGroup,
  HStack,
  Button,
  Alert,
  AlertIcon,
  VStack,
  Text,
  Grid,
  GridItem,
  Center,
  SimpleGrid,
} from "@chakra-ui/react";
import Hint from "../../Hint";
import MQStaticMathField from "../../../utils/MQStaticMathField";
import { useSnapshot } from "valtio";
import type { option, Step } from "./ExcerciseType";
import { useState, useEffect, useRef } from "react";
import MQProxy from "./MQProxy";
import { useAction } from "../../../utils/action";
import Latex from "react-latex-next";

const Enabledhint = ({
  disablehint,
  step,
  latex,
  setLastHint,
}: {
  disablehint: boolean;
  step: Step;
  latex: string;
  setLastHint: (hint: boolean) => void;
}) => {
  const mqSnap = useSnapshot(MQProxy);

  const [error, setError] = useState(false);
  const [hints, setHints] = useState(0);

  useEffect(() => {
    MQProxy.error = error;
  }, [error]);

  useEffect(() => {
    setError(mqSnap.error);
  }, [mqSnap.error]);

  useEffect(() => {
    MQProxy.hints = hints;
  }, [hints]);

  if (disablehint) {
    return <></>;
  } else {
    return (
      <Hint
        hints={step.hints}
        contentId={mqSnap.content}
        topicId={mqSnap.topicId}
        stepId={step.stepId}
        matchingError={step.matchingError}
        response={[latex]}
        error={error}
        setError={setError}
        hintCount={hints}
        setHints={setHints}
        setLastHint={setLastHint}
      ></Hint>
    );
  }
};

function handleAnswer(
  oans: option,
  ans: Array<option>,
  uans: string,
  attemps: number,
  stepid: string,
) {
  let correctAns = false;
  let at: "info" | "warning" | "success" | "error" | undefined;
  let output = {
    result: 0,
    attempts: attemps,
    alerttype: at,
    alertmsg: "potato",
    alerthidden: false,
  };

  for (var e of ans) if (e.correct && ("" + e.id).localeCompare(uans) == 0) correctAns = true;

  //console.log(validationType, correctAns);
  if (correctAns) {
    output.result = 1;
    MQProxy.endDate = Date.now();
    MQProxy.defaultIndex = [parseInt(stepid), parseInt(stepid) + 1];
    MQProxy.error = false;
  } else {
    output.result = 0;
    output.alerttype = "error";
    output.alertmsg = "No has elegido una respuesta!.";
    output.alerthidden = false;
    MQProxy.error = true;
  }
  if (oans != undefined) {
    if (oans.feedbackMsg != undefined) {
      output.alertmsg = oans.feedbackMsg;
      MQProxy.spaghettimsg = oans.feedbackMsg;
    } else {
      MQProxy.spaghettimsg = undefined;
    }
    if (oans.feedbackMsgExp != undefined) {
      MQProxy.spaghettimsgexp = oans.feedbackMsgExp;
    } else {
      MQProxy.spaghettimsgexp = undefined;
    }
  }

  MQProxy.submit = true;
  output.attempts = attemps + 1;

  return output;
}

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={1}
        py={1}
        w={"100%"}
        h={"100%"}
      >
        {props.children}
      </Box>
    </Box>
  );
}

function ChoiceContent(option: option) {
  let text = option.text;
  let exp = option.expression;
  return (
    <VStack alignItems={"center"} alignContent={"center"}>
      {text ? <Text>{text}</Text> : null}
      {exp ? <Latex>{"$$" + exp + "$$"} </Latex> : null}
    </VStack>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function CChoice({
  step,
  content,
  topicId,
  disablehint,
  options,
}: {
  step: Step;
  content: string;
  topicId: string;
  disablehint: boolean;
  options: Array<option>;
}) {
  const answer = useRef("react");
  const [attempts, setAttempts] = useState(0);
  const [alertType, setAlertType] = useState<
    "info" | "warning" | "success" | "error" | undefined
  >();
  const [alertMsg, setAlertMsg] = useState("");
  const [alertHidden, setAlertHidden] = useState(true);
  const [lastHint, setLastHint] = useState(false);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "mathchoice",
    //defaultValue:"1",
    value: undefined,
    onChange: val => {
      answer.current = val;
    },
  });

  const group = getRootProps();
  const action = useAction();

  return (
    <>
      <SimpleGrid columns={[1, 1, 1, 2]} spacing={2} {...group}>
        {options.map(v => {
          const radio = getRadioProps({ value: String(v.id) });
          return (
            <RadioCard key={v.id} {...radio}>
              <Grid templateColumns="repeat(20, 1fr)">
                <GridItem colSpan={2} alignContent={"center"}>
                  <Box borderRadius={"full"} bg="black" h={"2"} w={"2"} />
                </GridItem>
                <GridItem colSpan={16}>
                  <Center>{ChoiceContent(v)}</Center>
                </GridItem>
              </Grid>
            </RadioCard>
          );
        })}
      </SimpleGrid>
      <HStack spacing="4px" alignItems="center" justifyContent="center" margin={"auto"} padding="4">
        <Box>
          <Button
            colorScheme="teal"
            height={"32px"}
            width={"88px"}
            onClick={() => {
              let ans = handleAnswer(
                step.multipleChoice[Number(answer.current)],
                step.multipleChoice,
                answer.current,
                attempts,
                step.stepId,
              );
              let ansv = "";
              for (let e of step.multipleChoice)
                if (("" + e.id).localeCompare(answer.current) == 0) {
                  if (e.expression) ansv = e.expression;
                  else ansv = e.text;
                }
              setAttempts(ans.attempts);
              setAlertType(ans.alerttype);
              setAlertMsg(ans.alertmsg);
              setAlertHidden(ans.alerthidden);
              action({
                verbName: "tryStep",
                stepID: "" + step.stepId,
                contentID: content,
                topicID: topicId,
                result: ans.result,
                kcsIDs: step.KCs,
                extra: {
                  response: [ansv],
                  attempts: attempts,
                  hints: MQProxy.hints,
                },
              });
              MQProxy.submitValues = {
                ans: ansv,
                att: attempts,
                hints: MQProxy.hints,
                lasthint: lastHint,
                fail: ans.result ? false : true,
                duration: 0,
              };
            }}
          >
            Enviar
          </Button>
        </Box>
        <Enabledhint
          disablehint={disablehint}
          step={step}
          latex={answer.current}
          setLastHint={setLastHint}
        />
      </HStack>
      <Alert key={"Alert" + topicId + "i"} status={alertType} mt={2} hidden={alertHidden}>
        <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(20, 1fr)">
          <GridItem rowSpan={1} colSpan={1}>
            <AlertIcon key={"AlertIcon" + topicId + "i"} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={19}>
            <Text alignSelf={"left"} alignItems="start">
              {"¡Inténtalo nuevamente! (intentos: " + attempts + ") " + alertMsg}
            </Text>
          </GridItem>
          <GridItem rowSpan={1} colSpan={20}>
            {MQProxy.spaghettimsgexp ? (
              <Center>
                <MQStaticMathField exp={MQProxy.spaghettimsgexp} currentExpIndex={true} />
              </Center>
            ) : null}
          </GridItem>
        </Grid>
      </Alert>
    </>
  );
}

//Fisher-yates shuffle algorithm
//https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle

function fishyShuffle(options: Array<option>) {
  let arr = options;
  let l = arr.length;
  for (let i = l - 1; i > 0; i--) {
    let s = Math.floor(Math.random() * l);
    let t = arr[s];
    arr[s] = arr[i];
    arr[i] = t;
  }
  console.log("a", arr);
  return arr;
}

function ShuffledLoad({
  step,
  content,
  topicId,
  disablehint,
}: {
  step: Step;
  content: string;
  topicId: string;
  disablehint: boolean;
}) {
  //deepcopy
  var d = JSON.stringify(step);
  var dd = JSON.parse(d);
  return (
    <CChoice
      step={step}
      content={content}
      topicId={topicId}
      disablehint={disablehint}
      options={fishyShuffle(dd.multipleChoice)}
    />
  );
}

export default ShuffledLoad;
