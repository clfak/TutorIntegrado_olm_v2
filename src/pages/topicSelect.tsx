import { Box, Center, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { withAuth, useAuth } from "../components/Auth";
import { CardSelectionTopic } from "../components/contentSelectComponents/CardSelectionTopics";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAction } from "../utils/action";
import StartModel, { GroupModel, UserModel } from "../utils/startModel";
import { gSelect } from "../components/GroupSelect";
import { useSnapshot } from "valtio";
import type { ExType } from "../components/lvltutor/Tools/ExcerciseType";

export default withAuth(function TopicSelect() {
  const router = useRouter();
  const { user } = useAuth();
  const registerTopic = router.query.registerTopic as string; // topics in array
  //console.log(registerTopic);
  const topic = parseInt(registerTopic, 10).toString(); // Convertir a string
  //const nextContentPath = router.asPath + "";

  const [topicCodes, setTopicCodes] = useState<string[]>([]);
  const [kcsData, setKcsData] = useState<any>({}); // Cambiar a objeto para mapear id a KCs

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

  // obtengo los KCs asociados a los códigos de los subtemas
  const { data: kcsQueryData, isLoading: isKcsLoading } = useGQLQuery(
    gql(/* GraphQL */ `
      query GetKcsByTopics($topicsCodes: [String!]!) {
        kcsByContentByTopics(projectCode: "NivPreAlg", topicsCodes: $topicsCodes) {
          topic {
            id
            content {
              code
              kcs {
                id
                code
              }
              json
            }
          }
          kcs {
            code
          }
        }
      }
    `),
    {
      topicsCodes: topicCodes,
    },
    {
      enabled: topicCodes.length > 0,
    },
  );
  let jsonlist: Array<{ code: string; json: Array<ExType | Record<string, string> | undefined> }> =
    [];
  if (kcsQueryData) {
    for (var e of kcsQueryData.kcsByContentByTopics) {
      let max = 0;
      let json;
      //let code = e.topic.code;
      for (var f of e.topic.content) {
        if (max < f.kcs.length) {
          max = f.kcs.length;
          json = f.json;
        }
      }
      if (json) jsonlist.push(json);
    }
  }

  if (jsonlist.length > 0) console.log("prueba212: ", jsonlist.length, jsonlist);

  useEffect(() => {
    if (kcsQueryData) {
      const kcsByTopic = {};
      kcsQueryData.kcsByContentByTopics.forEach(({ topic, kcs }) => {
        kcsByTopic[topic.id] = kcs.map(kc => kc); // Guarda el objeto completo de KCs
      });
      setKcsData(kcsByTopic); // guarda el objeto que contiene KCs por topic
    }
  }, [kcsQueryData]);

  const sortedChildrens =
    subtopicsData?.topics?.[0]?.childrens?.sort((a, b) => a.sortIndex - b.sortIndex) || [];

  UserModel(user.id);

  const gs = useSnapshot(gSelect);

  GroupModel(gs.group, user.projects[0].code);

  return (
    <>
      <Center flexDirection="column" p={4}>
        <Heading mb="4">Factorización </Heading>
        <Text mb="5">Lista de subtópicos</Text>
        <Box w="full" mx="auto" overflowY="auto" p={4}>
          <SimpleGrid columns={3} spacing={10} mt="4">
            {!isSubtopicsLoading &&
              !isKcsLoading &&
              sortedChildrens.map((ejercicio, i) =>
                kcsData[ejercicio.id] && kcsData[ejercicio.id].length > 0 ? (
                  <CardSelectionTopic
                    key={ejercicio.id}
                    id={ejercicio.id}
                    jsonlist={jsonlist[i].json as unknown as ExType}
                    label={ejercicio.label}
                    registerTopic={registerTopic}
                    //nextContentPath={nextContentPath}
                    KCs={kcsData[ejercicio.id] || []} // pasar KCs correspondientes
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
