import { proxy } from "valtio";
import { useGQLQuery } from "rq-gql";
import { gql } from "../../graphql";
import { useEffect } from "react";

interface ans {
  ans: Record<string, { didreply: boolean; response: string; itemText: string; itemId: string }>;
  sumbmit: boolean;
}

export const Answers = proxy<ans>({ ans: {}, sumbmit: false });

export const reset = () => {
  Object.assign(Answers, { ans: {}, sumbmit: false });
};

interface SVI {
  topicselect: boolean;
  count: number;
}

export const SVP = proxy<SVI>({ topicselect: true, count: 0 });

export const reset2 = () => {
  Object.assign(SVP, { topicselect: true, count: -1 });
};

interface SD {
  title: string;
  code: string;
  description?: string;
  items: Array<{
    id: string;
    index: number;
    content: {
      type: string;
      text?: string;
      rankedLabel?: Array<string>;
      options?: Array<string>;
      expression?: string;
    };
  }>;
  tags: Array<string>;
}

//survey query+proxy

export const Surveys = proxy<{
  isLoading: boolean;
  data: Array<SD>;
  tagXindex: Record<string, number>;
}>({
  isLoading: true,
  data: [],
  tagXindex: {},
});

export default function SuerveyQ(projectid: string, tags: Array<string>) {
  const { isLoading: userModelData } = useGQLQuery(
    gql(/* GraphQL */ `
      query surveys($projectId: IntID!, $tags: [String!]!) {
        activePolls(projectId: $projectId, tags: $tags) {
          title
          code
          description
          items {
            id
            index
            content
          }
          tags
        }
      }
    `),
    { projectId: projectid, tags: tags },
    {
      enabled: Surveys.data.length < 1,
      onSuccess(data) {
        Surveys.data = data.activePolls as Array<SD>;
        let txi: Record<string, number> = {};
        for (var i = 0; i < Surveys.data.length; i++) {
          for (var j = 0; j < Surveys.data[i].tags.length; j++) {
            txi[Surveys.data[i].tags[j]] = i;
          }
        }
        Surveys.tagXindex = txi;
      },
      onError(err) {
        console.log("abc", err);
      },
      onSettled() {
        Surveys.isLoading = false;
      },
      refetchOnWindowFocus: false,
      //refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );
  useEffect(() => {
    Surveys.isLoading = userModelData;
  }, [userModelData]);
}
