import React, { useState, useEffect } from "react";
import {
  Image,
  Accordion,
  AccordionIcon,
  AccordionPanel,
  AccordionItem,
  AccordionButton,
  Box,
  Text,
  Button,
  Flex,
  Stack,
  VStack,
  Progress,
  HStack,
  Heading,
  Select,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth, withAuth } from "../components/Auth";
import { useGQLQuery } from "rq-gql";
import {
  FaTrashAlt,
  FaPaperPlane,
  FaEdit,
  FaFlagCheckered,
  FaEye,
  FaEyeSlash,
  FaTimes,
} from "react-icons/fa";
import { gql } from "../graphql";
import { formatDate, getColorScheme } from "../components/challenge/tools";
import LatexPreview from "../components/challenge/LatexPreview";
import { LoadingOverlay } from "../components/challenge/LoadingOverlay";
import { sessionState } from "../components/SessionState";
import { useAction } from "../utils/action";
import { calculateUserProgress, calculateGroupProgress } from "../components/challenge/tools";

//----------------

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

//------------------------------------------------
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

//-------------------------------------------

//const projectIds = sessionState.currentUser.projects.map(project => project.id);

/*
const queryGetChallenges = gql(`
  query GetChallenges($projectsIds: IntID!) {
      activeChallenges(projectId: $projectsIds) {
        code
      }
    }
  `);*/

const queryGetChallenges = gql(/* GraphQL */ `
  query GetChallenges($challengesIds: [IntID!]!) {
    challenges(ids: $challengesIds) {
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
        code
        id
        projectsIds
        tags
        users {
          email
          id
          name
          role
          tags
        }
      }
      id
      projectId
      startDate
      tags
      title
      topics {
        id
        code
        kcs {
          id
          code
        }
      }
    }
  }
`);

//---------------------------------------------------

const mutationUpdateChallenge = gql(`
  mutation UpdateChallenge($challengeId: IntID!, $challenge: ChallengeInput!) {
    adminContent {
      updateChallenge (id: $challengeId, data: $challenge){
        code,
        content {id},
        description,
        enabled,
        endDate,
        groups{id},
        projectId,
        startDate,
      tags,
      title,
      topics{id},
      }
    }
  }`);
/*
type ChallengeInput = {
  code: string;
  contentIds: string[];
  description?: string; // Opcional
  enabled: boolean;
  endDate: string; // O Date, dependiendo de tu uso
  groupsIds: string[];
  projectId: string;
  startDate: string; // O Date
  tags: string[];
  title: string;
  topicsIds: string[];
};*/

//-------------------------

// component

// Define colors according to state
const statusColors = {
  published: "#FFFFD5",
  unpublished: "",
  finalized: "gray.200",
};

