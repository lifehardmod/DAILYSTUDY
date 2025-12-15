// src/routes/stats.ts
import express from "express";
import prisma from "../lib/prisma";
import { USER_LIST } from "../constants/users";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  APIResponse,
  WeeklyStatsResponse,
  MissedSubmissionsResponse,
} from "../type/types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const router = express.Router();

router.get("/", async (req, res) => {
  const { start, end } = req.query;

  if (typeof start !== "string" || typeof end !== "string") {
    return res.status(400).json({ error: "start, end 쿼리가 필요합니다" });
  }

  const startDate = dayjs.tz(start, "Asia/Seoul").startOf("day");
  const endDate = dayjs.tz(end, "Asia/Seoul").startOf("day");
  const now = dayjs().tz("Asia/Seoul").startOf("day");
  const yesterday = now.subtract(1, "day");

  console.log("Date Debug:", {
    startDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
    endDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
    now: now.format("YYYY-MM-DD HH:mm:ss"),
    yesterday: yesterday.format("YYYY-MM-DD HH:mm:ss"),
  });

  if (!startDate.isValid() || !endDate.isValid()) {
    return res.status(400).json({ error: "날짜 형식이 잘못되었습니다" });
  }

  // 시작일이 종료일보다 늦으면 에러
  if (startDate.isAfter(endDate)) {
    return res
      .status(400)
      .json({ error: "시작일이 종료일보다 늦을 수 없습니다" });
  }

  // 시작일이 오늘이거나 이후면 에러
  if (!startDate.isBefore(now) && !startDate.isSame(now, "day")) {
    return res
      .status(400)
      .json({ error: "시작일은 오늘 또는 이전이어야 합니다" });
  }

  // 종료일까지 포함 (오늘도 포함)
  const effectiveEndDate = endDate;
  const days = effectiveEndDate.diff(startDate, "day") + 1;

  console.log("Calculation Debug:", {
    effectiveEndDate: effectiveEndDate.format("YYYY-MM-DD HH:mm:ss"),
    days,
  });

  if (days <= 0) {
    return res.status(400).json({ error: "유효한 날짜 범위가 없습니다" });
  }

  const allDates = Array.from({ length: days }).map((_, i) => {
    return new Date(startDate.add(i, "day").format("YYYY-MM-DD"));
  });

  console.log(
    "Generated Dates:",
    allDates.map((d) => dayjs(d).format("YYYY-MM-DD"))
  );

  // excuse가 'payed'인 레코드만 가져오기
  const records = await prisma.dailySubmission.findMany({
    where: {
      date: { in: allDates },
      excuse: "payed",
    },
    orderBy: {
      date: "asc",
    },
  });

  // 사용자별로 중복 없이 excuse가 'payed'인 날짜 카운트
  const payedDatesPerUser: Record<string, Set<string>> = {};
  for (const { userId, date } of records) {
    if (!userId) continue; // userId가 null이면 건너뛰기
    if (!payedDatesPerUser[userId]) {
      payedDatesPerUser[userId] = new Set();
    }
    payedDatesPerUser[userId].add(dayjs(date).format("YYYY-MM-DD"));
  }

  console.log(
    "Payed Dates Per User:",
    Object.fromEntries(
      Object.entries(payedDatesPerUser).map(([userId, dates]) => [
        userId,
        Array.from(dates),
      ])
    )
  );

  const result = USER_LIST.map(({ handle }) => {
    const payedDates = payedDatesPerUser[handle]?.size || 0;
    console.log("User Stats:", {
      userId: handle,
      payedCount: payedDates,
    });

    return {
      userId: handle,
      payedCount: payedDates,
    };
  });

  const response: APIResponse<WeeklyStatsResponse> = {
    success: true,
    message: "납부 현황을 가져왔습니다",
    data: {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: effectiveEndDate.format("YYYY-MM-DD"),
      totalDays: days,
      users: result,
    },
  };

  return res.json(response);
});

// 미제출 기록 조회 API (start~end 기간)
router.get("/missed", async (req, res) => {
  const { start, end } = req.query;

  if (typeof start !== "string" || typeof end !== "string") {
    return res.status(400).json({ error: "start, end 쿼리가 필요합니다" });
  }

  const startDate = dayjs.tz(start, "Asia/Seoul").startOf("day");
  const endDate = dayjs.tz(end, "Asia/Seoul").startOf("day");
  const now = dayjs().tz("Asia/Seoul").startOf("day");
  const yesterday = now.subtract(1, "day");

  if (!startDate.isValid() || !endDate.isValid()) {
    return res.status(400).json({ error: "날짜 형식이 잘못되었습니다" });
  }

  if (startDate.isAfter(endDate)) {
    return res
      .status(400)
      .json({ error: "시작일이 종료일보다 늦을 수 없습니다" });
  }

  // 종료일이 어제보다 미래면 어제로 제한
  const effectiveEndDate = endDate.isAfter(yesterday) ? yesterday : endDate;

  if (startDate.isAfter(effectiveEndDate)) {
    return res.status(400).json({ error: "조회 가능한 날짜 범위가 없습니다" });
  }

  // 시작일부터 종료일까지의 날짜 목록 생성
  const days = effectiveEndDate.diff(startDate, "day") + 1;
  const allDates = Array.from({ length: days }).map((_, i) => {
    return startDate.add(i, "day").format("YYYY-MM-DD");
  });

  // 해당 기간의 모든 제출 기록 가져오기
  const submissions = await prisma.dailySubmission.findMany({
    where: {
      date: {
        gte: new Date(start),
        lte: new Date(effectiveEndDate.format("YYYY-MM-DD")),
      },
    },
    select: {
      userId: true,
      date: true,
    },
  });

  // 유저별 제출한 날짜 Set 생성
  const submittedDates: Record<string, Set<string>> = {};
  for (const { userId, date } of submissions) {
    if (!submittedDates[userId]) {
      submittedDates[userId] = new Set();
    }
    submittedDates[userId].add(dayjs(date).format("YYYY-MM-DD"));
  }

  // 미제출 기록 계산
  const missedSubmissions: { userId: string; date: string }[] = [];

  for (const { handle } of USER_LIST) {
    const userSubmitted = submittedDates[handle] || new Set();
    for (const date of allDates) {
      if (!userSubmitted.has(date)) {
        missedSubmissions.push({ userId: handle, date });
      }
    }
  }

  // 날짜순 정렬
  missedSubmissions.sort((a, b) => a.date.localeCompare(b.date));

  const response: APIResponse<MissedSubmissionsResponse> = {
    success: true,
    message: "미제출 기록을 가져왔습니다",
    data: {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: effectiveEndDate.format("YYYY-MM-DD"),
      missedSubmissions,
    },
  };

  return res.json(response);
});

export default router;
