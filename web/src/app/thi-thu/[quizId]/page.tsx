import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import QuizEngineClient from "./QuizEngineClient";

export async function generateMetadata({ params }: { params: { quizId: string } }): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { title: "Không tìm thấy bài luyện tập" };
  return { title: `${quiz.title} - Luyện Tập` };
}

export default async function QuizDetailPage({ params }: { params: { quizId: string } }) {
  const { quizId } = await params;
  const session = await getServerSession(authOptions);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { choices: { orderBy: { orderIndex: "asc" } } },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!quiz || quiz.status !== "published") notFound();

  // Bỏ qua isCorrect trong client payload để chống gian lận
  const safeQuestions = quiz.questions.map((q: any) => ({
    id: q.id,
    questionType: q.questionType,
    question: q.question,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    points: q.points,
    choices: q.choices.map((c: any) => ({
      id: c.id,
      content: c.content,
      matchGroup: c.matchGroup,
      orderIndex: c.orderIndex,
    })),
  }));

  if (!session?.user) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-brand-coral/10 text-brand-coral rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để làm bài tập và lưu lại kết quả học tập của mình.</p>
          <Link href={`/login?callbackUrl=/thi-thu/${quiz.id}`} className="block w-full bg-brand-teal text-white font-bold py-3 rounded-xl hover:bg-opacity-90">
            Đăng nhập ngay
          </Link>
          <Link href="/luyen-tap" className="block w-full text-gray-500 font-medium py-3 mt-2 hover:text-gray-700">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuizEngineClient quiz={{ ...quiz, questions: safeQuestions }} />
      </div>
    </div>
  );
}
