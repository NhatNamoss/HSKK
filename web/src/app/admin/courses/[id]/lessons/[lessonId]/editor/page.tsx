import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import QuestionManagerClient from "@/app/admin/quizzes/[id]/questions/QuestionManagerClient";

export default async function LessonEditorPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const { id, lessonId } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: {
        include: {
          questions: {
            include: { choices: true },
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });

  if (!course || !lesson || !lesson.quiz) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/admin/courses/${id}/lessons`}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Soạn thảo bài tập</h2>
          <p className="text-gray-500 mt-1">
            Bài học: <span className="font-bold text-brand-teal">{lesson.title}</span> 
            <span className="mx-2">•</span> 
            Khóa học: {course.title}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
         <h3 className="text-lg font-bold text-gray-900 mb-2">Quản lý ngân hàng câu hỏi</h3>
         <p className="text-sm text-gray-500">Thêm, sửa, xóa và sắp xếp các câu hỏi cho bài tập này. Mọi thay đổi sẽ được lưu tự động.</p>
      </div>

      <QuestionManagerClient 
        quizId={lesson.quizId!} 
        initialQuestions={lesson.quiz.questions} 
      />
    </div>
  );
}
