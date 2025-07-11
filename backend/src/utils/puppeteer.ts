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
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // 메모리 사용량 최적화
      "--disable-gpu", // GPU 사용 비활성화
      "--no-first-run",
      "--disable-default-apps",
      "--disable-sync",
      "--no-default-browser-check",
      "--mute-audio", // 오디오 비활성화
      "--disable-web-security",
      "--disable-features=TranslateUI", // 번역 UI 비활성화
      "--disable-features=VizDisplayCompositor",
      // --single-process 제거 (안정성 문제)
      // 너무 공격적인 최적화 제거
    ],
  });

  try {
    const page = await browser.newPage();

    // 메모리 사용량 최적화를 위한 viewport 설정
    await page.setViewport({ width: 1280, height: 720 });

    // 불필요한 리소스 차단으로 로딩 속도 향상 (이미지와 폰트만 차단)
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      // CSS는 레이아웃에 영향을 줄 수 있으므로 이미지와 폰트만 차단
      if (["image", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "ko-KR,ko;q=0.9" });

    const url = `https://www.acmicpc.net/status?user_id=${handle}&result_id=4`;

    // 페이지 로딩 안정성 개선
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 0, // 무제한 대기
    });

    // 페이지 안정화를 위한 짧은 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 더 안전한 셀렉터 대기 전략
    try {
      await page.waitForSelector("#status-table", { timeout: 0 });
      await page.waitForSelector("#status-table tbody", { timeout: 0 });
      await page.waitForSelector("#status-table tbody tr", { timeout: 0 });
    } catch (selectorError) {
      console.warn(
        `Selector wait failed for ${handle}, trying alternative approach:`,
        selectorError
      );
      // 대안적 접근: 페이지가 로드되었는지 확인
      const hasTable = await page.$("#status-table");
      if (!hasTable) {
        throw new Error("Status table not found on page");
      }
    }

    // 모든 <tr>을 순회하며 problemId, submitTime 추출
    const records = await page.evaluate(() => {
      const table = document.querySelector("#status-table");
      if (!table) return [];

      const rows = Array.from(table.querySelectorAll("tbody tr"));
      if (rows.length === 0) return [];

      return rows
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

          const cells = row.querySelectorAll<HTMLTableCellElement>("td");
          const submitTimeCell = cells[8];
          const submitTime =
            submitTimeCell
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
