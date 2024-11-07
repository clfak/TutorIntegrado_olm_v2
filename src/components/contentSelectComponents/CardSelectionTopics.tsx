import { LinkBox, Heading, Center, HStack, LinkOverlay, Text, VStack, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import UserModelQuery from "../UserModelQuery";
import PBLoad from "../progressbar/pbload";
import UmProxy from "../ModelQueryProxy";

const listakcs = (kcs: { code: string }[]): string[] => {
  let kcnames: Array<string> = [];
  for (var kc of kcs) {
    let value = kc.code;
    if (!value) continue;
    kcnames.push(value);
  }
  return kcnames;
};

export const CardSelectionTopic = ({
  id,
  label,
  registerTopic,
  nextContentPath,
  KCs,
}: {
  id: string;
  label: string | undefined;
  registerTopic: string;
  nextContentPath: string | undefined;
  KCs: { code: string }[];
}) => {
  const topicPath = `contentSelect?topic=${id}&registerTopic=${registerTopic}`;
  return (
    <Box bg="blue.700" rounded="md">
      <LinkBox
        as="article"
        w="100%"
        maxW="md"
        p="4"
        borderTopRadius="md"
        textAlign="center"
        color="white"
        bg="blue.700"
        _hover={{
          color: "white",
          bg: "blue.900",
        }}
        minH="100px"
      >
        <Center>
          <HStack>
            <Heading size="md" my="2" textAlign="center">
              {label}
            </Heading>
          </HStack>
        </Center>

        {/* Muestra los KCs asociados */}
        <VStack spacing={1} align="start" mt={2}>
          {KCs.map(kc => (
            <Text key={kc.code} fontSize={"sm"}>
              {kc.code}
            </Text>
          ))}
        </VStack>

        <NextLink href={topicPath} passHref>
          <LinkOverlay>
            <Text paddingTop={"2"} fontSize={"sm"}>
              Ir al Tópico!
            </Text>
          </LinkOverlay>
        </NextLink>
        <UserModelQuery KCs={KCs} />
      </LinkBox>
      <Center h={"60px"}>
        {UmProxy.usuario ? (
          <PBLoad
            kcnames={listakcs(KCs)}
            values={UmProxy.usuario.users[0].modelStates.nodes[0].json}
          />
        ) : (
          <>fail</>
        )}
      </Center>
    </Box>
  );
};
