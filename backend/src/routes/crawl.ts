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

  // 크롤링 시작 시간 (한국 시간)
  const startTime = new Date(
    dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss.SSS") + "+09:00"
  );
  let crawlHistoryId: string | null = null;

  try {
    // 크롤링 히스토리 시작 기록
    const crawlHistory = await prisma.crawlHistory.create({
      data: {
        startTime,
        endTime: startTime, // 임시
        success: false,
      },
    });
    crawlHistoryId = crawlHistory.id;

    const today = dayjs().tz("Asia/Seoul").startOf("day").toDate();
    const todayDayOfWeek = dayjs(today).day();
    const isWeekendToday = todayDayOfWeek === 0 || todayDayOfWeek === 6;
    const todayStr = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD");

    for (const { handle, etc } of USER_LIST) {
      // 오늘 기록이 있는지 확인
      const existingToday = await prisma.dailySubmission.findMany({
        where: { userId: handle, date: todayStr },
      });
      if (
        existingToday.length === 0 &&
        etc === "exceptional" &&
        !isWeekendToday
      ) {
        // 오늘 제출 기록 없고, exceptional 평일 → excuse IMAGE 생성
        const excuseRecord = await prisma.dailySubmission.create({
          data: {
            userId: handle,
            date: today,
            status: "IMAGE",
            excuse: "기타 사유",
            submitTime: dayjs().format("YYYY년 M월 D일 HH:mm:ss"),
          },
        });

        results.push({
          handle,
          problemId: -1,
          action: "RECORDED",
        });

        console.log(`[EXCEPTIONAL] ${handle}: excuse IMAGE 생성`, excuseRecord);
        continue; // 오늘 처리 끝, submissions 안 봄
      }

      // === submissions 크롤링 & 기존 로직 ===
      const submissions = await parseSubmissions(handle);
      submissions.sort((a, b) => {
        const aTime = parseKoreanTimestamp(a.submitTime).getTime();
        const bTime = parseKoreanTimestamp(b.submitTime).getTime();
        return aTime - bTime;
      });

      // 날짜별 그룹화
      const submissionsByDate = new Map<string, typeof submissions>();
      for (const submission of submissions) {
        const fullDate = parseKoreanTimestamp(submission.submitTime);
        const kstDate = dayjs(fullDate).tz("Asia/Seoul").startOf("day");
        const dateKey = kstDate.format("YYYY-MM-DD");
        if (!submissionsByDate.has(dateKey)) submissionsByDate.set(dateKey, []);
        submissionsByDate.get(dateKey)!.push(submission);
      }

      // 날짜별 처리
      for (const [dateKey, daySubmissions] of submissionsByDate) {
        const kstDate = dayjs(dateKey).tz("Asia/Seoul");
        const dateObj = kstDate.toDate();
        const dayOfWeek = kstDate.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const existingRecords = await prisma.dailySubmission.findMany({
          where: { userId: handle, date: dateObj },
        });

        const existingPassOrImage = new Set(
          existingRecords
            .filter(
              (r) =>
                ["PASS", "IMAGE"].includes(r.status) && r.problemId !== null
            )
            .map((r) => r.problemId!)
        );

        const newSubmissions = daySubmissions.filter(
          (s) => !existingPassOrImage.has(s.problemId)
        );

        if (newSubmissions.length === 0) {
          for (const submission of daySubmissions) {
            results.push({
              handle,
              problemId: submission.problemId,
              action: "SKIPPED",
            });
          }
          continue;
        }

        // 주말 특별 처리
        if (isWeekend) {
          const submissionsWithMeta = await Promise.all(
            newSubmissions.map(async (submission) => {
              const { titleKo, level } = await fetchProblemMeta(
                submission.problemId
              );
              return { ...submission, titleKo, level };
            })
          );

          const goldOrAbove = submissionsWithMeta.filter((s) => s.level >= 11);
          const silverOrAbove = submissionsWithMeta.filter((s) => s.level >= 6);

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

        // 개별 제출 처리
        for (const { problemId, submitTime } of newSubmissions) {
          const { titleKo, level } = await fetchProblemMeta(problemId);

          if (!isRecordable(submitTime, level)) {
            results.push({ handle, problemId, action: "SKIPPED" });
            continue;
          }

          const tier = levelToTier(level);
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
    if (crawlHistoryId) {
      try {
        await prisma.crawlHistory.update({
          where: { id: crawlHistoryId },
          data: { endTime: new Date(), success: false },
        });
      } catch (historyError) {
        console.error("히스토리 업데이트 실패:", historyError);
      }
    }
    return res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
