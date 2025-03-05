import localforage from "localforage";
import { proxy } from "valtio";
import type { AuthState } from "./Auth";
import type { User } from "@auth0/auth0-react";
import type { UserRole } from "../graphql";
import type { wpExercise } from "./tutorWordProblems/types";

export interface ContentJson {
  code: string;
  title: string;
  type: string;
  meta: Object;
  steps: Array<Object>;
}
export interface selectionDataType {
  optionCode: string;
  optionTitle: string;
  optionBest: boolean;
  optionSelected: boolean;
}

export interface CurrentContent {
  id: string | null;
  code: string;
  label: string;
  description: string;
  kcs: Object[];
  json: ContentJson | wpExercise;
  state?: Object;
}

export const sessionState = proxy<{
  [x: string]: any;
  currentUser: typeof AuthState.user | null;
  tag: string[];
  domain: string;
  topic: string;
  sessionId: string;
  learnerModel: Object;
  currentContent: CurrentContent;
  selectionData: selectionDataType[];
  nextContentPath: string | undefined;
  learnerTraces: Object[];
}>({
  currentUser: null,
  tag: [],
  domain: "PreAlgebra",
  topic: "",
  sessionId: "",
  learnerModel: {
    type: "BKT",
  },
  currentContent: {
    id: null,
    code: "",
    label: "",
    description: "",
    kcs: [],
    json: null,
    state: {},
  },
  selectionData: [],
  nextContentPath: "",
  learnerTraces: [],
  callback: null, // Initially, no logic is assigned (callback function),
  callbackType: "",
});

export var sessionStateBD = localforage.createInstance({
  name: "sessionState",
});

export const sessionStateInitial = (
  user:
    | {
        __typename?: "User" | undefined;
        id: string;
        email: string;
        name?: string | null | undefined;
        role: UserRole;
        picture?: string | null | undefined;
        tags: string[];
        projects: {
          __typename?: "Project" | undefined;
          id: string;
          code: string;
          label: string;
        }[];
        groups: {
          __typename?: "Group" | undefined;
          id: string;
          code: string;
          label: string;
          tags: string[];
        }[];
      }
    | null
    | undefined,
  auth0User: User | null,
) => {
  sessionState.currentUser = JSON.parse(JSON.stringify(user));
  sessionState.sessionId = `${auth0User?.updated_at}`;
  for (const key in sessionState) {
    sessionStateBD.getItem(key).then(function (value) {
      if (value == null) {
        //create valuekey in sessionState in indexedBD
        sessionStateBD
          .setItem(key, JSON.parse(JSON.stringify(sessionState[key as keyof typeof sessionState])))
          .then(function () {
            // Do other things once the value has been saved.
            //console.log("create 'key' in sessionState");
          });
      } else {
        //update valuekey??
      }
    });
  }
};

//export const useSessionState = () => useSnapshot(sessionState);
