import ohm from "ohm-js";
import { MatchResult } from "./cst.ts";

// pop into https://ohmjs.org/editor/ to play around with this!
export const english = ohm.grammar(String.raw`
English {
  Paragraph = SemanticLine+

  // SemanticLine is a semantic clause and the delimiting
  // semantic boundary.
  SemanticLine = SemanticClause semanticBoundary
  SemanticClause = (Word | InlinePunctuation)+

  // SemanticBoundary delimits a semantic clause. We also
  // want to capture the spaces following a boundary break
  // to facilitate reconstruction.
  semanticBoundary = (semanticBreak | sentenceEnd) space*

  // semanticBreak are punctuation marks that are often
  // used to delimit a substantial unit of thought.
  semanticBreak = ":" | ";" -- colon
    | "--" | "-" | "–"      -- emDash
    | ") " | "),"           -- endParens

  // sentenceEnd are standard sentence-ending punctuation
  // marks or the end of input.
  sentenceEnd = "." | "!" | "?" | end

  // Punctuation that is part of a sentence
  InlinePunctuation = ","      -- comma
    | "\"" | "\'"              -- quotations
    | "(" | ~(") " | "),") ")" -- inlineParens

  // A word can come in many forms
  Word = rawContent
    | acronym
    | concatenatedWord
    | contractedWord
    | singleWord

  // Various types of words
  singleWord = (letter | digit)+
  concatenatedWord = singleWord "-" singleWord
  contractedWord = singleWord "\'" letter
  acronym = (letter ".")+

  // Special word class for injecting special content
  rawContentEnd = "{{ end rawContent }}"
  rawContent = "{{ begin rawContent }}" (~rawContentEnd any)* rawContentEnd
}
`);

export function matchEnglish(input: string) {
  const match = english.match(input) as MatchResult;
  // First child is the first iteration, we expect this
  const iterations = match._cst.children;
  if (iterations.length !== 1) {
    throw new Error(`Unexpected CST children: ${JSON.stringify(iterations)}`);
  }
  return { match, root: iterations[0] };
}
