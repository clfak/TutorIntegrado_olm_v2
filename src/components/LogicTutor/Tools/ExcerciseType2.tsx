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
  values?: Array<value>;
  multipleChoice?: Array<option>;
  hints: Array<hint>;
  matchingError?: Array<matchingError>;
  validation?: "stringComparison" | "evaluate" | "countElements" | "evaluateAndCount";
  answers: Array<answer>;
  incorrectMsg: string;
  correctMsg: string;
  summary: string;
  stepType?:
    | "Alternatives"
    | "TrueFalse"
    | "MultiplePlaceholders"
    | "Blank"
    | "InputButtons"
    | "TableStep"
    | "SinglePlaceholder";
  table?: Table | undefined;
  keyboardForm?: any;
  button?: string[][];
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
export interface option {
  id: number;
  text?: string;
  expression?: string;
  correct: boolean;
  type?: string;
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
  initialExpression?: string | undefined;
  steps: Array<Step>;
  img?: string;
  eqc?: string | undefined;
}

export interface ExLog extends ExType {
  img?: string | undefined;
  steps: Array<Step>;
}
