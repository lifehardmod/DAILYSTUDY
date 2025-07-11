// src/utils/solvedac.ts
export interface ProblemMeta {
  titleKo: string;
  level: number;
}

/**
 * 주어진 problemId로 solved.ac API 호출해서 메타 정보를 가져옵니다.
 */
export async function fetchProblemMeta(
  problemId: number
): Promise<ProblemMeta> {
  const url = `https://solved.ac/api/v3/problem/show?problemId=${problemId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Solved.ac API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return {
    titleKo: data.titleKo,
    level: data.level,
  };
}
