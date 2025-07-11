// src/test/puppeteer-test.ts
import { parseSubmissions, SubmissionRecord } from "../utils/puppeteer";

(async () => {
  const handle = "tjwndnjs7"; // 테스트할 BOJ 아이디
  console.log(`Testing parseSubmissions for ${handle}...`);
  const records: SubmissionRecord[] = await parseSubmissions(handle);
  console.log(`Found ${records.length} submissions:`);
  console.table(records); // 상위 10개만 표시
})();
