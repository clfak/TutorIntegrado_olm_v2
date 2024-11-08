import { proxy } from "valtio";

export interface g {
  code: string;
  id: string;
  tags: Array<string>;
}

export interface model {
  mth: number;
  level: number;
}

export interface n {
  json: Record<string, model>;
  fecha: string;
}

export interface ms {
  nodes: Array<n>;
}

export interface u {
  email: string;
  groups: Array<g>;
  modelStates: ms;
}

export interface usuario {
  users: Array<u>;
}

export interface query {
  usuario: usuario;
}

/*const initialObj: query = {
  usuario: {},
};*/

const initialObj: query = {
  usuario: {
    users: [
      {
        email: "incialprueba",
        groups: [
          {
            code: "",
            id: "",
            tags: [],
          },
        ],
        modelStates: {
          nodes: [
            {
              json: {},

              fecha: "",
            },
          ],
        },
      },
    ],
  },
};

const UmProxy = proxy(initialObj);

export interface queryGroupModelStates {
  id: string;
  json: Record<string, model>;
}

export interface gq {
  groupModelStates: Array<queryGroupModelStates>;
}

export interface groupQuery {
  gd: gq;
}

const iOGD: groupQuery = {
  gd: {
    groupModelStates: [
      {
        id: "0",
        json: {},
      },
    ],
  },
};

export const GdProxy = proxy(iOGD);

export const reset = () => {
  Object.assign(UmProxy, initialObj);
};

export default UmProxy;
