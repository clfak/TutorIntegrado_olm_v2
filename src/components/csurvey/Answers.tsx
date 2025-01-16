import { proxy } from "valtio";

interface ans {
  ans: Record<
    string,
    Array<{ didreply: boolean; response: string; itemText: string; itemId: string }>
  >;
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
