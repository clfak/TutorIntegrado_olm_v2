import { Stack, Heading, Text } from "@chakra-ui/react";
import OlmProgressBar from "../components/olm/OlmProgressBar";


import TopicTable from "../components/olm/TopicTable";


export default function olmDashboard() {
    const bgColor = "#2A4365";
    // const { user } = useAuth();
    // const proyecto = user?.projects?.some(x => x.code == "NivPreAlg");
    // console.log(proyecto);

    return (
        <>
            <Stack width="100%" padding="1em" alignItems="center">
                <Stack alignItems="center">
                    <Heading color={bgColor}>Mi progreso en Mateo</Heading>
                </Stack>
                <Text fontWeight="normal" marginBottom={10} mt={40}>
                    Aquí podrás ver porcentaje de tu progreso en todos los tópicos de matemáticas que has trabajado en Mateo. A medida que avances en los tópicos, el porcentaje irá variando. Recuerda que el objetivo es llegar al 100% en todos los tópicos.
                </Text>
                <TopicTable/>
            </Stack>
                <OlmProgressBar percent={75} />
            
        </>
    );
}