// Esto lo ve el estudiante (user.rol = USER)
const StudentCard = ({
  id,
  title,
  description,
  endDate,
  status,
  //tags,
  topics,
  groups,
  userByJsonById,
  uniqueUsers,
  userId,
}) => {
  const router = useRouter();

  function getStudentTags(groups, studentId) {
    // Recorremos cada grupo en la estructura de datos
    for (const group of groups) {
      // Buscamos al estudiante con el id especificado
      const student = group.students.find(student => student.id === studentId);

      // Si encontramos al estudiante, devolvemos sus tags
      if (student) {
        return student.tags || []; // Si no tiene tags, devolvemos un arreglo vacío
      }
    }
    // Si no se encuentra al estudiante, devolvemos un arreglo vacío
    return [];
  }

  const userTags = getStudentTags(groups, userId);

  //const jointControlEnabled = tags.includes("join-control"); // habilita selección conjunta de contenido
  const oslmEnabled = userTags?.includes("oslm"); // habilita barra de progreso del grupo (comparación social)
  const motivMsgEnabled = false; //userTags?.includes("motiv-msg"); // habilita el mensaje motivacional asociado al progreso
  //const sessionProgressEnabled = tags.includes("session-progress"); // habilita mostrar el delta de progreso dentro de la sesión

  const [studentProgress, setStudentProgress] = useState(0);
  const [groupProgress, setGroupProgress] = useState(0);

  const action = useAction();

  const handleStartChallenge = () => {
    action({
      verbName: "challengeLoad",
      extra: {
        challengeID: id,
        userID: userId,
        userProgress: studentProgress,
      },
    });

    router.push({
      pathname: "/challengeStart",
      query: { challengeId: id },
    });
  };

  const handleContinueChallenge = () => {
    action({
      verbName: "challengeLoad",
      extra: {
        challengeID: id,
        userID: userId,
        userProgress: studentProgress,
      },
    });

    router.push({
      pathname: "/challengeStart",
      query: { challengeId: id },
    });
  };

  //-------------------------------------------------------

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

  const { data: dataKcsByTopics, isLoading: isKcsByTopicsLoading } = useGQLQuery(
    queryGetKcsByTopics,
    {
      topicsCodes: getCodes(topics),
    },
  );

  //--------------------------------
  interface Student {
    id: string;
    name: string;
    tags: string[];
    progress: number;
  }

  interface Group {
    id: string;
    name: string;
    students: Student[];
    tags: string[];
  }

  function findClassmatesIncludingSelf(groups: Group[], studentId: string): Student[] {
    const groupWithStudent = groups.find(group =>
      group.students.some(student => student.id === studentId),
    );

    return groupWithStudent ? groupWithStudent.students : [];
  }

  function filterObjectsByIds(array1, array2) {
    // Extraer los IDs del segundo arreglo
    const idsFromArray2 = new Set(array2.map(item => item.id));

    // Filtrar el primer arreglo
    return array1.filter(item => idsFromArray2.has(item.userId));
  }
  //---------------------------------

  useEffect(() => {
    if (!isKcsByTopicsLoading && dataKcsByTopics) {
      const kcsByContentByTopics = dataKcsByTopics.kcsByContentByTopics || [];
      const uniqueKcs = getUniqueKcs(kcsByContentByTopics); // obtiene los kcs del desafio

      const averageLevelStudent = calculateUserProgress(uniqueKcs, userByJsonById) * 100;

      // optiene los estudiantes que comparten grupo con el usuario (incluido el usuario)
      const classmates = findClassmatesIncludingSelf(groups, userId);

      // obtiene el json y el id de los estudiantes que comparten grupo con el usuario (incluido el usuario)
      const allStudentsWithJson = filterObjectsByIds(uniqueUsers, classmates);

      const overallAverage = calculateGroupProgress(uniqueKcs, allStudentsWithJson) * 100;

      setStudentProgress(averageLevelStudent);
      setGroupProgress(overallAverage);
    }
  }, [isKcsByTopicsLoading, dataKcsByTopics]);

  //--------------------------------

  const Encouragement = ({ message, maxWidth }) => {
    const triangleStyle = {
      content: '""',
      width: 0,
      height: 0,
      borderRight: "7px solid gray",
      borderLeft: "7px solid transparent",
      borderBottom: "7px solid gray",
      borderTop: "7px solid transparent",
    };

    return (
      <HStack p={0} spacing={0} maxW={maxWidth}>
        <Image src="/img/mateo.png" alt="Logo" w="28px" h="28px" align="left" />

        {/* Cola del globo */}
        <Box style={triangleStyle} />

        {/* Globo de diálogo */}
        <Box bg="white" borderRadius="md" p={1} w="80%" borderWidth="2px" borderColor="gray.300">
          {/* Texto dentro del globo */}
          <Text noOfLines={[1, 2]}>{message}</Text>
        </Box>
      </HStack>
    );
  };

  return (
    <Box
      borderWidth={status === "finalized" ? "4px" : "1px"}
      borderRadius="md"
      p={4}
      bg={statusColors[status]} // Changes color according to status
      borderStyle={status === "finalized" ? "dashed" : "solid"}
      borderColor={status === "finalized" ? "gray.400" : "gray.200"}
      boxShadow="md"
      w="100%"
    >
      {/*Muestra spinner mientras se carga studentProgress */}
      {isKcsByTopicsLoading && <LoadingOverlay />}

      <VStack align="start" spacing={4}>
        <HStack w="100%" justify="space-between" align="center">
          <Stack
            w={{ lg: "95%", sm: "90%" }}
            spacing={4}
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
          >
            <Text
              w={{ lg: "85%", base: "100%" }}
              fontWeight="bold"
              fontSize="lg"
              textAlign="center"
            >
              {title}
            </Text>

            <Text
              w={{ lg: "30%", sm: "100%" }}
              fontSize="sm"
              color="gray.600"
              fontWeight="bold"
              ml={{ base: 8 }}
              textAlign="center"
            >
              Fecha de término: {formatDate(endDate)}
            </Text>
          </Stack>

          <HStack spacing={4}>{status === "finalized" && <FaFlagCheckered size={24} />}</HStack>
        </HStack>

        <Box w="100%" textAlign="center">
          <LatexPreview content={description} />
        </Box>

        <HStack w="100%" justify="space-between">
          <HStack justify="space-between" w="100%">
            <Text>Yo</Text>
            <HStack w="80%" justify="space-between">
              <Box
                w={{ base: "70%", sm: "85%" }}
                bg="white"
                p={1}
                borderWidth="1px"
                borderColor="gray.300"
              >
                <Progress
                  value={studentProgress}
                  size="lg"
                  colorScheme="gray"
                  sx={{
                    "&&": {
                      backgroundColor: "white",
                    },
                    "& > div": {
                      background: "green",
                    },
                  }}
                />
              </Box>
              <Text fontWeight="bold" color={getColorScheme(studentProgress)}>
                {Math.round(studentProgress) + " %"}
              </Text>{" "}
              {/* Cierre agregado */}
            </HStack>
          </HStack>
        </HStack>

        {oslmEnabled && (
          <>
            <HStack w="100%" justify="space-between">
              <HStack justify="space-between" w="100%">
                <Text>Grupo</Text>
                <HStack w="80%" justify="space-between">
                  <Box
                    w={{ base: "70%", sm: "85%" }}
                    bg="white"
                    p={1}
                    borderWidth="1px"
                    borderColor="gray.300"
                  >
                    <Progress
                      value={groupProgress}
                      size="lg"
                      colorScheme="gray"
                      sx={{
                        "&&": {
                          backgroundColor: "white",
                        },
                        "& > div": {
                          background: getColorScheme(groupProgress),
                        },
                      }}
                    />
                  </Box>
                  <Text fontWeight="bold" color={getColorScheme(groupProgress)}>
                    {Math.round(groupProgress) + " %"}
                  </Text>
                </HStack>
              </HStack>
            </HStack>
          </>
        )}

        {motivMsgEnabled && (
          <>
            <Encouragement message="¡Hola! Este es el mensaje que quiero mostrar" maxWidth="90%" />
          </>
        )}
        <Box display="flex" justifyContent="center" alignItems="center" w="100%">
          {status === "finalized" ? (
            <Button colorScheme="green" onClick={handleContinueChallenge} flex="1" maxW="200px">
              Continuar desafío
            </Button>
          ) : (
            <Button colorScheme="green" onClick={handleStartChallenge} flex="1" maxW="200px">
              Comenzar desafío
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

//----------------------------
type ChallengeInput = {
  code: string;
  contentIds: string[];
  description: string;
  enabled: boolean;
  endDate: string;
  groupsIds: string[];
  projectId: string;
  startDate: string;
  tags: string[];
  title: string;
  topicsIds: string[];
};
//---------------------------

// Esto lo ve el profesor (user.rol = ADMIN)
//export default ChallengeCard;
const ChallengeCard = ({
  id,
  title,
  description,
  endDate,
  groups,
  status,
  topics,
  setIsUpdated,
  setUpdateChallenge,
  setChallengeId,
  challengesOriginal,
  usersWithModelStates,
}) => {
  const router = useRouter();
  const [uniqueKcs, setUniqueKcs] = useState([]);
  //const [groupAverages, setGroupAverages] = useState({});

  const challengeFilter = challengesOriginal.find(challenge => challenge.id === id);

  const challengeData: ChallengeInput = {
    code: challengeFilter.code,
    contentIds: getIdsFromContent(challengeFilter.content),
    description: challengeFilter.description,
    enabled: challengeFilter.enabled,
    endDate: challengeFilter.endDate,
    groupsIds: getIdsFromContent(challengeFilter.groups),
    projectId: challengeFilter.projectId, // NivPreAlg
    startDate: challengeFilter.startDate,
    tags: challengeFilter.tags,
    title: challengeFilter.title,
    topicsIds: getIdsFromContent(challengeFilter.topics),
  };

  const action = useAction();
  const userId = sessionState.currentUser.id;

  function getIdsFromContent(content) {
    return content.map(item => item.id); // Extrae los ids
  }

  function formatDateToUTC(dateString) {
    const date = new Date(dateString); //+":00.000Z");
    return date.toISOString();
  }

  const previewClick = () => {
    // Navegar a la página de preview con un parámetro en la URL
    router.push({
      pathname: "/challengeStart",
      query: { preview: "true", challengeId: id },
    });
  };

  const handlePublish = () => {
    const updatedChallengeData = {
      ...challengeData,
      startDate: formatDateToUTC(new Date()), // Sobrescribe startDate con la fecha actual en UTC
    };
    setChallengeId(id);
    setUpdateChallenge(updatedChallengeData);
    setIsUpdated(true);

    action({
      verbName: "challengePublish",
      extra: {
        challengeID: id,
        userID: userId,
        title: challengeData.title,
        description: challengeData.description,
        endDate: challengeData.endDate,
        groupIDs: challengeData.groupsIds,
        topicIDs: challengeData.topicsIds,
        contentIDs: challengeData.contentIds,
      },
    });

    alert("Desafío publicado");
  };

  const handleUnpublish = () => {
    const updatedChallengeData = {
      ...challengeData,
      startDate: null, // Sobrescribe startDate con null
    };
    setChallengeId(id);
    setUpdateChallenge(updatedChallengeData);
    setIsUpdated(true);
    alert("Desafío publicado");
  };

  const handleDelete = () => {
    const updatedChallengeData = {
      ...challengeData,
      enabled: false,
    };
    setChallengeId(id);
    setUpdateChallenge(updatedChallengeData);
    setIsUpdated(true);
    alert("Desafío eliminado");
  };

  const handleModify = id => {
    router.push({
      pathname: "/challengeForm",
      query: { mode: "edit", challengeId: id },
    });
  };

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

  const { data: dataKcsByTopics, isLoading: isKcsByTopicsLoading } = useGQLQuery(
    queryGetKcsByTopics,
    {
      topicsCodes: getCodes(topics),
    },
  );

  //---------------------------------------

  useEffect(() => {
    if (!isKcsByTopicsLoading) {
      const kcsByContentByTopics = dataKcsByTopics.kcsByContentByTopics || [];
      setUniqueKcs(getUniqueKcs(kcsByContentByTopics));
    }
  }, [isKcsByTopicsLoading]);

  //------------------------------

  return (
    <Box
      borderWidth={status === "finalized" ? "4px" : "1px"}
      borderRadius="md"
      p={4}
      bg={statusColors[status]} // Changes color according to status
      borderStyle={status === "finalized" ? "dashed" : "solid"}
      borderColor={status === "finalized" ? "gray.400" : "gray.200"}
      boxShadow="md"
      w="100%"
    >
      <VStack align="start" spacing={4}>
        <HStack w="100%" justify="space-between" align="center">
          <Stack
            w={{ lg: "95%", sm: "90%" }}
            spacing={4}
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
          >
            <Text
              w={{ lg: "85%", base: "100%" }}
              fontWeight="bold"
              fontSize="lg"
              textAlign="center"
            >
              {title}
            </Text>

            <Text
              w={{ lg: "30%", sm: "100%" }}
              fontSize="sm"
              color="gray.600"
              fontWeight="bold"
              ml={{ base: 8 }}
              textAlign="center"
            >
              Fecha de término: {formatDate(endDate)}
            </Text>
          </Stack>

          <HStack spacing={4}>
            {status === "finalized" && <FaFlagCheckered size={24} />}
            {status === "published" && <FaEye size={24} />}
            {status === "unpublished" && <FaEyeSlash size={24} />}
          </HStack>
        </HStack>
        <Box w="100%" textAlign="center">
          <LatexPreview content={description} />
        </Box>

        {/* Accordion for groups */}
        <Accordion allowToggle w="100%">
          {groups.map((group, index) => {
            const groupsWithModelStates = usersWithModelStates?.groups?.find(
              item => item.id === group.id,
            );

            // Calcular el promedio del grupo
            const groupAverage =
              group?.students?.reduce((sum, student) => {
                const studentsWithModelStates = groupsWithModelStates?.users?.find(
                  item => item.id === student.id,
                );

                const averageLevelStudent =
                  calculateUserProgress(
                    uniqueKcs,
                    studentsWithModelStates?.modelStates?.nodes[0]?.json,
                  ) * 100;

                //console.log("averageLevelStudent", averageLevelStudent)
                return sum + averageLevelStudent;
              }, 0) / group.students.length;

            return (
              <AccordionItem key={index} w="100%">
                <AccordionButton>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm">{group.name}</Text>
                    <HStack w="70%" justify="space-between">
                      <Box
                        w={{ base: "70%", sm: "85%" }}
                        bg="white"
                        p={1}
                        borderWidth="1px"
                        borderColor="gray.300"
                      >
                        <Progress
                          value={groupAverage}
                          size="lg"
                          colorScheme="gray"
                          sx={{
                            "&&": {
                              backgroundColor: "white", // Set the progress track color to white
                            },
                            "& > div": {
                              /*https://v2.chakra-ui.com/docs/styled-system/theme#red */
                              background: getColorScheme(groupAverage),
                              //background: "linear-gradient(to right, #E53E3E, #F6AD55)"//red.500 = #E53E3E, orange.300 = #F6AD55
                            },
                          }}
                        />
                      </Box>
                      <Text fontWeight="bold" color={getColorScheme(groupAverage)}>
                        {Math.round(groupAverage) + " %"}
                      </Text>
                    </HStack>
                  </HStack>
                  <AccordionIcon display="none" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {/* List of students */}
                  {group?.students?.map((student, idx) => {
                    const studentsWithModelStates = groupsWithModelStates?.users?.find(
                      item => item.id === student.id,
                    );
                    const averageLevelStudent =
                      calculateAverageLevel(
                        studentsWithModelStates?.modelStates?.nodes[0]?.json,
                        uniqueKcs,
                      ) * 100;
                    return (
                      <HStack key={idx} justify="space-between" w="100%">
                        <Text>{student.name}</Text>
                        <HStack w="70%" justify="space-between">
                          <Box
                            w={{ base: "70%", sm: "85%" }}
                            bg="white"
                            p={1}
                            borderWidth="1px"
                            borderColor="gray.300"
                          >
                            {/*
  https://v2.chakra-ui.com/docs/styled-system/the-sx-prop
  https://v2.chakra-ui.com/docs/styled-system/style-props
  https://v2.chakra-ui.com/docs/styled-system/gradient
  https://www.w3schools.com/cssref/css3_pr_color-scheme.php
  https://stackoverflow.com/questions/65590038/how-to-add-the-gradient-to-chakra-ui-progress
  //  */}
                            <Progress
                              value={averageLevelStudent}
                              size="sm"
                              colorScheme="gray"
                              sx={{
                                "&&": {
                                  backgroundColor: "white", // Set the progress track color to white
                                },
                                "& > div": {
                                  background: getColorScheme(averageLevelStudent), // Set the progress color
                                },
                              }}
                            />
                          </Box>
                          <Text fontWeight="bold" color={getColorScheme(averageLevelStudent)}>
                            {Math.round(averageLevelStudent) + " %"}
                          </Text>
                        </HStack>
                      </HStack>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
        {/* Botón Preview */}

        <HStack justify="center" w="100%" mt={4}>
          <Button
            colorScheme="teal" // Cambia el color para diferenciarlo
            onClick={previewClick} // Función para manejar el clic
            flex="1"
            maxW="200px"
          >
            Preview
          </Button>
        </HStack>

        <HStack spacing={4} mt={4} justify="center" w="100%" wrap="wrap">
          {/* Botón para eliminar el desafío */}
          <Button colorScheme="red" onClick={handleDelete} flex="1" maxW="200px">
            <FaTrashAlt size={16} />
            {/* Botón para modificar el desafío */}
          </Button>
          {(status == "unpublished" || status == "published") && (
            <Button colorScheme="blue" onClick={() => handleModify(id)} flex="1" maxW="200px">
              <FaEdit size={24} />
            </Button>
          )}
          {/* Botón para publicar el desafío */}
          {status === "unpublished" ? (
            // Botón para publicar
            <Button colorScheme="green" onClick={() => handlePublish()} flex="1" maxW="200px">
              <FaPaperPlane size={16} />
            </Button>
          ) : status === "published" ? (
            // Botón para despublicar
            <Button colorScheme="red" onClick={() => handleUnpublish()} flex="1" maxW="200px">
              <FaTimes size={16} />
            </Button>
          ) : null}
        </HStack>
      </VStack>
    </Box>
  );
};
//--------------------------------------------

const StudentsList = ({ challenges, userByJsonById, allUsersJson, uniqueUsers, userId }) => {
  const [filteredChallenges, setFilteredChallenges] = useState(challenges);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filtrar por estado
  const handleFilterChange = status => {
    setStatusFilter(status);
  };

  // Ordenar por fecha
  const handleSortChange = order => {
    setSortOrder(order);
  };

  useEffect(() => {
    let filtered = challenges;

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filteredChallenges.filter(challenge => challenge.status === statusFilter);
    }

    // Ordenar por fecha
    filtered = filtered?.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.endDate - b.endDate;
      } else {
        return b.endDate - a.endDate;
      }
    });

    setFilteredChallenges(filtered);
  }, [statusFilter, sortOrder, challenges]);

  return (
    <Box>
      <Box p={4}>
        <Text mb={4} fontSize="xl">
          Filtrar y ordenar desafíos
        </Text>
        <Flex mb={4} gap={4}>
          {/* Filtro por estado */}
          <Select mb={4} value={statusFilter} onChange={e => handleFilterChange(e.target.value)}>
            <option value="all">Todos</option>
            <option value="published">Sin finalizar</option>
            <option value="finalized">Finalizado</option>
          </Select>

          {/* Ordenar por fecha */}
          <Select mb={4} value={sortOrder} onChange={e => handleSortChange(e.target.value)}>
            <option value="asc">Orden ascendente</option>
            <option value="desc">Orden descendente</option>
          </Select>
        </Flex>
      </Box>
      {filteredChallenges?.map(challenge => (
        <Box p={4} key={challenge.id}>
          <StudentCard
            {...challenge}
            challenges={challenges}
            userByJsonById={userByJsonById}
            allUsersJson={allUsersJson}
            uniqueUsers={uniqueUsers}
            userId={userId}
          />
        </Box>
      ))}
    </Box>
  );
};

//-----------------------------

//import ChallengeCard from './ChallengeCard';

/*
name: Nombre del desafío.
description: Descripción del desafío, explicando lo que deben hacer los estudiantes.
endDate: Fecha de finalización del desafío en formato "YYYY-MM-DD".
status: El estado del desafío, que puede ser uno de los siguientes: "active", "completed", o "inactive". Esto indica si el desafío está en progreso, completado o no iniciado.
groups: Un arreglo de grupos de estudiantes asociados con el desafío. Cada grupo tiene:
name: Nombre del grupo.
students: Un arreglo de estudiantes dentro de ese grupo, con cada estudiante teniendo:
name: Nombre del estudiante.
progress: Un valor de progreso entre 0 y 100, representando el avance del estudiante en el desafío.
*/

// https://timestamp.online/

// title, description, endDate, student, groupProgress, status, tags
/*
const student = [
  {
    title: "Desafío 1",
    description:
      "Este es el primer desafío del semestre, donde los estudiantes deben completar una serie de actividades en equipo.",
    endDate: 1734280712 * 1000,
    //studentName: "Estudiante 1",
    studentProgress: 60,
    groupProgress: 70,
    status: "published",
    tags: ["joint-control", "oslm", "motiv-msg", "session-progress"],
    content: [419, 459], // 1 de fraccione, 1 potencia
    topics: [31, 19, 68], //fracciones, potencias, raices
    id: 1,
  },
];
*/
//--------------------------

function addTagsToStudents(data) {
  data.forEach(item => {
    // Verificamos si el item tiene grupos
    if (item.groups && Array.isArray(item.groups)) {
      item.groups.forEach(group => {
        const groupTags = group.tags || [];

        group.students?.forEach(student => {
          if (!student.tags) {
            //student.tags = [];
            console.log("Faltan los tags de los estudiantes");
          }

          // Agregamos los tags del grupo al estudiante, evitando duplicados
          student.tags = [...new Set([...student.tags, ...groupTags])];
        });
      });
    }
  });
  console.log("return", data);
  return data;
}

//-----------------------------------------
// Interfaces
interface SkillLevel {
  threshold: number; // renamed from mth to be more descriptive
  currentLevel: number; // renamed from level to be more descriptive
}

interface UserProgress {
  id: string;
  json: Record<string, SkillLevel>;
}

// Función auxiliar para calcular el nivel normalizado
const calculateNormalizedLevel = (value: SkillLevel): number => {
  if (!value) return 0;
  return value.currentLevel >= value.threshold ? 1 : value.currentLevel;
};

// Función para calcular el valor promedio de habilidades
const calculateSkillsAverage = (
  skillNames: string[],
  userValues: Record<string, SkillLevel>,
): number => {
  if (skillNames.length === 0) return 0;

  // Caso especial para una sola habilidad
  if (skillNames.length === 1) {
    const skill = userValues[skillNames[0]];
    return skill ? calculateNormalizedLevel(skill) : 0;
  }

  // Calcular promedio para múltiples habilidades
  const validSkills = skillNames
    .map(name => userValues[name])
    .filter(skill => skill && skill.currentLevel !== undefined);

  if (validSkills.length === 0) return 0;

  const sum = validSkills.map(calculateNormalizedLevel).reduce((acc, val) => acc + val, 0);

  return sum / validSkills.length;
};

// Función principal para calcular el progreso
export const calculateProgress = (skillNames: string[], userProgresses: UserProgress[]): number => {
  if (!skillNames?.length || !userProgresses?.length) return 0;

  // Caso especial para un solo usuario
  if (userProgresses.length === 1) {
    return Number(calculateSkillsAverage(skillNames, userProgresses[0].json).toPrecision(2));
  }

  // Calcular promedio para múltiples usuarios
  const averageProgress =
    userProgresses
      .map(progress => calculateSkillsAverage(skillNames, progress.json))
      .reduce((sum, val) => sum + val, 0) / userProgresses.length;

  return Number(averageProgress.toPrecision(2));
};

const updateDataWithStatus = (dataArray: Challenge[]): Challenge[] => {
  const currentTimestamp = Date.now();

  return dataArray?.map(item => {
    let status = "unpublished";

    // Si enabled es false, el status siempre es "unpublished"
    if (item.enabled === false) {
      status = "unpublished";
    }
    // Si enabled es true, determinar el status basado en las fechas
    else {
      if (item.startDate) {
        status = "published";
      }

      if (new Date(item.endDate).getTime() < currentTimestamp) {
        status = "finalized";
      }
    }

    return {
      ...item,
      status: status,
    };
  });
};

type Challenge = {
  id: string;
  code: string;
  projectId: string;
  title: string;
  description: string;
  endDate: number;
  startDate: number;
  status: string;
  enabled: boolean;
  topics: [string];
  groups: {
    id: string;
    name: string;
    code: string;
    tags: [string];
    users: {
      id: number;
      name: string;
      email: string;
      progress: number;
      tags: [string];
    }[];
    students: {
      name: string;
      email: string;
      progress: number;
    }[];
  }[];
};

function filterUsersInChallenges(challenges) {
  return challenges?.map(challenge => {
    // Verifica si el desafío tiene grupos
    if (!challenge.groups || challenge.groups.length === 0) {
      return challenge; // Si no tiene grupos, se devuelve el desafío sin cambios
    }

    // Filtra los usuarios en cada grupo, manteniendo solo los que tienen rol "USER"
    const filteredGroups = challenge.groups.map(group => {
      if (!group.users || group.users.length === 0) {
        return group; // Si el grupo no tiene usuarios, se devuelve el grupo sin cambios
      }

      // Filtra los usuarios con rol "USER"
      const filteredUsers = group.users.filter(user => user.role === "USER");

      // Retorna el grupo con los usuarios filtrados
      return {
        ...group,
        users: filteredUsers,
      };
    });

    // Retorna el desafío con los grupos filtrados
    return {
      ...challenge,
      groups: filteredGroups,
    };
  });
}

function updateDataWithEndDate(input: Challenge[] = []) {
  return Array.isArray(input)
    ? input.map(challenge => ({
        id: challenge?.id,
        code: challenge?.code,
        projectId: challenge?.projectId,
        title: challenge?.title,
        description: challenge?.description,
        endDate: new Date(challenge?.endDate).getTime(),
        status: challenge?.status,
        enabled: challenge?.enabled,
        topics: challenge?.topics,
        startDate: challenge.startDate !== null ? new Date(challenge.startDate).getTime() : null,
        groups: challenge?.groups.map(group => ({
          id: group.id,
          name: group.code,
          tags: group.tags,
          students: group?.users?.map(user => ({
            id: user.id,
            name: user.email,
            tags: user.tags,
            progress: Math.floor(Math.random() * 101),
          })),
        })),
      }))
    : [];
}

//-------------------------------------------

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

function getUsersExcludingId(currentUser, userId) {
  // Verifica si currentUser y sus propiedades existen
  if (!currentUser || !currentUser.groups || !Array.isArray(currentUser.groups)) {
    return []; // Si no hay datos válidos, retorna un arreglo vacío
  }

  const usersExcludingId: any[] = [];

  // Itera sobre cada grupo en el array `groups`
  for (const group of currentUser.groups) {
    // Verifica si el grupo tiene usuarios y si es un array
    if (group.users && Array.isArray(group.users)) {
      // Filtra los usuarios cuyo `id` no coincida con `userId`
      const filteredUsers = group.users
        .filter(user => user.id !== userId)
        .map(user => ({ ...user })); // Copia profunda del usuario
      usersExcludingId.push(...filteredUsers); // Agrega los usuarios filtrados al arreglo
    }
  }

  return usersExcludingId; // Retorna el arreglo de usuarios excluyendo el `id` especificado
}

function getAllUsersJson(users) {
  // Verifica si el arreglo de usuarios es válido
  if (!users || !Array.isArray(users)) {
    return []; // Si no hay datos válidos, retorna un arreglo vacío
  }

  const allJsons = [];

  // Itera sobre cada usuario en el arreglo
  for (const user of users) {
    // Verifica si el usuario tiene `modelStates` y `nodes`
    if (user.modelStates && Array.isArray(user.modelStates.nodes)) {
      const node = user.modelStates.nodes[0]; // Asume que el `json` está en el primer nodo
      if (node && node.json) {
        allJsons.push(node.json); // Agrega el `json` al arreglo
      }
    }
  }

  return allJsons; // Retorna el arreglo con todos los `json` encontrados
}

function calculateAverageLevel(data, keysToSearch) {
  // Check if data is defined
  if (!data) {
    //console.log("Data is undefined:", { data, keysToSearch });
    return 0; // default value
  }

  // Filtra los datos que están en la lista `keysToSearch`
  const filteredData = keysToSearch?.map(key => data[key]).filter(Boolean);

  // Obtiene los valores de `level` de los datos filtrados
  const levels = filteredData.map(item => item.level);

  // Si no hay valores de `level`, imprime los datos recibidos y retorna 0
  if (levels.length === 0) {
    //console.log("Datos recibidos:", { data, keysToSearch });
    return 0; // O cualquier valor por defecto
  }

  // Calcula el promedio de los valores de `level`
  const averageLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;

  return averageLevel;
}

//-------------------------------------

const removeUnpublished = arr => {
  return arr.filter(item => item && item.status !== "unpublished");
};

//--------------------
function extractUserJsonWithEmail(GroupUsersWithModelStates) {
  const result = [];

  // Iterar sobre los grupos
  GroupUsersWithModelStates.groups.forEach(group => {
    // Iterar sobre los usuarios en cada grupo
    group.users.forEach(user => {
      // Verificar si el usuario tiene modelStates
      if (user.modelStates && user.modelStates.nodes.length > 0) {
        // Iterar sobre los modelStates
        user.modelStates.nodes.forEach(node => {
          // Extraer el json asociado al usuario
          const json = node.json;

          // Agregar el resultado al array
          result.push({
            userId: user.id,
            email: user.email, // el email es para debugear
            json: json,
          });
        });
      }
    });
  });

  return result;
}

function removeDuplicateUsers(usersData) {
  const uniqueUsersMap = new Map();

  // Iterar sobre los datos de usuarios
  usersData.forEach(user => {
    // Si el userId no está en el Map, agregarlo
    if (!uniqueUsersMap.has(user.userId)) {
      uniqueUsersMap.set(user.userId, user);
    }
  });

  // Convertir el Map de nuevo a un array
  return Array.from(uniqueUsersMap.values());
}

//---------------------------------
function filterByUserId(dataFilterUserByRole, userId) {
  return dataFilterUserByRole.filter(item => {
    // Verifica si el item tiene grupos y si alguno de los grupos contiene el userId
    return (
      item.groups &&
      item.groups.some(group => group.users && group.users.some(user => user.id === userId))
    );
  });
}
//---------------------------

//export default withAuth(function ContentSelect() {
export default withAuth(function ChallengesPage() {
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [updateChallenge, setUpdateChallenge] = useState<ChallengeInput>();

  const [challenges, setChallenges] = useState([]);
  const [challengesStudents, setChallengesStudents] = useState([]);

  const [isUpdated, setIsUpdated] = useState(false);
  const [challengeId, setChallengeId] = useState();

  const [challengesOriginal, setChallengesOriginal] = useState([]);

  const [userByJsonById, setUserByJsonById] = useState([]);
  const [allUsersJson, setAllUsersJson] = useState([]);
  const [usersWithModelStates, setUsersWithModelStates] = useState({});

  //const [isPreview, setIsPreview] = useState(false);
  const [uniqueUsers, setUniqueUsers] = useState([]);

  const { user, isLoading } = useAuth();
  const userId = user?.id;
  //const tagsUser = user?.tags;
  const isAdmin = (user?.role ?? "") == "ADMIN" ? true : false;

  const numbersAsStrings = Array.from({ length: 200 }, (_, i) => String(i + 1));
  const { data: dataChallenges, isLoading: isChallengesLoading } = useGQLQuery(queryGetChallenges, {
    challengesIds: numbersAsStrings,
  });

  const { data: dataGroupUsersWithModelStates, isLoading: isGroupUsersWithModelStatesLoading } =
    useGQLQuery(queryGroupUsersWithModelStates);

  const {
    /*data: dataUpdateChallenge,
    error: errorUpdateChallenge,
    isLoading: isUpdateChallengeLoading,*/
  } = useGQLQuery(
    mutationUpdateChallenge,
    {
      challengeId: challengeId,
      challenge: updateChallenge,
    },
    { enabled: isUpdated },
  );

  useEffect(() => {
    if (!isChallengesLoading && dataChallenges) {
      //console.log("dataChallenges", dataChallenges);
      setChallengesOriginal(dataChallenges.challenges);
    }
  }, [isChallengesLoading, dataChallenges]);

  useEffect(() => {
    const sortStudentsByProgress = challenges => {
      return challenges.map(challenge => {
        const sortedGroups = challenge.groups?.map(group => {
          const sortedStudents = group.students?.sort((a, b) => b.progress - a.progress);
          return { ...group, students: sortedStudents };
        });
        return { ...challenge, groups: sortedGroups };
      });
    };

    const transformData = () => {
      if (!isChallengesLoading) {
        // recibe todos los desafios -> filtra los desafios en los que el usuario no esta ->
        // elimina los usuarios con rol admin -> agrega el campo status ->
        // convierte las fechas en timestamp
        //console.log("dataChallenges", dataChallenges?.challenges)
        const filteredData = filterByUserId(dataChallenges?.challenges, userId); // elimina los desafio al que el usuario no pertenece
        //console.log("filteredData", filteredData)
        const dataFilterUserByRole = filterUsersInChallenges(filteredData); //elimina los users con rol Admin
        //console.log("dataFilterUserByRole", dataFilterUserByRole)
        const updatedData = updateDataWithStatus(dataFilterUserByRole); // agrega el campo status (published, unpublished, finalized)
        //console.log("updatedData", updatedData)
        const data = updateDataWithEndDate(updatedData); // convierte las fechas en timestamp
        //console.log("data", data)

        const transformedChallenge = data.map(challenge => ({
          // solo agrega el progress, crear funcion auxiliar que lo haga
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          endDate: challenge.endDate,
          status: challenge.status,
          enabled: challenge.enabled,
          topics: challenge.topics,
          groups: challenge.groups.map(group => ({
            id: group.id,
            name: group.name,
            tags: group.tags,
            students: group.students.map(user => ({
              id: user.id,
              name: user.name,
              tags: user.tags,
              progress: Math.floor(Math.random() * 101),
            })),
          })),
        }));

        const sortedStudents = sortStudentsByProgress(transformedChallenge); // ordena los stdents por su progreso dentro de cada grupo
        setChallenges(sortedStudents);
        setFilteredChallenges(sortedStudents);
      }
    };

    transformData();
  }, [isChallengesLoading]);

  const router = useRouter();
  const handleClick = () => {
    router.push("/challengeForm");
  };

  useEffect(() => {
    const challengesUnpublished = removeUnpublished(challenges); // remueve los desafios no publicados
    setChallengesStudents(addTagsToStudents(challengesUnpublished));
    console.log("addTags", addTagsToStudents(challengesUnpublished));
    //setChallengesStudents(updateArray(challengesUnpublished)); //, user?.id)); // agrega tags de forma artificial
  }, [challenges]);

  useEffect(() => {
    console.log("challengeStudents", challengesStudents);
  }, [challengesStudents]);

  useEffect(() => {
    if (!isGroupUsersWithModelStatesLoading && dataGroupUsersWithModelStates) {
      const GroupUsersWithModelStates = dataGroupUsersWithModelStates.currentUser || [];
      const removeAdmin = removeAdminUsers(GroupUsersWithModelStates);

      setUsersWithModelStates(removeAdmin);
      setUserByJsonById(getUserJsonById(removeAdmin, userId));

      const usersExcludingId = getUsersExcludingId(removeAdmin, userId);
      setAllUsersJson(getAllUsersJson(usersExcludingId));

      //----------------------

      const userJsonWithEmail = extractUserJsonWithEmail(GroupUsersWithModelStates); // obtiene el json, email y id de cadad users
      setUniqueUsers(removeDuplicateUsers(userJsonWithEmail)); // elimina los users duplicados (algunos se repiten en los grupos)

      //-------------------------
    }
  }, [isGroupUsersWithModelStatesLoading, dataGroupUsersWithModelStates]);

  //-------------------------------------------

  /*
     TAGS
Definiciones de tags que controlan aspectos de interface

joint-control: habilita selección conjunta de contenido

oslm: habilita barra de progreso del grupo (comparación social)

motiv-msg: habilita el mensaje motivacional asociado al progreso

session-progress: habilita mostrar el delta de progreso dentro de la sesión
    */

  // Filtrar por estado
  const handleFilterChange = status => {
    setStatusFilter(status);
  };

  // Ordenar por fecha
  const handleSortChange = order => {
    setSortOrder(order);
  };

  useEffect(() => {
    // evita que los ejercicios eliminados se muestren
    let filtered = challenges.filter(challenge => challenge.enabled === true);

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(challenge => challenge.status === statusFilter);
    }

    // Ordenar por fecha
    filtered = filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.endDate - b.endDate;
      } else {
        return b.endDate - a.endDate;
      }
    });

    setFilteredChallenges(filtered);
  }, [challenges, statusFilter, sortOrder]);

  if (isLoading || isChallengesLoading || isGroupUsersWithModelStatesLoading) {
    return <LoadingOverlay />;
  }

  return (
    <Box p={4}>
      {isAdmin ? (
        <Box p={8}>
          {/* Botón para crear desafio */}
          <Flex justify="flex-end" mt={6}>
            <Button colorScheme="blue" width="auto" onClick={handleClick} mt={6}>
              Crear desafío
            </Button>
          </Flex>
          <Box p={4}>
            <Text mb={4} fontSize="xl">
              Filtrar y ordenar desafíos
            </Text>
            <Flex mb={4} gap={4}>
              {/* Filtro por estado */}
              <Select
                mb={4}
                value={statusFilter}
                onChange={e => handleFilterChange(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="published">Publicado</option>
                <option value="finalized">Finalizado</option>
                <option value="unpublished">No publicado</option>
              </Select>

              {/* Ordenar por fecha */}
              <Select mb={4} value={sortOrder} onChange={e => handleSortChange(e.target.value)}>
                <option value="asc">Orden ascendente</option>
                <option value="desc">Orden descendente</option>
              </Select>
            </Flex>
          </Box>
          <Heading mb={6} textAlign="center">
            Desafíos
          </Heading>
          {filteredChallenges.length > 0 ? (
            <VStack spacing={6}>
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard
                  key={index}
                  {...challenge}
                  setIsUpdated={setIsUpdated}
                  setUpdateChallenge={setUpdateChallenge}
                  setChallengeId={setChallengeId}
                  challengesOriginal={challengesOriginal}
                  usersWithModelStates={usersWithModelStates}
                  //allUsersJson={allUsersJson}
                  //uniqueUsers={uniqueUsers}
                />
              ))}
            </VStack>
          ) : (
            <p>Cargando datos...</p>
          )}
        </Box>
      ) : (
        <StudentsList
          challenges={challengesStudents}
          userByJsonById={userByJsonById}
          allUsersJson={allUsersJson}
          uniqueUsers={uniqueUsers}
          userId={userId}
        />
      )}
    </Box>
  );
});

//export default ChallengesPage;
