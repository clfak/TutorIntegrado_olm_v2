import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Center, SimpleGrid } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { formatDate } from "../components/challenge/tools";
import { useAuth, withAuth } from "../components/Auth";
import { CardSelectionDynamic } from "../components/challenge/CardSelectionDynamic";
import type { ExType } from "../components/lvltutor/Tools/ExcerciseType";
import { CardLastExercise } from "../components/contentSelectComponents/CardLastExercise";
import parameters from "../components/contentSelectComponents/parameters.json";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import ShowContent from "../components/challenge/ShowContent";
import ProgressBar from "../components/challenge/ProgressBar";
import { LoadingOverlay } from "../components/challenge/LoadingOverlay";
import { sessionState } from "../components/SessionState";
import type { ContentJson } from "../components/SessionState";
import type { wpExercise } from "../components/tutorWordProblems/types";
import { useAction } from "../utils/action";
import { SkillModel, calculateUserProgress } from "../components/challenge/tools";

//----------------------------

const queryGetActions = gql(`
  query getActions($input: ActionsTopicInput!, $pagination: CursorConnectionArgs!) {
        actionsTopic {
          allActionsByUser(input: $input, pagination: $pagination) {
            nodes {
              actions {
                timestamp
                id
                extra
                content {
                  code
                  id
                }
                verb {
                  name
                }
              }
              email
            }
          }
        }
      }
  `);

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
`);

const queryGroupUsersWithModelStates = gql(`
  query GetGroupUsersWithModelStates {
    currentUser {
      id
      groups {
        id
        label
        users {
          id
          email
          name
          role
          modelStates(
            input: { filters: { type: ["BKT"] }, orderBy: { id: DESC }, pagination: { first: 1 } }
          ) {
            nodes {
              json
            }
          }
        }
      }
    }
  }
