import { Box, RadioProps, useRadio, useRadioGroup, VStack, Text } from "@chakra-ui/react";
import { Answers } from "./Answers";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props: RadioProps) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" w={"90%"}>
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={1}
        py={1}
        textAlign={"center"}
        textColor={"white"}
        fontSize={"sm"}
      >
        {props.children}
      </Box>
    </Box>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function Choice({
  index,
  options,
  question,
}: {
  index: number;
  options: Array<string>;
  question: string;
}) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "mathchoice",
    //defaultValue: 'react',
    onChange: nextValue => {
      Answers.ans["q" + index] = [{ didreply: true, value: nextValue, question: question }];
      setChange(true);
    },
  });

  const group = getRootProps();

  useEffect(() => {
    Answers.ans["q" + index] = [{ didreply: false, value: "", question: question }];
  }, []);

  const [change, setChange] = useState(false);
  const sub = useSnapshot(Answers);

  return (
    <VStack {...group}>
      <Text hidden={sub.sumbmit ? change : true} textColor={"red.500"}>
        Este campo es requerido
      </Text>
      {options.map(value => {
        const radio = getRadioProps({ value });
        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        );
      })}
    </VStack>
  );
}

export default Choice;
