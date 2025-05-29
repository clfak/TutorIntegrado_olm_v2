import React, { useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { FaChevronDown, FaChevronRight, FaRegEye, FaRegEyeSlash } from "react-icons/fa";


import { useAuth } from "../Auth";
import { useGQLQuery } from "rq-gql";
import { gql } from "../../graphql";
import OlmProgressBar from "./OlmProgressBar";




const GetTopicsAndModel = gql(/* GraphQL */ `
    query GetTopicsAndModel {
        currentUser {
            modelStates(input: { pagination: { first: 1 } }) {
                nodes {
                    json
                }
            }
        }
        topics(ids: [44,4,19,68,31,24,52,37]) {
            id
            label
            childrens {
                id
                label
                content {
                    kcs {
                        code
                    }
                }
            }
        }
    }
`);

export default function TopicTable() {
    const { isLoading: authLoading } = useAuth();
    const { data, isLoading: topicsLoading, error } = useGQLQuery(
        GetTopicsAndModel,
        undefined,
        { refetchOnWindowFocus: false, refetchOnReconnect: false }
    );

    // useEffect(() => {
    //     if (!authLoading && !topicsLoading && data) {
    //         console.log("Tópicos obtenidos:", data.topics);

    //     }
    // }, [authLoading, topicsLoading, data]);
    useEffect(() => {
        if (!authLoading && !topicsLoading && data) {
            console.log("Tópicos obtenidos:", data.topics);

            // data.topics.forEach((topic) => {
            //     topic.childrens.forEach((child) => {
            //         console.log(
            //             `Tópico "${topic.label}" - Subtópico "${child.label}" (id=${child.id})`
            //         );
            //     });
            //}
       // );
        }
    }, [authLoading, topicsLoading, data]);


    if (authLoading || topicsLoading) {
        return <div>Cargando información…</div>;
    }
    if (error) {
        return <div>Error al cargar tópicos: {error.message}</div>;
    }
    if (!data) {
        return <div>No hay datos</div>;
    }


    const modelJson = data.currentUser.modelStates.nodes[0].json;

    return (
        <TableContainer
            sx={{
                "thead tr th": {
                    color: "white",
                },
            }}
            w="100%"
        >
            <Table variant="striped" size="md">
                <Thead bg="blue.700">
                    <Tr >
                        <Th>Tópicos</Th>
                        <Th>Progreso</Th>
                        <Th></Th>
                        <Th textAlign="end">Ejercicios Realizados</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.topics.map((topic) => {
                        // promedio para este topico
                        const subtopicAverages = topic.childrens.map((sub) => {
                            const kcs: string[] = sub.content.flatMap((c) =>
                                c.kcs?.map((kc) => kc.code) ?? []
                            );
                            const levels = kcs.map(
                                (code) => modelJson[code as keyof typeof modelJson]?.level ?? 0
                            );
                            return levels.length > 0
                                ? levels.reduce((sum, lvl) => sum + lvl, 0) / levels.length
                                : 0;
                        });
                        const topicAvg =
                            subtopicAverages.length > 0
                                ? subtopicAverages.reduce((sum, avg) => sum + avg, 0) /
                                subtopicAverages.length
                                : 0;
                        const percent = Math.round(topicAvg * 100);

                        return (
                            <Tr key={topic.id} fontSize="md">
                                <Td fontWeight="semibold">{topic.label}</Td>
                                <Td>
                                    <OlmProgressBar percent={percent} />

                                </Td>
                                <Td textAlign="center">
                                    <FaRegEyeSlash size={18} cursor="pointer" />
                                </Td>
                                <Td textAlign="end"># Ejercicios Realizados</Td>
                                <Td textAlign="center">
                                    <FaChevronRight size={18} cursor="pointer" />
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
}