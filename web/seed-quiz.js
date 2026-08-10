const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Quiz data...");
  
  // 1. Create a Category for Quiz if needed
  let category = await prisma.category.findFirst({ where: { slug: "hsk-1" } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "HSK 1", slug: "hsk-1" }
    });
  }

  // 2. Create Quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: "Đề thi thử HSK 1 - Đề số 1",
      description: "Đề thi mô phỏng định dạng HSK 1 chuẩn Hanban gồm các phần nghe hiểu, đọc hiểu.",
      level: "HSK 1",
      quizType: "MOCK_EXAM",
      timeLimit: 40,
      status: "published",
      categoryId: category.id,
      questions: {
        create: [
          {
            questionType: "MULTIPLE_CHOICE",
            question: "Từ 'Cảm ơn' trong tiếng Trung là gì?",
            points: 10,
            orderIndex: 0,
            choices: {
              create: [
                { content: "你好 (nǐ hǎo)", isCorrect: false, orderIndex: 0 },
                { content: "谢谢 (xièxie)", isCorrect: true, orderIndex: 1 },
                { content: "再见 (zàijiàn)", isCorrect: false, orderIndex: 2 },
                { content: "对不起 (duìbuqǐ)", isCorrect: false, orderIndex: 3 }
              ]
            }
          },
          {
            questionType: "FILL_IN_BLANK",
            question: "Hôm qua tôi đi mua một ___ táo. (lượng từ)",
            explanation: "Lượng từ cho táo (quả) là 个 (gè) hoặc 斤 (cân).",
            points: 10,
            orderIndex: 1,
            choices: {
              create: [
                { content: "个", isCorrect: true, orderIndex: 0 },
                { content: "斤", isCorrect: true, orderIndex: 1 }
              ]
            }
          },
          {
            questionType: "WORD_ORDER",
            question: "Sắp xếp thành câu hoàn chỉnh:",
            explanation: "我 明天 去 医院。 (Tôi ngày mai đi bệnh viện.)",
            points: 10,
            orderIndex: 2,
            choices: {
              create: [
                { content: "我", isCorrect: true, orderIndex: 0 },
                { content: "明天", isCorrect: true, orderIndex: 1 },
                { content: "去", isCorrect: true, orderIndex: 2 },
                { content: "医院", isCorrect: true, orderIndex: 3 }
              ]
            }
          },
          {
            questionType: "TONE_RECOGNITION",
            question: "Thanh điệu của từ 'Mã' (Ngựa - ma) là thanh mấy?",
            points: 10,
            orderIndex: 3,
            choices: {
              create: [
                { content: "mā", isCorrect: false, orderIndex: 0 },
                { content: "má", isCorrect: false, orderIndex: 1 },
                { content: "mǎ", isCorrect: true, orderIndex: 2 },
                { content: "mà", isCorrect: false, orderIndex: 3 }
              ]
            }
          }
        ]
      }
    }
  });

  console.log("Seeded Quiz successfully: ", quiz.title);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
