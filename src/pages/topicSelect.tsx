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
  uModel,
  UserModel,
} from "../utils/startModel";
import { useSnapshot } from "valtio";
import { gSelect } from "../components/GroupSelect";
import SuerveyQ, { reset2 } from "../components/csurvey/Answers";
import parameters from "../components/contentSelectComponents/parameters.json";

export default withAuth(function TopicSelect() {
  const router = useRouter();
  const { user } = useAuth();
  const registerTopic = router.query.registerTopic as string; // topics in array
  //console.log(registerTopic);
  const topic = parseInt(registerTopic, 10).toString(); // Convertir a string
  //const nextContentPath = router.asPath + "";

  const [topicCodes, setTopicCodes] = useState<string[]>([]);

  StartModel(user.id);
  SuerveyQ("4", ["poll-srl1", "poll-srl2", "motiv-msg"]);

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
    {
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
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

  //Asegurar que en admin la correlacion entre la id del subtópico y sortindex vaya de menor a mayor
  const sortedChildrens =
    subtopicsData?.topics?.[0]?.childrens?.sort((a, b) => Number(a.id) - Number(b.id)) || [];

  UserModel(user.id);
  const gs = useSnapshot(gSelect);

  GroupModel(gs.group ? gs.group.id : "-1", user.projects[0].code);

  console.log("aa", selectedExcercise.kcXtopic, selectedExcercise.ejercicio);

  useEffect(() => {
    reset2();
    let alltags = user.tags;
    if (gs.group) {
      alltags = user.tags.concat(gs.group.tags);
    }

    for (var e of alltags) {
      if (e === "oslm") uModel.osml = true;
      if (e === "motiv-msg") uModel.motivmsg = true;
      if (e === "session-progress") uModel.sprog = true;
    }
  }, []);

  return (
    <>
      <Center flexDirection="column" p={4}>
        <Heading>
          {parameters.CSMain.title}
          {registerTopic == parameters.CSMain.topic1.registerTopic
            ? parameters.CSMain.topic1.topic
            : registerTopic == parameters.CSMain.topic2.registerTopic
            ? parameters.CSMain.topic2.topic
            : registerTopic == parameters.CSMain.topic3.registerTopic
            ? parameters.CSMain.topic3.topic
            : registerTopic == parameters.CSMain.topic4.registerTopic
            ? parameters.CSMain.topic4.topic
            : registerTopic == parameters.CSMain.topic5.registerTopic
            ? parameters.CSMain.topic5.topic
            : registerTopic == parameters.CSMain.topic6.registerTopic
            ? parameters.CSMain.topic6.topic
            : registerTopic == parameters.CSMain.topic7.registerTopic
            ? parameters.CSMain.topic7.topic
            : registerTopic == parameters.CSMain.topic8.registerTopic
            ? parameters.CSMain.topic8.topic
            : registerTopic == parameters.CSMain.topic9.registerTopic
            ? parameters.CSMain.topic9.topic
            : registerTopic == parameters.CSMain.topic10.registerTopic
            ? parameters.CSMain.topic10.topic
            : registerTopic == parameters.CSMain.topic11.registerTopic
            ? parameters.CSMain.topic11.topic
            : parameters.CSMain.topic12.topic}
        </Heading>
        <Text mb="5">Lista de subtópicos</Text>
        <Box w="full" mx="auto" p={4}>
          <SimpleGrid columns={[1, 1, 1, 3]} spacing={10} mt="4">
            {!isSubtopicsLoading &&
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
