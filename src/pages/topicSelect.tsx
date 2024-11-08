import { Box, Center, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { withAuth, useAuth } from "../components/Auth";
import { CardSelectionTopic } from "../components/contentSelectComponents/CardSelectionTopics";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAction } from "../utils/action";
import UmProxy, { usuario, GdProxy, gq } from "../components/ModelQueryProxy";

export default withAuth(function topicSelect() {
  const router = useRouter();
  const { user } = useAuth();
  const registerTopic = router.query.registerTopic as string; // topics in array
  console.log(registerTopic);
  const topic = parseInt(registerTopic, 10).toString(); // Convertir a string
  const nextContentPath = router.asPath + "";

  const [topicCodes, setTopicCodes] = useState<string[]>([]);
  const [kcsData, setKcsData] = useState<any>({}); // Cambiar a objeto para mapear id a KCs

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

  const { data: userModelData } = useGQLQuery(
    gql(/* GraphQL */ `
      query usermodel($userId: IntID!) {
        users(ids: [$userId]) {
          email
          groups {
            code
            id
            tags
          }
          modelStates(
            input: { filters: { type: ["BKT"] }, orderBy: { id: DESC }, pagination: { first: 1 } }
          ) {
            nodes {
              json
            }
          }
        }
      }
    `),
    { userId: user.id },
  );

  UmProxy.usuario = userModelData as usuario;

  let a = user.groups;
  var grupo;
  for (var e of a) {
    if (e.tags[0] == "main") {
      grupo = e.id;
      break;
    }
  }

  if (!grupo) grupo = 2;

  console.log("grupo: " + grupo + " project: " + user.projects[0].code);

  const { data: GroupData } = useGQLQuery(
    gql(`
      query potato($groupId: IntID!,$projectCode: String!) {
        groupModelStates(groupId: $groupId,projectCode: $projectCode){
          id
          json
        }
      }
    `),
    { groupId: grupo, projectCode: user.projects[0].code },
  );

  GdProxy.gd = GroupData as gq;

  if (GdProxy.gd) console.log("gd: " + GdProxy.gd.groupModelStates[0].id);

  return (
    <>
      <Center h="100vh" flexDirection="column" p={4}>
        <Heading mb="4">Factorización</Heading>
        <Text mb="5">Lista de subtópicos</Text>
        <Box maxW="md" w="full" mx="auto" overflowY="auto" maxH="80vh" p={4}>
          <SimpleGrid columns={1} spacing={10} mt="4">
            {!isSubtopicsLoading &&
              !isKcsLoading &&
              sortedChildrens.map(ejercicio => (
                <CardSelectionTopic
                  key={ejercicio.id}
                  id={ejercicio.id}
                  label={ejercicio.label}
                  registerTopic={registerTopic}
                  nextContentPath={nextContentPath}
                  KCs={kcsData[ejercicio.id] || []} // pasar KCs correspondientes
                />
              ))}
          </SimpleGrid>
        </Box>
      </Center>
    </>
  );
});
