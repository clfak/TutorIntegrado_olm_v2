import {
  Box,
  useRadio,
  useRadioGroup,
  HStack,
  Button,
  Alert,
  AlertIcon,
  VStack,
} from "@chakra-ui/react";
import Hint from "../../Hint";
import MQStaticMathField from "../../../utils/MQStaticMathField";
import { useSnapshot } from "valtio";
import type { Step } from "./ExcerciseType";
import { useState, useEffect, useRef } from "react";
import MQProxy from "./MQProxy";
import { useAction } from "../../../utils/action";

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

function handleAnswer(ans: string, uans: string, attemps: number, stepid: string) {
  let correctAns = false;
  let at: "info" | "warning" | "success" | "error" | undefined = "error";
  let output = {
    result: 0,
    attempts: attemps,
    alerttype: at,
    alertmsg: "potato",
    alerthidden: false,
  };

  if (ans.localeCompare(uans) == 0) correctAns = true;

  //console.log(validationType, correctAns);
  if (correctAns) {
    output.result = 1;
    MQProxy.endDate = Date.now();
    MQProxy.defaultIndex = [parseInt(stepid) + 1];
    MQProxy.error = false;
  } else {
    output.result = 0;
    output.alerttype = "error";
    output.alertmsg = "La expresion ingresada no es correcta.";
    output.alerthidden = false;
    MQProxy.error = true;
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
        w={"240px"}
      >
        {props.children}
      </Box>
    </Box>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function CChoice({
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
    //defaultValue: 'react',
    onChange: nextValue => {
      answer.current = nextValue;
    },
  });

  const group = getRootProps();

  let cans = "";
  for (let e of step.multipleChoice) if (e.correct) cans = e.expression;

  const action = useAction();

  return (
    <>
      <VStack {...group}>
        {step.multipleChoice.map(value => {
          const radio = getRadioProps({ value: value.expression });
          return (
            <RadioCard key={"cchoice" + value.id} {...radio}>
              {<MQStaticMathField exp={value.expression} currentExpIndex={true} />}
            </RadioCard>
          );
        })}
      </VStack>
      <HStack spacing="4px" alignItems="center" justifyContent="center" margin={"auto"}>
        <Box>
          <Button
            colorScheme="teal"
            height={"32px"}
            width={"88px"}
            onClick={() => {
              let ans = handleAnswer(cans, answer.current, attempts, step.stepId);
              console.log(cans, answer.current, ans);
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
                  response: [answer.current],
                  attempts: attempts,
                  hints: MQProxy.hints,
                },
              });
              MQProxy.submitValues = {
                ans: answer.current,
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
        <AlertIcon key={"AlertIcon" + topicId + "i"} />
        {"(" + attempts + ") " + alertMsg}
      </Alert>
    </>
  );
}

export default CChoice;
