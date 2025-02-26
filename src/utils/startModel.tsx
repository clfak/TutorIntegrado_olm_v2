import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { proxy } from "valtio";
import { useEffect } from "react";
import type { ExType } from "../components/lvltutor/Tools/ExcerciseType";
import { gSelect } from "../components/GroupSelect";
export interface model {
  mth: number;
  level: number;
}

export const InitialModel = proxy<{
  isLoading: boolean;
  data: Array<{
    id: string;
    json: Record<string, model>;
  }>;
}>({
  isLoading: true,
  data: [
    {
      id: "-2",
      json: {},
    },
  ],
});

export default function StartModel(uid: string) {
  const { isLoading: userModelData } = useGQLQuery(
    gql(/* GraphQL */ `
      query potatoUM($userId: IntID!) {
        users(ids: [$userId]) {
          modelStates(
            input: { filters: { type: ["BKT"] }, orderBy: { id: DESC }, pagination: { first: 1 } }
          ) {
            nodes {
              json
            }
          }
        }
      }
    `),
    { userId: uid },
    {
      enabled: Number(InitialModel.data[0].id) < -1,
      onSuccess(data) {
        InitialModel.data[0].json = data.users[0].modelStates.nodes[0].json;
        InitialModel.data[0].id = "-1";
      },
      onSettled() {
        InitialModel.isLoading = false;
      },
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    InitialModel.isLoading = userModelData;
  }, [userModelData]);
}

export const uModel = proxy<{
  isLoading: boolean;
  osml: boolean;
  motivmsg: boolean;
  sprog: boolean;
  data: Array<{
    id: string;
    json: Record<string, model>;
  }>;
}>({
  isLoading: true,
  osml: false,
  motivmsg: false,
  sprog: false,
  data: [
    {
      id: "-2",
      json: {},
    },
  ],
});

export function UserModel(uid: string) {
  const { isLoading: userModelData } = useGQLQuery(
    gql(/* GraphQL */ `
      query usermodel($userId: IntID!) {
        users(ids: [$userId]) {
          modelStates(
            input: { filters: { type: ["BKT"] }, orderBy: { id: DESC }, pagination: { first: 1 } }
          ) {
            nodes {
              json
            }
          }
        }
      }
    `),
    { userId: uid },
    {
      //enabled: false,
      onSuccess(data) {
        uModel.data[0].json = data.users[0].modelStates.nodes[0].json;
        uModel.data[0].id = "-1";
      },
      onSettled() {
        uModel.isLoading = false;
      },
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    uModel.isLoading = userModelData;
  }, [userModelData]);
}

export const gModel = proxy<{
  isLoading: boolean;
  data: Array<{
    id: string;
    json: Record<string, model>;
  }>;
}>({
  isLoading: true,
  data: [
    {
      id: "-2",
      json: {},
    },
  ],
});

export function GroupModel(gid: string, pid: string) {
  const { isLoading: userModelData } = useGQLQuery(
    gql(`
      query potato($groupId: IntID!,$projectCode: String!) {
        groupModelStates(groupId: $groupId,projectCode: $projectCode){
          id
          json
        }
      }
    `),
    { groupId: gid, projectCode: pid },
    {
      enabled: gSelect.group ? true : false && uModel.osml,
      onSuccess(data) {
        gModel.data = data.groupModelStates;
      },
      onSettled() {
        gModel.isLoading = false;
      },
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    gModel.isLoading = userModelData;
  }, [userModelData]);
}

export const kcsyejercicio = proxy<{
  lista: Array<string>;
  ejercicio: Object;
  title: string;
}>({
  lista: [],
  ejercicio: {},
  title: "",
});

export const selectedExcercise = proxy<{
  isLoading: boolean;
  ejercicio: Array<ExType>;
  kcXtopic: Array<Record<string, Array<{ code: string }>>>;
}>({
  isLoading: true,
  ejercicio: [],
  kcXtopic: [],
});

export function SelectExcercise(topicCodes: Array<string>) {
  const { isLoading: userModelData } = useGQLQuery(
    gql(`
     query GetKcsByTopics($topicsCodes: [String!]!) {
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
    `),
    { topicsCodes: topicCodes },
    {
      //enabled: false,
      onSuccess(data) {
        let jl: Array<ExType> = [];
        for (var e of data.kcsByContentByTopics) {
          let max = 0;
          let json;
          //let code = e.topic.code;
          for (var f of e.topic.content) {
            if (max < f.kcs.length) {
              max = f.kcs.length;
              json = f.json;
            }
          }
          if (json) jl.push(json);
        }
        selectedExcercise.ejercicio = jl;

        let kcsByTopic = [];
        data.kcsByContentByTopics.forEach(({ topic, kcs }) => {
          kcsByTopic[topic.id] = kcs.map(kc => kc); // Guarda el objeto completo de KCs
        });

        selectedExcercise.kcXtopic = kcsByTopic;
      },
      onSettled() {
        selectedExcercise.isLoading = false;
      },
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    selectedExcercise.isLoading = false;
  }, [userModelData]);
}
