import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import QuizListClient from "./QuizListClient";

export const metadata: Metadata = {
  title: "Quản lý Bài Kiểm Tra - Admin",
};

export default async function QuizzesAdminPage() {
  const [quizzes, categories] = await Promise.all([
    prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, attempts: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Bài Kiểm Tra</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý bài luyện tập, bộ đề thi trực tuyến.</p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="bg-brand-teal text-white px-5 py-2.5 rounded-xl font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tạo bài kiểm tra mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng bài kiểm tra", value: quizzes.length, color: "text-brand-teal" },
          { label: "Đã xuất bản", value: quizzes.filter((q: any) => q.status === "published").length, color: "text-green-600" },
          { label: "Bản nháp", value: quizzes.filter((q: any) => q.status === "draft").length, color: "text-gray-500" },
          { label: "Lượt làm bài", value: quizzes.reduce((s: number, q: any) => s + q._count.attempts, 0), color: "text-brand-coral" },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <QuizListClient quizzes={quizzes} />
    </div>
  );
}
