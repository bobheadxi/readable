import ohm from "ohm-js";
import { MatchResult } from "./cst.ts";

// pop into https://ohmjs.org/editor/ to play around with this!
export const english = ohm.grammar(String.raw`
English {
  Paragraph = SemanticLine+

  // Multiple words and pauses in between count towards
  // a semantic line
  SemanticLine = SemanticSentence (semanticBreak | sentenceEnd) 
  SemanticSentence = (Word | InlinePunctuation)+

	// Sentence end is demarcated usually by punctuation
  semanticBreak = (":" | ";" | "--" | "-" | "–") space*
  sentenceEnd = ("." | "!" | "?" | end) space*

  // Punctuation that is part of a sentence
  InlinePunctuation = "," | "\"" | "\'"

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
