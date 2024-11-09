import { Select, Box, Button, Input, Flex, Text, Stack, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, PopoverTrigger, Popover, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, } from '@chakra-ui/react';
import { useState } from 'react';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

export default function newExercise() {
  const [cards, setCards] = useState([
    { type: 'enunciado', title: '', question: '', expression: '', summary: '',
      successMessage: '', kcs: '', alternatives: [{ text: '', correct: false }, { text: '', correct: false }], isEditingExpression: false }
  ]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentCardIndex, setCurrentCardIndex] = useState(null);

  const operations = [
    { label: '+', command: '+' },
    { label: '-', command: '-' },
    { label: '\\times', command: '\\times' },
    { label: '\\div', command: '\\div' },
    { label: '\\frac{□}{□}', command: '\\frac{}{}' },
    // Otros símbolos que desees agregar...
  ];

  const addCard = () => {
    setCards([...cards, { type: 'paso', title: '', question: '', expression: '', summary: '', successMessage: '', kcs:'',alternatives: [{ text: '', correct: false }, { text: '', correct: false }], isEditingExpression: false }]);
  };

  const handleCardContentChange = (index, field, newContent) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = newContent;
    setCards(updatedCards);
  };

  const handleOpenLatexModal = (index) => {
    setCurrentCardIndex(index);
    onOpen();
  };

  const [kcOptions, setKcOptions] = useState([
    { value: 'KC1', label: 'KC1' },
    { value: 'KC2', label: 'KC2' },
    { value: 'KC3', label: 'KC3' },
    { value: 'IdeTerSem', label: 'IdeTerSem' },
    { value: 'FaccTerSem', label: 'FaccTerSem' },
    //Se añade más opciones según sea necesario
    //Llamada db de kc's
  ]);

  const [kcInput, setKcInput] = useState(''); 

  const insertLatex = (command) => {
    if (currentCardIndex !== null) {
      const updatedCards = [...cards];
      const textBefore = updatedCards[currentCardIndex].expression || '';
      updatedCards[currentCardIndex].expression = textBefore + command;
      setCards(updatedCards);
    }
  };

  const handleKcChange = (index, value) => {
    if (value === 'otro'){
      if (kcInput && !kcOptions.some(option => option.value === kcInput)){
        const newOption = { value: kcInput, label: kcInput };
        setKcOptions([...kcOptions, newOption]);
        handleCardContentChange(index, 'kcs', kcInput);
      }
    } else {
      handleCardContentChange(index, 'kcs', value);
    }
    setKcInput('');
  };


  const handleAlternativeChange = (cardIndex, altIndex, newContent) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].alternatives = updatedCards[cardIndex].alternatives.map((alt, index) => ({
      ...alt,
      text: index === altIndex ? newContent : alt.text,
    }));
    setCards(updatedCards);
  };

  const addAlternative = (index) => {
    const updatedCards = [...cards];
    updatedCards[index].alternatives.push({ text: '', correct: false });
    setCards(updatedCards);
  };

  const handleCorrectChange = (cardIndex, altIndex) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].alternatives = updatedCards[cardIndex].alternatives.map((alt, index) => ({
      ...alt,
      correct: index === altIndex
    }));
    setCards(updatedCards);
  };

  const removeAlternative = (cardIndex, altIndex) => {
    const updatedCards = [...cards];
    if (updatedCards[cardIndex].alternatives.length > 2) {
      updatedCards[cardIndex].alternatives.splice(altIndex, 1);
      setCards(updatedCards);
    }
  };

  return (
    <MathJaxContext>
      <div>
        <Flex direction="column" align="center" justify="center" minH="100vh" p={4}>
          {cards.map((card, index) => (
            <Flex
              key={index}
              mt={4}
              w="100%"
              maxW="800px"
              p={6}
              borderRadius="md"
              bg={card.type === 'enunciado' ? 'blue.200' : 'green.200'}
              boxShadow="md"
              alignItems="center"
              direction="row"
              position="relative"
            >
              <Text
                position="absolute"
                left="-10px"
                top="50%"
                transform="translateY(-50%) rotate(-90deg)"
                transformOrigin="left bottom"
                fontSize="lg"
                fontWeight="bold"
              >
                {card.type === 'enunciado' ? 'Enunciado' : 'Paso'} {index}
              </Text>

              <Box flex="1" w="100%">
                {card.type === 'enunciado' ? (
                  <Input
                    placeholder={`Contenido del enunciado`}
                    value={card.content}
                    onChange={(e) => handleCardContentChange(index, 'content', e.target.value)}
                    bg="white"
                  />
                ) : (
                  <>
                    <Input
                      placeholder="Título del paso"
                      value={card.title}
                      onChange={(e) => handleCardContentChange(index, 'title', e.target.value)}
                      bg="white"
                      mb={2}
                    />
                    <Input
                      placeholder="Pregunta del paso"
                      value={card.question}
                      onChange={(e) => handleCardContentChange(index, 'question', e.target.value)}
                      bg="white"
                      mb={2}
                    />

                    {/* Input de expresión con LaTeX */}
                    <Box display="flex" alignItems="center" w="100%" mb={2}>
                      {card.isEditingExpression ? (
                        <Input
                          id={`latex-input-${index}`}
                          value={card.expression}
                          onChange={(e) => handleCardContentChange(index, 'expression', e.target.value)}
                          onBlur={() => handleCardContentChange(index, 'isEditingExpression', false)}
                          placeholder="Expresión del paso"
                          bg="white"
                          size="md"
                          autoFocus
                        />
                      ) : (
                        <Box
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          w="100%"
                          h="40px"
                          bg="white"
                          onClick={() => handleCardContentChange(index, 'isEditingExpression', true)}
                          cursor="pointer"
                          color={card.expression ? "black" : "gray.400"}
                        >
                          {card.expression ? (
                            <MathJax dynamic inline>
                              {`\\(${card.expression}\\)`}
                            </MathJax>
                          ) : (
                            <Text opacity={0.5}>Expresión del paso</Text>
                          )}
                        </Box>
                      )}
                      <Button size="xs" ml={2} onClick={() => handleOpenLatexModal(index)}>
                        ?
                      </Button>
                    </Box>

                    {/* Modal de ayuda con LaTeX */}
                    <Modal isOpen={isOpen} onClose={onClose} size="xl">
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>Ayuda con LaTeX</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                          {currentCardIndex !== null && (
                            <>
                              <Input
                                id={`latex-input-${currentCardIndex}`}
                                value={cards[currentCardIndex].expression}
                                onChange={(e) => handleCardContentChange(currentCardIndex, 'expression', e.target.value)}
                                mb={3}
                              />

                              <Flex wrap="wrap" gap={2}>
                                {operations.map((operation, idx) => (
                                  <Button key={idx} onClick={() => insertLatex(operation.command)} size="sm">
                                    <MathJax dynamic inline>{`\\(${operation.label}\\)`}</MathJax>
                                  </Button>
                                ))}
                              </Flex>

                              <Box mt={4} p={2} borderWidth="1px" borderRadius="md">
                                <MathJax dynamic inline>
                                  {`\\(${cards[currentCardIndex].expression}\\)`}
                                </MathJax>
                              </Box>
                            </>
                          )}
                        </ModalBody>

                        <ModalFooter>
                          <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Cerrar
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>

                    {/* Sub-tarjeta de "Alternativas" */}
                    <Box mb={4} p={4} bg="yellow.100" borderRadius="md" boxShadow="md">
                      <Text fontWeight="bold" mb={2}>
                        Alternativas
                      </Text>

                      {card.alternatives.map((alt, altIndex) => (
                        <Flex key={altIndex} align="center">
                          <Input
                            placeholder={`Alternativa ${altIndex + 1}`}
                            value={alt.text}
                            onChange={(e) => handleAlternativeChange(index, altIndex, e.target.value)}
                            bg="white"
                            mr={2}
                            mb={2}
                          />
                          <Checkbox
                            isChecked={alt.correct}
                            onChange={() => handleCorrectChange(index, altIndex)}
                            mr={2}
                          >
                            Correcta
                          </Checkbox>
                          {card.alternatives.length > 2 && (
                            <Button colorScheme="red" onClick={() => removeAlternative(index, altIndex)}>
                              🗑️
                            </Button>
                          )}
                        </Flex>
                      ))}

                      <Button mt={4} onClick={() => addAlternative(index)}>
                        Agregar alternativa
                      </Button>
                    </Box>

                    <Input
                      placeholder="Summary del paso"
                      value={card.summary}
                      onChange={(e) => handleCardContentChange(index, 'summary', e.target.value)}
                      bg="white"
                      mb={4}
                    />
                    <Input
                      placeholder="Mensaje de paso correcto"
                      value={card.successMessage}
                      onChange={(e) => handleCardContentChange(index, 'successMessage', e.target.value)}
                      bg="white"
                      mb={4}
                    />
                  <Flex align="center" mb={4}>
                    <Popover>
                      <PopoverTrigger>
                        <Button>KC</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Selecciona los KCs o ingresa un KC</PopoverHeader>
                        <PopoverBody>
                          <Select
                            placeholder="Selecciona KC"
                            value={card.kcs}
                            onChange={(e) => handleKcChange(index, e.target.value)}
                            bg="white"
                            mb={4}
                          >
                            {kcOptions
                              .filter(option => option.label.toLowerCase().includes(kcInput.toLowerCase()))
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                            ))}
                            <option value="otro">Añadir KC</option>
                          </Select>
                          <Box mb={4} />
                          <Input
                            placeholder="Buscar KC en la lista"
                            value={kcInput}
                            onChange={(e) => setKcInput(e.target.value)}
                            bg="white"
                            mb={4}
                          />
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <Text ml={4}>{card.kcs || kcInput}</Text>
                  </Flex>
                  </>
                )}
              </Box>
            </Flex>
          ))}

          <Stack spacing={4} direction="row" align="center">
            <Button onClick={addCard} alignSelf="center">
              Agregar tarjeta tipo paso
            </Button>
            <Button colorScheme="green" onClick={() => alert('Datos guardados!')}>
              Guardar Cambios
            </Button>
          </Stack>
        </Flex>
      </div>
    </MathJaxContext>
  );
}
