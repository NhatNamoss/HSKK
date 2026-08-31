"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const originalPrice = parseFloat(formData.get("originalPrice") as string) || null;
    const level = formData.get("level") as string;
    const thumbnail = formData.get("thumbnail") as string;

    if (!title || !slug) {
      return { error: "Vui lòng nhập tên và slug khóa học" };
    }

    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    });

    if (existingCourse) {
      return { error: "Slug này đã tồn tại" };
    }

    await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price,
        originalPrice,
        level,
        thumbnail,
        status: "published" // Auto publish for now
      }
    });

    revalidatePath("/admin/courses");
    revalidatePath("/khoa-hoc");
    return { success: true };
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Đã xảy ra lỗi khi tạo khóa học" };
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({
      where: { id }
    });

    revalidatePath("/admin/courses");
    revalidatePath("/khoa-hoc");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { error: "Đã xảy ra lỗi khi xóa khóa học" };
  }
}

export async function createSection(formData: FormData) {
  try {
    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;

    if (!title || !courseId) {
      return { error: "Vui lòng nhập tên chương" };
    }

    // Lấy orderIndex cao nhất
    const lastSection = await prisma.courseSection.findFirst({
      where: { courseId },
      orderBy: { orderIndex: "desc" }
    });
    
    const nextOrder = lastSection ? lastSection.orderIndex + 1 : 0;

    await prisma.courseSection.create({
      data: {
        courseId,
        title,
        orderIndex: nextOrder
      }
    });

    revalidatePath(`/admin/courses/${courseId}/lessons`);
    return { success: true };
  } catch (error) {
    console.error("Error creating section:", error);
    return { error: "Đã xảy ra lỗi khi tạo chương" };
  }
}

export async function createLesson(formData: FormData) {
  try {
    const sectionId = formData.get("sectionId") as string;
    const title = formData.get("title") as string;
    const lessonType = formData.get("lessonType") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const content = formData.get("content") as string;
    const courseId = formData.get("courseId") as string;
    
    // Bỏ quizId truyền vào từ form vì chúng ta sẽ tự tạo
    // const quizId = formData.get("quizId") as string;

    if (!title || !sectionId) {
      return { error: "Vui lòng nhập tên bài học" };
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { orderIndex: "desc" }
    });
    
    const nextOrder = lastLesson ? lastLesson.orderIndex + 1 : 0;

    let finalQuizId = null;

    // Nếu là dạng QUIZ, tự động tạo 1 Quiz ẩn gắn kèm với Lesson này
    if (lessonType === "QUIZ") {
      const newQuiz = await prisma.quiz.create({
        data: {
          title: `[Bài tập] ${title}`,
          quizType: "EXERCISE",
          status: "published"
        }
      });
      finalQuizId = newQuiz.id;
    }

    await prisma.lesson.create({
      data: {
        sectionId,
        title,
        lessonType,
        videoUrl,
        content,
        quizId: finalQuizId,
        orderIndex: nextOrder
      }
    });

    revalidatePath(`/admin/courses/${courseId}/lessons`);
    return { success: true };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return { error: "Đã xảy ra lỗi khi tạo bài học" };
  }
}

export async function updateLessonContent(lessonId: string, content: string) {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return { error: "Không tìm thấy bài học" };
    
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { content }
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating lesson content:", error);
    return { error: "Đã xảy ra lỗi khi lưu bài học" };
  }
}

export async function updateLesson(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const courseId = formData.get("courseId") as string;

    if (!id || !title) {
      return { error: "Thiếu thông tin bài học" };
    }

    await prisma.lesson.update({
      where: { id },
      data: {
        title,
        videoUrl: videoUrl || null,
      }
    });

    revalidatePath(`/admin/courses/${courseId}/lessons`);
    return { success: true };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return { error: "Lỗi cập nhật bài học" };
  }
}

export async function deleteLesson(id: string, courseId: string) {
  try {
    await prisma.lesson.delete({ where: { id } });
    revalidatePath(`/admin/courses/${courseId}/lessons`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return { error: "Lỗi xóa bài học" };
  }
}
