import Link from "next/link";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khóa học tiếng Trung - Hán Ngữ Natra",
  description: "Các khóa học tiếng Trung trực tuyến chất lượng cao từ cơ bản đến nâng cao.",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    include: {
      _count: {
        select: { enrollments: true, sections: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Hệ Thống Khóa Học</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lộ trình học tập bài bản, phương pháp giảng dạy độc quyền giúp bạn nắm vững tiếng Trung trong thời gian ngắn nhất.
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <Link href={`/khoa-hoc/${course.slug}`} key={course.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-teal to-brand-earth opacity-80 flex items-center justify-center">
                      <span className="text-white text-5xl font-bold opacity-30">NATRA</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-teal text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {course.level}
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-coral transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                    {course.description || "Khóa học chất lượng cao được biên soạn độc quyền."}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-6 space-x-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      {course._count.sections} Chương
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      {course._count.enrollments} Học viên
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-2xl font-black text-brand-coral">
                        {course.price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-teal/10 mb-4">
              <svg className="w-8 h-8 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hệ thống đang cập nhật</h3>
            <p className="text-gray-500">Các khóa học đang được biên soạn và sẽ sớm ra mắt.</p>
          </div>
        )}

      </div>
    </div>
  );
}
