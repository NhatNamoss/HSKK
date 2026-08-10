"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function markLessonComplete(lessonId: string, courseSlug: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Chưa đăng nhập" };
    }

    const userId = session.user.id;

    // Upsert progress record
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date()
      }
    });

    // Cập nhật % tiến độ của Enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: { include: { sections: { include: { lessons: true } } } } } } }
    });

    if (lesson) {
      const course = lesson.section.course;
      const allLessons = course.sections.flatMap(s => s.lessons);
      const totalLessons = allLessons.length;

      if (totalLessons > 0) {
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId,
            completed: true,
            lessonId: { in: allLessons.map(l => l.id) }
          }
        });

        const progressPercent = (completedLessons / totalLessons) * 100;

        await prisma.enrollment.updateMany({
          where: { userId, courseId: course.id },
          data: { progress: progressPercent }
        });
      }
    }

    revalidatePath(`/hoc/${courseSlug}`);
    revalidatePath("/ca-nhan");
    return { success: true };
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    return { error: "Đã có lỗi xảy ra" };
  }
}

export async function getLessonProgress(userId: string, lessonIds: string[]) {
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
        completed: true
      },
      select: { lessonId: true }
    });
    return progress.map(p => p.lessonId);
  } catch (error) {
    return [];
  }
}
