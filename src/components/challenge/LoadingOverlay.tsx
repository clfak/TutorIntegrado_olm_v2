import { Flex, Spinner } from "@chakra-ui/react";

interface LoadingOverlayProps {
  spinnerColor?: string; // Opcional: color del spinner (default: green.500)
  //bgColor?: string; // Opcional: color de fondo (default: rgba(255, 255, 255, 0.7))
}

export const LoadingOverlay = ({
  spinnerColor = "green.500",
}: //bgColor = "rgba(255, 255, 255, 0.7)",
LoadingOverlayProps) => {
  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      w="100%"
      h="100%"
      zIndex={10}
      align="center"
      justify="center"
      //bg={bgColor}
    >
      <Spinner size="xl" color={spinnerColor} />
    </Flex>
  );
};
