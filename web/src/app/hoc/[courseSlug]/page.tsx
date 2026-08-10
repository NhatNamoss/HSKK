import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { courseSlug: string } }): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  });

  if (!course) return { title: "Không tìm thấy khóa học" };
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
  
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      sections: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    },
  });

  if (!course) notFound();

  // Tìm bài học hiện tại, mặc định là bài đầu tiên của chương đầu tiên
  let currentLesson = null;
  
  if (lessonId) {
    for (const section of course.sections) {
      const found = section.lessons.find(l => l.id === lessonId);
      if (found) {
        currentLesson = found;
        break;
      }
    }
  }
  
  if (!currentLesson && course.sections.length > 0 && course.sections[0].lessons.length > 0) {
    currentLesson = course.sections[0].lessons[0];
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 flex flex-col md:flex-row">
      
      {/* Sidebar - Danh sách bài học */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-r border-gray-700 flex flex-col h-[50vh] md:h-screen sticky top-0 order-2 md:order-1">
        
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-white line-clamp-1">{course.title}</h2>
          <Link href={`/khoa-hoc/${course.slug}`} className="text-gray-400 hover:text-white transition-colors" title="Thoát khóa học">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {course.sections.map((section, idx) => (
            <div key={section.id} className="border-b border-gray-700/50">
              <div className="bg-gray-800/80 px-4 py-3 sticky top-0 z-10 backdrop-blur-sm">
                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">
                  Chương {idx + 1}: {section.title}
                </h3>
              </div>
              
              <ul className="divide-y divide-gray-700/30">
                {section.lessons.map((lesson, lIdx) => {
                  const isActive = currentLesson?.id === lesson.id;
                  
                  return (
                    <li key={lesson.id}>
                      <Link 
                        href={`/hoc/${course.slug}?lessonId=${lesson.id}`}
                        className={`flex items-start px-4 py-3 transition-colors ${
                          isActive 
                            ? 'bg-brand-teal/20 border-l-4 border-brand-teal text-white' 
                            : 'hover:bg-gray-700/50 border-l-4 border-transparent text-gray-400'
                        }`}
                      >
                        <div className="mt-0.5 mr-3 flex-shrink-0">
                          {lesson.lessonType === "VIDEO" && (
                            <svg className={`w-5 h-5 ${isActive ? 'text-brand-teal' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                          )}
                          {lesson.lessonType === "PDF" && (
                            <svg className={`w-5 h-5 ${isActive ? 'text-brand-teal' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                          )}
                          {lesson.lessonType === "QUIZ" && (
                            <svg className={`w-5 h-5 ${isActive ? 'text-brand-teal' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isActive ? 'text-brand-teal' : ''} line-clamp-2`}>
                            {lIdx + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            {lesson.lessonType} {lesson.duration ? `• ${Math.floor(lesson.duration / 60)} phút` : ''}
                          </p>
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

      {/* Main Content - Player */}
      <div className="flex-1 flex flex-col order-1 md:order-2">
        {currentLesson ? (
          <>
            <div className="flex-1 bg-black w-full flex items-center justify-center relative">
              {currentLesson.lessonType === "VIDEO" ? (
                currentLesson.videoUrl ? (
                  // Simple iframe for youtube/vimeo or video tag for direct mp4
                  <div className="w-full h-full aspect-video md:aspect-auto">
                    {currentLesson.videoUrl.includes('youtube') || currentLesson.videoUrl.includes('vimeo') ? (
                      <iframe 
                        src={currentLesson.videoUrl} 
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-8">
                  <svg className="w-20 h-20 text-red-500 mb-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                  <a href={currentLesson.videoUrl || "#"} target="_blank" rel="noreferrer" className="px-8 py-3 bg-brand-coral hover:bg-brand-coral/90 text-white font-bold rounded-lg shadow-lg">
                    Mở tài liệu PDF
                  </a>
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-xl text-gray-300 font-bold mb-4">Bài tập trắc nghiệm</p>
                  <button className="px-8 py-3 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold rounded-lg shadow-lg">
                    Bắt đầu làm bài
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-gray-900 border-t border-gray-800 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{currentLesson.title}</h1>
              {currentLesson.content && (
                <div className="text-gray-400 prose prose-invert max-w-none">
                  {currentLesson.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-900">
            <svg className="w-20 h-20 text-gray-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Khóa học chưa có bài giảng nào</h2>
            <p className="text-gray-600">Giảng viên đang biên soạn nội dung và sẽ cập nhật sớm nhất.</p>
          </div>
        )}
      </div>

    </div>
  );
}
