import { Select, Box, Button, Input, Flex, Text, Stack, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Table,Thead,Tbody,Tr,Th,Td,TableContainer,useToast,Popover, PopoverTrigger, PopoverContent,PopoverArrow,PopoverCloseButton,PopoverHeader,PopoverBody} from '@chakra-ui/react';
import { useState,useCallback } from 'react';
import React from 'react';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

export default function NewExercise() {
  const [cards, setCards] = useState([
    { 
      type: 'enunciado', 
      title: '', 
      question: '', 
      expression: '', 
      summary: '', 
      successMessage: '', 
      latex: '', // Este campo debe estar presente y vacío
      alternatives: [{ text: '', correct: false }, { text: '', correct: false }], 
      hints: [{ text: '' }, { text: '' }], 
      respuestas: '' 
    }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(null); // Índice de la tarjeta seleccionada
  const { isOpen, onOpen, onClose } = useDisclosure(); // Estado del modal
  const { isOpen: isLatexOpen, onOpen: onOpenLatex, onClose: onLatexClose } = useDisclosure();
  const operations = [ //Operaciones del modal
    { label: '+', command: '+' }, { label: '-', command: '-' }, { label: '×', command: '\\times' },
    { label: '÷', command: '\\div' }, { label: '\\frac{□}{□}', command: '\\frac{}{}' }, { label: '=', command: '=' },
    { label: '≠', command: '\\neq' }, { label: '<', command: '<' }, { label: '>', command: '>' },
    { label: '≤', command: '\\leq' }, { label: '≥', command: '\\geq' }, { label: '±', command: '\\pm' },
    { label: '·', command: '\\cdot' }, { label: '\\sqrt{□}', command: '\\sqrt{}' }, { label: '□^n', command: '^{}' },
    { label: '□ₙ', command: '_{}' }, { label: '\\sum', command: '\\sum_{}^{}' }, { label: '\\int_{□}^{□}', command: '\\int_{}^{}' },
    { label: '∞', command: '\\infty' }, { label: 'π', command: '\\pi' }, { label: '\\sin', command: '\\sin' },
    { label: '\\cos', command: '\\cos' }, { label: '\\tan', command: '\\tan' }, { label: '\\log', command: '\\log' },
    { label: '\\ln', command: '\\ln' }, { label: '\\lim_{x \\to {□}}{□}', command: '\\lim_{x \\to {}}' }, { label: '()', command: '()' },
    { label: '[]', command: '\\left[ \\right]' }, { label: '{}', command: '\\left\\{ \\right\\}' }
  ];
  const updateCard = (index, updatedProps) => {
    setCards(cards.map((card, i) => (i === index ? { ...card, ...updatedProps } : card)));
  };
const insertLatex = (command) => {
  if (currentCardIndex !== null) {
    const inputElement = document.getElementById(`latex-input-${currentCardIndex}`);
    if (inputElement) {
      const startPos = inputElement.selectionStart;
      const endPos = inputElement.selectionEnd;
      const currentLatex = cards[currentCardIndex]?.latex || '';
      const updatedLatex = currentLatex.slice(0, startPos) + command + currentLatex.slice(endPos);
      updateCard(currentCardIndex, { latex: updatedLatex });
      setTimeout(() => {
        inputElement.selectionStart = inputElement.selectionEnd = startPos + command.length;
      }, 0);
    }
  }
};
  const toast = useToast();
  const [newCardType, setNewCardType] = useState('alternativas');
  const addCard = () => {
    if (newCardType === 'alternativas') {
      setCards([...cards, { type: 'alternativas', title: '', question: '', expression: '', summary: '', successMessage: '', alternatives: [{ text: '', correct: false }, { text: '', correct: false }], hints: [{ text: ''}, { text: ''}],kcs: ''}]);
    } else if (newCardType === 'verdadero/falso') {
      setCards([...cards, { type: 'verdadero/falso', title: '', question: '', expression: '', summary: '', successMessage: '', trueOption: false, falseOption: false, hints: [{ text: ''}, { text: ''}],kcs: ''}]);
    } else if (newCardType === 'multipleplaceholder') {
      setCards([...cards, {type: 'multipleplaceholder', title: '', question: '', expression: '', summary: '', successMessage: '', placeholders: '', respuestas: '' ,hints: [{ text: ''}, { text: ''}],kcs: ''}]);
    }else if (newCardType === 'singleplaceholder') {
      setCards([...cards, {type: 'singleplaceholder', title: '', question: '', expression: '', summary: '', successMessage: '', placeholders: '', respuestas: '' ,hints: [{ text: ''}, { text: ''}],kcs: ''}]);
    }
    else if (newCardType === 'table') {
      setCards([...cards, {type: 'table', title: '', question: '', expression: '', summary: '', successMessage: '', respuestas: new Array(4).fill('') ,hints: [{ text: ''}, { text: ''}],kcs: ''}]);
    }
    onClose();
  };

  // Opciones de KC
  const kcOptions = [
    { label: 'Kc1', value: 'Kc1' },
    { label: 'Kc2', value: 'Kc2' },
    { label: 'Kc3', value: 'Kc3' },
    // Añade más opciones según sea necesario DB
  ];

  const handleCardContentChange = (index, field, newContent) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = newContent;
    setCards(updatedCards);
  };
  const handleHintChange = (cardIndex, hintIndex, newContent) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].hints = updatedCards[cardIndex].hints.map((hint, index) => ({
      ...hint,
      text: index === hintIndex ? newContent : hint.text,
    }));
    setCards(updatedCards);
  };
  const handleAlternativeChange = (cardIndex, altIndex, newContent) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].alternatives = updatedCards[cardIndex].alternatives.map((alt, index) => ({
      ...alt,
      text: index === altIndex ? newContent : alt.text,
    }));
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
  const handleTrueFalseChange = (index, option) => {
    const updatedCards = [...cards];
    if (option === 'trueOption') {
      updatedCards[index].trueOption = !updatedCards[index].trueOption;
      updatedCards[index].falseOption = false;
    } else if (option === 'falseOption') {
      updatedCards[index].falseOption = !updatedCards[index].falseOption;
      updatedCards[index].trueOption = false;
    }
    setCards(updatedCards);
  };
  const addAlternative = (index) => {
    const updatedCards = [...cards];
    updatedCards[index].alternatives.push({ text: '', correct: false });
    setCards(updatedCards);
  };
  const addHints = (index) => {
    const updatedCards = [...cards];
    updatedCards[index].hints.push({ text: ''});
    setCards(updatedCards);
  };
  const removeAlternative = (cardIndex, altIndex) => {
    const updatedCards = [...cards];
    if (updatedCards[cardIndex].alternatives.length > 2) {
      updatedCards[cardIndex].alternatives.splice(altIndex, 1);
      setCards(updatedCards);
    }
  };
  const handleOpenLatexModal = (index) => {
    setCurrentCardIndex(index); // Establecemos el índice de la tarjeta actual
    onLatexOpen(); // Abre el modal de LaTeX, asegúrate de tener un useDisclosure para este modal
  };
  const removeHints = (cardIndex, hintIndex) => {
    const updatedCards = [...cards];
    if (updatedCards[cardIndex].hints.length > 2) {
      updatedCards[cardIndex].hints.splice(hintIndex, 1);
      setCards(updatedCards);
    }
  };
  const getCardColor = (type) => {
    switch (type) {
      case 'enunciado':
        return 'blue.200';
      case 'alternativas':
        return 'green.200';
      case 'verdadero/falso':
        return 'purple.200';     
      case 'multipleplaceholder':
        return 'orange.200';
      case 'singleplaceholder':
        return 'red.200';
        case 'table':
          return 'blue.400';
      default:
        return 'gray.200';
    }
  };
  const getCardLabel = (type) => {
    switch (type) {
      case 'enunciado':
        return 'Enunciado';
      case 'alternativas':
        return 'Alternativas';
      case 'verdadero/falso':
        return 'Verdadero/Falso';
      case 'multipleplaceholder':
        return 'Multiple placeholders';
      case 'singleplaceholder':
        return 'Single placeholder';
        case 'table':
          return 'Tabla de verdad';
      default:
        return 'Desconocido';
    }
  };
  const deleteCard = (index) => {
    const isConfirmed = window.confirm('¿Estás seguro de que deseas eliminar este paso?');
    if (isConfirmed) {
      const updatedCards = cards.filter((_, i) => i !== index);
      setCards(updatedCards);
    }
  };

  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCode, setExerciseCode] = useState('');
  const [exerciseTopic, setExerciseTopic] = useState('');
  const [tempExerciseName, setTempExerciseName] = useState('');
  const [tempExerciseCode, setTempExerciseCode] = useState('');
  const [tempExerciseTopic, setTempExerciseTopic] = useState('');
  const { isOpen: isModal2Open, onOpen: onModal2Open, onClose: onModal2Close } = useDisclosure();
  const [activeModal, setActiveModal] = React.useState(null);
  const handleSave = () => {
    setExerciseName(tempExerciseName);
    setExerciseCode(tempExerciseCode);
    setExerciseTopic(tempExerciseTopic);
    alert('Nombre de archivo:\n' + tempExerciseName + 'Código de ejercicio:\n' + tempExerciseCode + 'Tópico de ejercicio:\n' + tempExerciseTopic + 'Tarjetas: ' + JSON.stringify(cards));
    onClose();
  };


  const saveData = () => {
    alert('Datos a guardar:\n' + 'Tarjetas: ' + JSON.stringify(cards));
  };


  const [rowValues, setRowValues] = useState(new Array(4).fill('')); 
  const handleButtonClick = useCallback((cardIndex, answerIndex) => {
    setCards((prevCards) => {
      const updatedCards = [...prevCards];
      const currentRespuestas = updatedCards[cardIndex].respuestas;
      currentRespuestas[answerIndex] = currentRespuestas[answerIndex] === 'V' ? 'F' : 'V'; // Toggle value
      return updatedCards;
    });
  }, []); 

  const staticValues = [
    { P: 'V', Q: 'V' },
    { P: 'V', Q: 'F' },
    { P: 'F', Q: 'V' },
    { P: 'F', Q: 'F' },
  ];

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
              bg={getCardColor(card.type)}
              boxShadow="md"
              alignItems="center"
              direction="column"
              position="relative"
              justifyContent="space-between"
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
                {(getCardLabel(card.type) === "Enunciado" ?  getCardLabel(card.type) : getCardLabel(card.type) + " " + index )}
              </Text>

              <Box flex="1" w="100%">

              {card.type != 'enunciado' ? (
  <>
    <Input
      placeholder="Titulo del paso"
      value={card.title}
      onChange={(e) => handleCardContentChange(index, 'title', e.target.value)}
      bg="white"
      mb={2}
    />
    <Input
      placeholder={`Pregunta del paso`}
      value={card.question}
      onChange={(e) => handleCardContentChange(index, 'question', e.target.value)}
      bg="white"
      mb={2}
    />
              {/* CUADRO DE TEXTO PARA LATEX (INICIO)*/}
              <Box display="flex" alignItems="center">
                {card.isEditing ? (
                  <Input
                    id={`latex-input-${index}`}
                    value={card.latex || ''}
                    onChange={(e) => updateCard(index, { latex: e.target.value })}
                    onBlur={() => updateCard(index, { isEditing: false })}
                    placeholder={`Contenido en LaTeX tarjeta`} 
                    autoFocus
                    bg="white"
                  />
                ) : (
                  <Box 
                    p={2} 
                    mb={2}
                    bg="white"
                    borderWidth="1px" 
                    borderRadius="md" 
                    onClick={() => updateCard(index, { isEditing: true })} 
                    cursor="pointer" 
                    flex="1"
                  >
                    <MathJax>
                    {card.latex 
                      ? `\\(${card.latex}\\)` // Expresión LaTeX en color negro
                      : <span style={{ color: '#ccd3dd' }}> Expresión</span> // Texto "Expresión" en color gris
                    }
                    </MathJax>
                  </Box>
                )}
                <Button size="xs" ml={2} onClick={() => { setCurrentCardIndex(index); onOpenLatex(); }}>?</Button>
              </Box>
              {/* CUADRO DE TEXTO PARA LATEX (FIN) */}
  </> 
) : (
  <></>
)}
                {card.type === 'enunciado' ? (
                  <>
                    <Input
                      placeholder={`Contenido del enunciado`}
                      value={card.content}
                      onChange={(e) => handleCardContentChange(index, 'content', e.target.value)}
                      bg="white"
                    />
                  </>
                  ): card.type === 'singleplaceholder' ? (
                    <>
                      <Box mb={4} p={4} bg="yellow.300" borderRadius="md" boxShadow="md">
                        <Text fontWeight="bold" mb={2}>
                          Single Placeholder
                        </Text>
                        <Flex key={index} align="center">
                          <Input
                            placeholder={`Expresion del placeholder`}
                            value={card.placeholders}
                            onChange={(e) => handleCardContentChange(index, 'placeholder', e.target.value)}
                            bg="white"
                            mr={2}
                            mb={2}
                          />
                <Select 
                  placeholder="Seleccione un metodo correccion" 
                  value={card.respuestas} 
                  onChange={(e) => handleCardContentChange(index, 'respuestas', e.target.value)}
                  bg="white"
                            mr={2}
                            mb={2}
                  >
                  <option value="StringComparison">StringComparison</option>
                  <option value="EvaluateandCount">EvaluateandCount</option>
                  <option value="Evaluete">Evaluete</option>
                </Select>
                        </Flex>
                      </Box>
                    </>
                  ) : card.type === 'multipleplaceholder' ? (
                  <>
                    <Box mb={4} p={4} bg="yellow.300" borderRadius="md" boxShadow="md">
                      <Text fontWeight="bold" mb={2}>
                        Multiple Placeholders
                      </Text>
                      <Flex key={index} align="center">
                        <Input
                          placeholder={`Expresion con placeholders`}
                          value={card.placeholders}
                          onChange={(e) => handleCardContentChange(index, 'placeholder', e.target.value)}
                          bg="white"
                          mr={2}
                          mb={2}
                        />
                        <Input
                          placeholder={`Respuestas separadas por coma`}
                          value={card.respuestas}
                          onChange={(e) => handleCardContentChange(index, 'respuestas', e.target.value)}
                          bg="white"
                          mr={2}
                          mb={2}
                        />
                      </Flex>
                    </Box>
                  </>
                ) : card.type === 'table' ? (
                  <>
                  <Box mb={4} p={4} bg="yellow.300" borderRadius="md" boxShadow="md">
                      <Text fontWeight="bold" mb={2}>
                        Tabla de Verdad
                      </Text>
                      <TableContainer>
                        <Table variant='simple'>
                          <Thead>
                            <Tr>
                              <Th>P</Th>
                              <Th>Q</Th>
                              <Th>P=>Q</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                          {staticValues.map((row, answerIndex) => (
                            <Tr key={index}>
                              <Td>{row.P}</Td>
                              <Td>{row.Q}</Td>
                              <Td>
                              <Button onClick={() => handleButtonClick(index, answerIndex)}>
                                {card.respuestas[answerIndex]}
                              </Button>
                              </Td>
                            </Tr>
                          ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                ) : card.type === 'verdadero/falso' ? (
                  <>
                    <Box mb={4}  p={4} bg="yellow.300" borderRadius="md" boxShadow="md">
                      <Text fontWeight="bold">Verdadero/Falso</Text>
                      <Flex align="center" mb={4}>
                        <Button
                          colorScheme={card.trueOption ? 'green' : 'gray'}
                          onClick={() => handleTrueFalseChange(index, 'trueOption')}
                          mr={2} mt={4}
                        >
                          Verdadero
                        </Button>
                        <Button
                          colorScheme={card.falseOption ? 'red' : 'gray'}
                          onClick={() => handleTrueFalseChange(index, 'falseOption')}
                          mt={4}
                        >
                          Falso
                        </Button>
                      </Flex>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box mb={4} p={4} bg="yellow.300" borderRadius="md" boxShadow="md">
                      <Text fontWeight="bold" mb={2}>Alternativas</Text>
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
                      <Button mt={4} onClick={() => addAlternative(index)}>Agregar alternativa</Button>
                    </Box>
                    
                  </>
                )}
              </Box>
              {card.type !== 'enunciado' && (
                <Box flex="1" w="100%">
                <Box mb={4} p={4} bg="orange.300" borderRadius="md" boxShadow="md">
                        <Text fontWeight="bold" mb={2}>Pistas</Text>
                        {card.hints.map((hint, hintIndex) => (
                          <Flex key={hintIndex} align="center">
                            <Input
                              placeholder={`Pista ${hintIndex + 1}`}
                              value={hint.text}
                              onChange={(e) => handleHintChange(index, hintIndex, e.target.value)}
                              bg="white"
                              mr={2}
                              mb={2}
                            />
                            {card.hints.length > 2 && (
                              <Button colorScheme="red" onClick={() => removeHints(index, hintIndex)}>
                                🗑️
                              </Button>
                            )}
                          </Flex>
                        ))}
                        <Button mt={4} onClick={() => addHints(index)}>Agregar pista</Button>
                      </Box>
                      {/* Demas imputs */}
                      
                      <Input
                        placeholder="Resumen del paso"
                        value={card.summary}
                        onChange={(e) => handleCardContentChange(index, 'summary', e.target.value)}
                        bg="white"
                        mb={4}
                      />
                      <Input
                        placeholder="Mensaje de éxito"
                        value={card.successMessage}
                        onChange={(e) => handleCardContentChange(index, 'successMessage', e.target.value)}
                        bg="white"
                        mb={4}
                      />
                      <Popover>
                        <PopoverTrigger>
                          <Button>KC</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>Selecciona los KCs</PopoverHeader>
                          <PopoverBody>
                            <Input
                              placeholder="Ingresa KC"
                              value={kcInput}
                              onChange={(e) => setKcInput(e.target.value)}
                              bg="white"
                              mb={4}
                            />
                            <Select
                              placeholder="Selecciona KC"
                              value={kcOptions.find(option => option.value === cards.kcs)}
                              onChange={(selectedOption)=> {
                                handleCardContentChange(index, 'kcs', selectedOption.value);
                                setKcInput(selectedOption.label);
                              }}
                              options={kcOptions}
                              isClearable
                              isSearchable
                              styles={{ container: (base) => ({ ...base, width: 4 }) }}
                            />
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
              {/* Botón de Eliminar */}
              {card.type !== 'enunciado' && (
                <Flex justifyContent="center" >
                  <Button onClick={() => deleteCard(index)} colorScheme="red" size="sm">
                    Eliminar paso
                  </Button>
                </Flex>
)}
            </Flex>
          ))}
          <Stack spacing={4} mt={4} direction="row" align="center">
            <Button onClick={() => { setActiveModal('modal1'); onOpen(); }} alignSelf="center">Agregar tarjeta</Button>
            <Button
  colorScheme="green"
  onClick={() => {
    cards.length <= 1
      ? toast({
          title: "Error",
          description: "No puedes guardar sin tener pasos en el ejercicio",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      : (setActiveModal('modal2'), onOpen());
  }}
  alignSelf="center"
>
  Guardar Ejercicio
</Button>
          </Stack>
          <Modal isOpen={isOpen && activeModal === 'modal1'} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Seleccionar tipo de tarjeta</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Select value={newCardType} onChange={(e) => setNewCardType(e.target.value)}>
                  <option value="alternativas">Paso de alternativas</option>
                  <option value="verdadero/falso">Paso de verdadero/falso</option>
                  <option value="singleplaceholder">Paso de single placeholder</option>
                  <option value="multipleplaceholder">Paso de multiple placeholders</option>
                  <option value="table">Paso de tabla de verdad</option>
                </Select> 
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={addCard}>Agregar</Button>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isOpen={isOpen && activeModal === 'modal2'} onClose={onClose}>
            <ModalOverlay />
            <ModalContent width="80%" maxWidth="800px">
              <ModalHeader>Rellene los campos solicitados</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={3}>
                  <Flex align="center">
                    <Text width="200px">Nombre Del Ejercicio:</Text>
                    <Input 
                      placeholder="Nombre Del Ejercicio" 
                      value={tempExerciseName} 
                      onChange={(e) => setTempExerciseName(e.target.value)} 
                    />
                  </Flex>
                  <Flex align="center">
                    <Text width="200px">Código Del Ejercicio:</Text>
                    <Input 
                      placeholder="Código Del Ejercicio" 
                      value={tempExerciseCode} 
                      onChange={(e) => setTempExerciseCode(e.target.value)} 
                    />
                  </Flex>
                  <Flex align="center">
                    <Text width="200px">Tópico del Ejercicio:</Text>
                    <Select 
                      placeholder="Seleccione un Tópico" 
                      value={tempExerciseTopic} 
                      onChange={(e) => setTempExerciseTopic(e.target.value)} 
                    >
                      <option value="Factorización">Factorización</option>
                      <option value="Lógica y Conjuntos">Lógica y Conjuntos</option>
                      <option value="Productos Notables">Productos Notables</option>
                    </Select>
                  </Flex>
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleSave}>
                  Guardar
                </Button>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
      {/* Modal de ayuda con LaTeX (INICIO)*/}
      <Modal isOpen={isLatexOpen} onClose={onLatexClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ayuda con LaTeX</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentCardIndex !== null && (
              <>
                {/* Input de LaTeX dentro del modal */}
                <Input
                  id={`latex-input-${currentCardIndex}`}
                  value={cards[currentCardIndex]?.latex || ''}
                  onChange={(e) => updateCard(currentCardIndex, { latex: e.target.value })}
                  mb={3}
                />
                {/* Botones para insertar comandos LaTeX */}
                <Flex wrap="wrap" gap={2}>
                  {operations.map(({ label, command }, index) => (
                    <Button key={index} onClick={() => insertLatex(command)} size="sm">
                      <MathJax dynamic inline>{`\\(${label}\\)`}</MathJax>
                    </Button>
                  ))}
                </Flex>
                {/* Vista previa de LaTeX */}
                <Box mt={4} p={2} borderWidth="1px" borderRadius="md">
                  <MathJax hideUntilTypeset="first" dynamic>
                    {`\\(${cards[currentCardIndex]?.latex || 'Expresión'}\\)`}
                  </MathJax>
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onLatexClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal de ayuda con LaTeX (FIN) */}
        </Flex>
      </div>
    </MathJaxContext>
  );
}
