"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDocument(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const filePath = formData.get("filePath") as string;
    const fileType = formData.get("fileType") as string;

    if (!title || !categoryId || !filePath || !fileType) {
      return { error: "Vui lòng nhập đầy đủ thông tin bắt buộc" };
    }

    await prisma.document.create({
      data: {
        title,
        categoryId,
        description,
        filePath,
        fileType
      }
    });

    revalidatePath("/admin/documents");
    revalidatePath("/thu-vien");
    return { success: true };
  } catch (error) {
    console.error("Error creating document:", error);
    return { error: "Đã xảy ra lỗi khi thêm tài liệu" };
  }
}

export async function deleteDocument(id: string) {
  try {
    await prisma.document.delete({
      where: { id }
    });

    revalidatePath("/admin/documents");
    revalidatePath("/thu-vien");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { error: "Đã xảy ra lỗi khi xóa tài liệu" };
  }
}
