// src/routes/crawl.ts
import express from "express";
import prisma from "../lib/prisma";
import { USER_LIST } from "../constants/users";
import { parseSubmissions } from "../utils/puppeteer";
import { fetchProblemMeta } from "../utils/solvedac";
import {
  isRecordable,
  levelToTier,
  parseKoreanTimestamp,
} from "../utils/recordRules";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
const router = express.Router();

router.get("/crawl", async (_req, res) => {
  const results: {
    handle: string;
    problemId: number;
    action: "SKIPPED" | "RECORDED";
  }[] = [];

  try {
    for (const { handle } of USER_LIST) {
      // 유저별로 오늘자 RECORD(=PASS/IMAGE) 이미 DB에 있는 key
      const submissions = await parseSubmissions(handle);
      // 제출 시간 오름차순 정렬
      submissions.sort((a, b) => {
        const aTime = parseKoreanTimestamp(a.submitTime).getTime();
        const bTime = parseKoreanTimestamp(b.submitTime).getTime();
        return aTime - bTime;
      });
      // 로컬 Set: 이번 실행 중에 이미 RECORDED 한 문제를 SKIP
      const recordedSet = new Set<string>();

      for (const { problemId, submitTime } of submissions) {
        // 1) submitTime → Date 객체(연·월·일만)
        const fullDate = parseKoreanTimestamp(submitTime);
        const kstDate = dayjs(fullDate).tz("Asia/Seoul").startOf("day");
        // UTC offset을 보정하여 저장
        const dateObj = kstDate.add(9, "hour").toDate();

        const key = `${handle}|${dateObj
          .toISOString()
          .slice(0, 10)}|${problemId}`;

        // 2) DB에 PASS/IMAGE 로 이미 기록된 건 스킵
        const exists = await prisma.dailySubmission.findFirst({
          where: {
            userId: handle,
            problemId: problemId,
            date: dateObj,
          },
        });

        // PASS 또는 IMAGE면 skip
        if (exists && ["PASS", "IMAGE"].includes(exists.status)) {
          results.push({ handle, problemId, action: "SKIPPED" });
          continue;
        }

        // 3) Solved.ac 메타 조회
        const { titleKo, level } = await fetchProblemMeta(problemId);

        // 4) 요일·레벨 검사
        if (!isRecordable(submitTime, level)) {
          results.push({ handle, problemId, action: "SKIPPED" });
          continue;
        }

        // 5) Tier 계산
        const tier = levelToTier(level);

        // 6) DB에 CREATE (PASS)
        await prisma.dailySubmission.create({
          data: {
            userId: handle,
            date: dateObj,
            status: "PASS",
            submitTime,
            problemId,
            titleKo,
            level,
            tier,
          },
        });

        // 중복 방지
        recordedSet.add(key);
        results.push({ handle, problemId, action: "RECORDED" });
      }
    }

    return res.json({ results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
