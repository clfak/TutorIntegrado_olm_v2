import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Checkbox,
  Button,
  FormControl,
  FormLabel,
  Text,
  Divider,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useGQLQuery } from "rq-gql";
import { gql } from "../../graphql";
import "katex/dist/katex.min.css";
import MathDisplay from "./MathDisplay";

const queryTopics = gql(/* GraphQL */ `
  query GetTopics2 {
    topics(ids: [44, 16, 19, 68, 69, 24, 52]) {
      id
      code
      label
      content {
        json
      }
      childrens {
        id
        code
        label
        content {
          json
        }
        childrens {
          id
          code
          label
          content {
            json
          }
          childrens {
            id
            code
            label
            content {
              json
            }
          }
        }
      }
    }
  }
`);

const RecursiveAccordion = ({ data, setSelectedItems, selectedItems = [] }) => {
  // Función auxiliar para verificar si un item está seleccionado
  const isItemSelected = itemId => {
    return selectedItems.some(item => item.id === itemId);
  };

  // Obtiene todos los items descendientes de un item dado
  const getAllDescendants = item => {
    let descendants = [];
    if (item.subtopics?.length) {
      item.subtopics.forEach(subtopic => {
        descendants.push(subtopic);
        descendants = [...descendants, ...getAllDescendants(subtopic)];
      });
    }
    return descendants;
  };

  const handleParentChange = item => {
    const isSelected = isItemSelected(item.id);

    setSelectedItems(prev => {
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

    setSelectedItems(prev => {
      if (isChildSelected) {
        // Deseleccionar hijo y padre
        return prev.filter(item => item.id !== childItem.id && item.id !== parentItem.id);
      } else {
        // Seleccionar hijo
        let newItems = [...prev, childItem];

        // Verificar si todos los hermanos están seleccionados
        const allSiblingsSelected = parentItem.subtopics.every(
          subtopic => subtopic.id === childItem.id || isItemSelected(subtopic.id),
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
                    if (item.subtopics?.length > 0) {
                      handleParentChange(item);
                    } else {
                      handleChildChange(item.parent, item);
                    }
                  }}
                >
                  {item.title}
                </Checkbox>
              </Box>
              {item.subtopics?.length > 0 && <AccordionIcon />}
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {item.subtopics?.length > 0 ? (
              <Accordion allowMultiple>
                <RecursiveAccordion
                  data={item.subtopics.map(subtopic => ({
                    ...subtopic,
                    parent: item,
                  }))}
                  setSelectedItems={setSelectedItems}
                  selectedItems={selectedItems}
                />
              </Accordion>
            ) : (
              <Button size="sm">Ver descripción</Button>
            )}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </>
  );
};

const MathRecursiveAccordion = ({ data }) => {
  const extractExercise = data => {
    const exercises = [];

    const contentArray = data[0]?.content;
    contentArray?.forEach(item => {
      if (item?.json) {
        let id;
        let desc;
        let mathExpr;
        let img;

        switch (item.json.type) {
          case "fdsc2":
          case "fc1s":
          case "fcc3s":
          case "fdc2s":
          case "ftc5s":
          case "lvltutor":
            id = item.json.code;
            desc = item.json.text;
            mathExpr = item.json.initialExpression?.trim()
              ? item.json.initialExpression
              : item.json.steps[0].expression; //item.json.steps[0].expression;
            break;
          case "fc1s":
            id = item.json.code;
            desc = item.json.title;
            mathExpr = item.json.steps[0].eqc;
            break;
          case "ecl2s":
          case "ecc5s":
          case "secl5s":
            id = item.json.code;
            desc = item.json.title;
            mathExpr = item.json.eqc;
            break;
          case "thales1":
          case "thales2":
          case "pitagoras1":
          case "pitagoras2":
          case "areaperimetro1":
          case "areaperimetro2":
          case "geom":
            id = item.json.code;
            desc = item.json.text;
            mathExpr = item.json.image;
            img = item.json.image;
            break;
          default:
            console.log("Caso no manejado:", item.json.type);
            break;
        }

        // Solo agregar si se definieron id, desc, y mathExpr
        if (id && desc && mathExpr) {
          exercises.push({
            exerciseId: id,
            description: desc,
            mathExpression: mathExpr,
            image: img,
          });
        } else {
          console.log("Caso no manejado:", item.json);
        }
      }
    });

    return exercises;
  };

  return (
    <>
      {data && data.length > 0 && (
        <Box>
          {data.map(topic => {
            const exercises = extractExercise([topic]);
            return (
              <AccordionItem key={topic.id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold" mb={2}>
                        {topic.title}
                      </Text>
                    </Box>
                    {topic.content?.length > 0 && <AccordionIcon />}
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  {exercises.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {exercises.map((exercise, index) => (
                        <Box key={`${topic.id}-${index}`}>
                          <HStack align="start" spacing={4}>
                            {/* Texto en el lado izquierdo */}
                            <Box flex="1">
                              <Text fontWeight="bold" fontSize="lg">
                                {exercise.exerciseId}
                              </Text>
                            </Box>

                            {/* MathDisplay a la derecha */}
                            <Box flex="2">
                              <MathDisplay
                                description={exercise.description}
                                mathExpression={exercise.mathExpression}
                                image={exercise.image}
                              />
                            </Box>
                          </HStack>
                          {/* Divider excepto en la última fila */}
                          {index < exercises.length - 1 && (
                            <Divider my={4} borderColor="gray.300" borderWidth="2px" opacity={1} />
                          )}
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No hay ejercicios disponibles para este tópico
                    </Text>
                  )}
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Box>
      )}
    </>
  );
};

const GetInfoExercises = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  //const [detailItem, setDetailItem] = useState(null);
  //const [isDrawerOpen, setDrawerOpen] = useState(false);

  const { data: TopicsData, isLoading: isTopicsLoading } = useGQLQuery(queryTopics);

  const router = useRouter();
  const { mode } = router.query;

  const isEditMode = mode === "edit";

  const topics = TopicsData?.topics || [];

  const transformTopics = topics =>
    topics?.map(topic => ({
      id: topic.id,
      title: topic.label,
      content: topic.content,
      subtopics: topic.childrens ? transformTopics(topic.childrens) : [],
    }));

  const dynamicTopics = transformTopics(topics);

  //const handleShowDetails = item => {
  //setDetailItem(item);
  //setDrawerOpen(true);
  //};

  if (isTopicsLoading) {
    return <Box p={5}>Cargando...</Box>;
  }

  return (
    <ChakraProvider>
      <Box p={5}>
        <Heading mb={6} textAlign="center">
          {isEditMode ? "Editar Desafío" : "Crear Desafío"}
        </Heading>

        <FormControl mb={4} border="2px" borderColor="gray.600" borderRadius="md" p={4}>
          <FormLabel htmlFor="topicsAccordion">Tópicos y subtópicos</FormLabel>
          <Accordion id="topicsAccordion" allowMultiple>
            <RecursiveAccordion
              data={dynamicTopics}
              setSelectedItems={setSelectedItems}
              selectedItems={selectedItems}
            />
          </Accordion>
        </FormControl>

        <FormControl mb={4} border="2px" borderColor="gray.600" borderRadius="md" p={4}>
          <FormLabel htmlFor="exercisesAccordion" mt={4}>
            Ejercicios de los tópicos y subtópicos seleccionados
          </FormLabel>
          <Accordion id="exercisesAccordion" allowMultiple>
            <MathRecursiveAccordion data={selectedItems} />
          </Accordion>
        </FormControl>
      </Box>
    </ChakraProvider>
  );
};

export default GetInfoExercises;
