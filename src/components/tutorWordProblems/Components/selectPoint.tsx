import { AlertStatus, facePoint, Hint, selectPointerMeta } from "../types.d";
import { useEffect, useState } from "react";
import { Box, ButtonGroup, Flex, useMediaQuery } from "@chakra-ui/react";
import ResAlert from "../Alert/responseAlert";
import { useAlert } from "../hooks/useAlert";
import { useBoard } from "../hooks/useBoard";
import HintButton from "../Hint/hint";
import { useHint } from "../hooks/useHint";
import { useStore } from "../store/store";
import { useAction } from "../../../utils/action";

interface Props {
  meta: selectPointerMeta;
  hints: Hint[];
}
export const SelectPoint = ({ meta, hints }: Props) => {
  //console.log("SelectPoint");

  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [isScreenLarge] = useMediaQuery("(min-width: 768px)");
  const { correctPoint, data } = meta;
  const [userAnswer, setUserAnswer] = useState([]);
  const { alertTitle, alertStatus, alertMsg, alertHidden, showAlert } = useAlert(3000);
  const { boardId, boardRef, bgBoardColor, disableBoard, createLine } = useBoard(
    "jxgbox",
    meta.graphSettings,
  );
  const {
    unlockNextStep,
    currentContetId,
    currentTopicId,
    currentQuestionIndex,
    currentStepIndex,
    exerciseData,
  } = useStore();
  const {
    unlockedHints,
    currentHint,
    totalHints,
    disabledPrevButton,
    disabledNextButton,
    numHintsActivated,
    nextHint,
    prevHint,
    unlockHint,
    resetNumHintsActivated,
  } = useHint(hints);

  const reportAction = useAction();
  //al utilizar useEffect S/D se ejecuta una unica vez despues del primer renderizado del componente
  useEffect(() => {
    // inicialización de datos
    data.forEach(point => {
      const isStatic = point?.isStatic ?? true;
      const face = point?.face ?? facePoint.circle;
      const p = boardRef.current.create("point", point.coord, {
        name: point?.name,
        color: point?.color,
        face: face,
        fixed: isStatic,
      });
      p.on("up", () => {
        setUserAnswer(p.coords.usrCoords);

        //console.log(p.coords)
        const coordPoint = JSON.stringify(p.coords.usrCoords.slice(1));
        //console.log("Coordpoint",coordPoint)
        if (coordPoint === JSON.stringify(correctPoint)) {
          p.setName("Punto correcto!");

          p.setAttribute({
            color: "green",
            highlightFillColor: "green",
            strokeColor: "green",
            size: 8,
          });

          //p.board.BOARD_MODE_NONE
          //p.board.removeEventHandlers()
          //boardRef.current.removeEvent()
        } else {
          p.setName("Punto incorrecto");
          p.setAttribute({ face: "cross", color: "red", size: 4 });
        }

        //selectedPointRef.current = p; // Guarda el punto seleccionado en el estado
      });
    });
  }, []);

  useEffect(() => {
    if (userAnswer.length !== 0 && !answerCorrect) {
      const answer = userAnswer.slice(-2);
      const isCorrect = answer.every((element, index) => element === correctPoint[index]);

      reportAction({
        verbName: "tryStep",
        stepID: "[" + currentQuestionIndex + "," + currentStepIndex + "]",
        contentID: currentContetId,
        topicID: currentTopicId,
        result: isCorrect ? 1 : 0,
        kcsIDs: exerciseData.questions[currentQuestionIndex].steps[currentStepIndex].kcs,
        extra: {
          Response: answer,
        },
        detail: "SelectPoint",
      });

      if (isCorrect) {
        setAnswerCorrect(true);
        showAlert("😃", AlertStatus.success, "Muy bien!", null);
        createLine(answer, [answer[0] + 1, answer[1]]);
        createLine(answer, [answer[0], answer[1] + 1]);
        if (boardRef.current) {
          disableBoard();

          //boardRef.current.create("point",[correctPoint[0], correctPoint[1]], {face: facePoint.cross})
          //JXG.JSXGraph.freeBoard(boardRef.current)
        }

        unlockNextStep();
      } else {
        showAlert("😕", AlertStatus.error, "Respuesta Incorrecta");
        unlockHint();
      }
    }
  }, [userAnswer]);

  return (
    <Flex flexDirection="column" alignContent="center" flexWrap="wrap" width="100%" maxW="100%">
      <Box
        bgColor={bgBoardColor}
        rounded="2xl"
        shadow="lg"
        overflow="hidden"
        width={isScreenLarge ? "500px" : "100%"}
        height={isScreenLarge ? "500px" : "100%"}
        pb={isScreenLarge ? undefined : "100%"}
        position="relative"
        maxW={isScreenLarge ? "500px" : undefined}
        maxH={isScreenLarge ? "500px" : undefined}
      >
        <div
          id={boardId}
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        ></div>
      </Box>

      <ButtonGroup size="lg" display="flex" justifyContent="flex-end" paddingTop={5}>
        <HintButton
          hints={unlockedHints}
          currentHint={currentHint}
          totalHints={totalHints}
          prevHint={prevHint}
          nextHint={nextHint}
          disabledPrevButton={disabledPrevButton}
          disabledNextButton={disabledNextButton}
          numEnabledHints={numHintsActivated}
          //interactiveHint={activeLine(metaSelectPointHint.activeLine.point1,metaSelectPointHint.activeLine.point2)}
          resetNumHintsActivated={resetNumHintsActivated}
        ></HintButton>
      </ButtonGroup>
      <ResAlert title={alertTitle} status={alertStatus} alertHidden={alertHidden} text={alertMsg} />
    </Flex>
  );
};
