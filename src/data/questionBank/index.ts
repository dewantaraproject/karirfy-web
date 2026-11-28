import NumericalMatrixQuestions from "./NumericalMatrix";
import digitsymbolQuestions from "./Digitsymbol";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  imageUrl?: string;
  options: Option[] | { [key: string]: string };
  correct: string | string[];
  discussion?: string;
  type: string;
  category?: string;
  matrixData?: (number | string)[][];
  digitSymbolData?: {
    symbolMap: Record<string, string>;
    testSequence: string[];
  };
  explanationUrl?: string;
  question_format?: string;
  text?: string;
  scores?: Record<string, number>;
}

export const questionBank = {
  NumericalMatrix: NumericalMatrixQuestions,
  digitsymbol: digitsymbolQuestions,
};

export default questionBank;
