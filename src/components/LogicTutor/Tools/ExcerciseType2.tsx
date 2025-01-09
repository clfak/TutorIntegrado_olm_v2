export interface value {
  name: string;
  value: number;
}
export interface hint {
  hintId: number;
  hint: string;
}
export interface matchingError {
  error: Array<string>;
  hintId: number;
  hint: string;
}
export interface answer {
  answer: Array<string>;
  nextStep: string;
}

export interface Step {
  stepId: string;
  KCs: Array<string>;
  expression: string;
  stepTitle: string;
  displayResult: Array<string>;
  values?: Array<value> | Array<tvalue>;
  hints: Array<hint>;
  matchingError?: Array<matchingError>;
  validation?: "stringComparison" | "evaluate" | "countElements" | "evaluateAndCount";
  answers: Array<answer>;
  incorrectMsg: string;
  correctMsg: string;
  summary: string;
}
export interface Table {
  header: Header[];
  rows: Row[];
  alignRows: textAlign;
  tableCaption: string;
}
export type textAlign = "left" | "right" | "center" | "justify" | "end" | "start";

export interface Header {
  align: string;
  value: string;
}
export interface tvalue {
  name: string;
  value: string;
}

export interface Row {
  data: string[];
}

export interface ExType {
  code: string;
  meta: {};
  title: string;
  presentation?: {
    title: string;
    urlImg: string;
  };
  text: string;
  type: string;
  eqc?: string | undefined;
  steps: Array<Step>;
  img?: string;
  initialExpression?: string;
}

export interface StepLog extends Step {
  StepType:
    | "Alternatives"
    | "TrueFalse"
    | "MultiplePlaceholders"
    | "Blank"
    | "DualInputs"
    | "InputButtons"
    | "Notation"
    | "Rect"
    | "TableStep"
    | "SinglePlaceholder";
  table?: Table | undefined;
  button?: any;
}

export interface ExLog extends ExType {
  img?: string | undefined;
  steps: Array<StepLog>;
}
