import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany(); // User 테이블 조회
  console.log("📦 Users:", users);

  const submissions = await prisma.dailySubmission.findMany(); // DailySubmission 테이블 조회
  console.log("📦 Submissions:", submissions);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
