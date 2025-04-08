import React from "react";
import { Box, Text, Image } from "@chakra-ui/react";

import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

const MathDisplay = ({ description, mathExpression, image }) => {
  const renderDescription = text => {
    // Expresión regular para encontrar \text{contenido}
    const texRegex = /\\text\{([^}]*)\}/g;

    // Si no contiene \text{}, devuelve el texto normal
    if (!texRegex.test(text)) {
      return <Text mb={4}>{text}</Text>;
    }
    return (
      <Box mb={4}>
        <TeX>{text}</TeX>
      </Box>
    );
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" maxW="400px">
      {renderDescription(description)}
      {image ? <Image src={image}></Image> : <TeX>{mathExpression}</TeX>}
    </Box>
  );
};

export default MathDisplay;
