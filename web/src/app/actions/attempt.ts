"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Bắt đầu một lần làm bài
export async function startAttempt(quizId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Vui lòng đăng nhập để làm bài" };

    const userId = session.user.id;

    // Kiểm tra quiz tồn tại và đã published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { choices: { orderBy: { orderIndex: "asc" } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) return { error: "Không tìm thấy bài kiểm tra" };
    if (quiz.status !== "published") return { error: "Bài kiểm tra chưa được mở" };
    if (quiz.questions.length === 0) return { error: "Bài kiểm tra chưa có câu hỏi" };

    // Tạo attempt mới
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      },
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi" };
  }
}

// Nộp bài và chấm điểm
export async function submitAttempt(
  attemptId: string,
  answers: Record<string, string> // questionId -> answer
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Không xác thực được" };

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: { choices: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!attempt) return { error: "Không tìm thấy lần làm bài" };
    if (attempt.userId !== session.user.id) return { error: "Không có quyền" };
    if (attempt.status === "COMPLETED") return { error: "Bài đã được nộp" };

    let earnedPoints = 0;
    const userAnswers = [];

    for (const question of attempt.quiz.questions) {
      const userAnswer = answers[question.id] || "";
      let isCorrect = false;

      switch (question.questionType) {
        case "MULTIPLE_CHOICE":
        case "TONE_RECOGNITION": {
          // answer = choiceId
          const correctChoice = question.choices.find((c) => c.isCorrect);
          isCorrect = correctChoice?.id === userAnswer;
          break;
        }
        case "FILL_IN_BLANK": {
          try {
            const userAnswers = JSON.parse(userAnswer) as string[];
            const correctChoices = question.choices
              .filter(c => c.isCorrect)
              .sort((a,b) => a.orderIndex - b.orderIndex);
            
            if (userAnswers.length !== correctChoices.length) {
              isCorrect = false;
              break;
            }

            isCorrect = true;
            for (let i = 0; i < correctChoices.length; i++) {
               const acceptable = correctChoices[i].content.toLowerCase().split(',').map(s => s.trim());
               if (!acceptable.includes(userAnswers[i].toLowerCase().trim())) {
                  isCorrect = false;
                  break;
               }
            }
          } catch {
            isCorrect = false;
          }
          break;
        }
        case "MATCHING": {
          // answer = JSON string of pairs: [{ left: choiceId, right: choiceId }]
          try {
            const pairs = JSON.parse(userAnswer) as { left: string; right: string }[];
            const leftChoices = question.choices.filter((c) => c.matchGroup === "left");
            let allCorrect = true;
            for (const lc of leftChoices) {
              const correctRight = question.choices.find(
                (c) => c.matchGroup === "right" && c.orderIndex === lc.orderIndex
              );
              const userPair = pairs.find((p) => p.left === lc.id);
              if (!userPair || !correctRight || userPair.right !== correctRight.id) {
                allCorrect = false;
                break;
              }
            }
            isCorrect = allCorrect && leftChoices.length > 0;
          } catch {
            isCorrect = false;
          }
          break;
        }
        case "WORD_ORDER": {
          // answer = JSON array of choiceIds in order
          try {
            const userOrder = JSON.parse(userAnswer) as string[];
            const correctChoices = question.choices
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .filter((c) => c.isCorrect);
            isCorrect =
              userOrder.length === correctChoices.length &&
              userOrder.every((id, idx) => id === correctChoices[idx].id);
          } catch {
            isCorrect = false;
          }
          break;
        }
      }

      if (isCorrect) earnedPoints += question.points;

      userAnswers.push({
        attemptId,
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
      });
    }

    const totalPoints = attempt.totalPoints || 1;
    const score = Math.round((earnedPoints / totalPoints) * 100);

    // Xóa câu trả lời cũ nếu có, ghi lại mới
    await prisma.userAnswer.deleteMany({ where: { attemptId } });
    await prisma.userAnswer.createMany({ data: userAnswers });

    // Cập nhật attempt
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        earnedPoints,
        score,
        finishedAt: new Date(),
      },
    });

    // Cập nhật tiến độ bài học nếu đạt điểm (>= 50)
    if (score >= 50) {
      const lessons = await prisma.lesson.findMany({
        where: { quizId: attempt.quizId },
        select: { id: true, section: { select: { course: { select: { slug: true } } } } }
      });
      
      for (const lesson of lessons) {
        await prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: lesson.id
            }
          },
          update: { completed: true, completedAt: new Date() },
          create: {
            userId: session.user.id,
            lessonId: lesson.id,
            completed: true,
            completedAt: new Date()
          }
        });
        
        revalidatePath(`/hoc/${lesson.section.course.slug}`);
      }
    }

    revalidatePath(`/luyen-tap/bai-tap/${attempt.quizId}/ket-qua/${attemptId}`);
    revalidatePath(`/thi-thu/${attempt.quizId}/ket-qua/${attemptId}`);
    revalidatePath("/ca-nhan");
    return { success: true, score, earnedPoints, totalPoints };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi nộp bài" };
  }
}
