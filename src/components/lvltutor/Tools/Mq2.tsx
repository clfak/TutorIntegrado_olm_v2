import { Alert, AlertIcon, Button, Stack, Box, HStack, VStack } from "@chakra-ui/react";
import { useState, memo, useEffect, useRef } from "react";
import { addStyles, EditableMathField, MathField } from "react-mathquill";
//se importa el componente hint desarrollado por Miguel Nahuelpan
import Hint from "../../Hint";
import MQPostfixSolver from "../../../utils/MQPostfixSolver";
import MQPostfixparser from "../../../utils/MQPostfixparser";
//reporte de acciones
import { useAction } from "../../../utils/action";

import type { Step, answer, value } from "./ExcerciseType";
import { useSnapshot } from "valtio";
import MQProxy from "./MQProxy";
import MQPostfixstrict from "../../../utils/MQPostfixstrict";
import MQStaticMathField from "../../../utils/MQStaticMathField";

addStyles();

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
//inline style aprendido para componentes react en... https://codeburst.io/4-four-ways-to-style-react-components-ac6f323da822
const EMFStyle = {
  width: "190px",
  maxHeight: "120px",
  marginBottom: "12px",
  border: "3px solid #73AD21",
  overflow: "visible",
};

interface values {
  values: Array<value>;
}

const evaluation = ({
  input,
  answer,
  values,
}: {
  input: string;
  answer: answer;
  values: values;
}) => {
  let parseAns = MQPostfixparser(answer.answer[0]);
  let evaluation1 = MQPostfixSolver(input.substring(0), values);
  let evaluation2 = MQPostfixSolver(parseAns.substring(0), values);

  if (!MQProxy.finishedEval || isNaN(evaluation1)) {
    return false;
  }
  MQProxy.finishedEval = true;

  let correctAns = false;
  let answer1 = "" + evaluation1;
  let answer2 = "" + evaluation2;
  let y = parseFloat(answer1);
  let x = parseFloat(answer2);
  if (parseFloat(answer2) == 0) {
    x = x + 1;
    y = y + 1;
  }

  let relativeError = Math.abs(1 - y / x);
  if (relativeError < 0.005 && MQPostfixstrict(input, parseAns)) correctAns = true;

  return correctAns;
};

