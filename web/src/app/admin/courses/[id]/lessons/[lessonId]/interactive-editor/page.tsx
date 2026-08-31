import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InteractiveEditorClient from "./InteractiveEditorClient";

export default async function InteractiveLessonEditorPage({
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
  });

  if (!course || !lesson) {
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
          <h2 className="text-2xl font-bold text-gray-800">Soạn thảo bài học tương tác</h2>
          <p className="text-gray-500 mt-1">
            Bài học: <span className="font-bold text-purple-600">{lesson.title}</span> 
            <span className="mx-2">•</span> 
            Khóa học: {course.title}
          </p>
        </div>
      </div>

      <InteractiveEditorClient 
        lessonId={lesson.id} 
        initialContent={lesson.content} 
        quizId={lesson.quizId}
        courseId={course.id}
        lessonType={lesson.lessonType}
      />
    </div>
  );
}
