import express from "express";
import prisma from "../lib/prisma";
import { USER_LIST } from "../constants/users";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const router = express.Router();

router.get("/", async (req, res) => {
  const dateStr = req.query.date as string;
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: "Invalid or missing date" });
  }

  console.log("Querying for date:", dateStr);

  try {
    const submissions = await prisma.dailySubmission.findMany({
      where: {
        date: {
          equals: new Date(dateStr),
        },
      },
      orderBy: { userId: "asc" },
    });

    const users = USER_LIST.map(({ handle }) => {
      const userSubmissions = submissions.filter((s) => s.userId === handle);
      if (userSubmissions.length === 0)
        return { userId: handle, status: "NONE" };

      const problems = userSubmissions.map((submission) => {
        const { problemId, titleKo, level, tier, submitTime, excuse } =
          submission;
        return {
          problemId,
          titleKo,
          level,
          tier,
          submitTime,
          excuse,
        };
      });

      return {
        userId: handle,
        status: "PASS",
        problems,
      };
    });

    res.json({ date: dateStr, users });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
