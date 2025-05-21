import { Box, Link } from "@chakra-ui/react";

export const NewUser = () => {
  return (
    <>
      <Box marginBottom={2} marginTop={10} p={4} bg="orange.300" textAlign="center">
        Comienza ingresando en el botón Login a la izquierda. Si no tienes cuenta de usuario, puedes
        solicitarla en este{" "}
        <Link
          color="blue.500"
          href="https://forms.gle/dJgg9H53fTxm56mHA"
          target="_blank"
          rel="noopener noreferrer"
        >
          formulario.{" "}
        </Link>
      </Box>
    </>
  );
};
