import { questions } from '../data/questions';
import { dimensionMeta, dimensionOrder } from '../data/dimensions';
import { TYPE_LIBRARY, NORMAL_TYPES, PersonalityType, NormalTypePattern } from '../data/types';

export const DRUNK_TRIGGER_QUESTION_ID = 'drink_gate_q2';

export function sumToLevel(score: number): string {
  if (score <= 3) return 'L';
  if (score === 4) return 'M';
  return 'H';
}

export function levelNum(level: string): number {
  return { L: 1, M: 2, H: 3 }[level] as number;
}

export function parsePattern(pattern: string): string[] {
  return pattern.replace(/-/g, '').split('');
}

export interface ComputedResult {
  rawScores: Record<string, number>;
  levels: Record<string, string>;
  ranked: (NormalTypePattern & PersonalityType & { distance: number; exact: number; similarity: number })[];
  bestNormal: any;
  finalType: PersonalityType;
  modeKicker: string;
  badge: string;
  sub: string;
  special: boolean;
  secondaryType: any | null;
}

export function computeResult(answers: Record<string, number>): ComputedResult {
  const rawScores: Record<string, number> = {};
  const levels: Record<string, string> = {};
  Object.keys(dimensionMeta).forEach((dim) => {
    rawScores[dim] = 0;
  });

  questions.forEach((q) => {
    if (q.dim) {
      rawScores[q.dim] += Number(answers[q.id] || 0);
    }
  });

  Object.entries(rawScores).forEach(([dim, score]) => {
    levels[dim] = sumToLevel(score);
  });

  const userVector = dimensionOrder.map((dim) => levelNum(levels[dim]));

  const ranked = NORMAL_TYPES.map((type) => {
    const vector = parsePattern(type.pattern).map(levelNum);
    let distance = 0;
    let exact = 0;
    for (let i = 0; i < vector.length; i++) {
      const diff = Math.abs(userVector[i] - vector[i]);
      distance += diff;
      if (diff === 0) exact += 1;
    }
    const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
    return { ...type, ...TYPE_LIBRARY[type.code], distance, exact, similarity };
  }).sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return b.similarity - a.similarity;
  });

  const bestNormal = ranked[0];
  const drunkTriggered = answers[DRUNK_TRIGGER_QUESTION_ID] === 2;

  let finalType: PersonalityType;
  let modeKicker = '你的主类型';
  let badge = `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/15 维`;
  let sub = '维度命中度较高，当前结果可视为你的第一人格画像。';
  let special = false;
  let secondaryType = null;

  if (drunkTriggered) {
    finalType = TYPE_LIBRARY.DRUNK;
    secondaryType = bestNormal;
    modeKicker = '隐藏人格已激活';
    badge = '匹配度 100% · 酒精异常因子已接管';
    sub = '乙醇亲和性过强，系统已直接跳过常规人格审判。';
    special = true;
  } else if (bestNormal.similarity < 60) {
    finalType = TYPE_LIBRARY.HHHH;
    modeKicker = '系统强制兜底';
    badge = `标准人格库最高匹配仅 ${bestNormal.similarity}%`;
    sub = '标准人格库对你的脑回路集体罢工了，于是系统把你强制分配给了 HHHH。';
    special = true;
  } else {
    finalType = bestNormal;
  }

  return {
    rawScores,
    levels,
    ranked,
    bestNormal,
    finalType,
    modeKicker,
    badge,
    sub,
    special,
    secondaryType,
  };
}
