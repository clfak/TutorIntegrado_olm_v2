import { Center, Heading, SimpleGrid } from "@chakra-ui/react";
import { AllContent, contentByTopic } from "../../utils/startModel";
import { CardSelectionDynamic } from "./CardSelectionDynamic";
import type { ExType } from "../lvltutor/Tools/ExcerciseType";
import { useRouter } from "next/router";
import type { selectionDataType } from "../SessionState";

export const CompleteTopic = ({ topicCodes }: { topicCodes: Array<string> }) => {
  AllContent(topicCodes);
  const router = useRouter();
  const nextContentPath = router.asPath + ""; //topics in array

  if (contentByTopic.isLoading || contentByTopic.data.content == undefined) return <>Cargando...</>;

  const selectionData: selectionDataType = {
    optionCode: "a",
    optionTitle: "b",
    optionBest: false,
    optionSelected: false,
  };

  return (
    <>
      <Center>
        <Heading>
          {"¡Muy bien!, has completado el tópico: " + contentByTopic.data.content[0].label}
        </Heading>
      </Center>
      <SimpleGrid columns={[1, 1, 1, 3]} spacing="8" p="10" textAlign="center" rounded="lg">
        {contentByTopic.data.content.map((content, index) => (
          <CardSelectionDynamic
            id={content.id}
            code={content.code}
            json={content.json as ExType}
            description={content.description}
            label={content.label}
            kcs={content.kcs}
            selectionTitle={content.label}
            selectionText={""}
            selectionBest={false}
            registerTopic={topicCodes[0]}
            nextContentPath={nextContentPath}
            selectionData={[selectionData]}
            indexSelectionData={0}
            key={index}
          ></CardSelectionDynamic>
        ))}
      </SimpleGrid>
    </>
  );
};
