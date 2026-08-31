"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPractice(data: any) {
  try {
    const practice = await prisma.practice.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        status: data.status || "draft",
        categoryId: data.categoryId || null,
        content: JSON.stringify({
          flashcards: [],
          sentences: [],
          situations: [],
          dialogues: [],
          games: [],
          writeTranslate: []
        }),
      }
    });
    revalidatePath("/admin/practices");
    return { success: true, practice };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePractice(id: string, data: any) {
  try {
    const practice = await prisma.practice.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        status: data.status,
        categoryId: data.categoryId || null,
      }
    });
    revalidatePath("/admin/practices");
    revalidatePath(`/luyen-tap/${practice.slug}`);
    return { success: true, practice };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePracticeContent(id: string, content: string) {
  try {
    const practice = await prisma.practice.update({
      where: { id },
      data: { content }
    });
    revalidatePath(`/admin/practices/${id}/editor`);
    revalidatePath(`/luyen-tap/${practice.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePractice(id: string) {
  try {
    await prisma.practice.delete({ where: { id } });
    revalidatePath("/admin/practices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
