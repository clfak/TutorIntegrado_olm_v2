import React from "react";
import { useState, useMemo } from "react";
import { Button, Stack, Alert, AlertIcon, Center } from "@chakra-ui/react";
import { MathfieldElement } from "mathlive";
import dynamic from "next/dynamic";
import MQPostfixSolver from "../../utils/MQPostfixSolver";
import MQPostfixparser from "../../utils/MQPostfixparser";
import type { ExLog } from "./Tools/ExcerciseType2";
import Hint from "../../components/Hint";
import { convertirNotacion } from "./convertirNotacion";
import { useAction } from "../../utils/action";
import type { value } from "../../components/lvltutor/Tools/ExcerciseType";

const Mathfield = dynamic(() => import("./Tools/mathLive"), {
  ssr: false,
});

const MultiplePlaceholders = ({
  exc,
  nStep,
  setCompleted,
  topic,
}: {
  exc: ExLog;
  nStep: number;
  setCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  topic: string;
}) => {
  const action = useAction();
  //console.log("topic multiple placeholders: "+topic)
  const [firstTime, setFirstTime] = useState(true);
  const [isCorrectValue, setIsCorrectValue] = useState(false);
  const [ValuesArray, setValuesArray] = useState<Array<any>>([]);
  const [error, setError] = useState(false);
  const [hints, setHints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [_, setLastHint] = useState(0);
  const evaluar = () => {
    setFirstTime(!firstTime);
    interface values {
      values: Array<value>;
    }
    //console.log(ValuesArray);
    //console.log("values "+ValuesArray)
    //console.log(exc.steps[nStep].answers[0].answer);
    //console.log("valor 1 convertido "+convertirNotacion(ValuesArray[0]));
    //console.log("valor 2 convertido "+convertirNotacion(ValuesArray[1]));
    const answer = exc.steps[nStep].answers[0].answer;
    let respuesta = false;
    const evaluation: {
      input1: string;
      answer: values;
      values: Array<value>;
    } = {
      input1: "",
      answer: { values: [] },
      values: [],
    };
    if (exc.steps[nStep].validation == "evaluate") {
      if (
        ValuesArray.every(
          (value, index) =>
            MQPostfixSolver(MQPostfixparser(convertirNotacion(value)), evaluation.answer) ===
            MQPostfixSolver(MQPostfixparser(convertirNotacion(answer[index])), evaluation.answer),
        )
      ) {
        setIsCorrectValue(true);
        respuesta = true;
        //console.log("correctValueSeteado "+isCorrectValue)
      } else {
        setError(true);
        setHints(hints + 1);
      }
    } else {
      if (ValuesArray.every((value, index) => value === answer[index])) {
        //console.log("true1");
        respuesta = true;
        setIsCorrectValue(true);
        //console.log("correctValueSeteado "+isCorrectValue)
      } else {
        setError(true);
        setHints(hints + 1);
      }
    }
    setAttempts(attempts + 1);
    //console.log("valor de correctValue: "+isCorrectValue)
    //console.log("Valor VERIFICACION: "+(isCorrectValue?1:0))
    action({
      verbName: "tryStep",
      stepID: "" + exc.steps[nStep].stepId,
      contentID: exc.code,
      topicID: topic,
      result: respuesta ? 1 : 0,
      kcsIDs: exc.steps[nStep].KCs,
      extra: {
        response: [ValuesArray],
        attempts: attempts,
        hints: hints,
      },
    });
  };

  function test(_, prompsValues) {
    let newValuesArray = [];
    for (let key in prompsValues) {
      newValuesArray.push(prompsValues[key]);
    }
    setValuesArray(newValuesArray);
  }
  const mfe = useMemo(() => new MathfieldElement(), []);
  return (
    <>
      <>
        <Center>
          <Mathfield
            readOnly={true}
            mfe={mfe}
            value={`\\large ${exc.steps[nStep].displayResult[0]}\\;`}
            onChange={test}
          ></Mathfield>
        </Center>

        <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
          <Button colorScheme="blue" size="sm" onClick={() => evaluar()}>
            {" "}
            enviar
          </Button>
          <Hint
            hints={exc.steps[nStep].hints}
            contentId={exc.code}
            topicId={topic}
            stepId={exc.steps[nStep].stepId}
            matchingError={exc.steps[nStep].matchingError}
            response={ValuesArray}
            error={error}
            setError={setError}
            hintCount={hints}
            setHints={setHints}
            setLastHint={setLastHint}
          ></Hint>
        </Stack>
        {firstTime ? null : !isCorrectValue ? (
          <Alert status="error">
            <AlertIcon />
            Tu respuesta no es la esperada intentalo denuevo.
          </Alert>
        ) : (
          <Alert status="success">
            <AlertIcon />
            {exc.steps[nStep].correctMsg}
            {setCompleted(true)}
          </Alert>
        )}
      </>
    </>
  );
};

export default MultiplePlaceholders;
