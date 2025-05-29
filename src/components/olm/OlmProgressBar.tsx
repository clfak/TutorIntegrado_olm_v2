import React from "react";
import { Text, HStack, Progress, ProgressLabel } from "@chakra-ui/react";

interface OlmProgressBarProps { percent: number }

export default function OlmProgressBar({ percent }: OlmProgressBarProps) {
    return (
        <HStack maxW="sm" w="full" spacing={2} align="center">
            <Progress
                value={percent}
                size="md"
                borderRadius="md"
                bg="gray.300"
                flex="1"
                h="4"
                sx={{
                    "& > div": {  
                        bg: "#56AB2F", 
                        borderRadius: "inherit" 
                    },
                }}
                aria-label={`Progreso ${percent}%`}
            />
            <Text fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
                {percent}%
            </Text>
        </HStack>
    );
}