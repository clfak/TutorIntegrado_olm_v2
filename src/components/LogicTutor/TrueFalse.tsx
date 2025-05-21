import React from "react";
import { useState } from "react";
import { Button, Stack, Alert, AlertIcon, Center } from "@chakra-ui/react";
import type { ExLog } from "./Tools/ExcerciseType2";
import Hint from "../../components/Hint";
import Latex from "react-latex-next";
import { useAction } from "../../utils/action";

const TrueFalse = ({
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
  const [isCorrectValue, setIsCorrectvalue] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [_, setLastHint] = useState(0);
  //@ts-ignore
  let valor: number | string;
  if (exc && exc.steps && exc.steps[1] && exc.steps[1].values && exc.steps[1].values[0]) {
    valor = exc.steps[1].values[0].value;
    //{console.log("valor: "+valor)}
  }
  const evaluar = (Response: string) => {
    setRespuestas(prevRespuestas => [...prevRespuestas, Response]);
    let respuesta = false;
    if (Response === exc.steps[nStep].answers[0].answer[0]) {
      setIsCorrectvalue(true);
      setCompleted(true);
      respuesta = true;
    } else {
      setError(true);
    }
    setFirstTime(false);
    setAttempts(attempts + 1);
    action({
      verbName: "tryStep",
      stepID: "" + exc.steps[nStep].stepId,
      contentID: exc.code,
      topicID: topic,
      result: respuesta ? 1 : 0,
      kcsIDs: exc.steps[nStep].KCs,
      extra: {
        response: [Response],
        attempts: attempts,
        hints: hints,
      },
    });
  };
  //console.log(exc.steps[nStep].expression)
  return (
    <>
      <>
        <Center>
          <Latex>{"$$" + exc.steps[nStep].expression + "$$"}</Latex>
        </Center>
        <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
          <Button colorScheme="blue" size="sm" onClick={() => evaluar("V")}>
            Verdadero
          </Button>
          <Button colorScheme="blue" size="sm" onClick={() => evaluar("F")}>
            Falso
          </Button>
          <Hint
            hints={exc.steps[nStep].hints}
            contentId={exc.code}
            topicId={topic}
            stepId={exc.steps[nStep].stepId}
            matchingError={exc.steps[nStep].matchingError}
            response={respuestas}
            error={error}
            setError={setError}
            hintCount={hints}
            setHints={setHints}
            setLastHint={setLastHint}
          ></Hint>
        </Stack>
      </>
      {firstTime ? null : !isCorrectValue ? (
        <Alert status="error">
          <AlertIcon />
          Tu respuesta no es la esperada intentalo denuevo.
        </Alert>
      ) : (
        <Alert status="success">
          <AlertIcon />
          {exc.steps[nStep].correctMsg}
        </Alert>
      )}
    </>
  );
};

export default TrueFalse;
