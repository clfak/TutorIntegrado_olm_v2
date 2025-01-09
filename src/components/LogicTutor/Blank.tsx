import React from "react";
import { useState } from "react";
import { Button, Stack, Input, Alert, AlertIcon } from "@chakra-ui/react";
import type { ExLog } from "./Tools/ExcerciseType2";
import Hint from "../../components/Hint";
import { useAction } from "../../utils/action";

const Blank = ({
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
  const [inputText, setInputText] = useState<string>("");
  const [isCorrectValue, setIsCorrectvalue] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [hints, setHints] = useState(0);
  const [_, setLastHint] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const action = useAction();
  const evaluar = () => {
    console.log("Input:", inputText);
    let respuesta = false;
    console.log("Respuesta esperada:", exc.steps[nStep].answers[0].answer[0]);
    setRespuestas(prevRespuestas => [...prevRespuestas, inputText]);
    setFirstTime(false);
    if (inputText === exc.steps[nStep].answers[0].answer[0]) {
      setIsCorrectvalue(true);
      respuesta = true;
      setCompleted(true);
    } else {
      setError(true);
      setHints(hints + 1);
    }
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
  const handleButtonClick = (symbol: string) => {
    setInputText(prevText => prevText + symbol);
  };
  return (
    <>
      <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
        <Input
          htmlSize={4}
          width="auto"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("[")}>
          {" "}
          [
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("]")}>
          {" "}
          ]
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("∞")}>
          {" "}
          ∞
        </Button>
      </Stack>
      <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
        <Button colorScheme="blue" size="sm" onClick={() => evaluar()}>
          {" "}
          Enviar
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
      {firstTime ? null : !isCorrectValue ? (
        <Alert status="error">
          <AlertIcon />
          {exc.steps[nStep].incorrectMsg}
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
export default Blank;
