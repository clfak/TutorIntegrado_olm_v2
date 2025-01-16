import React, { useState } from "react";
import RatingQuestion from "../RatingQuestion";
import {
  Box,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Latex from "react-latex-next";
import type { ExLog } from "./Tools/ExcerciseType2";
import { FaHandPointRight } from "react-icons/fa";
import { useAction } from "../../utils/action";

const TrueFalse = dynamic(() => import("./TrueFalse"), { ssr: false });
const Blank = dynamic(() => import("./Blank"), { ssr: false });
const InputButtons = dynamic(() => import("./InputButtons"), { ssr: false });
const Alternatives = dynamic(() => import("./Alternatives"), { ssr: false });
const MultiplePlaceholders = dynamic(() => import("./MultiplePlaceholders"), { ssr: false });
const TableStep = dynamic(() => import("./TableStep"), { ssr: false });
const SinglePlaceholder = dynamic(() => import("./SinglePlaceholder"), { ssr: false });
const SingleAnswer = dynamic(() => import("./SingleAnswer"), { ssr: false });
const extras = { steps: {} };

const ShowSteps = ({
  exc,
  nStep,
  Step,
  setStep,
  topic,
}: {
  exc: ExLog;
  nStep: number;
  Step: any;
  setStep: any;
  topic: string;
}) => {
  const [completed, setCompleted] = useState(false);
  const next = parseInt(exc.steps[nStep].answers[0].nextStep);
  const [changed, setChanged] = useState(false);
  const action = useAction();
  const [report, setReport] = useState(true);
  const [color, setColor] = useState("#bee3f8");

  const stepType = exc.steps[nStep]?.stepType;
  console.log("hola" + exc.steps[nStep].stepType);

  return (
    <AccordionItem>
      <h2>
        <AccordionButton
          style={{ backgroundColor: color }}
          onClick={() => {
            setStep(nStep);
          }}
        >
          <Box
            as="span"
            flex="1"
            textAlign="center"
            fontSize={{ base: "1rem" }}
            maxW={{ base: "80%" }}
          >
            <Box display="flex" alignItems="center" mr={1}>
              <FaHandPointRight />
              <Latex>{exc.steps[nStep].stepTitle}</Latex>
            </Box>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={8} index={nStep}>
        {/* Renderiza componentes según stepType */}
        {stepType === "TrueFalse" && (
          <TrueFalse exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === "Blank" && (
          <Blank exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === "Alternatives" && (
          <Alternatives exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === "InputButtons" && (
          <InputButtons exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === "MultiplePlaceholders" && (
          <MultiplePlaceholders exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === "SinglePlaceholder" && (
          <SinglePlaceholder exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === "TableStep" && (
          <TableStep exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
        {stepType === undefined && (
          <SingleAnswer exc={exc} nStep={nStep} setCompleted={setCompleted} topic={topic} />
        )}
      </AccordionPanel>
      {/* Si está completado y el nextStep es -1, muestra un mensaje de éxito */}
      {completed && next === -1 ? (
        <>
          <Alert status="success">
            <AlertIcon />
            Ejercicio Terminado
          </Alert>
          {!changed && (setColor("#C6F6D5"), setChanged(true))}
          {report && (
            <>
              {action({
                verbName: "completeContent",
                contentID: exc.code,
                topicID: topic,
                result: 1,
                extra: extras,
              })}
              {setReport(false)}
            </>
          )}
          <RatingQuestion />
        </>
      ) : completed && next !== -1 ? (
        <>
          <ShowSteps exc={exc} nStep={next} Step={Step} setStep={setStep} topic={topic} />
          {!changed && (setColor("#C6F6D5"), setStep(next), setChanged(true))}
        </>
      ) : null}
    </AccordionItem>
  );
};

export default ShowSteps;
