import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LessonCompleteButton from "./LessonCompleteButton";
import QuizEngineClient from "@/app/luyen-tap/[quizId]/QuizEngineClient";

export async function generateMetadata({ params }: { params: { courseSlug: string } }): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return { title: "Không tìm thấy" };
  return { title: `Học: ${course.title} - Hán Ngữ Natra` };
}

export default async function LearningPage({
  params,
  searchParams,
}: {
  params: { courseSlug: string };
  searchParams: { lessonId?: string };
}) {
  const { courseSlug } = await params;
  const { lessonId } = await searchParams;

  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      sections: {
        include: {
          lessons: { 
            orderBy: { orderIndex: 'asc' },
            include: {
              quiz: {
                include: {
                  questions: {
                    include: { choices: { orderBy: { orderIndex: 'asc' } } },
                    orderBy: { orderIndex: 'asc' }
                  }
                }
              }
            }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    },
  });

  if (!course) notFound();

  // Lấy danh sách bài đã hoàn thành của user
  const allLessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id));
  let completedLessonIds: string[] = [];

  if (session?.user?.id) {
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: allLessonIds },
        completed: true
      },
      select: { lessonId: true }
    });
    completedLessonIds = progress.map(p => p.lessonId);
  }

  const totalLessons = allLessonIds.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Tìm bài học hiện tại
  let currentLesson = null;
  if (lessonId) {
    for (const section of course.sections) {
      const found = section.lessons.find(l => l.id === lessonId);
      if (found) { currentLesson = found; break; }
    }
  }
  if (!currentLesson && course.sections.length > 0 && course.sections[0].lessons.length > 0) {
    currentLesson = course.sections[0].lessons[0];
  }

  const isCurrentLessonCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  // Tìm bài học tiếp theo
  let nextLesson = null;
  if (currentLesson) {
    let found = false;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (found) { nextLesson = lesson; break; }
        if (lesson.id === currentLesson.id) found = true;
      }
      if (nextLesson) break;
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 flex flex-col md:flex-row">

      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-r border-gray-700 flex flex-col h-[50vh] md:h-screen sticky top-0 order-2 md:order-1">
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white line-clamp-1 text-sm">{course.title}</h2>
            <Link href={`/khoa-hoc/${course.slug}`} className="text-gray-400 hover:text-white" title="Thoát">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </Link>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Tiến độ</span>
              <span className="font-bold text-brand-teal">{completedCount}/{totalLessons} bài • {progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-brand-teal h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section, idx) => (
            <div key={section.id} className="border-b border-gray-700/50">
              <div className="bg-gray-800/80 px-4 py-3 sticky top-0 z-10">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">
                  Chương {idx + 1}: {section.title}
                </h3>
              </div>
              <ul className="divide-y divide-gray-700/30">
                {section.lessons.map((lesson, lIdx) => {
                  const isActive = currentLesson?.id === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/hoc/${course.slug}?lessonId=${lesson.id}`}
                        className={`flex items-center px-4 py-3 transition-colors group ${
                          isActive
                            ? 'bg-brand-teal/20 border-l-4 border-brand-teal'
                            : 'hover:bg-gray-700/50 border-l-4 border-transparent'
                        }`}
                      >
                        {/* Completed checkmark or lesson icon */}
                        <div className="mr-3 flex-shrink-0 w-5 h-5">
                          {isDone ? (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg className={`w-5 h-5 ${isActive ? 'text-brand-teal' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                              {lesson.lessonType === "VIDEO" ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />}
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-brand-teal' : isDone ? 'text-gray-400' : 'text-gray-300'}`}>
                            {lIdx + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{lesson.lessonType}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col order-1 md:order-2 overflow-hidden">
        {currentLesson ? (
          <>
            {/* Video / PDF player */}
            <div className="bg-black w-full flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '60vh' }}>
              {currentLesson.lessonType === "VIDEO" ? (
                currentLesson.videoUrl ? (
                  <div className="w-full h-full" style={{ aspectRatio: '16/9' }}>
                    {currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : currentLesson.videoUrl.includes('vimeo.com') ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${currentLesson.videoUrl.split('/').pop()}`}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        src={currentLesson.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        controlsList="nodownload"
                      ></video>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <p className="text-gray-400">Video đang được cập nhật</p>
                  </div>
                )
              ) : currentLesson.lessonType === "PDF" ? (
                <div className="w-full h-full min-h-[300px] bg-gray-100 flex flex-col items-center justify-center p-8">
                  <svg className="w-20 h-20 text-red-500 mb-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                  <p className="text-gray-600 mb-4 text-center font-medium">{currentLesson.title}</p>
                  {currentLesson.videoUrl ? (
                    <a href={currentLesson.videoUrl} target="_blank" rel="noreferrer" className="px-8 py-3 bg-brand-coral hover:bg-brand-coral/90 text-white font-bold rounded-xl shadow-lg">
                      📥 Mở / Tải tài liệu PDF
                    </a>
                  ) : (
                    <p className="text-gray-400 text-sm">Tài liệu đang được cập nhật</p>
                  )}
                </div>
              ) : currentLesson.lessonType === "QUIZ" ? (
                <div className="w-full h-full bg-gray-50 flex-1 overflow-y-auto">
                  {currentLesson.quiz ? (
                    <QuizEngineClient quiz={currentLesson.quiz} />
                  ) : (
                    <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-xl m-8">
                       <p className="text-gray-500">Bài kiểm tra đang được cập nhật</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 w-full h-full min-h-[300px] bg-gray-900 text-gray-300">
                   {currentLesson.content?.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-4">{line}</p>
                   ))}
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="bg-gray-900 border-t border-gray-800 p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-white">{currentLesson.title}</h1>
                  <p className="text-gray-500 text-sm mt-1">{currentLesson.lessonType} {currentLesson.duration ? `• ${Math.floor(currentLesson.duration / 60)} phút` : ''}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {session?.user && currentLesson.lessonType !== "QUIZ" && (
                    <LessonCompleteButton 
                      lessonId={currentLesson.id}
                      courseSlug={course.slug}
                      isCompleted={isCurrentLessonCompleted}
                    />
                  )}
                  {nextLesson && (
                    <Link 
                      href={`/hoc/${course.slug}?lessonId=${nextLesson.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-xl font-medium text-sm hover:bg-gray-600 transition-colors"
                    >
                      Bài tiếp theo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                  )}
                </div>
              </div>

              {currentLesson.content && (
                <div className="text-gray-400 space-y-2 border-t border-gray-800 pt-6">
                  {currentLesson.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Khóa học chưa có bài giảng</h2>
            <p className="text-gray-600">Giảng viên đang biên soạn nội dung.</p>
          </div>
        )}
      </div>
    </div>
  );
}
