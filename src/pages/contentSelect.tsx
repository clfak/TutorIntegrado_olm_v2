import { useRouter } from "next/router";
import { SimpleGrid, Center, Text, Heading, Spinner, Box } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useAuth, withAuth } from "../components/Auth";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { CardSelectionDynamic } from "../components/contentSelectComponents/CardSelectionDynamic";
import type { ExType } from "../components/lvltutor/Tools/ExcerciseType";
import { useAction } from "../utils/action";
import { CompleteTopic } from "../components/contentSelectComponents/CompleteTopic";
import { CardLastExercise } from "../components/contentSelectComponents/CardLastExercise";
import parameters from "../components/contentSelectComponents/parameters.json";
import PBLoad from "../components/progressbar/pbload";
import {
  kcsyejercicio,
  uModel,
  gModel,
  UserModel,
  GroupModel,
  InitialModel,
} from "../utils/startModel";
import { gSelect } from "../components/GroupSelect";
import { progresscalc } from "../components/progressbar/progresscalc";
import { reset, SVP } from "../components/csurvey/Answers";
import { SurveyViewer } from "../components/csurvey/SurveyViewer";
import sample from "../components/csurvey/SurveySample.json";
import sample2 from "../components/csurvey/SurveySample2.json";

export default withAuth(function ContentSelect() {
  const { user, project } = useAuth();
  const router = useRouter();
  const topics = router.query.topic?.toString() || ""; //topics in array
  //console.log(topics);
  const registerTopic = router.query.registerTopic + ""; //topics in array
  //console.log(registerTopic);
  const nextContentPath = router.asPath + ""; //topics in array
  const domainId = parameters.CSMain.domain;

  const { data, isLoading, isError, isFetching } = useGQLQuery(
    gql(/* GraphQL */ `
      query ProjectData($input: ContentSelectionInput!) {
        contentSelection {
          contentSelected(input: $input) {
            contentResult {
              P {
                id
                code
                json
                kcs {
                  code
                }
                description
                label
              }
              Msg {
                label
                text
              }
              Order
              Preferred
            }
            model
            newP
            PU
            pAVGsim
            pAVGdif
            tableSim {
              contentCode
              sim
              diff
              probSuccessAvg
              probSuccessMult
            }
            tableDifEasy {
              contentCode
              sim
              diff
              probSuccessAvg
              probSuccessMult
            }
            tableDifHarder {
              contentCode
              sim
              diff
              probSuccessAvg
              probSuccessMult
            }
            topicCompletedMsg {
              label
              text
            }
          }
        }
      }
    `),
    {
      input: {
        domainId,
        projectId: project.id,
        userId: user.id,
        topicId: topics.split(","),
        discardLast: 2,
      },
    },
    {
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );
  const contentResult = data?.contentSelection?.contentSelected?.contentResult?.sort((a, b) => {
    return parseInt(a.Order) - parseInt(b.Order);
  });
  //console.log(data?.contentSelection?.contentSelected);

  const lastExercise = data?.contentSelection?.contentSelected?.PU[0];
  //console.log("ejercicio ", lastExercise);
  //const [queryLastExercise, setQueryLastExercise] = useState(false);

  const bestExercise =
    !isLoading &&
    !isError &&
    ((contentResult ?? [])
      .map(x => x.Preferred)
      .reduce((out, bool, index) => (bool ? out.concat(index) : out), [])[0] ??
      0);

  const experimentGroup =
    !isError && user.tags.indexOf(parameters.CSMain.experimentalTag) >= 0
      ? parameters.CSMain.experimentalTag
      : parameters.CSMain.controlTag;

  const selectionData =
    !isLoading &&
    !isError &&
    (experimentGroup == parameters.CSMain.controlTag
      ? [
          {
            optionCode: contentResult[bestExercise]?.P?.code ?? "",
            optionTitle: contentResult[bestExercise]?.Msg?.label ?? parameters.CSMain.completeTopic,
            optionBest: true,
            optionSelected: false,
          },
        ]
      : (contentResult ?? []).map((content, index) => {
          return {
            optionCode: content?.P?.code ?? "",
            optionTitle: content?.Msg?.label ?? parameters.CSMain.completeTopic,
            optionBest: index == bestExercise,
            optionSelected: false,
          };
        }));

  const action = useAction();
  useEffect(() => {
    data &&
      !isFetching &&
      action({
        verbName: "displaySelection",
        topicID: registerTopic,
        extra: { selectionData },
      });
  }, [data]);
  UserModel(user.id);

  const gs = useRef(gSelect);

  GroupModel(gs.current.group, user.projects[0].code);

  let pbValues = {
    uservalues: 0,
  };

  //!uModel.isLoading && !gModel.isLoading && !InitialModel.isLoading
  if (!uModel.isLoading) {
    pbValues.uservalues = progresscalc(kcsyejercicio.lista, uModel.data);
    if (uModel.osml) pbValues["groupvalues"] = progresscalc(kcsyejercicio.lista, gModel.data);
    if (uModel.motivmsg) pbValues["msg"] = "potato";
    if (uModel.sprog) {
      let ouval = progresscalc(kcsyejercicio.lista, InitialModel.data);
      let diff = pbValues.uservalues - ouval;
      pbValues["deltau"] = (diff * 100).toFixed(0);
    }
  }

  const [pageload, setPL] = useState(false);

  useEffect(() => {
    reset();
    if (!SVP.topicselect) SVP.count++;
    setPL(true);
  }, []);

  return (
    <>
      {pageload ? (
        SVP.topicselect ? (
          <SurveyViewer data={sample} />
        ) : SVP.count % 3 == 2 ? (
          <SurveyViewer data={sample2} />
        ) : null
      ) : null}
      {isError ? (
        <p>{parameters.CSMain.noData}</p>
      ) : data?.contentSelection?.contentSelected?.topicCompletedMsg?.label ==
        parameters.CSMain.completeMsgService ? (
        <CompleteTopic />
      ) : !isLoading && !isFetching /*&& !queryLastExercise*/ ? (
        <>
          <Center>
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
                : parameters.CSMain.topic9.topic}
            </Heading>
            &nbsp;&nbsp;&nbsp;
          </Center>

          <br></br>
          <Center>
            <Box
              w={["100%", "100%", "100%", "md"]}
              p="4"
              borderRadius="md"
              textAlign="center"
              color="white"
              bg="blue.700"
              _hover={{
                color: "white",
                bg: "blue.900",
              }}
            >
              <Heading size="sm">Progreso</Heading>
              {PBLoad(pbValues)}
            </Box>
          </Center>
          <CardLastExercise
            lastExercise={lastExercise}
            //setQueryLastExercise={setQueryLastExercise}
          />
          <br></br>
          <Center>
            <Text> {parameters.CSMain.text} </Text>
          </Center>

          <SimpleGrid
            columns={{
              lg: 1,
              xl:
                experimentGroup != parameters.CSMain.experimentalTag
                  ? 1
                  : (contentResult ?? []).length,
            }}
            spacing="8"
            p="10"
            textAlign="center"
            rounded="lg"
          >
            {
              //agregar componente de tópico completado
              !isLoading ? (
                experimentGroup == parameters.CSMain.controlTag ? (
                  <Center>
                    <CardSelectionDynamic
                      id={contentResult[bestExercise]?.P?.id}
                      code={contentResult[bestExercise]?.P?.code}
                      json={contentResult[bestExercise]?.P?.json as unknown as ExType}
                      description={contentResult[bestExercise]?.P?.description}
                      label={contentResult[bestExercise]?.P?.label}
                      kcs={contentResult[bestExercise]?.P?.kcs}
                      selectionTitle={contentResult[bestExercise]?.Msg?.label}
                      selectionText={contentResult[bestExercise]?.Msg?.text}
                      selectionBest={false}
                      registerTopic={registerTopic}
                      nextContentPath={nextContentPath}
                      selectionData={selectionData}
                      indexSelectionData={0}
                      key={0}
                    ></CardSelectionDynamic>
                  </Center>
                ) : (
                  <>
                    {contentResult.length > 1
                      ? contentResult?.map((content, index) => (
                          <CardSelectionDynamic
                            id={content?.P?.id}
                            code={content?.P?.code}
                            json={content?.P?.json as unknown as ExType}
                            description={content?.P?.description}
                            label={content?.P?.label}
                            kcs={content?.P?.kcs}
                            selectionTitle={content?.Msg?.label}
                            selectionText={content?.Msg?.text}
                            selectionBest={index == bestExercise}
                            registerTopic={registerTopic}
                            nextContentPath={nextContentPath}
                            selectionData={selectionData}
                            indexSelectionData={index}
                            key={index}
                          ></CardSelectionDynamic>
                        ))
                      : contentResult?.map((content, index) => (
                          <Center key={index + "center"}>
                            <CardSelectionDynamic
                              id={content?.P?.id}
                              code={content?.P?.code}
                              json={content?.P?.json as unknown as ExType}
                              description={content?.P?.description}
                              label={content?.P?.label}
                              kcs={content?.P?.kcs}
                              selectionTitle={content?.Msg?.label}
                              selectionText={content?.Msg?.text}
                              selectionBest={index == bestExercise}
                              registerTopic={registerTopic}
                              nextContentPath={nextContentPath}
                              selectionData={selectionData}
                              indexSelectionData={index}
                              key={index}
                            ></CardSelectionDynamic>
                          </Center>
                        ))}
                  </>
                )
              ) : (
                <Text>
                  {experimentGroup == parameters.CSMain.controlTag
                    ? parameters.CSMain.waitMsgControl
                    : parameters.CSMain.waitMsgExperimental}
                </Text>
              )
            }
          </SimpleGrid>
        </>
      ) : (
        <>
          <Center padding="5px 0px 10px 0px">
            <Heading>
              {experimentGroup == parameters.CSMain.controlTag
                ? parameters.CSMain.waitMsgControl
                : parameters.CSMain.waitMsgExperimental}
            </Heading>
          </Center>
          <Center padding="5px 0px 10px 0px">
            <Spinner size="xl" emptyColor="gray.200" color="blue.500" />
          </Center>
        </>
      )}
    </>
  );
});
