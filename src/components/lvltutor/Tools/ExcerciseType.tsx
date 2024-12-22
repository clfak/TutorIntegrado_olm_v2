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

export interface option {
  id: number;
  text?: string;
  expression?: string;
  correct: boolean;
  type?: string;
}

export interface Step {
  stepId: string;
  KCs: Array<string>;
  expression: string;
  stepTitle: string;
  displayResult: Array<string>;
  values?: Array<value>;
  hints: Array<hint>;
  matchingError?: Array<matchingError>;
  multipleChoice?: Array<option>;
  validation?: "stringComparison" | "evaluate" | "countElements" | "evaluateAndCount";
  answers: Array<answer>;
  incorrectMsg: string;
  correctMsg: string;
  summary: string;
}

export interface ExType extends Record<string, string | object | Array<Step>> {
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
