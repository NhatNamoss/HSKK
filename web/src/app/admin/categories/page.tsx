import prisma from "@/lib/prisma";
import CategoryClient from "./CategoryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Danh mục - Admin",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { documents: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
      </div>

      <CategoryClient initialCategories={categories} />
    </div>
  );
}
