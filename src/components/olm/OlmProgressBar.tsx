import { HStack, Progress, ProgressLabel } from "@chakra-ui/react";

const OlmProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
    <HStack maxW="sm" w="100%">
        <Progress
            value={percent}
            size="md"
            rounded="lg"                   
            colorScheme="blue"
        >
            <ProgressLabel color="black">
                {percent}%
            </ProgressLabel>
        </Progress>
    </HStack>
);

export default OlmProgressBar;
