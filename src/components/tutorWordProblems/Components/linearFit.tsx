import { Box, Button, ButtonGroup, Flex, useMediaQuery } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import ResAlert from "../Alert/responseAlert";
import HintButton from "../Hint/hint";
import { useAlert } from "../hooks/useAlert";
import { useBoard } from "../hooks/useBoard";
import { useHint } from "../hooks/useHint";
import { useStore } from "../store/store";
import { AlertStatus, Hint, linearFitMeta, slider } from "../types.d";
import { useAction } from "../../../utils/action";

interface Props {
  meta: linearFitMeta;
  hints: Hint[];
}
export const LinearFit = ({ meta, hints }: Props) => {
  const [isScreenLarge] = useMediaQuery("(min-width: 768px)");
  const [lineColor, setLineColor] = useState("black");
  const { data, linearFunction, correctAnswer, graphSettings } = meta;
  const positionTextEq = graphSettings.newAxis.yAxis.point1 ?? [0, 0];
  const { m, b } = linearFunction;
  const mSliderRef = useRef(null);
  const bSliderRef = useRef(null);
  const [disabledButton, setDisabledButton] = useState(false);
  const {
    unlockNextStep,
    currentContetId,
    currentTopicId,
    currentQuestionIndex,
    currentStepIndex,
    exerciseData,
  } = useStore();
  const reportAction = useAction();
  const { boardId, boardRef, bgBoardColor, disableBoard } = useBoard(
    "linearFitBoard",
    meta.graphSettings,
  );
  const { alertTitle, alertStatus, alertMsg, alertHidden, showAlert } = useAlert(3000);

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

  // Definir las variables mval y bval antes del useEffect
  let mval: () => number;
  let bval: () => number;

  useEffect(() => {
    data.forEach(point => {
      const isStatic = point?.isStatic ?? true;
      const facePoint = point?.face ?? "circle";
      boardRef.current.create("point", point.coord, {
        name: point?.name,
        color: point?.color,
        fixed: isStatic,
        face: facePoint,
      });
    });

    if (m.slider && b.slider) {
      const mSlider = createSlider(m.slider);
      const bSlider = createSlider(b.slider);
      mSliderRef.current = mSlider;
      bSliderRef.current = bSlider;
      // @ts-ignore
      mval = () => mSlider.Value();
      // @ts-ignore
      bval = () => bSlider.Value();
    } else if (m.slider && !b.slider) {
      const mSlider = createSlider(m.slider);
      mSliderRef.current = mSlider;
      // @ts-ignore
      mval = () => mSlider.Value();
      bval = () => b?.value;
    } else if (!m.slider && b.slider) {
      const bSlider = createSlider(b.slider);
      bSliderRef.current = bSlider;
      mval = () => m?.value;
      // @ts-ignore
      bval = () => bSlider.Value();
    }

    const linF = function (x) {
      return mval() * x + bval();
    };
    // @ts-ignore
    var G = boardRef.current.create("functiongraph", [linF], {
      strokeWidth: 2,
      strokeColor: lineColor,
    });
    const fTextVal = () => {
      var vz = "";
      var tv = "";
      if (bval() >= 0.0) {
        if (bval() == 0.0) {
          tv = "";
          vz = "";
        } else {
          vz = "+";
          tv = JXG.toFixed(bval(), 1);
        }
      } else {
        vz = "";
        tv = JXG.toFixed(bval(), 1);
      }
      return "y = " + JXG.toFixed(mval(), 3) + "x" + vz + tv;
    };

    // @ts-ignore
    var ftext = boardRef.current.create("text", [positionTextEq[0], positionTextEq[1], fTextVal], {
      fontSize: 18,
      color: "#2B4163",
      cssStyle: "background-color: rgb(255,255,255)",
    });
  }, []);

  const createSlider = (sliderInfo: slider) => {
    // Si es un objeto slider, creamos el slider en el board
    return boardRef.current.create(
      "slider",
      [
        sliderInfo.startPoint,
        sliderInfo.endPoint,
        [sliderInfo.min, sliderInfo.initialValue, sliderInfo.max],
      ],
      {
        snapWidth: sliderInfo.snapWidth,
        precision: sliderInfo.precision,
        ticks: { drawLabels: false },
        name: sliderInfo.name,
      },
    );
  };

  const checkAnswer = () => {
    const mvalue = mSliderRef.current ? mSliderRef.current.Value() : undefined;
    const bvalue = bSliderRef.current ? bSliderRef.current.Value() : undefined;

    const mIsCorrect =
      mvalue === undefined
        ? true // si es undefined => no es un Slider y se retorna true (no hay nada que comprobar)
        : checkSliderValue(mvalue, correctAnswer.mCorrect as [number, number]);

    const bIsCorrect =
      bvalue === undefined
        ? true
        : checkSliderValue(bvalue, correctAnswer.bCorrect as [number, number]);

    reportAction({
      verbName: "tryStep",
      stepID: "[" + currentQuestionIndex + "," + currentStepIndex + "]",
      contentID: currentContetId,
      topicID: currentTopicId,
      result: mIsCorrect && bIsCorrect ? 1 : 0,
      kcsIDs: exerciseData.questions[currentQuestionIndex].steps[currentStepIndex].kcs,
      extra: {
        Response: { m: mvalue, b: bvalue },
      },
      detail: "LinearFit",
    });

    if (mIsCorrect && bIsCorrect) {
      //console.log("¡Respuesta correcta en ambos casos!");
      showAlert("😃", AlertStatus.success, "Muy bien!", null);
      setLineColor("green");
      setDisabledButton(true);
      disableBoard();
      unlockNextStep();
    } else {
      //console.log("Respuesta incorrecta");
      showAlert("😕", AlertStatus.error, "Respuesta Incorrecta");
      setLineColor("red");
      unlockHint();
    }
  };

  const checkSliderValue = (sliderValue: number, correctRange: [number, number]) => {
    return correctRange[0] <= sliderValue && sliderValue <= correctRange[1];
  };

  // @ts-ignore
  const handleHintClick = () => {
    boardRef.current.create(
      "functiongraph",
      [
        function (x) {
          return -0.8583 * x + 1963.8;
        },
      ],
      { strokeWidth: 2 },
    );
  };

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
        <Button onClick={checkAnswer} disabled={disabledButton} colorScheme="teal" size="sm">
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
          //interactiveHint={handleHintClick}
          numEnabledHints={numHintsActivated}
          resetNumHintsActivated={resetNumHintsActivated}
        ></HintButton>
      </ButtonGroup>
      <ResAlert
        title={alertTitle}
        status={alertStatus}
        alertHidden={alertHidden}
        text={alertMsg}
      ></ResAlert>
    </Flex>
  );
};
