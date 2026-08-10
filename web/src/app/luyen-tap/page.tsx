import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện Tập & Thi Thử HSK - Hán Ngữ Natra",
  description: "Hệ thống bài tập trắc nghiệm, điền từ, nghe hiểu, mô phỏng đề thi thật HSK và HSKK.",
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { level?: string; type?: string };
}) {
  const { level, type } = await searchParams;

  const whereCondition: any = { status: "published" };
  if (level) whereCondition.level = level;
  if (type) whereCondition.quizType = type;

  const quizzes = await prisma.quiz.findMany({
    where: whereCondition,
    include: {
      _count: { select: { questions: true, attempts: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Luyện Tập & Thi Thử</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống bài tập tương tác thông minh giúp bạn ghi nhớ từ vựng, ngữ pháp và chuẩn bị tốt nhất cho kỳ thi HSK.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-8 items-center justify-center">
          <Link
            href="/luyen-tap"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!level && !type ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tất cả
          </Link>
          <Link
            href="/luyen-tap?type=EXERCISE"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${type === 'EXERCISE' ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Luyện tập theo chuyên đề
          </Link>
          <Link
            href="/luyen-tap?type=MOCK_EXAM"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${type === 'MOCK_EXAM' ? 'bg-brand-coral text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Thi thử (Mock Exams)
          </Link>
          <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
          {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map(hsk => (
            <Link
              key={hsk}
              href={`/luyen-tap?level=${hsk}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${level === hsk ? 'bg-brand-earth text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {hsk}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                    quiz.quizType === 'MOCK_EXAM' ? 'bg-brand-coral/10 text-brand-coral' : 'bg-brand-teal/10 text-brand-teal'
                  }`}>
                    {quiz.quizType === 'MOCK_EXAM' ? '📝 Thi thử' : '🎯 Luyện tập'}
                  </span>
                  {quiz.level && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {quiz.level}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors line-clamp-2">
                  {quiz.title}
                </h3>
                
                {quiz.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {quiz.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {quiz._count.questions} câu hỏi
                  </div>
                  {quiz.timeLimit && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {quiz.timeLimit} phút
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-brand-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {quiz._count.attempts} lượt thi
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-50 bg-gray-50">
                <Link
                  href={`/luyen-tap/${quiz.id}`}
                  className="block w-full py-2.5 bg-white border-2 border-brand-teal text-brand-teal font-bold rounded-xl text-center hover:bg-brand-teal hover:text-white transition-colors"
                >
                  VÀO LÀM BÀI →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🏜️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài tập nào</h3>
            <p className="text-gray-500">Thầy cô đang chuẩn bị nội dung cho phần này, bạn quay lại sau nhé.</p>
            <Link href="/" className="mt-6 inline-block bg-brand-teal text-white font-bold px-6 py-2.5 rounded-xl">Về trang chủ</Link>
          </div>
        )}

      </div>
    </div>
  );
}
