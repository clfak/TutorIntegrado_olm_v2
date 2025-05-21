import React, { useEffect, useState } from "react";
import { Accordion, Center } from "@chakra-ui/react";
import type { ExLog } from "./Tools/ExcerciseType2";
import "katex/dist/katex.min.css";
import { useAction } from "../../utils/action";
import ShowSteps from "./ShowSteps";
import { sessionState } from "../SessionState";

const StepComponent = ({ exc, nStep, topicId }: { exc: ExLog; nStep: number; topicId: string }) => {
  //console.log(exc?.code)
  //console.log("Sesion topic " + sessionState.topic)
  //console.log("current code "+sessionState.currentContent.code)
  const action = useAction();
  const [Step, setStep] = useState(0);
  //console.log("Valor Step Base: ", Step)
  useEffect(() => {
    action({
      verbName: "loadContent",
      contentID: sessionState.currentContent.code,
      topicID: topicId,
    });
  }, [action, topicId]);

  return (
    <>
      <Center>
        <Accordion allowToggle defaultIndex={0} index={Step}>
          <Center>
            <ShowSteps exc={exc} nStep={nStep} Step={Step} setStep={setStep} topic={topicId} />
          </Center>
        </Accordion>
      </Center>
    </>
  );
};

export default StepComponent;
