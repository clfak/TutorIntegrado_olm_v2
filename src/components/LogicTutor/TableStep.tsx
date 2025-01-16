import React, { useState } from "react";
import {
  Button,
  Box,
  Alert,
  AlertIcon,
  useColorModeValue,
  Table,
  TableCaption,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  Center,
  Stack,
} from "@chakra-ui/react";

import type { ExLog, textAlign } from "./Tools/ExcerciseType2";
import Hint from "../Hint";
import Latex from "react-latex-next";
import { useAction } from "../../utils/action";

function BotonAlternar({ valores, setValor }) {
  const [indice, setIndice] = useState(0); // Estado para almacenar el índice del valor actual

  // Función para cambiar el valor del botón cuando se hace clic
  const handleClick = () => {
    // Obtenemos el índice del próximo valor (alternando entre 0 y 1)
    const siguienteIndice = indice === 0 ? 1 : 0;
    // Actualizamos el índice
    setIndice(siguienteIndice);
    // Actualizamos el valor
    setValor(valores[siguienteIndice]);
  };

  return (
    <Button colorScheme="blue" size="sm" onClick={handleClick}>
      {valores[indice]}
    </Button>
  );
}
const TableStep = ({
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
  const [valor, setValor] = useState(exc.steps[nStep].button[0][0]);
  const [valor1, setValor1] = useState(exc.steps[nStep].button[1][0]);
  const [valor2, setValor2] = useState(exc.steps[nStep].button[2][0]);
  const [valor3, setValor3] = useState(exc.steps[nStep].button[3][0]);
  const userAnswers = [valor, valor1, valor2, valor3];
  const [hints, setHints] = useState(0);
  const [_, setLastHint] = useState(false);
  const [error, setError] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [isCorrectValue, setIsCorrectValue] = useState(false);
  const textColor = useColorModeValue("dark", "white");
  const bg = useColorModeValue("#2B4264", "#1A202C");
  const [attempts, setAttempts] = useState(0);
  const action = useAction();
  const evaluar = () => {
    let respuesta = false;
    const isCorrect = userAnswers.every(
      (userAnswer, index) => userAnswer === exc.steps[nStep].answers[0].answer[index],
    );
    //console.log(isCorrect);

    isCorrect
      ? (setIsCorrectValue(true), (respuesta = true), setCompleted(true))
      : (setHints(hints + 1), setFirstTime(false), setError(true));
    setAttempts(attempts + 1);
    action({
      verbName: "tryStep",
      stepID: "" + exc.steps[nStep].stepId,
      contentID: exc.code,
      topicID: topic,
      result: respuesta ? 1 : 0,
      kcsIDs: exc.steps[nStep].KCs,
      extra: {
        response: [userAnswers],
        attempts: attempts,
        hints: hints,
      },
    });
  };

  return (
    <>
      <Center>
        <Latex>{"$$" + exc.steps[nStep].expression + "$$"}</Latex>
      </Center>
      {exc.steps[nStep].table?.tableCaption && (
        <Box marginY={5} shadow="sm" rounded="lg" w="auto" overflowX="auto">
          <Table variant="striped" size="sm" borderColor={textColor}>
            <TableCaption>
              <Latex>{exc.steps[nStep].table?.tableCaption}</Latex>
            </TableCaption>
            <Thead bgColor={bg}>
              <Tr>
                {exc.steps[nStep].table?.header?.map((head, index) => (
                  <Th
                    key={index}
                    textAlign={head?.align as textAlign}
                    color="white"
                    fontWeight="bold"
                    textTransform="none"
                  >
                    <Latex>{"$" + head?.value + "$"}</Latex>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {exc.steps[nStep].table?.rows?.map((row, index) => (
                <Tr key={index}>
                  {row?.data?.map((value, i) => {
                    return (
                      <Td key={i} textAlign={exc.steps[nStep].table?.alignRows}>
                        {value === "a" ? (
                          <Center>
                            <BotonAlternar
                              valores={exc.steps[nStep].button[0]}
                              setValor={setValor}
                            />
                          </Center>
                        ) : value === "b" ? (
                          <Center>
                            <BotonAlternar
                              valores={exc.steps[nStep].button[1]}
                              setValor={setValor1}
                            />
                          </Center>
                        ) : value === "c" ? (
                          <Center>
                            <BotonAlternar
                              valores={exc.steps[nStep].button[2]}
                              setValor={setValor2}
                            />
                          </Center>
                        ) : value === "d" ? (
                          <Center>
                            <BotonAlternar
                              valores={exc.steps[nStep].button[3]}
                              setValor={setValor3}
                            />
                          </Center>
                        ) : (
                          <Latex strict>{value}</Latex>
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      <Stack spacing={4} m={2} direction="row" justifyContent={"center"}>
        {!isCorrectValue && (
          <>
            <Button colorScheme="blue" size="sm" onClick={() => evaluar()}>
              Enviar
            </Button>
            <Hint
              hints={exc.steps[nStep].hints}
              contentId={exc.code}
              topicId={topic}
              stepId={exc.steps[nStep].stepId}
              matchingError={exc.steps[nStep].matchingError}
              response={userAnswers}
              error={error}
              setError={setError}
              hintCount={hints}
              setHints={setHints}
              setLastHint={setLastHint}
            ></Hint>
          </>
        )}
      </Stack>
      {firstTime ? null : !isCorrectValue ? (
        <Alert status="error">
          <AlertIcon />
          Tu respuesta no es la esperada intentalo denuevo.
        </Alert>
      ) : (
        <Alert status="success">
          <AlertIcon />
          {exc.steps[nStep].correctMsg}
        </Alert>
      )}
    </>
  );
};

export default TableStep;
