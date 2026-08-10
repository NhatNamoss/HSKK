"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    if (!name || !slug) {
      return { error: "Vui lòng nhập tên và slug" };
    }

    const existingCat = await prisma.category.findUnique({ where: { slug } });
    if (existingCat) {
      return { error: "Slug này đã tồn tại" };
    }

    await prisma.category.create({ data: { name, slug } });

    revalidatePath("/admin/categories");
    revalidatePath("/thu-vien");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Đã xảy ra lỗi khi tạo danh mục" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    if (!name || !slug) {
      return { error: "Vui lòng nhập tên và slug" };
    }

    // Kiểm tra slug trùng (trừ chính nó)
    const existingCat = await prisma.category.findFirst({
      where: { slug, NOT: { id } }
    });
    if (existingCat) {
      return { error: "Slug này đã tồn tại" };
    }

    await prisma.category.update({
      where: { id },
      data: { name, slug }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/thu-vien");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Đã xảy ra lỗi khi cập nhật danh mục" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } }
    });

    if (!cat) return { error: "Không tìm thấy danh mục" };

    if (cat._count.documents > 0) {
      return { error: `Không thể xóa danh mục đang có ${cat._count.documents} tài liệu. Vui lòng chuyển hoặc xóa tài liệu trước.` };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/thu-vien");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Đã xảy ra lỗi khi xóa danh mục" };
  }
}
