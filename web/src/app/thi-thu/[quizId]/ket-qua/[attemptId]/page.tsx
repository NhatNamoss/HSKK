import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Kết quả làm bài - Luyện Tập` };
}

export default async function QuizResultPage({ params }: { params: { quizId: string, attemptId: string } }) {
  const { attemptId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return notFound();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
      answers: {
        include: {
          question: {
            include: { choices: { orderBy: { orderIndex: "asc" } } }
          }
        }
      }
    }
  });

  if (!attempt || attempt.userId !== session.user.id) notFound();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  const timeSpent = attempt.finishedAt ? Math.floor((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 1000) : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Kết quả tổng quan */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center mb-8 relative overflow-hidden">
          {attempt.score !== null && attempt.score >= 80 && (
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-brand-teal"></div>
          )}
          {attempt.score !== null && attempt.score < 50 && (
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-brand-coral"></div>
          )}
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Kết quả làm bài</h1>
          <p className="text-gray-500 mb-8">{attempt.quiz.title}</p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="bg-brand-teal/5 border border-brand-teal/20 w-40 h-40 rounded-full flex flex-col items-center justify-center text-brand-teal">
              <div className="text-5xl font-extrabold">{attempt.score}<span className="text-2xl">%</span></div>
              <div className="text-sm font-medium mt-1">ĐIỂM SỐ</div>
            </div>
            
            <div className="flex flex-col justify-center gap-4 text-left">
              <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-500 block">Số điểm đạt được</span>
                <span className="text-xl font-bold text-gray-900">{attempt.earnedPoints} / {attempt.totalPoints}</span>
              </div>
              <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-500 block">Thời gian làm bài</span>
                <span className="text-xl font-bold text-gray-900">{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
             <Link href={`/thi-thu/${attempt.quizId}`} className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-xl hover:bg-opacity-90">
               Làm lại
             </Link>
             <Link href="/thi-thu" className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">
               Trở về danh sách
             </Link>
          </div>
        </div>

        {/* Chi tiết từng câu */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết bài làm</h2>
        <div className="space-y-6">
          {attempt.answers.sort((a: any, b: any) => a.question.orderIndex - b.question.orderIndex).map((ans: any, idx: number) => {
            const q = ans.question;
            return (
              <div key={ans.id} className={`bg-white p-6 rounded-2xl shadow-sm border-2 ${ans.isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-700">{q.points} điểm</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ans.isCorrect ? 'ĐÚNG' : 'SAI'}
                  </span>
                </div>

                <div className="text-lg font-medium text-gray-900 mb-4 whitespace-pre-wrap">{q.question}</div>

                {/* Your answer display */}
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Câu trả lời của bạn</div>
                  {q.questionType === "MULTIPLE_CHOICE" || q.questionType === "TONE_RECOGNITION" ? (
                     <div className="text-gray-900 font-medium">
                       {q.choices.find((c: any) => c.id === ans.answer)?.content || <span className="text-gray-400 italic">Bỏ trống</span>}
                     </div>
                  ) : q.questionType === "WORD_ORDER" ? (
                     <div className="flex flex-wrap gap-2">
                       {(() => {
                         try {
                           const ids = JSON.parse(ans.answer);
                           if (ids.length === 0) return <span className="text-gray-400 italic">Bỏ trống</span>;
                           return ids.map((id: string, i: number) => (
                             <span key={i} className="px-2 py-1 bg-white border rounded shadow-sm text-sm font-medium">{q.choices.find((c: any) => c.id === id)?.content}</span>
                           ));
                         } catch {
                           return <span className="text-gray-400 italic">Lỗi định dạng</span>;
                         }
                       })()}
                     </div>
                  ) : q.questionType === "FILL_IN_BLANK" ? (
                     <div className="text-gray-900 font-medium flex flex-wrap gap-2">
                       {(() => {
                         try {
                           const arr = JSON.parse(ans.answer);
                           if (arr.length === 0) return <span className="text-gray-400 italic">Bỏ trống</span>;
                           return arr.map((ansText: string, i: number) => (
                             <span key={i} className="px-2 py-1 bg-white border rounded shadow-sm text-sm font-medium">{ansText || "..."}</span>
                           ));
                         } catch {
                           return ans.answer || <span className="text-gray-400 italic">Bỏ trống</span>;
                         }
                       })()}
                     </div>
                  ) : q.questionType === "MATCHING" ? (
                     <div className="text-gray-900 font-medium space-y-2">
                       {(() => {
                         try {
                           const pairs = JSON.parse(ans.answer);
                           if (pairs.length === 0) return <span className="text-gray-400 italic">Bỏ trống</span>;
                           return pairs.map((p: any, i: number) => {
                             const leftContent = q.choices.find((c: any) => c.id === p.left)?.content;
                             const rightContent = q.choices.find((c: any) => c.id === p.right)?.content;
                             return (
                               <div key={i} className="flex items-center gap-2">
                                 <span className="px-3 py-1 bg-gray-100 rounded text-sm">{leftContent}</span>
                                 <span className="text-gray-400">→</span>
                                 <span className="px-3 py-1 bg-gray-100 rounded text-sm">{rightContent}</span>
                               </div>
                             );
                           });
                         } catch {
                           return <span className="text-gray-400 italic">Lỗi định dạng</span>;
                         }
                       })()}
                     </div>
                  ) : (
                     <div className="text-gray-900 font-medium">
                       {ans.answer || <span className="text-gray-400 italic">Bỏ trống</span>}
                     </div>
                  )}
                </div>

                {/* Correct answer & Explanation */}
                {!ans.isCorrect && (
                  <div className="bg-green-50 p-4 rounded-xl mb-4 border border-green-100">
                    <div className="text-xs font-bold text-green-700 mb-2 uppercase">Đáp án đúng</div>
                    {q.questionType === "MULTIPLE_CHOICE" || q.questionType === "TONE_RECOGNITION" ? (
                       <div className="text-green-800 font-medium">{q.choices.find((c: any) => c.isCorrect)?.content}</div>
                    ) : q.questionType === "WORD_ORDER" ? (
                       <div className="text-green-800 font-medium">{q.explanation}</div>
                    ) : q.questionType === "FILL_IN_BLANK" ? (
                       <div className="text-green-800 font-medium">{q.choices.filter((c: any) => c.isCorrect).map((c: any) => c.content).join(" hoặc ")}</div>
                    ) : (
                       <div className="text-green-800 font-medium">Vui lòng xem lại bài học</div>
                    )}
                  </div>
                )}

                {q.explanation && ans.isCorrect && (
                  <div className="bg-brand-teal/5 p-4 rounded-xl mb-4 border border-brand-teal/10">
                    <div className="text-xs font-bold text-brand-teal mb-2 uppercase">Giải thích</div>
                    <div className="text-gray-700">{q.explanation}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
