import { TYPE_LIBRARY as _TYPE_LIBRARY, NORMAL_TYPES as _NORMAL_TYPES, TYPE_IMAGES as _TYPE_IMAGES } from './types-raw';

export interface PersonalityType {
  code: string;
  cn: string;
  intro: string;
  desc: string;
}

export interface NormalTypePattern {
  code: string;
  pattern: string;
}

export const TYPE_LIBRARY = _TYPE_LIBRARY as Record<string, PersonalityType>;
export const NORMAL_TYPES = _NORMAL_TYPES as NormalTypePattern[];
export const TYPE_IMAGES = _TYPE_IMAGES as Record<string, string>;
