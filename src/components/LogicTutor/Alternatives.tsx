import React, { useState, useEffect } from "react";
import { Alert, AlertIcon, Button, Center, Stack } from "@chakra-ui/react";
import type { ExLog } from "./Tools/ExcerciseType2";
import Hint from "../../components/Hint";
import { useAction } from "../../utils/action";
import Latex from "react-latex-next";

const Alternatives = ({
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
  const [firstTime, setFirstTime] = useState(true);
  const valores_a_elegir = exc.steps[nStep]?.multipleChoice;
  const [isCorrectValue, setIsCorrectValue] = useState(false);
  const [showError, setShowError] = useState(false);
  const [response, setResponse] = useState(0);
  const [hints, setHints] = useState(0);
  const [_, setLastHint] = useState(false);
  const [valoresBarajados, setValoresBarajados] = useState<Array<any>>([]);
  const action = useAction();
  const [attempts, setAttempts] = useState(0);
  useEffect(() => {
    if (valores_a_elegir && firstTime) {
      const shuffledValues = [...valores_a_elegir].sort(() => Math.random() - 0.5);
      setValoresBarajados(shuffledValues);
    }
  }, [valores_a_elegir, firstTime]);

  const evaluar = (valor: { id: number; text: string; correct: boolean }) => {
    setResponse(valor.id);
    setFirstTime(false);

    if (valor.correct) {
      setIsCorrectValue(true);
      setCompleted(true);
      setShowError(false);
    } else {
      setShowError(true);
      setHints(hints + 1);
    }
    setAttempts(attempts + 1);
    action({
      verbName: "tryStep",
      stepID: "" + exc.steps[nStep].stepId,
      contentID: exc.code,
      topicID: topic,
      result: valor.correct ? 1 : 0,
      kcsIDs: exc.steps[nStep].KCs,
      extra: {
        response: [valor.id],
        attempts: attempts + 1,
        hints: hints,
      },
    });
  };

  return (
    <>
      <Stack spacing={4} m={2} fontSize={{ base: "1rem" }} w={{ base: "100%" }}>
        <Center>
          <Latex>{"$$" + exc.steps[nStep].expression + "$$"}</Latex>
        </Center>
        {valoresBarajados.map((valor, index) => (
          <Button
            key={index}
            colorScheme="blue"
            size="md"
            onClick={() => evaluar(valor)}
            isDisabled={isCorrectValue}
          >
            {valor.text && valor.expression ? (
              <Stack>
                <div>{valor.text}</div>
                <Latex>{"$$" + valor.expression + "$$"}</Latex>
              </Stack>
            ) : valor.text ? (
              <>{valor.text}</>
            ) : valor.expression ? (
              <Latex>{"$$" + valor.expression + "$$"}</Latex>
            ) : null}
          </Button>
        ))}
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
      <Center>
        <Hint
          hints={exc.steps[nStep].hints}
          contentId={exc.code}
          topicId={topic}
          stepId={exc.steps[nStep].stepId}
          matchingError={exc.steps[nStep].matchingError}
          response={[response]}
          error={showError}
          setError={setShowError}
          hintCount={hints}
          setHints={setHints}
          setLastHint={setLastHint}
        />
      </Center>
    </>
  );
};

export default Alternatives;
