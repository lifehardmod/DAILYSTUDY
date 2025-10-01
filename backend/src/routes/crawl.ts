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
import { APIResponse } from "../type/types";
dayjs.extend(utc);
dayjs.extend(timezone);
const router = express.Router();

router.get("/", async (_req, res) => {
  const results: {
    handle: string;
    problemId: number;
    action: "SKIPPED" | "RECORDED";
  }[] = [];

  // 크롤링 시작 시간 기록 (한국 시간)
  const startTime = new Date(
    dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss.SSS") + "+09:00"
  );
  let crawlHistoryId: string | null = null;

  try {
    // 크롤링 히스토리 시작 기록
    const crawlHistory = await prisma.crawlHistory.create({
      data: {
        startTime,
        endTime: startTime, // 임시로 같은 시간으로 설정
        success: false, // 일단 false로 설정
      },
    });
    crawlHistoryId = crawlHistory.id;
    for (const { handle } of USER_LIST) {
      // 유저별로 오늘자 RECORD(=PASS/IMAGE) 이미 DB에 있는 key
      const submissions = await parseSubmissions(handle);
      // 제출 시간 오름차순 정렬
      submissions.sort((a, b) => {
        const aTime = parseKoreanTimestamp(a.submitTime).getTime();
        const bTime = parseKoreanTimestamp(b.submitTime).getTime();
        return aTime - bTime;
      });

      // 날짜별로 제출 그룹화
      const submissionsByDate = new Map<string, typeof submissions>();
      for (const submission of submissions) {
        const fullDate = parseKoreanTimestamp(submission.submitTime);
        const kstDate = dayjs(fullDate).tz("Asia/Seoul").startOf("day");
        const dateKey = kstDate.format("YYYY-MM-DD");

        if (!submissionsByDate.has(dateKey)) {
          submissionsByDate.set(dateKey, []);
        }
        submissionsByDate.get(dateKey)!.push(submission);
      }

      // 날짜별로 처리
      for (const [dateKey, daySubmissions] of submissionsByDate) {
        const kstDate = dayjs(dateKey).tz("Asia/Seoul");
        // 9시간 추가 제거 - 이미 KST 기준이므로
        const dateObj = kstDate.toDate();
        const dayOfWeek = kstDate.day(); // 0=일요일, 6=토요일
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // 이미 DB에 기록된 문제들 확인
        const existingRecords = await prisma.dailySubmission.findMany({
          where: {
            userId: handle,
            date: dateObj,
          },
        });

        const existingPassOrImage = new Set(
          existingRecords
            .filter(
              (r) =>
                ["PASS", "IMAGE"].includes(r.status) && r.problemId !== null
            )
            .map((r) => r.problemId!)
        );

        // 새로 처리할 제출들 (이미 PASS/IMAGE로 기록된 것 제외)
        const newSubmissions = daySubmissions.filter(
          (s) => !existingPassOrImage.has(s.problemId)
        );

        if (newSubmissions.length === 0) {
          // 모든 제출이 이미 처리됨
          for (const submission of daySubmissions) {
            results.push({
              handle,
              problemId: submission.problemId,
              action: "SKIPPED",
            });
          }
          continue;
        }

        // 주말 특별 처리: 골드 1개 또는 실버 이상 2개 확인
        if (isWeekend) {
          // 메타 정보 먼저 가져오기
          const submissionsWithMeta = await Promise.all(
            newSubmissions.map(async (submission) => {
              const { titleKo, level } = await fetchProblemMeta(
                submission.problemId
              );
              return { ...submission, titleKo, level };
            })
          );

          // 골드 이상 (level >= 11) 문제 개수 확인
          const goldOrAbove = submissionsWithMeta.filter((s) => s.level >= 11);
          // 실버 이상 (level >= 6) 문제 개수 확인
          const silverOrAbove = submissionsWithMeta.filter((s) => s.level >= 6);

          // 골드 이상 1개가 있거나, 실버 이상 2개가 있으면 모든 문제를 PASS로 처리
          if (goldOrAbove.length >= 1 || silverOrAbove.length >= 2) {
            for (const submission of submissionsWithMeta) {
              const tier = levelToTier(submission.level);

              await prisma.dailySubmission.create({
                data: {
                  userId: handle,
                  date: dateObj,
                  status: "PASS",
                  submitTime: submission.submitTime,
                  problemId: submission.problemId,
                  titleKo: submission.titleKo,
                  level: submission.level,
                  tier,
                },
              });

              results.push({
                handle,
                problemId: submission.problemId,
                action: "RECORDED",
              });
            }
            continue;
          }
        }

        // 기존 로직: 개별 제출 처리
        for (const { problemId, submitTime } of newSubmissions) {
          const { titleKo, level } = await fetchProblemMeta(problemId);

          // 요일·레벨 검사
          if (!isRecordable(submitTime, level)) {
            results.push({ handle, problemId, action: "SKIPPED" });
            continue;
          }

          // Tier 계산
          const tier = levelToTier(level);

          // DB에 CREATE (PASS)
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

          results.push({ handle, problemId, action: "RECORDED" });
        }
      }
    }

    // 크롤링 성공 시 히스토리 업데이트
    if (crawlHistoryId) {
      await prisma.crawlHistory.update({
        where: { id: crawlHistoryId },
        data: {
          endTime: new Date(),
          success: true,
          recordsProcessed: results.filter((r) => r.action === "RECORDED")
            .length,
        },
      });
    }

    return res.json({ results });
  } catch (e) {
    console.error(e);

    // 크롤링 실패 시 히스토리 업데이트
    if (crawlHistoryId) {
      try {
        await prisma.crawlHistory.update({
          where: { id: crawlHistoryId },
          data: {
            endTime: new Date(),
            success: false,
          },
        });
      } catch (historyError) {
        console.error("히스토리 업데이트 실패:", historyError);
      }
    }

    return res.status(500).json({ error: (e as Error).message });
  }
});

// 마지막 크롤링 시간 조회 API 추가
router.get("/last-crawl", async (_req, res) => {
  try {
    const lastCrawl = await prisma.crawlHistory.findFirst({
      where: { success: true },
      orderBy: { endTime: "desc" },
    });

    if (!lastCrawl) {
      const response: APIResponse<{
        lastCrawlTime: null;
        recordsProcessed: null;
      }> = {
        success: true,
        message: "크롤링 정보가 없습니다.",
        data: { lastCrawlTime: null, recordsProcessed: null },
      };

      return res.json(response);
    }

    const response: APIResponse<{
      lastCrawlTime: Date;
      recordsProcessed: number;
    }> = {
      success: true,
      message: "마지막 크롤링 시간 조회 성공",
      data: {
        lastCrawlTime: lastCrawl?.endTime,
        recordsProcessed: lastCrawl?.recordsProcessed || 0,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("마지막 크롤링 시간 조회 실패:", error);
    return res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
