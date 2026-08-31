import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LessonCompleteButton from "./LessonCompleteButton";
import CourseQuizEngineClient from "./CourseQuizEngineClient";
import InteractiveLessonClient from "./InteractiveLessonClient";

export async function generateMetadata({ params }: { params: { courseSlug: string } }): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return { title: "Không tìm thấy" };
  return { title: `Học: ${course.title} - Học tiếng cùng cô Mỹ - Hán ngữ Natra` };
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

  // Lấy pastAttempt nếu bài học hiện tại là QUIZ
  const pastAttempt = session?.user?.id && currentLesson?.lessonType === "QUIZ" && currentLesson.quiz ? await prisma.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId: currentLesson.quiz.id },
    orderBy: { startedAt: 'desc' },
    include: { answers: true }
  }) : null;

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex flex-col md:flex-row font-sans">

      {/* Sidebar - Dark Mode for Contrast */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-900 text-gray-200 border-r border-slate-800 flex flex-col h-[50vh] md:h-screen sticky top-0 order-2 md:order-1 shadow-xl z-10">
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-white line-clamp-2 text-base">{course.title}</h2>
            <Link href={`/khoa-hoc/${course.slug}`} className="text-gray-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition-colors" title="Thoát">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </Link>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>Tiến độ học tập</span>
              <span className="text-brand-teal font-bold">{completedCount}/{totalLessons} bài ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-brand-teal h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section, idx) => (
            <div key={section.id} className="border-b border-slate-800/80">
              <div className="bg-slate-900/95 backdrop-blur px-5 py-3 sticky top-0 z-10 border-b border-slate-800/50">
                <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                  Chương {idx + 1}: {section.title}
                </h3>
              </div>
              <ul className="divide-y divide-slate-800/50">
                {section.lessons.map((lesson, lIdx) => {
                  const isActive = currentLesson?.id === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/hoc/${course.slug}?lessonId=${lesson.id}`}
                        className={`flex items-start px-5 py-3.5 transition-all group ${
                          isActive
                            ? 'bg-brand-teal/10 border-l-4 border-brand-teal'
                            : 'hover:bg-slate-800/50 border-l-4 border-transparent'
                        }`}
                      >
                        {/* Completed checkmark or lesson icon */}
                        <div className="mr-3 mt-0.5 flex-shrink-0 w-5 h-5">
                          {isDone ? (
                            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg className={`w-5 h-5 ${isActive ? 'text-brand-teal' : 'text-slate-500 group-hover:text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {lesson.lessonType === "VIDEO" ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />}
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-snug ${isActive ? 'text-brand-teal font-bold' : isDone ? 'text-slate-400' : 'text-slate-200'}`}>
                            {lIdx + 1}. {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isActive ? 'bg-brand-teal/20 text-brand-teal' : 'bg-slate-800 text-slate-400'}`}>
                              {lesson.lessonType}
                            </span>
                            {lesson.duration && (
                              <span className="text-[11px] text-slate-500">
                                {Math.floor(lesson.duration / 60)} phút
                              </span>
                            )}
                          </div>
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

      {/* Main Content Area - Light Mode */}
      <div className="flex-1 flex flex-col order-1 md:order-2 overflow-hidden bg-[#FAF9F6] text-gray-900 relative">
        {currentLesson ? (
          <>
            {/* Media/Interactive Container */}
            <div className={`w-full flex flex-col ${["VIDEO", "PDF"].includes(currentLesson.lessonType) ? "bg-black" : "bg-white"} shadow-sm z-0`} style={{ minHeight: '40vh', maxHeight: '70vh' }}>
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
                <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-gray-800 text-lg mb-6 text-center font-bold">{currentLesson.title}</p>
                  {currentLesson.videoUrl ? (
                    <a href={currentLesson.videoUrl} target="_blank" rel="noreferrer" className="px-8 py-3.5 bg-brand-coral hover:bg-brand-coral/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      📥 Mở / Tải tài liệu PDF
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Tài liệu đang được cập nhật</p>
                  )}
                </div>
              ) : currentLesson.lessonType === "QUIZ" ? (
                <div className="w-full h-full bg-[#FAF9F6] flex-1 overflow-y-auto">
                  {currentLesson.quiz ? (
                    <CourseQuizEngineClient quiz={currentLesson.quiz} pastAttempt={pastAttempt} />
                  ) : (
                    <div className="text-center p-12 bg-white border border-gray-200 rounded-2xl m-8 shadow-sm">
                       <p className="text-gray-500">Bài kiểm tra đang được cập nhật</p>
                    </div>
                  )}
                </div>
              ) : ["FLASHCARDS", "SENTENCES", "SITUATIONS", "DIALOGUES"].includes(currentLesson.lessonType) ? (
                <div className="w-full h-full bg-[#FAF9F6] flex-1 overflow-y-auto">
                  <InteractiveLessonClient 
                    content={currentLesson.content} 
                    quiz={currentLesson.quiz} 
                    pastAttempt={pastAttempt} 
                  />
                </div>
              ) : (
                <div className="p-8 md:p-12 w-full h-full min-h-[300px] bg-white text-gray-700">
                   {currentLesson.content?.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-4 leading-relaxed text-lg">{line}</p>
                   ))}
                </div>
              )}
            </div>

            {/* Lesson Info Header */}
            <div className="bg-white border-t border-gray-200 p-6 md:p-8 flex-1 overflow-y-auto z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">{currentLesson.lessonType}</span>
                      {currentLesson.duration && <span className="text-xs text-gray-400 font-medium">• {Math.floor(currentLesson.duration / 60)} phút</span>}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{currentLesson.title}</h1>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {session?.user && currentLesson.lessonType !== "QUIZ" && (
                      <LessonCompleteButton 
                        key={currentLesson.id}
                        lessonId={currentLesson.id}
                        courseSlug={course.slug}
                        isCompleted={isCurrentLessonCompleted}
                      />
                    )}
                    {nextLesson && (
                      <Link 
                        href={`/hoc/${course.slug}?lessonId=${nextLesson.id}`}
                        className="flex items-center gap-2 px-5 py-3 bg-[#6A5ACD] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        Bài tiếp theo
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </Link>
                    )}
                  </div>
                </div>

                {currentLesson.content && !["FLASHCARDS", "SENTENCES", "SITUATIONS", "DIALOGUES"].includes(currentLesson.lessonType) && (
                  <div className="prose prose-lg prose-gray max-w-none text-gray-700 border-t border-gray-100 pt-8 mt-8">
                    {currentLesson.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#FAF9F6]">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có nội dung</h2>
            <p className="text-gray-500">Giảng viên đang biên soạn nội dung cho bài học này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
