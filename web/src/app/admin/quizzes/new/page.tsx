import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import QuizForm from "../QuizForm";

export const metadata: Metadata = {
  title: "Tạo Bài Kiểm Tra - Admin",
};

export default async function NewQuizPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/quizzes"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-brand-teal shadow-sm border border-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thêm Bài Kiểm Tra Mới</h2>
          <p className="text-sm text-gray-500 mt-1">Điền thông tin cơ bản cho bài kiểm tra.</p>
        </div>
      </div>

      <QuizForm categories={categories} />
    </div>
  );
}
