// pages/challengeStart.js
import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Center, SimpleGrid } from '@chakra-ui/react';
import { useRouter } from "next/router";
import { formatDate } from "../components/challenge/tools";
import { useAuth, withAuth } from "../components/Auth";
import ContentSelect from '../pages/';
import { CardSelectionDynamic } from "../components/challenge/CardSelectionDynamic";
import type { ExType } from "../components/lvltutor/Tools/ExcerciseType";
import { useAction } from "../utils/action";
import { CompleteTopic } from "../components/contentSelectComponents/CompleteTopic";
import { CardLastExercise } from "../components/contentSelectComponents/CardLastExercise";
import parameters from "../components/contentSelectComponents/parameters.json";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import ShowContent from '../components/challenge/ShowContent';
import ProgressBar from "../components/challenge/ProgressBar";
import { selectionDataType, sessionState, sessionStateBD } from "../components/SessionState";

const topicDefined = { // topic id: subtopic id
  "44": [44,45,46,47,48,49,50,51,62], //productos notables
  "4": [16,4,3,5,6,7,8], // factorización
  "19": [19,21,22,64], // potencias
  "68": [68,23,67], // raíces
  "69": [69,20], // notación cientifica
  "31": [16,31,17,18,63],// fracciones
  "52": [52,53,54,55,56], // álgebra de polinomios
}
//----------------------------

const queryGetChallenge = gql(/* GraphQL */ `
  query GetChallenge2($challengeId: IntID!) {
      challenge(id: $challengeId) {
        code
        content {
          code
          id
          json
          kcs {
            code
            id
          }
        }
        description
        enabled
        endDate
        groups {
          label
          code
          id
          projectsIds
          users {
            email
            id
            name
            role
          }
        }
        id
        startDate
        tags
        title
        topics {
           id
          code
          label
          content {
        id
        json
      }
      childrens {
        id
        code
        label
        content {
          id
          json
        }
        childrens {
          id
          code
          label
          content {
            id
            json
          }
          childrens {
            id
            code
            label
            content {
              id
              json
            }
          }
        }
      }
        } 
      }
    }
  `)
//-------------------------

function extractIds(data) {
    return data?.map(item => item.id);
}

//----------------------------

