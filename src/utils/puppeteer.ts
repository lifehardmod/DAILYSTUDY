// src/utils/puppeteer.ts
import puppeteer from "puppeteer";

export interface SubmissionRecord {
  problemId: number;
  submitTime: string;
}

/**
 * 주어진 BOJ handle의 상태 페이지를 크롤링하여
 * 모든 제출 행에서 problemId와 submitTime을 추출합니다.
 */
export async function parseSubmissions(
  handle: string
): Promise<SubmissionRecord[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "ko-KR,ko;q=0.9" });

    const url = `https://www.acmicpc.net/status?user_id=${handle}&result_id=4`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector("#status-table tbody tr", { timeout: 30000 });

    // 모든 <tr>을 순회하며 problemId, submitTime 추출
    const records = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("#status-table tbody tr"))
        .map((row) => {
          const link = row.querySelector<HTMLAnchorElement>("a.problem_title");
          const rawId = link?.getAttribute("data-original-id") ?? "";
          let problemId = NaN;

          // data-original-id가 유효한 숫자 문자열인지 먼저 검사
          if (rawId && /^\d+$/.test(rawId)) {
            problemId = Number(rawId);
          } else {
            // 페일백: href에서 숫자 파싱
            const href = link?.getAttribute("href") ?? "";
            const m = href.match(/\/problem\/(\d+)/);
            if (m) problemId = Number(m[1]);
          }

          const cell = row.querySelectorAll<HTMLTableCellElement>("td")[8];
          const submitTime =
            cell
              ?.querySelector<HTMLAnchorElement>("a")
              ?.getAttribute("data-original-title") || "";

          return { problemId, submitTime };
        })
        .filter((r) => !isNaN(r.problemId));
    });
    return records;
  } catch (error) {
    console.error(`Puppeteer parsing error for ${handle}:`, error);
    return [];
  } finally {
    await browser.close();
  }
}