const Mq2 = ({
  step,
  content,
  topicId,
  disablehint,
}: {
  step: Step;
  content: string;
  topicId: string;
  disablehint: boolean;
}) => {
  const mqSnap = useSnapshot(MQProxy);
  const action = useAction();

  let entero = parseInt(step.stepId);

  const [lastHint, setLastHint] = useState(false);

  //Mq1
  const [latex, setLatex] = useState(" ");
  const [placeholder, setPlaceholder] = useState(true);
  const [ta, setTa] = useState<MathField | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [alertType, setAlertType] = useState<
    "info" | "warning" | "success" | "error" | undefined
  >();
  const [alertMsg, setAlertMsg] = useState("");
  const [alertHidden, setAlertHidden] = useState(true);

  const result = useRef(false);

  //la siguiente funcion maneja la respuesta ingresada, la respuesta se compara con el valor correspondiente almacenado en el ejercicio.json
  //Ademas, se manejan los componentes de alerta utilizado en el componente padre(solver2) y el componente hijo(Mq2)
  //finalmente, se maneja la activacion del siguiente paso o resumen en caso de que la respuesta ingresada es correcta
  //"validation": "stringComparison" | "evaluate" | "countElements" | "evaluateAndCount"
  const handleAnswer = () => {
    let validationType = step.validation;
    let answers = step.answers;
    let correctAns = false;
    let parseInput = MQPostfixparser(latex);
    let values: values = { values: [] };

    if (step.values != undefined) {
      values.values = step.values;
    }

    if (validationType) {
      //console.log(1);
      if (validationType.localeCompare("evaluate") == 0) {
        for (let i = 0; i < answers.length; i++) {
          let e = answers[i];
          if (!e) continue;
          if (evaluation({ input: parseInput, answer: e, values: values })) correctAns = true;
        }
      } else if (validationType.localeCompare("countElements") == 0) {
        for (let i = 0; i < answers.length; i++) {
          let e = answers[i];
          if (!e) continue;
          let parseAns = MQPostfixparser(e.answer[0]);
          if (MQPostfixstrict(parseInput, parseAns)) correctAns = true;
        }
      } else if (validationType.localeCompare("evaluateAndCount") == 0) {
        //console.log(2);
        for (let i = 0; i < answers.length; i++) {
          let e = answers[i];
          if (!e) continue;
          if (evaluation({ input: parseInput, answer: e, values: values })) correctAns = true;
        }
      } else {
        for (let i = 0; i < answers.length; i++) {
          let e = answers[i];
          if (!e) continue;
          let parseAns = MQPostfixparser(e.answer[0]);
          if (parseInput.localeCompare(parseAns) == 0) correctAns = true;
        }
      }
    } else {
      for (let i = 0; i < answers.length; i++) {
        let e = answers[i];
        if (!e) continue;
        let parseAns = MQPostfixparser(e.answer[0]);
        if (parseInput.localeCompare(parseAns) == 0) correctAns = true;
      }
    }
    //console.log(validationType, correctAns);
    if (correctAns) {
      result.current = true;
      MQProxy.endDate = Date.now();
      MQProxy.defaultIndex = [parseInt(step.stepId), parseInt(step.stepId) + 1];
      MQProxy.submitValues = {
        ans: latex,
        att: attempts,
        hints: mqSnap.hints,
        lasthint: lastHint,
        fail: false,
        duration: 0,
      };
      MQProxy.error = false;
    } else {
      result.current = false;
      setAlertType("error");
      setAlertMsg("La expresion ingresada no es correcta.");
      setAlertHidden(false);
      MQProxy.error = true;
      MQProxy.submitValues = {
        ans: latex,
        att: attempts,
        hints: mqSnap.hints,
        lasthint: lastHint,
        fail: true,
        duration: 0,
      };
    }
    action({
      verbName: "tryStep",
      stepID: "" + step.stepId,
      contentID: content,
      topicID: topicId,
      result: result.current ? 1 : 0,
      kcsIDs: step.KCs,
      extra: {
        response: [latex],
        attempts: attempts,
        hints: mqSnap.hints,
      },
    });
    MQProxy.submit = true;
    setAttempts(attempts + 1);
  };

  const refMQElement = (mathquill: MathField) => {
    if (ta == undefined) {
      setTa(mathquill);
    }
  };

  const MQtools = (operation: string) => {
    if (ta != undefined) ta.cmd(operation);
  };

  const clear = () => {
    if (ta != undefined) setLatex("");
  };

  return (
    <>
      <VStack alignItems="center" justifyContent="center" margin={"auto"}>
        <MQStaticMathField
          exp={step.expression}
          currentExpIndex={
            parseInt(step.stepId) == mqSnap.defaultIndex[mqSnap.defaultIndex.length - 1]
              ? true
              : false
          }
        />
        <Box>
          <Stack spacing={4} direction="row" align="center" pb={4}>
            {/*importante la distincion de onMouseDown vs onClick, con el evento onMouseDown aun no se pierde el foco del input*/}
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("(");
              }}
            >
              {"("}
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools(")");
              }}
            >
              {")"}
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("^");
              }}
            >
              <MQStaticMathField
                exp={"x^y"}
                currentExpIndex={
                  parseInt(step.stepId) == mqSnap.defaultIndex[mqSnap.defaultIndex.length - 1]
                    ? true
                    : false
                }
              />
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("\\sqrt");
              }}
            >
              <MQStaticMathField
                exp={"\\sqrt{x}"}
                currentExpIndex={
                  parseInt(step.stepId) == mqSnap.defaultIndex[mqSnap.defaultIndex.length - 1]
                    ? true
                    : false
                }
              />
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("\\nthroot");
              }}
            >
              <MQStaticMathField
                exp={"\\sqrt[y]{x}"}
                currentExpIndex={
                  parseInt(step.stepId) == mqSnap.defaultIndex[mqSnap.defaultIndex.length - 1]
                    ? true
                    : false
                }
              />
            </Button>
          </Stack>
          <Stack spacing={4} direction="row" align="center" pb={4}>
            {/*importante la distincion de onMouseDown vs onClick, con el evento onMouseDown aun no se pierde el foco del input,
                           Ademas con mousedown se puede usar preventDefault*/}
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("+");
              }}
            >
              +
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("-");
              }}
            >
              -
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("*");
              }}
            >
              *
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                MQtools("\\frac");
              }}
            >
              /
            </Button>
            <Button
              width={"40px"}
              height={"40px"}
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                clear();
              }}
            >
              C
            </Button>
          </Stack>
          <HStack spacing="4px" alignItems="center" justifyContent="center" margin={"auto"}>
            <Button
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                if (ta != undefined) ta.keystroke("Left");
              }}
              size="xs"
            >
              L
            </Button>
            <EditableMathField
              key={"EMF" + entero}
              latex={latex}
              style={EMFStyle}
              onMouseDown={() => {
                if (placeholder) {
                  setPlaceholder(false);
                  setLatex("");
                }
              }}
              onChange={mathField => {
                //if(placeholder){setLatex("\\text{Ingresa la expresion aqui}")}
                setLatex(() => mathField.latex());
                refMQElement(mathField);
              }}
            ></EditableMathField>
            <Button
              colorScheme="teal"
              onMouseDown={e => {
                e.preventDefault();
                if (ta != undefined) ta.keystroke("Right");
              }}
              size="xs"
            >
              R
            </Button>
          </HStack>
        </Box>
      </VStack>
      <HStack spacing="4px" alignItems="center" justifyContent="center" margin={"auto"}>
        <Box>
          <Button
            colorScheme="teal"
            height={"32px"}
            width={"88px"}
            onClick={() => {
              if (!(latex.localeCompare("") == 0 || latex.localeCompare(" ") == 0)) handleAnswer();
              else {
                setAlertType("error");
                setAlertMsg("Comienza por ingresar una expresion.");
                setAlertHidden(false);
              }
            }}
          >
            Enviar
          </Button>
        </Box>
        <Enabledhint
          disablehint={disablehint}
          step={step}
          latex={latex}
          setLastHint={setLastHint}
        />
      </HStack>
      <Alert key={"Alert" + topicId + "i"} status={alertType} mt={2} hidden={alertHidden}>
        <AlertIcon key={"AlertIcon" + topicId + "i"} />
        {"¡Inténtalo nuevamente! (intentos: " + attempts + ") " + alertMsg}
      </Alert>
    </>
  );
};

export default memo(Mq2);
