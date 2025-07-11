// src/utils/puppeteer.ts
import puppeteer from "puppeteer";

export interface SubmissionRecord {
  problemId: number;
  submitTime: string;
}

/**
 * 지정된 지연시간만큼 대기합니다.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 주어진 BOJ handle의 상태 페이지를 크롤링하여
 * 모든 제출 행에서 problemId와 submitTime을 추출합니다.
 */
export async function parseSubmissions(
  handle: string,
  maxRetries: number = 3
): Promise<SubmissionRecord[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    });

    try {
      const page = await browser.newPage();

      // 더 긴 타임아웃 설정 (60초)
      page.setDefaultTimeout(60000);
      page.setDefaultNavigationTimeout(60000);

      // 적당한 크기로 리소스 절약
      await page.setViewport({ width: 300, height: 300 });

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({
        "Accept-Language": "ko-KR,ko;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      });

      const url = `https://www.acmicpc.net/status?user_id=${handle}&result_id=4`;

      try {
        console.log(
          `Attempting to load page for ${handle} (attempt ${attempt})...`
        );

        // 네트워크 조건을 완화하고 타임아웃을 60초로 증가
        await page.goto(url, {
          waitUntil: "domcontentloaded", // networkidle2에서 domcontentloaded로 완화
          timeout: 60000,
        });

        // 페이지 로딩 완료 대기
        await page.waitForSelector("#status-table tbody tr", {
          timeout: 60000,
        });

        // 추가 대기시간으로 안정성 확보
        await delay(1000);

        // 모든 <tr>을 순회하며 problemId, submitTime 추출
        const records = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("#status-table tbody tr"))
            .map((row) => {
              const link =
                row.querySelector<HTMLAnchorElement>("a.problem_title");
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

        console.log(
          `Successfully parsed ${records.length} submissions for ${handle} (attempt ${attempt})`
        );
        return records;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Attempt ${attempt}/${maxRetries} failed for ${handle}:`,
          error instanceof Error ? error.message : error
        );

        if (attempt === maxRetries) {
          throw error;
        }

        // 재시도 전 대기 (지수 백오프)
        const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) {
        console.error(
          `All ${maxRetries} attempts failed for ${handle}. Final error:`,
          error
        );
      }
    } finally {
      await browser.close();
    }
  }

  // 모든 재시도가 실패한 경우
  console.error(
    `Puppeteer parsing completely failed for ${handle} after ${maxRetries} attempts:`,
    lastError
  );
  return [];
}
