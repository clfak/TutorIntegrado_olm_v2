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
import { useAuth } from "../components/Auth";
import { useGQLQuery } from "rq-gql";
import {
  FaTrashAlt,
  FaPaperPlane,
  FaEdit,
  FaFlagCheckered,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { gql } from "../graphql";
import { formatDate, getColorScheme } from "../components/challenge/tools";
import LatexPreview from "../components/challenge/LatexPreview";

//----------------
/*
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
*/
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
        users {
          email
          id
          name
          role
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
//----------------------------------
/*const getTopicsFromChallenges = challengesOriginal => {
  if (!challengesOriginal || !Array.isArray(challengesOriginal)) {
    return [];
  }

  // Creamos el arreglo de objetos
  const challengeObjects = challengesOriginal.map(challenge => ({
    id: challenge.id,
    topicCodes: challenge.topics?.map(topic => topic.code) || [],
  }));

  return challengeObjects;
};*/

//--------------------------
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
};

//-------------------------

// component

// Define colors according to state
const statusColors = {
  published: "#FFFFD5",
  unpublished: "",
  finalized: "gray.200",
};

const StudentCard = ({
  id,
  title,
  description,
  endDate,
  studentProgress,
  groupProgress,
  status,
  tags,
  topics,
}) => {
  const router = useRouter();

  //const jointControlEnabled = tags.includes("join-control"); // habilita selección conjunta de contenido
  const oslmEnabled = tags.includes("oslm"); // habilita barra de progreso del grupo (comparación social)
  const motivMsgEnabled = tags.includes("motiv-msg"); // habilita el mensaje motivacional asociado al progreso
  //const sessionProgressEnabled = tags.includes("session-progress"); // habilita mostrar el delta de progreso dentro de la sesión

  /*
  const calculateGroupProgress = (students) => {
    if (students.length === 0) return 0; // Avoid division by zero
    const totalProgress = students.reduce((sum, student) => sum + student.progress, 0);
    return totalProgress / students.length;
  };*/

  const handleStartChallenge = () => {
    router.push({
      pathname: "/challengeStart",
      query: { challengeId: id },
    });
  };

  function getCodes(array) {
    return array.map(item => item.code);
  }
  const queryResult = useGQLQuery(queryGetKcsByTopics, {
    topicsCodes: getCodes(topics),
  });

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

  console.log("uniqueKcs", getUniqueKcs(queryResult?.data?.kcsByContentByTopics));
  const uniqueKcs: string[] = getUniqueKcs(queryResult?.data?.kcsByContentByTopics || []);

  const { data: dataKcsByTopics, isLoading: isKcsByTopicsLoading } = useGQLQuery(
    queryGetKcsByTopics,
    {
      topicsCodes: uniqueKcs,
    },
  );

  console.log("kcsByTopics1", dataKcsByTopics);

  useEffect(() => {
    if (!isKcsByTopicsLoading) {
      console.log("kcsByTopics", dataKcsByTopics);
    }
  }, [isKcsByTopicsLoading]);

  //const groupProgress = calculateGroupProgress(group.students);

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
              <Text
                fontWeight="bold"
                color={
                  studentProgress <= 50
                    ? "red.500"
                    : studentProgress < 70
                    ? "orange.400"
                    : "orange.300"
                }
              >
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
                  <Text
                    fontWeight="bold"
                    color={
                      groupProgress <= 50
                        ? "red.500"
                        : groupProgress < 70
                        ? "orange.400"
                        : "orange.300"
                    }
                  >
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
          <Button colorScheme="green" onClick={handleStartChallenge}>
            Comenzar desafío
            {/*<FaRocket size={24} />*/}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

//----------------------------

//export default ChallengeCard;
const ChallengeCard = ({
  id,
  title,
  description,
  endDate,
  groups,
  status,
  setIsUpdated,
  setUpdateChallenge,
  setChallengeId,
  challengesOriginal,
}) => {
  const router = useRouter();
  const challengeFilter = challengesOriginal.find(challenge => challenge.id === id);

  const challengeData: ChallengeInput = {
    code: challengeFilter.code,
    contentIds: getIdsFromContent(challengeFilter.content),
    description: challengeFilter.description,
    enabled: challengeFilter.enabled,
    endDate: challengeFilter.endDate,
    groupsIds: getIdsFromContent(challengeFilter.groups),
    projectId: challengeFilter.projectId, // 	NivPreAlg
    startDate: challengeFilter.startDate,
    tags: challengeFilter.tags,
    title: challengeFilter.title,
    topicsIds: getIdsFromContent(challengeFilter.topics),
  };

  function getIdsFromContent(content) {
    return content.map(item => item.id); // Extrae los ids
  }

  function formatDateToUTC(dateString) {
    const date = new Date(dateString); //+":00.000Z");
    return date.toISOString();
  }

  const handlePublish = () => {
    const updatedChallengeData = {
      ...challengeData,
      startDate: formatDateToUTC(new Date()), // Sobrescribe startDate con la fecha actual en UTC
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

  const calculateGroupProgress = students => {
    if (students.length === 0) return 0; // Avoid division by zero
    const totalProgress = students.reduce((sum, student) => sum + student.progress, 0);
    return totalProgress / students.length;
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
            // Calculate group progress
            const groupProgress = calculateGroupProgress(group.students);
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
                          value={groupProgress}
                          size="lg"
                          colorScheme="gray"
                          sx={{
                            "&&": {
                              backgroundColor: "white", // Set the progress track color to white
                            },
                            "& > div": {
                              /*https://v2.chakra-ui.com/docs/styled-system/theme#red */
                              background: getColorScheme(groupProgress),
                              //background: "linear-gradient(to right, #E53E3E, #F6AD55)"//red.500 = #E53E3E, orange.300 = #F6AD55
                            },
                          }}
                        />
                      </Box>
                      <Text
                        fontWeight="bold"
                        color={
                          groupProgress <= 35
                            ? "red.500"
                            : groupProgress < 70
                            ? "orange.400"
                            : "orange.300"
                        }
                      >
                        {Math.round(groupProgress) + " %"}
                      </Text>
                    </HStack>
                  </HStack>
                  <AccordionIcon display="none" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {/* List of students */}
                  {group.students.map((student, idx) => (
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
                            value={student.progress}
                            size="sm"
                            colorScheme="gray"
                            sx={{
                              "&&": {
                                backgroundColor: "white", // Set the progress track color to white
                              },
                              "& > div": {
                                background: getColorScheme(student.progress), // Set the progress color
                              },
                            }}
                          />
                        </Box>
                        <Text
                          fontWeight="bold"
                          color={
                            student.progress <= 35
                              ? "red.500"
                              : student.progress < 70
                              ? "orange.400"
                              : "orange.300"
                          }
                        >
                          {Math.round(student.progress) + " %"}
                        </Text>
                      </HStack>
                    </HStack>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
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
          {status == "unpublished" && (
            <Button colorScheme="green" onClick={() => handlePublish()} flex="1" maxW="200px">
              <FaPaperPlane size={16} />
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
//--------------------------------------------

const StudentsList = ({ challenges }) => {
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
    filtered = filtered.sort((a, b) => {
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
      {filteredChallenges.map(challenge => (
        <Box p={4} key={challenge.id}>
          {console.log("challengeStudent", challenge)}
          <StudentCard {...challenge} challenges={challenges} />
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
  {
    title: "Desafío 2",
    description:
      "En este desafío, los estudiantes deben completar un proyecto práctico en equipo relacionado con la ingeniería.",
    endDate: 1710952712 * 1000,
    //studentName: "Estudiante 1",
    studentProgress: 60,
    groupProgress: 70,
    status: "finalized",
    tags: ["joint-control", "motiv-msg", "session-progress"],
    content: [],
    topics: [],
  },
  {
    title: "Desafío 3",
    description:
      "Desafío de revisión final donde los estudiantes completan pruebas y ejercicios sobre el material del curso.",
    endDate: 1733788800 * 1000,
    //studentName: "Estudiante 1",
    studentProgress: 60,
    groupProgress: 70,
    status: "finalized",
    tags: ["joint-control", "session-progress"],
    content: [],
    topics: [],
  },
  {
    title: "Desafío 4",
    description:
      "Desafío de resolución de problemas matemáticos, donde los estudiantes deben resolver una serie de ecuaciones y problemas complejos.",
    endDate: 1734185600 * 1000,
    //studentName: "Estudiante 1",
    studentProgress: 60,
    groupProgress: 70,
    status: "finalized",
    tags: ["joint-control", "oslm", "session-progress"],
    content: [],
    topics: [],
  },
];
*/
//--------------------------

function updateArray(array, userIdToRemove) {
  // Recorrer cada objeto en el arreglo
  return array.map(item => {
    // Agregar las nuevas propiedades al objeto
    item.studentProgress = 60; // Valor por defecto
    item.groupProgress = 70; // Valor por defecto
    item.tags = ["joint-control", "oslm", "motiv-msg", "session-progress"];

    // Si el objeto tiene grupos, eliminar al usuario con el id especificado
    if (item.groups && Array.isArray(item.groups)) {
      item.groups.forEach(group => {
        if (group.students && Array.isArray(group.students)) {
          // Filtrar y eliminar al usuario con el id especificado
          group.students = group.students.filter(student => student.id !== userIdToRemove);
        }
      });
    }

    return item;
  });
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
    if (item.startDate) {
      status = "published";
    }

    if (new Date(item.endDate).getTime() < currentTimestamp) {
      //(item.endDate && new Date(item.endDate).getTime() >= currentTimestamp){
      status = "finalized";
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
    name: string;
    code: string;
    users: {
      id: number;
      name: string;
      email: string;
      progress: number;
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
        groups: challenge?.groups.map(group => ({
          name: group.code,
          students: group?.users?.map(user => ({
            id: user.id,
            name: user.email,
            progress: Math.floor(Math.random() * 101),
          })),
        })),
      }))
    : [];
}

//-------------------------------------------
/*
const sortStudentsByProgress = challenges => {
  return challenges.map(challenge => {
    const sortedGroups = challenge.groups?.map(group => {
      const sortedStudents = group.students.sort((a, b) => b.progress - a.progress);
      return { ...group, students: sortedStudents };
    });
    return { ...challenge, groups: sortedGroups };
  });
};
*/
//sortStudentsByProgress(challenges);

//--------------------------------------------
/*
function filterStudentsByTopics(students, topicsKcs) {
  // Extraer las claves de topics.kcs
  const topicKeys = Object.keys(topicsKcs);

  // Filtrar los estudiantes cuyos nodes contengan alguna clave de topics.kcs
  const filteredStudents = students.filter(student => {
    // Verificar si alguno de los nodes del estudiante tiene una clave que coincida con topics.kcs
    return student.nodes.some(node => {
      // Extraer las claves del nodo actual
      const nodeKeys = Object.keys(node.json);
      // Verificar si alguna clave del nodo está en topicKeys
      return nodeKeys.some(key => topicKeys.includes(key));
    });
  });

  return filteredStudents;
}
*/

//-----------------------------------

const ChallengesPage = () => {
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [updateChallenge, setUpdateChallenge] = useState<ChallengeInput>(() => ({
    code: "",
    contentIds: [],
    description: "",
    enabled: false,
    endDate: "",
    groupsIds: [],
    projectId: "",
    startDate: "",
    tags: [],
    title: "",
    topicsIds: [],
  }));

  const [challenges, setChallenges] = useState([]);
  const [challengesStudents, setChallengesStudents] = useState([]);

  const [isUpdated, setIsUpdated] = useState(false);
  //const [challenge, setChallenge] = useState({});
  const [challengeId, setChallengeId] = useState();

  const [challengesOriginal, setChallengesOriginal] = useState([]);
  //const [topicQueries, setTopicQueries] = useState([]);

  /*const { data: GroupUsersWithModelStates, isLoading: isGroupUsersWithModelStatesLoading } =
    useGQLQuery(queryGroupUsersWithModelStates);
*/
  const { data: dataChallenges, isLoading: isChallengesLoading } = useGQLQuery(queryGetChallenges, {
    challengesIds: [
      "1",
      "3",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
    ],
  });

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
      console.log("dataChallenges", dataChallenges);
      setChallengesOriginal(dataChallenges.challenges);
    }
  }, [isChallengesLoading, dataChallenges]);
  /*
  useEffect(() => {
    setIsUpdated(false);
  }, []);*/

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
        const dataFilterUserByRole = filterUsersInChallenges(dataChallenges?.challenges);
        const updatedData = updateDataWithStatus(dataFilterUserByRole);
        const data = updateDataWithEndDate(updatedData);

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
            name: group.name,
            students: group.students.map(user => ({
              id: user.id,
              name: user.name,
              progress: Math.floor(Math.random() * 101),
            })),
          })),
        }));

        const sortedStudents = sortStudentsByProgress(transformedChallenge);
        console.log("sortedStudents", sortedStudents);
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

  const { isLoading, user } = useAuth();
  //const tags = user?.tags;
  const admin = (user?.role ?? "") == "ADMIN" ? true : false;

  useEffect(() => {
    // "challneges witouth user"
    setChallengesStudents(updateArray(challenges, user?.id));
  }, [challenges]);

  /*const students = GroupUsersWithModelStates?.groups || [];
  const transformStudents = students =>
    students.map(student => ({
      id: student.id,
      groupName: student.label,
    }));
*/
  // const dynamicStudents = transformStudents(students);

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

  if (isLoading || isChallengesLoading) {
    return <Box p={5}>Cargando...</Box>;
  }

  return (
    <Box p={4}>
      {admin ? (
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
              {console.log(filteredChallenges)}
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard
                  key={index}
                  {...challenge}
                  setIsUpdated={setIsUpdated}
                  setUpdateChallenge={setUpdateChallenge}
                  setChallengeId={setChallengeId}
                  challengesOriginal={challengesOriginal}
                />
              ))}
            </VStack>
          ) : (
            <p>Cargando datos...</p>
          )}
        </Box>
      ) : (
        <StudentsList challenges={challengesStudents} />
      )}
    </Box>
  );
};

export default ChallengesPage;
