import React from "react";
import { useState } from "react";
import { Button, Stack, Input, Alert, AlertIcon } from "@chakra-ui/react";
import type { ExLog } from "./Tools/ExcerciseType2";
import Hint from "../../components/Hint";
import { useAction } from "../../utils/action";

const InputButtons = ({
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
  const [isCorrectValue, setIsCorrectvalue] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [inputText, setInputText] = useState<string>("");
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [hints, setHints] = useState(0);
  const [_, setLastHint] = useState(0);
  const action = useAction();
  const [attempts, setAttempts] = useState(0);
  const evaluar = () => {
    //console.log('Input:', inputText);
    let respuesta = false;
    //console.log('Respuesta esperada:', exc.steps[nStep].answers[0].answer[0]);
    setRespuestas(prevRespuestas => [...prevRespuestas, inputText]);
    setFirstTime(false);
    if (inputText === exc.steps[nStep].answers[0].answer[0]) {
      //console.log("Correcto");
      setIsCorrectvalue(true);
      setCompleted(true);
      respuesta = true;
    } else {
      //console.log("Respuesta incorrecta");
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
        response: [inputText],
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
        <span>&#123;</span>
        <Input
          htmlSize={4}
          size="sm"
          width="xs"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <span>&#125;</span>
      </Stack>

      <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("√")}>
          √
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("∈")}>
          {" "}
          ∈
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("ℂ")}>
          {" "}
          ℂ
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("ℤ")}>
          {" "}
          ℤ
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("ℝ")}>
          {" "}
          ℝ
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("ℕ")}>
          {" "}
          ℕ
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("∞")}>
          {" "}
          ∞
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("≤")}>
          {" "}
          ≤
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("≥")}>
          {" "}
          ≥
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick(">")}>
          {" "}
          &lt;{" "}
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleButtonClick("<")}>
          {" "}
          &gt;
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

export default InputButtons;
