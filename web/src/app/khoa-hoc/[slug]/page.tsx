import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CourseActionButtons from "./CourseActionButtons";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
  });

  if (!course) {
    return { title: "Không tìm thấy khóa học" };
  }

  return {
    title: `${course.title} - Học tiếng cùng cô Mỹ - Hán ngữ Natra`,
    description: course.description || "Khóa học tiếng Trung chất lượng cao.",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      sections: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      },
      _count: {
        select: { enrollments: true }
      }
    },
  });

  if (!course) {
    notFound();
  }

  // Lấy session để check xem user đã mua khóa này chưa
  const session = await getServerSession(authOptions);
  let hasEnrolled = false;

  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      }
    });
    if (enrollment) {
      hasEnrolled = true;
    }
  }

  // Tính tổng số bài giảng
  const totalLessons = course.sections.reduce((total, section) => total + section.lessons.length, 0);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-brand-cream py-16 lg:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            <div className="w-full lg:w-3/5 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="bg-brand-teal/10 text-brand-teal font-bold px-3 py-1 rounded-full text-sm">
                  {course.level || "Tất cả trình độ"}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  5.0 (128 đánh giá)
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-600 pt-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  {course._count.enrollments} Học viên
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  {course.sections.length} Chương
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  {totalLessons} Bài giảng
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/5">
              <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-teal to-brand-earth flex items-center justify-center">
                      <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                  {/* Play overlay for preview */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center pl-1">
                      <svg className="w-8 h-8 text-brand-coral" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-end mb-6">
                    <span className="text-3xl font-black text-brand-coral">
                      {course.price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                    </span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-lg text-gray-400 line-through ml-3 mb-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <CourseActionButtons 
                    courseId={course.id} 
                    price={course.price} 
                    slug={course.slug} 
                    hasEnrolled={hasEnrolled}
                  />
                  
                  <p className="text-center text-xs text-gray-500 mt-4">
                    {course.validityPeriod ? `Truy cập trong ${course.validityPeriod} ngày` : "Sở hữu khóa học trọn đời"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-2/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nội dung khóa học</h2>
            
            <div className="space-y-4">
              {course.sections.length === 0 ? (
                <p className="text-gray-500 italic bg-gray-50 p-6 rounded-xl border border-gray-100">Nội dung đang được cập nhật...</p>
              ) : (
                course.sections.map((section, idx) => (
                  <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                      <h3 className="font-bold text-gray-800">
                        Phần {idx + 1}: {section.title}
                      </h3>
                      <span className="text-sm font-medium text-gray-500">
                        {section.lessons.length} bài học
                      </span>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {section.lessons.map((lesson, lIdx) => {
                        const lessonContent = (
                          <>
                            <div className="mr-4 text-brand-teal opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {lesson.lessonType === "VIDEO" && (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                              )}
                              {lesson.lessonType === "PDF" && (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                              )}
                              {lesson.lessonType === "QUIZ" && (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${lesson.isPreview ? 'text-brand-teal' : 'text-gray-800'} line-clamp-1`}>
                                Bài {lIdx + 1}: {lesson.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{lesson.lessonType}{lesson.duration ? ` • ${Math.floor(lesson.duration / 60)} phút` : ''}</p>
                            </div>
                            {lesson.isPreview && (
                              <span className="bg-brand-coral/10 text-brand-coral text-xs font-bold px-2 py-1 rounded flex-shrink-0">Học thử</span>
                            )}
                            {!lesson.isPreview && (
                              <svg className="w-4 h-4 text-gray-300 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            )}
                          </>
                        );

                        return lesson.isPreview ? (
                          <Link key={lesson.id} href={`/hoc/${course.slug}?lessonId=${lesson.id}`} className="px-6 py-4 flex items-center hover:bg-brand-teal/5 transition-colors group border-b border-gray-100 last:border-0">
                            {lessonContent}
                          </Link>
                        ) : (
                          <div key={lesson.id} className="px-6 py-4 flex items-center transition-colors group border-b border-gray-100 last:border-0">
                            {lessonContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bạn sẽ học được gì?</h2>
            <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-teal mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700">Nắm vững toàn bộ từ vựng và ngữ pháp trọng tâm theo chuẩn HSK mới nhất.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-teal mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700">Luyện kỹ năng Nghe - Đọc - Viết phản xạ nhanh chóng thông qua các bài tập thực hành.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-teal mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700">Mẹo làm bài thi đạt điểm cao, tránh bẫy thường gặp.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-teal mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700">Tự tin giao tiếp các chủ đề thông dụng trong đời sống.</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
