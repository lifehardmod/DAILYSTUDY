import axios from "axios";
import * as cheerio from "cheerio";

export interface SubmissionRecord {
  problemId: number;
  submitTime: string;
}

/**
 * 주어진 BOJ handle의 상태 페이지를 axios+cheerio로 크롤링하여
 * problemId와 submitTime을 추출합니다.
 */
export async function parseSubmissions(
  handle: string
): Promise<SubmissionRecord[]> {
  console.log(`[${handle}] 크롤링 시작...`);

  const url = `https://www.acmicpc.net/status?user_id=${handle}&result_id=4`;
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
  });

  const $ = cheerio.load(html);
  const rows = $("#status-table tbody tr");
  console.log(`📊 rows 개수: ${rows.length}`);

  const records: SubmissionRecord[] = [];
  rows.each((_, el) => {
    const $row = $(el);
    // 문제 번호
    const link = $row.find("a.problem_title");
    let problemId = NaN;
    const dataId = link.attr("data-original-id");
    if (dataId && /^\d+$/.test(dataId)) {
      problemId = Number(dataId);
    } else {
      const href = link.attr("href") || "";
      const m = href.match(/\/problem\/(\d+)/);
      if (m) problemId = Number(m[1]);
    }

    const ts = $row.find("td").eq(8).find("a").attr("data-timestamp");
    let submitTime = "";
    if (ts && /^\d+$/.test(ts)) {
      const date = new Date(parseInt(ts, 10) * 1000);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      submitTime = `${year}년 ${month}월 ${day}일 ${hour
        .toString()
        .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second
        .toString()
        .padStart(2, "0")}`;
    }

    if (!isNaN(problemId) && submitTime) {
      records.push({ problemId, submitTime });
      console.log(`✅ ${problemId} / ${submitTime}`);
    }
  });

  console.log(`[${handle}] 크롤링 완료: ${records.length}개`);
  return records;
}
