import React from "react";
import { Box, Text, Image } from "@chakra-ui/react";

import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

const MathDisplay = ({ description, mathExpression, image }) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" maxW="400px">
      <Text mb={4}>{description}</Text>
      {image ? <Image src={image}></Image> : <TeX>{mathExpression}</TeX>}
    </Box>
  );
};

export default MathDisplay;
