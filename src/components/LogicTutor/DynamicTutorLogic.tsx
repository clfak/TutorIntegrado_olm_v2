import React from "react";
import { Image, Container, Center, Stack } from "@chakra-ui/react";
import Inter1 from "../../components/LogicTutor/LogicaJson/Inter1.json";
import type { ExLog } from "./Tools/ExcerciseType2";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import StepComponent from "./StepComponent";
const DynamicTutorLogic = ({ exc, topicId }: { exc: ExLog; topicId: string }) => {
  if (exc == undefined) {
    exc = Inter1 as ExLog;
  }
  if (topicId == undefined) {
    topicId = "38";
  }
  return (
    <>
      <Stack textAlign="center" fontSize={{ base: "12px", sm: "15px", lg: "20px" }}>
        <Center>Titulo: {exc.title}</Center>
        <Latex>{exc.text}</Latex>
      </Stack>
      {exc.eqc ? (
        exc.eqc !== "" ? (
          <>
            <Stack textAlign="center" fontSize={{ base: "15px", sm: "20px", lg: "25px" }}>
              <Center>
                <Latex>{"$$" + exc.eqc + "$$"}</Latex>
              </Center>
            </Stack>
          </>
        ) : null
      ) : exc.steps[0]?.expression ? (
        exc.steps[0].expression !== "" ? (
          <>
            <Stack textAlign="center" fontSize={{ base: "15px", sm: "20px", lg: "25px" }}>
              <Center>
                <Latex>{`$$` + exc.steps[0].expression + `$$`}</Latex>
              </Center>
            </Stack>
          </>
        ) : null
      ) : null}
      <Container maxW="container.sm" color="#262626">
        <br />
        {exc.img ? (
          <>
            <Center>
              <Image objectFit="cover" src={`img/${exc.img}`} alt="Broken image" />
            </Center>
          </>
        ) : null}
      </Container>
      <Stack style={{ justifyContent: "center", margin: "auto" }}>
        <StepComponent exc={exc} nStep={0} topicId={topicId} />
      </Stack>
    </>
  );
};
export default DynamicTutorLogic;
