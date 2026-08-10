"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// ----------------------------------------------------------------
// QUIZ ACTIONS
// ----------------------------------------------------------------

export async function createQuiz(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const level = formData.get("level") as string;
    const quizType = formData.get("quizType") as string;
    const timeLimit = formData.get("timeLimit") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!title) return { error: "Vui lòng nhập tiêu đề" };

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        level: level || null,
        quizType: quizType || "EXERCISE",
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        categoryId: categoryId || null,
      },
    });

    revalidatePath("/admin/quizzes");
    return { success: true, id: quiz.id };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi tạo bài kiểm tra" };
  }
}

export async function updateQuiz(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const level = formData.get("level") as string;
    const quizType = formData.get("quizType") as string;
    const timeLimit = formData.get("timeLimit") as string;
    const categoryId = formData.get("categoryId") as string;

    await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description: description || null,
        level: level || null,
        quizType: quizType || "EXERCISE",
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        categoryId: categoryId || null,
      },
    });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${id}/questions`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi cập nhật" };
  }
}

export async function publishQuiz(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!quiz) return { error: "Không tìm thấy bài kiểm tra" };
    if (quiz._count.questions === 0)
      return { error: "Bài kiểm tra phải có ít nhất 1 câu hỏi" };

    const newStatus = quiz.status === "published" ? "draft" : "published";
    await prisma.quiz.update({ where: { id }, data: { status: newStatus } });

    revalidatePath("/admin/quizzes");
    revalidatePath("/luyen-tap");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi" };
  }
}

export async function deleteQuiz(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    await prisma.quiz.delete({ where: { id } });
    revalidatePath("/admin/quizzes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi xóa" };
  }
}

// ----------------------------------------------------------------
// QUESTION ACTIONS
// ----------------------------------------------------------------

export async function createQuestion(data: {
  quizId: string;
  questionType: string;
  question: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  orderIndex?: number;
  points?: number;
  choices: { content: string; isCorrect: boolean; matchGroup?: string; orderIndex?: number }[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    const question = await prisma.question.create({
      data: {
        quizId: data.quizId,
        questionType: data.questionType,
        question: data.question,
        explanation: data.explanation || null,
        audioUrl: data.audioUrl || null,
        imageUrl: data.imageUrl || null,
        orderIndex: data.orderIndex || 0,
        points: data.points || 1,
        choices: {
          create: data.choices.map((c, i) => ({
            content: c.content,
            isCorrect: c.isCorrect,
            matchGroup: c.matchGroup || null,
            orderIndex: c.orderIndex ?? i,
          })),
        },
      },
    });

    revalidatePath(`/admin/quizzes/${data.quizId}/questions`);
    return { success: true, id: question.id };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi tạo câu hỏi" };
  }
}

export async function updateQuestion(id: string, data: {
  questionType: string;
  question: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  points?: number;
  choices: { content: string; isCorrect: boolean; matchGroup?: string; orderIndex?: number }[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    const q = await prisma.question.findUnique({ where: { id } });
    if (!q) return { error: "Không tìm thấy câu hỏi" };

    // Xóa choices cũ, tạo lại
    await prisma.questionChoice.deleteMany({ where: { questionId: id } });

    await prisma.question.update({
      where: { id },
      data: {
        questionType: data.questionType,
        question: data.question,
        explanation: data.explanation || null,
        audioUrl: data.audioUrl || null,
        imageUrl: data.imageUrl || null,
        points: data.points || 1,
        choices: {
          create: data.choices.map((c, i) => ({
            content: c.content,
            isCorrect: c.isCorrect,
            matchGroup: c.matchGroup || null,
            orderIndex: c.orderIndex ?? i,
          })),
        },
      },
    });

    revalidatePath(`/admin/quizzes/${q.quizId}/questions`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi cập nhật câu hỏi" };
  }
}

export async function deleteQuestion(id: string, quizId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    await prisma.question.delete({ where: { id } });
    revalidatePath(`/admin/quizzes/${quizId}/questions`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Đã xảy ra lỗi khi xóa câu hỏi" };
  }
}

export async function reorderQuestion(id: string, quizId: string, newIndex: number) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền" };

    await prisma.question.update({
      where: { id },
      data: { orderIndex: newIndex },
    });

    revalidatePath(`/admin/quizzes/${quizId}/questions`);
    return { success: true };
  } catch (error) {
    return { error: "Lỗi sắp xếp" };
  }
}
