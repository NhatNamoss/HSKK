import prisma from "@/lib/prisma";
import PracticeClient from "./PracticeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Bài Luyện Tập - Admin",
};

export default async function PracticesPage() {
  const practices = await prisma.practice.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Bài Luyện Tập (6 Kỹ Năng)</h2>
      </div>

      <PracticeClient initialPractices={practices} categories={categories} />
    </div>
  );
}
