import ohm from "ohm-js";

export type MatchResult = ohm.MatchResult & {
  _cst: ConcreteSyntaxTree;
};

export type ConcreteSyntaxTree = {
  children: Node[];
};

export type Node = {
  ctorName: Expression;
  matchLength: string;
  children: any[];
};

export type Expression =
  | "_iter"
  | "SemanticLine"
  | "SemanticSentence"
  | "SemanticPause"
  | "Word"
  | "sentenceEnd";
