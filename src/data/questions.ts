import { questions as _q, specialQuestions as _sq } from './questions-raw';

export interface Option {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  dim?: string;
  text: string;
  options: Option[];
  special?: boolean;
  kind?: string;
}

export const questions = _q as Question[];
export const specialQuestions = _sq as Question[];
