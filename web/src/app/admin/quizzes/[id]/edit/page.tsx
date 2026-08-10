import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import QuizForm from "../../QuizForm";

export const metadata: Metadata = {
  title: "Sửa Bài Kiểm Tra - Admin",
};

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [quiz, categories] = await Promise.all([
    prisma.quiz.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!quiz) notFound();

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
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Bài Kiểm Tra</h2>
          <p className="text-sm text-gray-500 mt-1">Sửa thông tin cơ bản của bài kiểm tra.</p>
        </div>
      </div>

      <QuizForm initialData={quiz} categories={categories} />
    </div>
  );
}
