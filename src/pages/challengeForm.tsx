import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Input,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Checkbox,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  FormControl,
  FormLabel,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import "katex/dist/katex.min.css";
import MathDisplay from "../components/challenge/MathDisplay";
import LatexPreview from "../components/challenge/LatexPreview";
import { extractExercise, formatDate } from "../components/challenge/tools";
import { withAuth } from "../components/Auth";
import { useAction } from "../utils/action";
import { sessionState } from "../components/SessionState";
import { LoadingOverlay } from "../components/challenge/LoadingOverlay";

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

const mutationCreateChallenge = gql(`
  mutation CreateChallenge($challenge: ChallengeInput!) {
    adminContent {
      createChallenge (data : $challenge){
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

const queryTopics = gql(/* GraphQL */ `
  query GetTopics {
    topics(ids: [44, 4, 31, 19, 68, 24, 52]) {
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
`);

const queryGroups = gql(/* GraphQL */ `
  query GetGroups {
    currentUser {
      id
      groups {
        id
        label
      }
    }
  }
`);

const queryGetChallenge = gql(/* GraphQL */ `
  query GetChallenge($challengeId: IntID!) {
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
        topics {
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
//--------------------------------------------------

const RecursiveAccordion = ({ data, onShowDetails, setSelectedTopics, selectedTopics = [] }) => {
  // Función auxiliar para verificar si un item está seleccionado
  const isItemSelected = itemId => {
    return selectedTopics.some(item => item.id === itemId);
  };

  // Obtiene todos los items descendientes de un item dado
  const getAllDescendants = item => {
    let descendants = [];
    if (item.childrens?.length) {
      item.childrens.forEach(children => {
        descendants.push(children);
        descendants = [...descendants, ...getAllDescendants(children)];
      });
    }
    return descendants;
  };

  const handleParentChange = item => {
    const isSelected = isItemSelected(item.id);

    setSelectedTopics(prev => {
      if (isSelected) {
        // Deseleccionar padre e hijos
        const descendantIds = getAllDescendants(item).map(d => d.id);
        return prev.filter(
          selectedItem => selectedItem.id !== item.id && !descendantIds.includes(selectedItem.id),
        );
      } else {
        // Seleccionar padre e hijos

        // Al usar set, la operación de filtrado es más rapida que con la funcion filter
        const uniqueItems = new Set(prev.map(existingItem => existingItem.id));
        const descendants = getAllDescendants(item);
        return [
          ...prev,
          ...[item, ...descendants].filter(
            newItem => !uniqueItems.has(newItem.id) && uniqueItems.add(newItem.id),
          ),
        ];
      }
    });
  };

  const handleChildChange = (parentItem, childItem) => {
    const isChildSelected = isItemSelected(childItem.id);

    setSelectedTopics(prev => {
      if (isChildSelected) {
        // Deseleccionar hijo y padre
        return prev.filter(item => item.id !== childItem.id && item.id !== parentItem.id);
      } else {
        // Seleccionar hijo
        let newItems = [...prev, childItem];

        // Verificar si todos los hermanos están seleccionados
        const allSiblingsSelected = parentItem.childrens.every(
          children => children.id === childItem.id || isItemSelected(children.id),
        );

        // Si todos los hermanos están seleccionados, incluir al padre
        if (allSiblingsSelected) {
          newItems = [...newItems, parentItem];
        }

        return newItems;
      }
    });
  };

  return (
    <>
      {data.map(item => (
        <AccordionItem key={item.id}>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Checkbox
                  isChecked={isItemSelected(item.id)}
                  onChange={() => {
                    if (item.childrens?.length > 0) {
                      handleParentChange(item);
                    } else {
                      handleChildChange(item.parent, item);
                    }
                  }}
                >
                  {item.label}
                </Checkbox>
              </Box>
              {item.childrens?.length > 0 && <AccordionIcon />}
            </AccordionButton>
          </h2>
          {item.childrens?.length > 0 && (
            <AccordionPanel pb={4}>
              <Accordion allowMultiple>
                <RecursiveAccordion
                  data={item.childrens.map(children => ({
                    ...children,
                    parent: item,
                  }))}
                  onShowDetails={onShowDetails}
                  setSelectedTopics={setSelectedTopics}
                  selectedTopics={selectedTopics}
                />
              </Accordion>
            </AccordionPanel>
          )}
        </AccordionItem>
      ))}
    </>
  );
};

const MathRecursiveAccordion = ({
  selectedTopics,
  //onShowDetails,
  setSelectedExercises,
  selectedExercises = [],
}) => {
  // Verifica si un item está seleccionado
  const isItemSelected = exercise => {
    return selectedExercises.some(
      selected =>
        selected.description === exercise.description &&
        selected.mathExpression === exercise.mathExpression,
    );
  };

  // Maneja el cambio en la selección de cualquier item
  const handleItemChange = exercise => {
    if (isItemSelected(exercise)) {
      // Si ya está seleccionado, lo removemos
      const newSelected = selectedExercises.filter(
        selected =>
          !(
            selected.description === exercise.description &&
            selected.mathExpression === exercise.mathExpression
          ),
      );
      setSelectedExercises(newSelected);
    } else {
      // Si no está seleccionado, lo agregamos
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  useEffect(() => {
    // Obtén los IDs de los tópicos seleccionados actualmente
    const currentTopicIds = selectedTopics.map(topic => topic.id);

    // Filtra los ejercicios seleccionados para mantener solo aquellos asociados a tópicos existentes
    const filteredExercises = selectedExercises.filter(
      exercise => currentTopicIds.includes(exercise.topicId), // Asegúrate de que cada ejercicio tenga un `topicId`
    );

    // Si hay cambios, actualiza `selectedExercises`
    if (filteredExercises.length !== selectedExercises.length) {
      setSelectedExercises(filteredExercises);
    }
  }, [selectedTopics]); // Ejecuta este efecto cada vez que `selectedTopics` cambie

  return (
    <>
      {selectedTopics && selectedTopics.length > 0 && (
        <Box>
          {selectedTopics.map(topic => {
            const exercises = extractExercise([topic]);

            return (
              exercises.length > 0 && (
                <AccordionItem key={topic.id}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold" mb={2}>
                          {topic.label}
                        </Text>
                      </Box>
                      {topic.content?.length > 0 && <AccordionIcon />}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    {exercises.length > 0 ? (
                      exercises.map(exercise => (
                        <Checkbox
                          key={`${exercise.exerciseId}-checkbox`}
                          mb={2}
                          isChecked={isItemSelected(exercise)}
                          onChange={() => handleItemChange(exercise)}
                        >
                          <MathDisplay
                            key={`${exercise.exerciseId}-math`}
                            description={exercise.description}
                            mathExpression={exercise.mathExpression}
                            image={exercise.image}
                          />
                        </Checkbox>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No hay ejercicios disponibles para este tópico
                      </Text>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              )
            );
          })}
        </Box>
      )}
    </>
  );
};

//---------------------------------------------
/*
function formatDateToRequiredFormat(dateString) {
  // Crear un objeto Date a partir de la cadena de fecha
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  // Extraer los componentes de la fecha
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, "0");

  // Formatear la fecha en el formato requerido
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}
*/
//-------------------------------
/*
function formatDateToUTC(dateString) {
  console.log("Input dateString:", dateString)
  if (!dateString || typeof dateString !== "string") {
    throw new Error("Invalid input: dateString must be a string");
  }

  // Parse the input date string
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  // Convert the date to ISO string (UTC)
  return date.toISOString();
}*/

//----------------------------
const localTimeToUTC = localDateTime => {
  // Create a Date object from the local date-time string
  const date = new Date(localDateTime);

  // Convert to UTC and format as ISO string without the 'Z'
  return date.toISOString(); //.replace(/Z$/, '');
};

//------------------------------
const utcToLocalTime = utcDateTime => {
  // Create a Date object from the UTC date-time string
  const date = new Date(utcDateTime);

  // Extract local date and time components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format as "yyyy-MM-ddThh:mm" (with optional ":ss" or ":ss.SSS")
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

//---------------------------------

export default withAuth(function ChallengesForm() {
  //const ChallengeForm = () => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [detailItem, setDetailItem] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [isUpdated, setIsUpdated] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [challenge, setChallenge] = useState({});

  const router = useRouter();
  const { mode, challengeId: id } = router.query;

  if (Array.isArray(id)) {
    throw new Error("challengeId no puede ser un array en este contexto");
  }

  const isEditMode = mode === "edit";
  const challengeId = id ? id : "default-id";
  const action = useAction();
  //const { user } = useAuth();
  const userId = sessionState.currentUser.id;

  const { data: TopicsData, isLoading: isTopicsLoading } = useGQLQuery(queryTopics);
  const { data: GroupsData, isLoading: isGroupsLoading } = useGQLQuery(queryGroups);

  const { data: dataChallenge, isLoading: isChallengeLoading } = useGQLQuery(
    queryGetChallenge,
    {
      challengeId: challengeId,
    },
    {
      enabled: isEditMode && !!challengeId, // Solo ejecuta la consulta si isEditMode es true y challengeId existe
    },
  );

  const {
    //data: dataUpdateChallenge,
    error: errorUpdateChallenge,
    //isLoading: isUpdateChallengeLoading,
  } = useGQLQuery(
    mutationUpdateChallenge,
    {
      challengeId: challengeId,
      challenge: challenge,
    },
    { enabled: isEditMode && isUpdated },
  );

  const {
    //data: dataCreateChallenge,
    error: errorCreateChallenge,
    //isLoading: isCreateChallengeLoading,
  } = useGQLQuery(
    mutationCreateChallenge,
    {
      challenge: challenge,
    },
    { enabled: !isEditMode && isCreated },
  );

  useEffect(() => {
    if (!isChallengeLoading && dataChallenge) {
      const challenge = dataChallenge.challenge;

      setTitle(challenge.title || "");
      setDescription(challenge.description || "");
      setEndDate(utcToLocalTime(challenge.endDate));
      setSelectedGroups(challenge.groups || []);
      setSelectedTopics(challenge.topics || []);
      console.log("challenge", challenge);
      setSelectedExercises(
        extractExercise([{ content: challenge.content, id: challenge.content[0].topics[0].id }]) ||
          [],
      );
      setStartDate(challenge.startDate !== null ? utcToLocalTime(challenge.startDate) : null);
    }
  }, [dataChallenge, isChallengeLoading]);

  useEffect(() => {
    setIsCreated(false);
    setIsUpdated(false);
  }, []);

  const topics = TopicsData?.topics || [];
  const groups = GroupsData?.currentUser?.groups || [];

  // Función para obtener el ejercicio con más KCs para cada 'code'
  /*function getMaxKCsForEachCode(topics) {
    const results = {};

    // Función recursiva para explorar el JSON
    function exploreTopic(topic) {
      // Si el tema tiene subtemas, se recorren
      if (topic.childrens && topic.childrens.length > 0) {
        for (let child of topic.childrens) {
          exploreTopic(child);
        }
      }

      // Si el tema tiene ejercicios, se busca el que tiene más KCs
      if (topic.content && topic.content.length > 0) {
        // Si no existe una entrada en 'results' o el ejercicio tiene más KCs
        if (!results[topic.code] || topic.content.length > results[topic.code].content.length) {
          results[topic.code] = {
            code: topic.code,
            expression: topic.label,
            description: `${topic.content.length} KCs`,
          };
        }
      }
    }

    // Recorremos todos los temas principales
    for (let topic of topics) {
      exploreTopic(topic);
    }

    return results;
  }
*/
  const handleSelectGroup = group => {
    setSelectedGroups(prev =>
      prev.some(g => g.id === group.id) ? prev.filter(g => g.id !== group.id) : [...prev, group],
    );
  };

  const handleShowDetails = item => {
    setDetailItem(item);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const challengeData = {
      code: `${title.slice(0, 25)}_${Date.now()}`, //_${user.id}`, //unique key
      contentIds: selectedExercises.map(exercise => exercise.exerciseId),
      description: description,
      enabled: true,
      endDate: localTimeToUTC(endDate),
      groupsIds: selectedGroups.map(group => group.id),
      projectId: 4, // 	NivPreAlg
      startDate: startDate ? localTimeToUTC(startDate) : null,
      tags: [],
      title: title,
      topicsIds: selectedTopics.map(topic => topic.id),
    };

    // Validación de campos obligatorios
    const requiredFields = [
      {
        field: "code",
        value: challengeData.code,
        message: "El código del desafío es obligatorio.",
      },
      {
        field: "title",
        value: challengeData.title,
        message: "El título del desafío es obligatorio.",
      },
      {
        field: "description",
        value: challengeData.description,
        message: "La descripción del desafío es obligatoria.",
      },
      {
        field: "endDate",
        value: challengeData.endDate,
        message: "La fecha de finalización es obligatoria.",
      },
      {
        field: "groups",
        value: challengeData.groupsIds,
        message: "Debes seleccionar al menos un grupo.",
      },
      {
        field: "topics",
        value: challengeData.topicsIds,
        message: "Debes seleccionar al menos un tópico.",
      },
      {
        field: "content",
        value: challengeData.contentIds,
        message: "Debes seleccionar al menos un ejercicio.",
      },
    ];

    // Verifica si falta algún campo obligatorio
    const missingField = requiredFields.find(field => {
      // Si el valor es undefined, null, o una lista vacía, se considera faltante
      return (
        field.value === undefined ||
        field.value === null ||
        field.value === "" ||
        (Array.isArray(field.value) && field.value.length === 0)
      );
    });

    // Si falta algún campo, muestra una alerta y se detiene el proceso
    if (missingField) {
      alert(`Error: ${missingField.message}`);
      return;
    }

    setChallenge(challengeData);

    if (isEditMode) {
      setIsUpdated(true);

      action({
        verbName: "challengeUpdate",
        extra: {
          challengeID: challengeId,
          userID: userId,
          contentIDs: challengeData.contentIds,
          topicIDs: challengeData.topicsIds,
          groupIDs: challengeData.groupsIds,
        },
      });

      alert("Desafío actualizado exitosamente!");
    } else {
      setIsCreated(true);

      action({
        verbName: "challengeCreate",
        extra: {
          challengeID: challengeId,
          userID: userId,
          contentIDs: challengeData.contentIds,
          topicIDs: challengeData.topicsIds,
          groupIDs: challengeData.groupsIds,
        },
      });

      alert("Desafío guardado exitosamente");
    }

    // limpia todo para evitar que el usuario cree ejercicios duplicados

    setTitle("");
    setDescription("");
    setSelectedGroups([]);
    setEndDate("");
    setSelectedTopics([]);
    setSelectedExercises([]);

    router.push({
      pathname: "/challenge",
    });
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setSelectedGroups([]);
    setEndDate("");
    setSelectedTopics([]);
    setSelectedExercises([]);
    setIsUpdated(false);
    setIsCreated(false);

    router.push({
      pathname: "/challenge",
    });
  };

  const isLoading =
    mode === "edit"
      ? isTopicsLoading || isGroupsLoading || isChallengeLoading // En modo edición, carga todo
      : isTopicsLoading || isGroupsLoading; // Fuera del modo edición, carga solo topics y groups

  // Si está cargando, muestra un Spinner
  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (errorUpdateChallenge) {
    return (
      <p className="error-message">
        Error: {errorUpdateChallenge.message}. Por favor, inténtalo de nuevo o contacta al equipo de
        desarrollo.
      </p>
    );
  }

  if (errorCreateChallenge) {
    return (
      <p className="error-message">
        Error: {errorCreateChallenge.message}. Por favor, inténtalo de nuevo o contacta al equipo de
        desarrollo.
      </p>
    );
  }

  const formBackgroundColor = "gray.300";
  const summaryFormBackgroundColor = "gray.100";

  return (
    <ChakraProvider>
      <Box key={challengeId} p={5}>
        <Heading mb={6} textAlign="center">
          {isEditMode ? "Editar Desafío" : "Crear Desafío"}
        </Heading>

        <Box bg={formBackgroundColor}>
          <FormControl mb={4} borderRadius="md" p={4}>
            <FormLabel>Nombre del desafío</FormLabel>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nombre del desafío"
            />
          </FormControl>

          <FormControl mb={4} borderRadius="md" p={4}>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción del desafío (opcional)"
            />
            <LatexPreview content={description} />
          </FormControl>

          <FormControl mb={4} borderRadius="md" p={4}>
            <FormLabel>Fecha de término</FormLabel>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </FormControl>
        </Box>

        <ChakraProvider>
          <Box bg={formBackgroundColor}>
            <FormControl mb={4} borderRadius="md" p={4}>
              <FormLabel>
                Grupos
                <Text as="span" display="block" fontSize="sm" color="gray.500">
                  Selecciona los grupos que participarán en este desafío
                </Text>
              </FormLabel>
              <Box>
                {groups.map(group => (
                  <Box key={group.id} mb={2}>
                    <Checkbox
                      isChecked={selectedGroups.some(g => g.id === group.id)}
                      onChange={() => handleSelectGroup(group)}
                    >
                      {group.label}
                    </Checkbox>
                  </Box>
                ))}
              </Box>
            </FormControl>
          </Box>
        </ChakraProvider>

        <Box bg={formBackgroundColor}>
          <FormControl mb={4} borderRadius="md" p={4}>
            <FormLabel htmlFor="topicsAccordion">
              Tópicos y subtópicos
              <Text as="span" display="block" fontSize="sm" color="gray.500">
                Selecciona los tópicos para el desafío
              </Text>
            </FormLabel>
            <Accordion id="topicsAccordion" allowMultiple>
              <RecursiveAccordion
                data={topics}
                onShowDetails={handleShowDetails}
                setSelectedTopics={setSelectedTopics}
                selectedTopics={selectedTopics}
              />
            </Accordion>
          </FormControl>
        </Box>

        <Box bg={formBackgroundColor}>
          <FormControl mb={4} borderRadius="md" p={4}>
            <FormLabel htmlFor="exercisesAccordion" mt={4}>
              Ejercicios iniciales
              <Text as="span" display="block" fontSize="sm" color="gray.500">
                Selecciona los ejercicios con los que comenzará este desafío, considerando los
                tópicos seleccionados
              </Text>
            </FormLabel>
            <Accordion id="exercisesAccordion" allowMultiple>
              <MathRecursiveAccordion
                selectedTopics={selectedTopics}
                //onShowDetails={[]}
                setSelectedExercises={setSelectedExercises}
                selectedExercises={selectedExercises}
              />
            </Accordion>
          </FormControl>
        </Box>

        <Box p={4} bg={summaryFormBackgroundColor}>
          <Box mt={4}>
            <Text as="strong" fontWeight="bold">
              Nombre del desafío: {title}
            </Text>
          </Box>

          <Box mt={4}>
            <Text as="strong" fontWeight="bold">
              Descripción del desafío:
              <LatexPreview content={description} />
            </Text>
          </Box>

          <Box mt={4}>
            <Text as="strong" fontWeight="bold">
              Grupos Seleccionados:
            </Text>
            <ul style={{ paddingLeft: "20px" }}>
              {selectedGroups.map(group => (
                <li key={group.id}>{group.label}</li>
              ))}
            </ul>
          </Box>

          <Box mt={4}>
            <Text as="strong" fontWeight="bold">
              Fecha de término: {formatDate(endDate)}
            </Text>
          </Box>

          <Box mt={4}>
            <Text as="strong" fontWeight="bold">
              Tópicos y subtópicos seleccionados:
            </Text>
            <ul style={{ paddingLeft: "20px" }}>
              {selectedTopics.map((topic, index) => (
                <li key={index - topic.id}>{topic.label}</li>
              ))}
            </ul>
          </Box>

          <Box mt={4}>
            <Text as="strong" fontWeight="bold">
              Ejercicios seleccionados:
            </Text>
            <Box>
              {selectedExercises.map(exercise => (
                <MathDisplay
                  key={exercise.exerciseId}
                  description={exercise.description}
                  mathExpression={exercise.mathExpression}
                  image={exercise.image}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Box mt={6} display="flex" justifyContent="space-between">
          <Button colorScheme="red" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSave}>
            Guardar desafío
          </Button>
        </Box>
      </Box>

      <Drawer isOpen={isDrawerOpen} placement="right" onClose={() => setDrawerOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>{detailItem?.title}</DrawerHeader>
          <DrawerBody>
            <p>Detalles sobre {detailItem?.title}...</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ChakraProvider>
  );
});

//export default ChallengeForm;
