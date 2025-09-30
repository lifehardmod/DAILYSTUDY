import express from "express";
import prisma from "../lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { APIResponse, ExcuseResponse } from "../type/types";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, date, excuse } = req.body;

  // 유효성 검사
  if (!userId || !date || !excuse) {
    const response: APIResponse<null> = {
      success: false,
      message: "userId, date, excuse는 필수입니다",
      data: null,
    };
    return res.status(400).json(response);
  }

  // 날짜 형식 검증
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const response: APIResponse<null> = {
      success: false,
      message: "날짜 형식이 잘못되었습니다",
      data: null,
    };
    return res.status(400).json(response);
  }

  try {
    // 유저가 해당 날짜에 이미 PASS/IMAGE 등록했는지 확인
    const existing = await prisma.dailySubmission.findFirst({
      where: {
        userId,
        date: new Date(date),
      },
    });

    if (existing) {
      const response: APIResponse<null> = {
        success: false,
        message: "이미 해당 날짜에 제출 기록이 있습니다",
        data: null,
      };
      return res.status(409).json(response);
    }

    // 새 레코드 삽입
    const record = await prisma.dailySubmission.create({
      data: {
        userId,
        date: new Date(date),
        status: "IMAGE",
        excuse,
        submitTime: dayjs().format("YYYY년 M월 D일 HH:mm:ss"),
      },
    });

    const response: APIResponse<ExcuseResponse> = {
      success: true,
      message: "사유가 등록되었습니다",
      data: {
        userId: record.userId,
        date: record.date.toISOString().split("T")[0], // Date를 YYYY-MM-DD 형식 문자열로 변환
        status: record.status,
        excuse: record.excuse || "",
        submitTime: record.submitTime || "",
      },
    };

    return res.json(response);
  } catch (e) {
    console.error(e);
    const response: APIResponse<null> = {
      success: false,
      message: "서버 오류",
      data: null,
    };
    return res.status(500).json(response);
  }
});

export default router;
