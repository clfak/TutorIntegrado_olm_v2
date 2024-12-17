import { Box, Center, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { withAuth, useAuth } from "../components/Auth";
import { CardSelectionTopic } from "../components/contentSelectComponents/CardSelectionTopics";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAction } from "../utils/action";
import StartModel, {
  GroupModel,
  selectedExcercise,
  SelectExcercise,
  UserModel,
} from "../utils/startModel";
import { useSnapshot } from "valtio";
import { gSelect } from "../components/GroupSelect";

export default withAuth(function TopicSelect() {
  const router = useRouter();
  const { user } = useAuth();
  const registerTopic = router.query.registerTopic as string; // topics in array
  //console.log(registerTopic);
  const topic = parseInt(registerTopic, 10).toString(); // Convertir a string
  //const nextContentPath = router.asPath + "";

  const [topicCodes, setTopicCodes] = useState<string[]>([]);

  StartModel(user.id);

  const { data: subtopicsData, isLoading: isSubtopicsLoading } = useGQLQuery(
    gql(/* GraphQL */ `
      query GetSubtopics($parentIds: [IntID!]!) {
        topics(ids: $parentIds) {
          childrens {
            id
            code
            label
            sortIndex
          }
        }
      }
    `),
    {
      parentIds: [topic], // Convertir a número para la consulta
    },
  );

  // Acción para el registro
  const action = useAction();
  useEffect(() => {
    action({
      verbName: "displaySubTopics",
      topicID: registerTopic,
      //extra: { selectionData },
    });
  }, [registerTopic, action]);

  // Manejo de subtópicos
  useEffect(() => {
    if (subtopicsData) {
      const codes = subtopicsData.topics[0]?.childrens?.map(child => child.code) || [];
      setTopicCodes(codes);
    }
  }, [subtopicsData]);

  SelectExcercise(topicCodes);

  const sortedChildrens =
    subtopicsData?.topics?.[0]?.childrens?.sort((a, b) => a.sortIndex - b.sortIndex) || [];

  UserModel(user.id);

  const gs = useSnapshot(gSelect);

  GroupModel(gs.group, user.projects[0].code);

  console.log("aa", selectedExcercise.kcXtopic, selectedExcercise.ejercicio);

  return (
    <>
      <Center flexDirection="column" p={4}>
        <Heading mb="4">Factorización </Heading>
        <Text mb="5">Lista de subtópicos</Text>
        <Box w="full" mx="auto" overflowY="auto" p={4}>
          <SimpleGrid columns={3} spacing={10} mt="4">
            {!isSubtopicsLoading &&
              !selectedExcercise.isLoading &&
              !selectedExcercise.isLoading &&
              sortedChildrens.map((ejercicio, i) =>
                selectedExcercise.kcXtopic[ejercicio.id] &&
                selectedExcercise.kcXtopic[ejercicio.id].length > 0 ? (
                  <CardSelectionTopic
                    key={ejercicio.id}
                    id={ejercicio.id}
                    index={i}
                    label={ejercicio.label}
                    registerTopic={registerTopic}
                    //nextContentPath={nextContentPath}
                    KCs={selectedExcercise.kcXtopic[ejercicio.id] || []} // pasar KCs correspondientes
                  />
                ) : (
                  console.log("Tópico sin ejercicios")
                ),
              )}
          </SimpleGrid>
        </Box>
      </Center>
    </>
  );
});