const ChallengeStart = () => {
  const router = useRouter();
  const { user, project } = useAuth();
  //const { title, endDate, studentProgress, content, topics } = router.query;
  const { challengeId } = router.query;
  //const challengeId = 1
  const [title, setTitle] = useState("")
  const [endDate, setEndDate] = useState("")
  const [studentProgress, setStudentProgress] = useState(0)
  const [contents, setContents] = useState([])
  const [topics, setTopics] = useState([])

  const [currentIndex, setCurrentIndex] = useState(0);
  const domainId = parameters.CSMain.domain;
  //const topicsString = topics.toString() || "";
  const registerTopic = 4//topics[0] + ""; //topics in array
  const nextContentPath = "/challenge" //contentSelect?topic=" + topicDefined[registerTopic] + "&registerTopic=" + registerTopic; //topics in array


const [showContent, setShowContent] = useState(true);
const [showDemo, setShowDemo] = useState(true);
const [hasMoreContent, setHasMoreContent] = useState(true);

//--------------------------------

  const { data: dataChallenge, isLoading: isChallengeLoading} = useGQLQuery(
    queryGetChallenge,
    {
     challengeId: challengeId,
    }
  );

  useEffect(()=>{
    if(!isChallengeLoading && dataChallenge){
      const challenge = dataChallenge?.challenge
      setTitle(challenge.title)
      setEndDate(challenge?.endDate)
      setStudentProgress(60)
      setContents(extractIds(challenge.content))
      setTopics(extractIds(challenge.topics))
    }
  }, [isChallengeLoading, dataChallenge])

//--------------------
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
        projectId: project?.id,
        userId: user?.id,
        topicId: topics,//topicDefined[registerTopic].toString().split(","),//topicsString.split(","),
        discardLast: 2,
      },
    },
    {
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
      //enabled: !isChallengeLoading
    },
  );

  const { data: dataContent, isLoading: isContentLoading} = useGQLQuery(
    gql(`
      query getContent {
        content(ids:[419, 459]) {
          code,
          id
          json
        }
      }`
    )
  )


  const { data: dataDemo, isLoading: isLoadingDemo, isError: isErrorDemo, isFetched: isFetchingDemo } = useGQLQuery(
    gql(/* GraphQL */ `
query DataDemo($ids: [IntID!]!) {
        content(ids: $ids) {
          code,
          description,
          id,
          json,
          kcs {
            code
          },
          label,
        }
      }
    `),
    {
      ids: contents,
    },
    {
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(()=>{
      console.log("topics", topics)
    }, [topics])

      const contentResult = data?.contentSelection?.contentSelected?.contentResult?.sort((a, b) => {
    return parseInt(a.Order) - parseInt(b.Order);
  });
  //console.log(data?.contentSelection?.contentSelected);

  const lastExercise = data?.contentSelection?.contentSelected?.PU[0];
  //const [queryLastExercise, setQueryLastExercise] = useState(false);

  const bestExercise =
    !isLoading &&
    !isError &&
    ((contentResult ?? [])
      .map(x => x.Preferred)
      .reduce((out, bool, index) => (bool ? out.concat(index) : out), [])[0] ??
      0);

  const experimentGroup =
    !isError && user?.tags.indexOf(parameters.CSMain.experimentalTag) >= 0
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


        console.log(selectionData)
    // Construir la URL dinámica para ContentSelect
   // const topicsList = "16,31,17,18,63";
    //const registerTopic = "31"; // O cualquier valor que necesites
    //const contentSelectUrl = `/contentSelect?topic=${topicsList}&registerTopic=${registerTopic}`;

      
      const createNextExerciseCallback = (exercises: any[], index: number) => {
        if (index >= exercises.length) {
          setShowContent(false);
          setShowDemo(false);
          return null;
        }
      
        return () => {
          const nextContent = exercises[index];
          //sessionState.nextContentPath = `/challengeStart?title=Desafío+${currentIndex}&endDate=1734280712000&content=${419 + currentIndex}&content=${459 + currentIndex}&topics=31&topics=19&topics=68`;
          sessionState.currentContent.json = nextContent;
          sessionState.currentContent.code = nextContent.code;
          setCurrentIndex(index + 1);
          // Configura el callback para el siguiente ejercicio
          sessionState.callback = createNextExerciseCallback(exercises, index + 1);

         /* sessionStateBD.setItem(
                        "currentContent",
                        JSON.parse(JSON.stringify(sessionState.currentContent)),
                      );*/
        };
      };

      useEffect(() => {
        console.log("currentIndex", currentIndex);
      }, [currentIndex]);

      useEffect(() => {
        console.log("showContent", showContent);
      }, [showContent]);

//---------------------------------
/* Necesario para evitar que el contador que se encarga de
mantener el contenido (ejercicios demo) en que va el usuario se reinicie al cambiar de página, 
ya que el componente se desmonta y vuelve a montar debido a la hidratación
de las páginas en Nextjs y eso hace que los datos cambie a los que había al momento
de montar el componente por primera vez reiniciando el contador a 0*/

useEffect(() => { // agregar el challengeId para evitar errores en el identificador
  sessionStorage.setItem("currentIndex", JSON.stringify(currentIndex));
}, [currentIndex]);

useEffect(() => {
  const savedIndex = sessionStorage.getItem("currentIndex");

  if (savedIndex !== null) {
    setCurrentIndex(JSON.parse(savedIndex));
  }
}, []); 

//------------------------------------------------------------

      useEffect(() => {
        // Se ejecutará cuando el contenido cambie
        console.log("currentContent updated", sessionState.currentContent);
      }, [sessionState.currentContent]);

        if(!isLoading && !isContentLoading && showDemo){
          const demoContent = dataContent.content.map((content)=>content.json)
        const currentContent = demoContent[currentIndex]//contentResult[bestExercise]?.P;
        //sessionState.currentContent.id = currentContent.id;
        sessionState.currentContent.code = currentContent.code;
        //sessionState.currentContent.description = currentContent.description;
        //sessionState.currentContent.label = currentContent.label;
        sessionState.currentContent.json = currentContent//.json as unknown as ExType;
        //sessionState.currentContent.kcs = currentContent.kcs;
        //sessionState.selectionData = selectionData;
        //sessionState.selectionData[0].optionSelected = true;
        sessionState.nextContentPath=nextContentPath
        sessionState.topic = registerTopic;
        sessionState.callbackType = "challenge";
            sessionState.callback = createNextExerciseCallback(demoContent, currentIndex);
          }; 



        if (isLoading || isContentLoading || isChallengeLoading) {
          return <Box p={5}>Cargando...</Box>;
        }

  return (
    <Box>
      <Box>
        {/* Franja en la parte superior */}
        <Box
          position="sticky"
          width="100%"
          top="0"
          left="0"
          right="0"
          height="60px" // Ajusta la altura de la franja superior
          bg="teal.500" // Color de la franja superior
          zIndex={1} // Para que quede encima del contenido
        >
          <Flex
            align="center"
            justify="space-between"
            height="100%"
            px="4"
            color="white"
          >
            {/* Título y Fecha */}
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                {title || 'Título no disponible'}
              </Text>
              <Text fontSize="sm">
                {endDate ? `Termina el: ${formatDate(endDate)}` : 'Fecha no disponible'}
              </Text>
            </Box>

            {/* Barra de Progreso */}
            <Box w="45%">
            <ProgressBar label="" progress={studentProgress} />
            </Box>
          </Flex>
        </Box>

        {/* Contenido de la página */}
        <Box p="4" height="100%">
 {/* Ejercicios demo, para modulo desafío */}
        {showContent ? (
         
          <ShowContent/>
        ) : (
          <>
          {/* Card Selection, seleccion de contenido */}

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
                      setShowContent={setShowContent}
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
                  )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChallengeStart;
