import { Center, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { withAuth } from "../components/Auth";
import { CardSelectionwp } from "../components/contentSelectComponents/CardSelectionWp";
import type { wpExercise } from "../components/tutorWordProblems/types";
import parameters from "../components/contentSelectComponents/parameters.json";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAction } from "../utils/action";

export default withAuth(function WpExercises() {
  const router = useRouter();
  const registerTopic = router.query.registerTopic + ""; //topics in array
  console.log(registerTopic);
  const nextContentPath = router.asPath + "";
  const { data, isLoading } = useGQLQuery(
    gql(/* GraphQL */ `
      query data {
        topicByCode(code: "WPFrac") {
          content {
            id
            code
            description
            label
            json
            kcs {
              code
            }
          }
        }
      }
    `),
  );
  const action = useAction();
  useEffect(() => {
    action({
      verbName: "displaySelection",
      topicID: registerTopic,
      //extra: { selectionData },
    });
  }, []);

  console.log(data?.topicByCode?.content);

  return (
    <>
      <Center>
        <Heading marginBottom="4">
          {parameters.CSMain.title}
          {parameters.CSMain.topic10.topic}
        </Heading>
        &nbsp;&nbsp;&nbsp;
      </Center>
      <Center>
        <Text marginBottom={5}>
          Los siguientes ejercicios te permitirán aplicar conceptos matemáticos de fracciones,
          potencias, notación científica, ecuaciones, etc. para entender fenómenos
          socio-medioambientales. Realizar estos ejercicios te dará una visión de cómo las
          matemáticas se usan en problemas reales.
        </Text>
      </Center>
      <Center>
        <SimpleGrid columns={2} spacing={10} marginTop="4">
          {!isLoading &&
            data?.topicByCode?.content?.map(ejercicio => (
              <CardSelectionwp
                registerTopic={registerTopic}
                nextContentPath={nextContentPath}
                key={ejercicio?.id}
                ej={ejercicio?.json as unknown as wpExercise}
                id={ejercicio?.id}
                label={ejercicio?.label}
                kcs={ejercicio?.kcs}
                selectionTitle=""
                selectionText=""
              />
            ))}
        </SimpleGrid>
      </Center>
    </>
  );
});
