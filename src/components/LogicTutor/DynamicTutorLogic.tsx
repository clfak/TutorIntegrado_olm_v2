import React from "react";
import { Image, Container, Center, Stack, Box } from "@chakra-ui/react";
import type { ExLog } from "./Tools/ExcerciseType2";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import StepComponent from "./StepComponent";
const DynamicTutorLogic = ({ exc, topicId }: { exc: ExLog; topicId: string }) => {
  return (
    <>
      <Stack textAlign="center" fontSize={{ base: "12px", sm: "15px", lg: "20px" }}>
        <Center>Titulo: {exc.title}</Center>
        <Box
          as="span"
          flex="1"
          textAlign="center"
          fontSize={{ base: "1rem" }}
          maxW={{ base: "100%" }}
        >
          <Latex>{exc.text}</Latex>
        </Box>
      </Stack>
      {exc.initialExpression ? (
        exc.initialExpression !== "" ? (
          <>
            <Stack textAlign="center" fontSize={{ base: "1rem" }} maxW={{ base: "100%" }}>
              <Center>
                <Latex>{"$$" + exc.initialExpression + "$$"}</Latex>
              </Center>
            </Stack>
          </>
        ) : null
      ) : exc.steps[0]?.expression ? (
        exc.steps[0].expression !== "" ? (
          <>
            <Stack textAlign="center" fontSize={{ base: "1rem" }}>
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
              <Image
                objectFit="cover"
                src={`img/${exc.img}`}
                alt="Broken image"
                maxW={{ base: "100%" }}
              />
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
