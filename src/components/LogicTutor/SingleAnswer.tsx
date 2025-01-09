import React, { useState, useMemo } from "react";
import { Button, Stack, Alert, AlertIcon, Center, Text, Image, Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Latex from "react-latex-next";
import MQPostfixSolver from "../../utils/MQPostfixSolver";
import MQPostfixparser from "../../utils/MQPostfixparser";
import { convertirNotacion } from "./convertirNotacion";
import { useAction } from "../../utils/action";
import { MathfieldElement } from "mathlive";
import Hint from "../../components/Hint";
import MQPostfixstrict from "../../utils/MQPostfixstrict";

const Mathfield = dynamic(() => import("./Tools/mathLive"), {
  ssr: false,
});

const SingleAnswer = ({ exc, nStep, setCompleted, topic }) => {
  const [latex, setLatex] = useState("");
  const [error, setError] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [isCorrectValue, setIsCorrectvalue] = useState(false);
  const [Values, setValues] = useState([]);
  const [hints, setHints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const action = useAction();

  function evaluar(_, Values) {
    setFirstTime(!firstTime);
    const validationType = exc.steps[nStep].validation;
    const answers = exc.steps[nStep].answers;
    let correctAns = false;

    if (validationType === "evaluate") {
      const inputEvaluated = MQPostfixSolver(MQPostfixparser(convertirNotacion(Values)), {
        values: [],
      });
      const answerParsed = MQPostfixparser(answers[0].answer[0]);
      const answerEvaluated = MQPostfixSolver(answerParsed, { values: [] });
      correctAns = inputEvaluated === answerEvaluated;
    } else if (validationType === "evaluateAndCount") {
      for (let i = 0; i < answers.length; i++) {
        const e = answers[i];
        if (!e) continue;
        const parsedInput = MQPostfixparser(convertirNotacion(Values));
        const parsedAnswer = MQPostfixparser(e.answer[0]);

        const inputEvaluated = MQPostfixSolver(parsedInput, { values: [] });
        const answerEvaluated = MQPostfixSolver(parsedAnswer, { values: [] });

        if (inputEvaluated === answerEvaluated) {
          correctAns = true;
          break;
        }
      }
    } else if (validationType === "stringComparison") {
      const userAnswer = convertirNotacion(Values);
      correctAns = userAnswer === answers[0].answer;
    } else if (validationType === "countElements") {
      const parseInput = MQPostfixparser(convertirNotacion(Values));
      for (let i = 0; i < answers.length; i++) {
        let e = answers[i];
        if (!e) continue;
        let parseAns = MQPostfixparser(e.answer[0]);
        if (MQPostfixstrict(parseInput, parseAns)) correctAns = true;
      }
    }

    if (correctAns) {
      setIsCorrectvalue(true);
      setCompleted(true);
      setError(false);
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
      result: correctAns ? 1 : 0,
      kcsIDs: exc.steps[nStep].KCs,
      extra: {
        response: [Values],
        attempts: attempts,
        hints: hints,
      },
    });
  }

  function modify(latex, prompsValues) {
    setLatex(latex);
    setValues(prompsValues.a);
  }

  const mfe = useMemo(() => new MathfieldElement(), []);

  return (
    <>
      <Center>
        <Box maxW={{ base: "100%" }} p={2} borderWidth={1} borderRadius="lg" overflow="hidden">
          <Latex>{"$$" + exc.steps[nStep].expression + "$$"}</Latex>
          <Text>
            Símbolos especiales en el teclado virtual{" "}
            <Image
              src={`img/teclado.png`}
              alt="Icono del teclado"
              display="inline"
              verticalAlign="middle"
              boxSize="25px"
              mx="2px"
            />{" "}
          </Text>
          <Mathfield
            readOnly={true}
            mfe={mfe}
            value={`\\large $\\placeholder[a]{} \\quad`}
            onChange={modify}
          ></Mathfield>
        </Box>
      </Center>
      <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
        <Button colorScheme="blue" size="sm" onClick={() => evaluar(latex, Values)}>
          Enviar
        </Button>
        <Hint
          hints={exc.steps[nStep].hints}
          contentId={exc.code}
          topicId={exc.type}
          stepId={exc.steps[nStep].stepId}
          matchingError={exc.steps[nStep].matchingError}
          response={[latex]}
          error={error}
          setError={setError}
          hintCount={hints}
          setHints={setHints}
          setLastHint={() => {}}
        ></Hint>
      </Stack>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {exc.steps[nStep].incorrectMsg}
        </Alert>
      )}
      {isCorrectValue && (
        <Alert status="success">
          <AlertIcon />
          {exc.steps[nStep].correctMsg}
          {setCompleted(true)}
        </Alert>
      )}
    </>
  );
};

export default SingleAnswer;
