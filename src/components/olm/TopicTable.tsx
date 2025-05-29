import React, { useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";

import { useAuth } from "../Auth";
import { useGQLQuery } from "rq-gql";
import { gql } from "../../graphql";

//query para obtener los topicos
const GET_INFO_TOPIC = gql(/* GraphQL */ `
    query GetInfoTopic {
        topics(ids: [44,4,19,68,31,24,52,37]){
            id
            label
        }
    }
`);

export default function TopicTable() {
    const { isLoading: authLoading } = useAuth();

    const { data, isLoading: topicsLoading, error } = useGQLQuery(GET_INFO_TOPIC,);

    useEffect(() => {
        if (!authLoading && !topicsLoading && data) {
            console.log("Tópicos obtenidos:", data.topics);
        }
    }, [authLoading, topicsLoading, data]);

    // 4. Si cualquiera sigue cargando, mostramos indicador
    if (authLoading || topicsLoading) {
        return <div>Cargando información…</div>;
    }

    // 5. En caso de error
    if (error) {
        return <div>Error al cargar tópicos: {error.message}</div>;
    }
    return (
        <TableContainer>
            <Table variant="striped" size="md">
                <Thead bg="blue.700" color="gray.100" >
                    <Tr>
                        <Th>Tópicos</Th>
                        <Th>Progreso</Th>
                        <Th></Th>
                        <Th textAlign="end">Ejercicios Realizados</Th>
                        <Th></Th>

                    </Tr>
                </Thead>
                <Tbody>
                    {data.topics.map((topic) => (
                        <Tr key={topic.id}>
                            <Td>{topic.label}</Td>
                            {/* <Td>{item.progress}</Td>
                            <Td>{item.eyeicon}</Td>
                            <Td textAlign="end">{item.exercises}</Td>
                            <Td>{item.icon}</Td> */}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
