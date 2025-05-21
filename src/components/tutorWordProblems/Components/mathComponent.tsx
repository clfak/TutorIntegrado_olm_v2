import { Box, Button, ButtonGroup, Flex } from "@chakra-ui/react";
import type { Hint, MathComponentMeta } from "../types";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import ResAlert from "../Alert/responseAlert";
import { useAlert } from "../hooks/useAlert";
import { AlertStatus } from "../types.d";
import HintButton from "../Hint/hint";
import { useHint } from "../hooks/useHint";
import { ComputeEngine } from "@cortex-js/compute-engine";
import { useStore } from "../store/store";
import { useAction } from "../../../utils/action";

const MathField = dynamic(() => import("./tools/mathLive"), {
  ssr: false,
});

interface Props {
  meta: MathComponentMeta;
  hints: Hint[];
  correctMsg?: string;
}
interface Answer {
  placeholderId: string;
  value: string;
}

// Función para normalizar expresiones LaTeX, incluyendo números decimales
const normalizeLatex = (latex: string) => {
  // Reemplazar todas las comas con puntos para tener notación decimal consistente
  const normalizedLatex = latex.replace(/(\d+),(\d+)/g, "$1.$2");
  return normalizedLatex;
};

const MathComponent = ({ meta, hints, correctMsg }: Props) => {
  //console.log("RE-RENDER MATHCOMPONENT")
  const newComputerEngine = new ComputeEngine();
  const { expression, readonly, answers, idCorrectAnswers } = meta;
  //const expr1 =  newComputerEngine.parse('\\frac{-1}  {40} ');
  //const expr2 =  newComputerEngine.parse('-\\frac{1}{-40}');
  //const expr3 = newComputerEngine.parse(normalizeLatex("3.5"))

  //const [answerState,setAnswer] = useState<Answer[]>([]) // utilizar useState provoca que cuando cambie el valor de los placeholders el componente se vuelva a renderizar, provocando el re-renderizado de mathLive
  const answerStateRef = useRef<Answer[]>([]); // Utilizamos useRef para mantener una referencia mutable a answerState
  const [disabledButton, setDisabledButton] = useState(false);
  const mfe = useMemo(() => new MathfieldElement(), []);

  const correctAnswers = answers.filter(answ => {
    //return idCorrectAnswers.find((correctId) => correctId === answ.id);
    return idCorrectAnswers.includes(answ.id);
  });
  const otherAnswers = answers.filter(answ => {
    return !idCorrectAnswers.some(correctId => correctId === answ.id);
  });

  const { alertTitle, alertStatus, alertMsg, alertHidden, showAlert, resetAlert } = useAlert(3000);

  const {
    unlockedHints,
    currentHint,
    totalHints,
    nextHint,
    prevHint,
    disabledPrevButton,
    disabledNextButton,
    numHintsActivated,
    unlockHint,
    resetNumHintsActivated,
  } = useHint(hints);

  const {
    unlockNextStep,
    currentContetId,
    currentQuestionIndex,
    currentStepIndex,
    currentTopicId,
    exerciseData,
  } = useStore();
  const reportAction = useAction();

  useEffect(() => {
    resetAlert();
    setDisabledButton(false);
  }, [meta]);
  const checkAnswer = () => {
    try {
      const isEmpty = answerStateRef.current.some(userAnswer => userAnswer.value === "");
      if (isEmpty) {
        showAlert("", AlertStatus.warning, "Debes completar todos los recuadros!");
        return;
      }
      let allCorrect = true;
      let genericHint = true;
      //console.log("idsCorrects", idCorrectAnswers);
      //console.log("corrAnswer-->", correctAnswers);
      //console.log("otherAnswers-->", otherAnswers);
      answerStateRef.current.forEach(userAnswer => {
        // comprobar si userAnswer.value hace match con alguna respuesta en correctAnswers, si no, comprobar si hace match en otherAnswer
        //const isCorrect = correctAnswers.some(corrAnswer => corrAnswer.value.replace(/ /g, '') === userAnswer.value)
        const parUserAnswer = newComputerEngine.parse(normalizeLatex(userAnswer.value));
        //console.log("parUserAnswer--->", parUserAnswer.latex);

        //const isCorrect = correctAnswers.some(corrAnswer =>   parUserAnswer.isEqual(newComputerEngine.parse(normalizeLatex(corrAnswer.value))))
        const isCorrect = correctAnswers.find(
          corrAnswer =>
            corrAnswer.placeholderId === userAnswer.placeholderId &&
            parUserAnswer.isEqual(newComputerEngine.parse(normalizeLatex(corrAnswer.value))),
        );

        if (isCorrect) {
          mfe.setPromptState(userAnswer.placeholderId, "correct", true);
        } else {
          allCorrect = false;
          mfe.setPromptState(userAnswer.placeholderId, "incorrect", false);
          //const isOther = otherAnswers.find((otherAnswer) => otherAnswer.value.replace(/ /g, '') === userAnswer.value)
          const isOther = otherAnswers.find(
            otherAnswer =>
              otherAnswer.placeholderId === userAnswer.placeholderId &&
              parUserAnswer.isEqual(newComputerEngine.parse(normalizeLatex(otherAnswer.value))),
          );
          if (isOther) {
            //TODO aplicar logica de hint para una respuesta especifica
            genericHint = false;
            unlockHint(isOther.id);
          } else {
            // TODO activar hint generico
          }
        }
      });

      reportAction({
        verbName: "tryStep",
        stepID: "[" + currentQuestionIndex + "," + currentStepIndex + "]",
        contentID: currentContetId,
        topicID: currentTopicId,
        result: allCorrect ? 1 : 0,
        kcsIDs: exerciseData.questions[currentQuestionIndex].steps[currentStepIndex].kcs,
        extra: {
          Response: answerStateRef.current,
        },
        detail: "MathComponent",
      });
      if (allCorrect) {
        showAlert("😃", AlertStatus.success, correctMsg, null);
        setDisabledButton(true); // set disabled status
        unlockNextStep();
      } else {
        showAlert("😕", AlertStatus.error, "Respuesta Incorrecta");
        genericHint && unlockHint();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // @ts-ignore
  const handleMathFieldChange = (latex, promptsValues) => {
    const entries = Object.entries(promptsValues) as [string, string][];
    answerStateRef.current = entries.map(([placeholderId, value]) => ({
      placeholderId,
      value,
    }));
    //console.log(answerStateRef.current)
  };
  return (
    <Flex flexDirection="column">
      <Box width="100%" textAlign="center" mb={4}>
        <MathField
          readOnly={readonly}
          mfe={mfe}
          value={expression}
          onChange={handleMathFieldChange}
        ></MathField>
      </Box>

      <Flex justifyContent="flex-end">
        <ButtonGroup size="lg" display="flex" justifyContent="flex-end">
          <Button colorScheme="teal" size="sm" onClick={checkAnswer} disabled={disabledButton}>
            Aceptar
          </Button>
          <HintButton
            hints={unlockedHints}
            currentHint={currentHint}
            totalHints={totalHints}
            prevHint={prevHint}
            nextHint={nextHint}
            disabledPrevButton={disabledPrevButton}
            disabledNextButton={disabledNextButton}
            numEnabledHints={numHintsActivated}
            resetNumHintsActivated={resetNumHintsActivated}
          ></HintButton>
        </ButtonGroup>
      </Flex>

      <Box width="100%">
        <ResAlert
          title={alertTitle}
          status={alertStatus}
          text={alertMsg}
          alertHidden={alertHidden}
        />
      </Box>
    </Flex>
  );
};

export default MathComponent;
