import { Box, Text } from "@chakra-ui/react";

import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

const LatexPreview = ({ content }) => {
  const renderLatexContent = text => {
    // Se divide el texto en fragmentos basados en los delimitadores
    const parts = [];
    let currentIndex = 0;
    let match;

    // Expresión regular para encontrar \[ ... \] y \( ... \)
    const regex = /(\\\[.*?\\\]|\\\(.*?\\\))/gs;

    while ((match = regex.exec(text)) !== null) {
      // Se añade el texto normal antes del LaTeX si existe
      if (match.index > currentIndex) {
        parts.push({
          type: "text",
          content: text.slice(currentIndex, match.index),
        });
      }

      // Determinar si es block o inline y extraer el contenido LaTeX
      const isBlock = match[0].startsWith("\\[");
      const latexContent = match[0].slice(2, -2); // Remover \[ \] o \( \)

      parts.push({
        type: isBlock ? "block" : "inline",
        content: latexContent,
      });

      currentIndex = regex.lastIndex;
    }

    // Se añade cualquier texto restante después del último LaTeX
    if (currentIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(currentIndex),
      });
    }

    // Se renderiza cada parte según su tipo
    return parts.map((part, index) => {
      switch (part.type) {
        case "block":
          return (
            <TeX key={index} block>
              {part.content}
            </TeX>
          );
        case "inline":
          return <TeX key={index}>{part.content}</TeX>;
        default:
          return (
            <Text key={index} as="span">
              {part.content}
            </Text>
          );
      }
    });
  };

  return (
    <Box>
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Box>{renderLatexContent(content)}</Box>
      </Box>
    </Box>
  );
};

export default LatexPreview;