`);

const queryGetKcsByTopics = gql(`
  query GetKcsByTopics2($topicsCodes: [String!]!) {
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
`);

//-------------------------

function extractIds(data) {
  return data?.map(item => item.id);
}

//----------------------------

function removeAdminUsers(data) {
  const filteredGroups = data?.groups?.map(group => {
    const filteredUsers = group.users.filter(user => user.role === "USER");

    return {
      ...group,
      users: filteredUsers,
    };
  });

  return {
    ...data, // Copia todas las propiedades del objeto original
    groups: filteredGroups, // Sobrescribe la propiedad `groups` con los grupos filtrados
  };
}

function getUserJsonById(currentUser: any, userId: string): any | null {
  // Verifica si currentUser y sus propiedades existen
  if (!currentUser || !currentUser.groups || !Array.isArray(currentUser.groups)) {
    return null; // Si no hay datos válidos, retorna null
  }

  // Itera sobre cada grupo en el array `groups`
  for (const group of currentUser.groups) {
    // Verifica si el grupo tiene usuarios y si es un array
    if (group.users && Array.isArray(group.users)) {
      // Busca el usuario con el `id` especificado
      const user = group.users.find(user => user.id === userId);
      if (user) {
        // Si el usuario tiene `modelStates` y `nodes`, busca el `json`
        if (user.modelStates && Array.isArray(user.modelStates.nodes)) {
          const node = user.modelStates.nodes[0]; // Asume que el `json` está en el primer nodo
          if (node && node.json) {
            return node.json; // Retorna el `json` del usuario
          }
        }
      }
    }
  }

  return null; // Si no se encuentra el usuario o el `json`, retorna null
}

function getCodes(array) {
  return array.map(item => item.code);
}

function getUniqueKcs(kcsByContentByTopics: any[]): string[] {
  if (!Array.isArray(kcsByContentByTopics)) {
    return []; // Return an empty array or handle the error as needed
  }

  const uniqueKcs = new Set<string>(); // Use a Set to avoid duplicates

  // Loop through each object in the main array
  kcsByContentByTopics.forEach(item => {
    // Loop through the kcs of each object
    item.kcs?.forEach(kc => {
      uniqueKcs.add(kc.code); // Add the code to the Set
    });
  });

  // Convert the Set back to an array
  return Array.from<string>(uniqueKcs);
}

//------------------------------------

export default withAuth(function ChallengesStart() {
  const router = useRouter();

  const { user, project } = useAuth();
  const userId = user?.id;

  const { challengeId, preview } = router.query;

  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentProgress, setStudentProgress] = useState(0);
  const [contents, setContents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicsCode, setTopicsCode] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const domainId = parameters.CSMain.domain;

  const nextContentPath = `/challengeStart?challengeId=${challengeId}`; //"/challenge";

  const [showContent, setShowContent] = useState(true);
  const [showDemo, setShowDemo] = useState(true);

  const [processedContentResult, setProcessedContentResult] = useState(null);
  const [processedBestExercise, setProcessedBestExercise] = useState(null);
  const [processedSelectionData, setProcessedSelectionData] = useState(null);
  const [processedLastExercise, setProcessedLastExercise] = useState(null);
  const [processedExperimentGroup, setProcessedExperimentGroup] = useState(null);

  //const [showLoading, setShowLoading] = useState(false);
  const [refreshDataManualLoading, setRefreshDataManualLoading] = useState(false); // Estado de carga para la actualización de CardSelection
  const [refreshProgressManualLoading, setRefreshProgressManualLoading] = useState(false); // Estado de carga para la barra de progreso

  //--------------------------------

  const { data: dataChallenge, isLoading: isChallengeLoading } = useGQLQuery(queryGetChallenge, {
    challengeId: challengeId,
  });

  const {
    data: dataGroupUsersWithModelStates,
    isLoading: isGroupUsersWithModelStatesLoading,
    refetch: refetchModelStates,
  } = useGQLQuery(
    queryGroupUsersWithModelStates,
    /*{
        refetchOnWindowFocus: false,
        //refetchOnMount: false,
        refetchOnReconnect: false,
      }*/
  );

  const { data: dataKcsByTopics, isLoading: isKcsByTopicsLoading } = useGQLQuery(
    queryGetKcsByTopics,
    {
      topicsCodes: topicsCode,
    },
    { enabled: !!topicsCode },
  );

  const [userByJsonById, setUserByJsonById] = useState<Record<string, SkillModel>>({});

  useEffect(() => {
    if (!isGroupUsersWithModelStatesLoading && dataGroupUsersWithModelStates) {
      const GroupUsersWithModelStates = dataGroupUsersWithModelStates.currentUser || [];
      let removeAdmin;
      if (preview === "true") {
        removeAdmin = GroupUsersWithModelStates;
      } else {
        removeAdmin = removeAdminUsers(GroupUsersWithModelStates);
      }
      console.log("preview", preview);
      //setUsersWithModelStates(removeAdmin);
      setUserByJsonById(getUserJsonById(removeAdmin, userId));
    }
  }, [isGroupUsersWithModelStatesLoading, dataGroupUsersWithModelStates]);

  useEffect(() => {
    if (
      !isKcsByTopicsLoading &&
      dataKcsByTopics &&
      !isGroupUsersWithModelStatesLoading &&
      dataGroupUsersWithModelStates &&
      userByJsonById
    ) {
      const kcsByContentByTopics = dataKcsByTopics?.kcsByContentByTopics || [];
      const uniqueKcs = getUniqueKcs(kcsByContentByTopics);

      console.log("userByJsonById", userByJsonById);
      const averageLevelUser = calculateUserProgress(uniqueKcs, userByJsonById) * 100;
      setStudentProgress(averageLevelUser);
    }
  }, [isKcsByTopicsLoading, dataKcsByTopics, isGroupUsersWithModelStatesLoading, dataGroupUsersWithModelStates, userByJsonById]);

  useEffect(() => {
    if (!isChallengeLoading && dataChallenge) {
      const challenge = dataChallenge?.challenge;
      setTitle(challenge.title);
      setEndDate(challenge?.endDate);
      setContents(extractIds(challenge.content));
      setTopics(extractIds(challenge.topics));
      setTopicsCode(getCodes(challenge.topics));
    }
  }, [isChallengeLoading, dataChallenge]);

  //-------------------------------------------

  // Add this state variable to track previous showContent value
  const [prevShowContent, setPrevShowContent] = useState(showContent);

  // Add this useEffect to track changes in showContent
  useEffect(() => {
    // Check if showContent changed from false to true
    if (!prevShowContent && showContent) {
      console.log("showContent changed from false to true");
      // You could trigger additional logic here if needed
    }
    // Update the previous value
    setPrevShowContent(showContent);
  }, [showContent]);

  //--------------------
  // Function to filter by challengeId
  function filterByChallengeId(data, challengeId) {
    return data?.filter(item => item.extra.challengeID === challengeId);
  }

  // Function to get the newest object based on the timestamp
  function getNewest(data) {
    // Check if data is undefined, null, or empty
    if (!data || data.length === 0) return null;

    let newest = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i].timestamp > newest.timestamp) {
        newest = data[i];
      }
    }
    return newest;
  }

  /*function getTodayDate() {
    // Obtener la fecha actual
    const today = new Date();

    // Convertir la fecha a formato ISO 8601 (UTC)
    const isoString = today.toISOString();
    //console.log("date", isoString)
    return isoString;
  }
  //console.log("date", getTodayDate())
*/
  const {
    data: actionsData,
    isLoading: actionsLoading,
    // error: actionsError,
  } = useGQLQuery(queryGetActions, {
    input: {
      endDate: "2025-12-31T12:00:00.000Z", //getTodayDate(),//"2025-03-16T20:20:55.000Z", // la fecha de hoy
      projectId: 4,
      startDate: "2025-03-01T00:00:00.000Z", //, // El 1 de Marzo del 2025
      verbNames: ["challengeContentCompleted"],
    },
    pagination: { last: 1 },
  });

  function findObjectById(data, id) {
    // Verifica si el contenido existe y es un array
    if (!data.content || !Array.isArray(data.content)) {
      console.error("El contenido no es válido o no es un array.");
      return null;
    }

    // Busca el objeto que tenga el id especificado
    const result = data.content.find(item => item.id === id);

    // Si no se encuentra ningún objeto con ese id, devuelve null
    if (!result) {
      console.warn(`No se encontró ningún objeto con el id: ${id}`);
      return null;
    }

    // Devuelve el objeto encontrado
    return result;
  }

  //-----------------------------------
  const { data, isLoading, isError, refetch } = useGQLQuery(
    // isFetching
    gql(/* GraphQL */ `
      query ContentSelected($input: ContentSelectionInput!) {
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
                topics {
                  id
                  code
                }
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
        topicId: topics,
        discardLast: 2,
      },
    },
    {
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !!showContent, //&& showContent //&& !prevShowContent,
    },
  );

  const {
    data: dataDemo,
    isLoading: isLoadingDemo,
    //isError: isErrorDemo,
    //isFetched: isFetchingDemo,
  } = useGQLQuery(
    gql(`
      query DataDemo($ids: [IntID!]!) {
        content(ids: $ids) {
          code
          description
          id
          json
          kcs {
            code
          }
          label
          topics {
            id
            code
          }
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
      //enabled: !isChallengeLoading && !!contents,
    },
  );

  const action = useAction();

  //----------------------------------------

  function getNextContent(demoContent, resultContent) {
    // Verifica si demoContent es un array y tiene elementos
    if (!Array.isArray(demoContent) || demoContent.length === 0) {
      console.error("demoContent no es un array válido o está vacío.");
      return null;
    }

    // Encuentra el índice de resultContent en demoContent
    const currentIndex = demoContent.findIndex(item => item.id === resultContent.id);

    // Si no se encuentra resultContent, devuelve null
    if (currentIndex === -1) {
      console.warn("resultContent no se encontró en demoContent.");
      return null;
    }

    // Calcula el índice del siguiente objeto
    const nextIndex = currentIndex + 1;

    // Si nextIndex está dentro de los límites del arreglo, devuelve el siguiente objeto
    if (nextIndex < demoContent.length) {
      return demoContent[nextIndex];
    } else {
      // Si resultContent es el último elemento, devuelve null
      console.log("resultContent es el último elemento en demoContent.");
      return () => {
        setShowDemo(false);
        setShowContent(false);
      };
    }
  }

  const [useFiltered, setUseFiltered] = useState(null); // Estado para controlar si se usa filtered o demoContent

  useEffect(() => {
    if (
      !actionsLoading &&
      actionsData &&
      !isLoadingDemo &&
      dataDemo &&
      dataDemo.content.length > 0
    ) {
      const actions = actionsData.actionsTopic.allActionsByUser.nodes[0].actions;
      console.log("actionsData", actions);

      const filtered = filterByChallengeId(actions, challengeId); // Filtra ejercicios por id
      console.log("filtered:", filtered);
      console.log("datademo", dataDemo);
      if (filtered !== null && filtered.length > 0) {
        const newest = getNewest(filtered); // Obtiene el ejercicio más nuevo
        console.log("newest.content.id:", newest?.content.id);

        const resultContent = findObjectById(dataDemo, newest?.content.id); // Busca el contenido en dataDemo
        console.log("resultContent:", resultContent);

        if (resultContent) {
          const nextContent = getNextContent(dataDemo.content, resultContent); // Obtiene el siguiente contenido
          console.log("nextContent:", nextContent);

          if (nextContent) {
            // Encuentra el índice de nextContent en demoContent
            const nextIndex = dataDemo.content.findIndex(item => item.id === nextContent.id);
            console.log("nextIndex:", nextIndex);

            if (nextIndex !== -1) {
              setCurrentIndex(nextIndex); // Actualiza currentIndex a la posición de nextContent, ayuda a sincronizar localStorage con lo que envia el servidor

              const topic = nextContent.topics[0].id;
              // Actualiza sessionState con el siguiente contenido
              sessionState.currentContent.code = nextContent.json.code;
              sessionState.currentContent.json = nextContent.json;
              sessionState.nextContentPath = nextContentPath;
              sessionState.topic = topic;
              sessionState.callbackType = "challenge";
              sessionState.callback = createNextExerciseCallback(
                dataDemo.content.map(content => content.json),
                nextIndex,
              );
            } else {
              console.log("nextContent no se encontró en demoContent.");
              // sale de demo y entra al tutor (usa cardSelection)
              setShowDemo(false);
              setShowContent(false);
            }
          } else {
            // sale de demo y entra al tutor (usa cardSelection)
            setShowDemo(false);
            setShowContent(false);
            console.log("No hay siguiente contenido.");
          }
        } else {
          // El profesor modifico los ejercicios demo y el ultimo ejercicio completado no concuerda con los nuevos
          // ejercicios demos
          // 1) los nuevos ejercicios demos no concuerdan con el ultimo realizado por el usuario, solo basta con
          // ejecutar los demos desde el primero, pero, 2) si alguno concuerda podrían no mostrarse los nuevos
          // ejercicios demos anteriores a ese:
          console.log("No se encontró resultContent para el id:", newest?.content.id);

          setCurrentIndex(0); // para modificar el valor guardado en localStorage

          setUseFiltered(false); // corrige el caso 1
        }
      } else {
        setUseFiltered(false); // Indica que se debe usar demoContent
      }
    }
  }, [actionsLoading, actionsData, isLoadingDemo, dataDemo]);

  // useEffect para la lógica de demoContent (solo se ejecuta si useFiltered es false)
  useEffect(() => {
    if (useFiltered === false && !isLoadingDemo && showDemo) {
      const demoContent = dataDemo ? dataDemo.content.map(content => content.json) : [];

      const topic = dataDemo.content[currentIndex]?.topics[0].id;
      if (
        demoContent &&
        demoContent.length > 0 &&
        currentIndex >= 0 &&
        currentIndex < demoContent.length
      ) {
        const currentContent = demoContent[currentIndex] as unknown as ContentJson | wpExercise;

        //console.log("demoContent 2", demoContent);
        //console.log("currentContent 2", currentContent.code);

        // Actualiza sessionState con el contenido actual
        sessionState.currentContent.code = currentContent.code;
        sessionState.currentContent.json = currentContent;
        sessionState.nextContentPath = nextContentPath;
        sessionState.topic = topic;
        sessionState.callbackType = "challenge";
        sessionState.callback = createNextExerciseCallback(demoContent, currentIndex);
      } else {
        setShowDemo(false);
        setShowContent(false);
        console.log("No hay contenido demo disponible o currentIndex está fuera de límites.");
      }
    }
  }, [useFiltered, isLoadingDemo, showDemo, dataDemo, currentIndex]);

  //-----------------------------------

  useEffect(() => {
    if (
      data?.contentSelection?.contentSelected?.PU &&
      data.contentSelection.contentSelected.PU[0]
    ) {
      setProcessedLastExercise(data.contentSelection.contentSelected.PU[0]);
      console.log(
        "data.contentSelection.contentSelected.PU[0]",
        data.contentSelection.contentSelected.PU[0],
      );

      // Procesar experimentGroup
      if (!isError && user) {
        const expGroup =
          user.tags && user.tags.indexOf(parameters.CSMain.experimentalTag) >= 0
            ? parameters.CSMain.experimentalTag
            : parameters.CSMain.controlTag;
        setProcessedExperimentGroup(expGroup);
      }

      // Procesar contentResult
      if (!isLoading && !isError && data?.contentSelection?.contentSelected?.contentResult) {
        const sortedContent = [...data.contentSelection.contentSelected.contentResult].sort(
          (a, b) => {
            return parseInt(a.Order) - parseInt(b.Order);
          },
        );
        setProcessedContentResult(sortedContent);
      }
    }
  }, [isLoading, isError, data, user]); //, parameters.CSMain.experimentalTag, parameters.CSMain.controlTag]);

  useEffect(() => {
    if (processedContentResult && processedContentResult.length > 0) {
      try {
        const bestIdx =
          processedContentResult
            .map(x => x.Preferred)
            .reduce((out, bool, index) => (bool ? out.concat(index) : out), [])[0] ?? 0;
        setProcessedBestExercise(bestIdx);
      } catch (error) {
        console.error("Error al calcular bestExercise:", error);
        setProcessedBestExercise(0); // Valor predeterminado si hay un error
      }
    }
  }, [processedContentResult]);

  useEffect(() => {
    if (
      processedContentResult &&
      processedBestExercise !== null &&
      !isLoading &&
      !isError &&
      processedExperimentGroup
    ) {
      if (processedExperimentGroup === parameters.CSMain.controlTag) {
        if (processedContentResult[processedBestExercise]) {
          setProcessedSelectionData([
            {
              optionCode: processedContentResult[processedBestExercise]?.P?.code ?? "",
              optionTitle:
                processedContentResult[processedBestExercise]?.Msg?.label ??
                parameters.CSMain.completeTopic,
              optionBest: true,
              optionSelected: false,
            },
          ]);
        } else {
          setProcessedSelectionData([]);
        }
      } else {
        setProcessedSelectionData(
          processedContentResult.map((content, index) => ({
            optionCode: content?.P?.code ?? "",
            optionTitle: content?.Msg?.label ?? parameters.CSMain.completeTopic,
            optionBest: index === processedBestExercise,
            optionSelected: false,
          })),
        );
      }
    }
  }, [processedContentResult, processedBestExercise, processedExperimentGroup, isLoading, isError, parameters.CSMain.completeTopic, parameters.CSMain.controlTag]);

  const createNextExerciseCallback = (exercises: any[], index: number) => {
    if (index >= exercises.length) {
      sessionState.callbackType = "challenge";

      return () => {
        setShowDemo(false);
        setShowContent(false);
        console.log("No hay más ejercicios disponibles");

        if (studentProgress === 100) {
          action({
            verbName: "challengeCompleted",
            extra: {
              challengeID: challengeId,
              userID: userId,
            },
          });
        }

        handleRefreshProgress(); // actualiza la barra de progreso
      };
    }

    return () => {
      const nextContent = exercises[index];
      sessionState.nextContentPath = nextContentPath;
      sessionState.currentContent.json = nextContent;
      sessionState.currentContent.code = nextContent.code;
      setCurrentIndex(index + 1);

      action({
        verbName: "challengeContentCompleted",
        contentID: dataDemo.content[index].id,
        extra: {
          challengeID: challengeId,
          contentCode: dataDemo.content[index].code,
        },
      });

      if (studentProgress === 100) {
        action({
          verbName: "challengeCompleted",
          extra: {
            challengeID: challengeId,
            userID: userId,
          },
        });
      }

      handleRefreshProgress(); // actualiza la barra de progreso

      // Configura el callback para el siguiente ejercicio
      sessionState.callback = createNextExerciseCallback(exercises, index + 1);
      //setShowDemo(false);
      // setShowContent(false);
    };
  };

  const handleRefreshData = async () => {
    try {
      setRefreshDataManualLoading(true);
      await refetch(); // solicita datos al modelo (json)
      await refetchModelStates(); // actualiza la barra de progreso
      setShowContent(false);
      console.log("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    } finally {
      setRefreshDataManualLoading(false);
    }
  };

  const handleRefreshProgress = async () => {
    try {
      setRefreshProgressManualLoading(true);
      await refetchModelStates(); // actualiza la barra de progreso
      console.log("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    } finally {
      setRefreshProgressManualLoading(false);
    }
  };

  /* permite volver a cardSelection desde showCode al presionar RatingQuestion */
  useEffect(() => {
    if (showContent && !showDemo) {
      sessionState.callback = () => {
        handleRefreshData();

        if (studentProgress === 100) {
          action({
            verbName: "challengeCompleted",
            extra: {
              challengeID: challengeId,
              userID: userId,
            },
          });
        }
      };
      sessionState.callbackType = "tutor";
    }
  }, [showContent, showDemo]);

  //---------------------------------
  /* Necesario para evitar que el contador que se encarga de
mantener el contenido (ejercicios demo) en que va el usuario se reinicie al cambiar de página, 
ya que el componente se desmonta y vuelve a montar debido a la hidratación
de las páginas en Nextjs y eso hace que los datos cambie a los que había al momento
de montar el componente por primera vez reiniciando el contador a 0*/

  useEffect(() => {
    // Se usa challengeId para evitar colisiones
    sessionStorage.setItem("currentIndex" + challengeId, JSON.stringify(currentIndex));
  }, [currentIndex, challengeId]);

  useEffect(() => {
    const savedIndex = sessionStorage.getItem("currentIndex" + challengeId);

    if (savedIndex !== null) {
      setCurrentIndex(JSON.parse(savedIndex));
    }
  }, [challengeId]);

  //---------------------

  const isAnythingLoading =
    isLoading ||
    isChallengeLoading ||
    isLoadingDemo ||
    isGroupUsersWithModelStatesLoading ||
    isKcsByTopicsLoading ||
    actionsLoading ||
    refreshDataManualLoading ||
    refreshProgressManualLoading;
  /*
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isAnythingLoading) {
      // Mostrar LoadingOverlay después de 1.8 segundos si aún está cargando
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, 3000); // 1800 ms = 1.8 segundos
    } else {
      setShowLoading(false); // Ocultar inmediatamente si ya no hay carga
    }

    return () => {
      clearTimeout(timeoutId); // Limpiar el timeout si el componente se desmonta o cambia el estado
    };
  }, [isAnythingLoading]);*/
  /*
  if (showLoading) {
    return <LoadingOverlay />;
  }
*/

  if (isAnythingLoading) {
    return <LoadingOverlay />;
  }

  return (
    <Box key={`challengeId-${challengeId}`}>
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
          <Flex align="center" justify="space-between" height="100%" px="4" color="white">
            {/* Título y Fecha */}
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                {title || "Título no disponible"}
              </Text>
              <Text fontSize="sm">
                {endDate ? `Termina el: ${formatDate(endDate)}` : "Fecha no disponible"}
              </Text>
            </Box>

            {/* Barra de Progreso */}
            <Box w="45%">
              <ProgressBar
                key={`challengeId-${challengeId}-studentProgress-${studentProgress}`}
                label=""
                progress={studentProgress}
                color="green"
              />
            </Box>
          </Flex>
        </Box>

        {/* Contenido de la página */}
        <Box p="4" height="100%">
          {/* Ejercicios demo, para modulo desafío */}
          {showContent ? (
            <ShowContent />
          ) : (
            <>
              {/* Card Selection, seleccion de contenido */}

              <CardLastExercise
                lastExercise={processedLastExercise}
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
                    processedExperimentGroup != parameters.CSMain.experimentalTag
                      ? 1
                      : (processedContentResult ?? []).length,
                }}
                spacing="8"
                p="10"
                textAlign="center"
                rounded="lg"
              >
                {
                  //agregar componente de tópico completado
                  !isLoading ? (
                    processedExperimentGroup == parameters.CSMain.controlTag ? (
                      <Center>
                        {processedContentResult &&
                        processedBestExercise !== null &&
                        processedContentResult[processedBestExercise] ? (
                          <CardSelectionDynamic
                            id={processedContentResult[processedBestExercise]?.P?.id}
                            code={processedContentResult[processedBestExercise]?.P?.code}
                            json={
                              processedContentResult[processedBestExercise]?.P
                                ?.json as unknown as ExType
                            }
                            description={
                              processedContentResult[processedBestExercise]?.P?.description
                            }
                            label={processedContentResult[processedBestExercise]?.P?.label}
                            kcs={processedContentResult[processedBestExercise]?.P?.kcs}
                            selectionTitle={
                              processedContentResult[processedBestExercise]?.Msg?.label
                            }
                            selectionText={processedContentResult[processedBestExercise]?.Msg?.text}
                            selectionBest={false}
                            registerTopic={
                              processedContentResult[processedBestExercise]?.P?.topics[0]?.id
                            }
                            nextContentPath={nextContentPath}
                            selectionData={processedSelectionData}
                            indexSelectionData={0}
                            key={0}
                            setShowContent={setShowContent}
                          ></CardSelectionDynamic>
                        ) : (
                          <Text>No se encontró contenido disponible</Text>
                        )}
                      </Center>
                    ) : (
                      <>
                        {processedContentResult && processedContentResult.length > 0 ? (
                          processedContentResult.length > 1 ? (
                            processedContentResult.map((content, index) => (
                              <CardSelectionDynamic
                                id={content?.P?.id}
                                code={content?.P?.code}
                                json={content?.P?.json as unknown as ExType}
                                description={content?.P?.description}
                                label={content?.P?.label}
                                kcs={content?.P?.kcs}
                                selectionTitle={content?.Msg?.label}
                                selectionText={content?.Msg?.text}
                                selectionBest={index === processedBestExercise}
                                registerTopic={content?.P?.topics[0]?.id}
                                nextContentPath={nextContentPath}
                                selectionData={processedSelectionData}
                                indexSelectionData={index}
                                key={index}
                                setShowContent={setShowContent}
                              ></CardSelectionDynamic>
                            ))
                          ) : (
                            processedContentResult.map((content, index) => (
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
                                  selectionBest={index === processedBestExercise}
                                  registerTopic={content?.P?.topics[0]?.id}
                                  nextContentPath={nextContentPath}
                                  selectionData={processedSelectionData}
                                  indexSelectionData={index}
                                  key={index}
                                  setShowContent={setShowContent}
                                ></CardSelectionDynamic>
                              </Center>
                            ))
                          )
                        ) : (
                          <Text>No se encontró contenido disponible</Text>
                        )}
                      </>
                    )
                  ) : (
                    <Text>
                      {processedExperimentGroup == parameters.CSMain.controlTag
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
});
//};

//export default ChallengeStart;
