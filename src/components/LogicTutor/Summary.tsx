import { Image, Alert, Box, Center, Heading, AlertIcon, VStack } from "@chakra-ui/react";
import React from "react";
import Latex from "react-latex-next";
import type { ExLog } from "./Tools/ExcerciseType2";

const Summary = ({ exc }: { exc: ExLog }) => {
  return (
    <>
      <Alert status="info" alignItems="top">
        <AlertIcon />
        <VStack w="100%" align="left">
          <Center>
            <Heading fontSize="xl">Resumen</Heading>
          </Center>
          <VStack spacing={4} align="center" justify="center" w="100%">
            <Latex>{exc.text + "$$" + exc.initialExpression + "$$"}</Latex>
            {exc.img ? (
              <>
                <Center>
                  <Image
                    objectFit="cover"
                    src={`img/${exc.img}`}
                    alt="Broken image"
                    maxW={{ base: "60%" }}
                  />
                </Center>
              </>
            ) : null}
          </VStack>
          {exc.steps.map((_, index) => (
            <>
              <Box>
                <Center>
                  <Latex>{exc.steps[index].summary}</Latex>
                </Center>
                <Latex>{"$$" + exc.steps[index].displayResult[0] + "$$"}</Latex>
              </Box>
            </>
          ))}
        </VStack>
      </Alert>
    </>
  );
};
export default Summary;
