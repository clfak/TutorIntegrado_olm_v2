import { Box, Center, Heading, SimpleGrid, Text } from "@chakra-ui/react";
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
  Subtopic,
  GetSubtopics,
  gModel,
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
  console.log("holaaaaaa");

  GetSubtopics(topic);

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
    if (Subtopic.data) {
      const codes = Subtopic.data[0]?.childrens?.map(child => child.code) || [];
      setTopicCodes(codes);
    }
  }, [Subtopic.data]);

  SelectExcercise(topicCodes);

  //Asegurar que en admin la correlacion entre la id del subtópico y sortindex vaya de menor a mayor
  const sortedChildrens =
    Subtopic.data[0]?.childrens?.sort((a, b) => Number(a.id) - Number(b.id)) || [];

  UserModel(user.id);
  const gs = useSnapshot(gSelect);

  GroupModel(gs.group ? gs.group.id : "-1", user.projects[0].code);

  console.log("aa", selectedExcercise.kcXtopic, selectedExcercise.ejercicio);

  useEffect(() => {
    reset2();
  }, []);

  let alltags = user.tags;
  if (gs.group) {
    alltags = user.tags.concat(gs.group.tags);
  }

  var oslm: number = 0;
  var motiv: number = 0;
  var sprog: number = 0;
  var pol1: number = 0;
  var pol2: number = 0;

  for (var e of alltags) {
    if (e === "oslm") oslm++;
    if (e === "motiv-msg") motiv++;
    if (e === "session-progress") sprog++;
    if (e === "poll-srl1") pol1++;
    if (e === "poll-srl2") pol2++;
  }

  if (oslm > 0) uModel.osml = true;
  else uModel.osml = false;
  if (motiv > 0) uModel.motivmsg = true;
  else uModel.motivmsg = false;
  if (sprog > 0) uModel.sprog = true;
  else uModel.sprog = false;
  if (pol1 > 0) uModel.pol1 = true;
  else uModel.pol1 = false;
  if (pol2 > 0) uModel.pol2 = true;
  else uModel.pol2 = false;

  if (Subtopic.isLoading || selectedExcercise.isLoading || uModel.isLoading || gModel.isLoading) {
    return <Box p={5}> Cargando...</Box>;
  }

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
            {!Subtopic.isLoading &&
              !selectedExcercise.isLoading &&
              sortedChildrens.map((ejercicio, i) =>
                selectedExcercise.kcXtopic[ejercicio.id] &&
                selectedExcercise.kcXtopic[ejercicio.id].length > 0 ? (
                  <CardSelectionTopic
                    key={ejercicio.id}
                    id={ejercicio.id}
                    index={i}
                    label={ejercicio.label}
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
