import { useGQLQuery } from "rq-gql";
import { gql } from "../graphql";
import { proxy } from "valtio";
import { useEffect } from "react";

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
    },
  );

  useEffect(() => {
    InitialModel.isLoading = userModelData;
  }, [userModelData]);
}

export const uModel = proxy<{
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
      //enabled: false,
      onSuccess(data) {
        gModel.data = data.groupModelStates;
      },
      onSettled() {
        gModel.isLoading = false;
      },
    },
  );

  useEffect(() => {
    gModel.isLoading = userModelData;
  }, [userModelData]);
}
