import Link from 'next/link';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Hán Ngữ Natra - Học Tiếng Trung Cùng Cô Mỹ",
  description: "Nền tảng học tiếng Trung trực tuyến hàng đầu. Khóa học và tài liệu chất lượng cao giúp bạn chinh phục HSK và HSKK dễ dàng hơn.",
};

async function handleSearch(formData: FormData) {
  "use server";
  const q = formData.get("q") as string;
  if (q?.trim()) {
    redirect(`/thu-vien?q=${encodeURIComponent(q.trim())}`);
  }
}

export default async function Home() {
  const [featuredCourses, totalStudents, totalCourses, totalDocuments, libraryCategories] = await Promise.all([
    prisma.course.findMany({
      where: { status: "published" },
      include: { _count: { select: { enrollments: true, sections: true } } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.course.count({ where: { status: "published" } }),
    prisma.document.count(),
    prisma.category.findMany({ orderBy: { name: 'asc' }, take: 10 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-cream py-24 border-b-4 border-brand-earth/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-coral/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal font-semibold text-sm mb-6 border border-brand-teal/20">
            Nền tảng học tiếng Trung hàng đầu
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            HỌC TIẾNG TRUNG{' '}
            <span className="text-brand-coral relative inline-block">
              DỄ HƠN
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-earth opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hệ thống tài liệu và khóa học bài bản từ Hán Ngữ Natra, giúp bạn chinh phục HSK và HSKK một cách toàn diện.
          </p>

          {/* Functional Search Form */}
          <div className="max-w-2xl mx-auto relative group mb-12">
            <div className="absolute inset-0 bg-brand-teal/20 rounded-full blur-md group-focus-within:bg-brand-teal/30 transition-all duration-300"></div>
            <form action={handleSearch} className="relative flex items-center bg-white rounded-full p-2 shadow-lg border border-gray-100">
              <input
                type="text"
                name="q"
                placeholder="Tìm kiếm tài liệu, khóa học..."
                className="w-full px-6 py-3 rounded-full outline-none text-lg bg-transparent text-gray-900 placeholder-gray-400"
              />
              <button type="submit" className="flex-shrink-0 bg-brand-teal text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-md whitespace-nowrap">
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-extrabold text-brand-coral">{totalStudents.toLocaleString('vi-VN')}+</div>
              <div className="text-sm text-gray-500 mt-1">Học viên đã đăng ký</div>
            </div>
            <div className="w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <div className="text-3xl font-extrabold text-brand-teal">{totalCourses}+</div>
              <div className="text-sm text-gray-500 mt-1">Khóa học đang mở</div>
            </div>
            <div className="w-px bg-gray-200 hidden sm:block"></div>
            <div>
              <div className="text-3xl font-extrabold text-brand-earth">{totalDocuments}+</div>
              <div className="text-sm text-gray-500 mt-1">Tài liệu miễn phí</div>
            </div>
          </div>
        </div>
      </section>

      {/* Thư viện Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 uppercase">Khám phá thư viện</h2>
              <div className="w-20 h-1.5 bg-brand-earth mt-3 rounded-full"></div>
            </div>
            <Link href="/thu-vien" className="text-brand-earth font-bold hover:text-brand-coral transition-colors flex items-center gap-1">
              Xem tất cả <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-4">
            {libraryCategories.length > 0 ? (
              libraryCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/thu-vien?category=${cat.slug}`}
                  className="px-6 py-3 bg-brand-cream/50 text-gray-800 rounded-xl font-medium border border-brand-earth/20 hover:border-brand-coral hover:bg-brand-coral hover:text-white transition-all duration-300 shadow-sm"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSKK', 'Giao tiếp', 'Ngữ pháp'].map((cat) => (
                <Link
                  key={cat}
                  href={`/thu-vien?category=${encodeURIComponent(cat.toLowerCase().replace(/ /g, '-'))}`}
                  className="px-6 py-3 bg-brand-cream/50 text-gray-800 rounded-xl font-medium border border-brand-earth/20 hover:border-brand-coral hover:bg-brand-coral hover:text-white transition-all duration-300 shadow-sm"
                >
                  {cat}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Khóa học nổi bật Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 uppercase">Khóa học nổi bật</h2>
              <div className="w-20 h-1.5 bg-brand-teal mt-3 rounded-full"></div>
            </div>
            <Link href="/khoa-hoc" className="text-brand-teal font-bold hover:text-brand-coral transition-colors flex items-center gap-1">
              Xem tất cả <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/khoa-hoc/${course.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="h-44 bg-brand-cream relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-teal/20 to-brand-earth/20 flex items-center justify-center">
                        <span className="text-3xl font-extrabold text-brand-teal/30 tracking-widest">{course.level || 'NATRA'}</span>
                      </div>
                    )}
                    {course.price === 0 && (
                      <div className="absolute top-3 left-3 bg-brand-teal text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        Miễn phí
                      </div>
                    )}
                    {course.level && course.price > 0 && (
                      <div className="absolute top-3 left-3 bg-brand-coral text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {course.level}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-brand-teal transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{course.description || "Khóa học chất lượng cao."}</p>
                    <div className="text-xs text-gray-400 mb-3 flex items-center gap-3">
                      <span>{course._count.sections} Chương</span>
                      <span>•</span>
                      <span>{course._count.enrollments} Học viên</span>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xl font-black text-brand-coral">
                        {course.price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400">Các khóa học đang được biên soạn và sẽ sớm ra mắt.</p>
              <Link href="/admin/courses" className="mt-4 inline-block text-brand-teal font-bold hover:underline">Thêm khóa học →</Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials / Why us */}
      <section className="py-20 bg-brand-cream border-t border-brand-earth/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Tại sao chọn Hán Ngữ Natra?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Phương pháp giảng dạy độc quyền, giáo trình chuẩn hóa quốc tế.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Lộ trình rõ ràng", desc: "Từng bước từ phiên âm đến giao tiếp tự nhiên, không bị bơi." },
              { icon: "🎓", title: "Giáo viên bản ngữ", desc: "Cô Mỹ với kinh nghiệm nhiều năm giảng dạy tiếng Trung chuyên nghiệp." },
              { icon: "📚", title: "Tài liệu độc quyền", desc: "Hệ thống giáo trình và đề luyện thi được biên soạn chuẩn cấu trúc HSK mới nhất." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-teal to-brand-teal/80 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Sẵn sàng bắt đầu hành trình?</h2>
          <p className="text-brand-teal/20 text-lg mb-8 text-white/80">Đăng ký ngay hôm nay và nhận quyền truy cập miễn phí vào hàng trăm tài liệu học tập.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="bg-white text-brand-teal font-bold px-8 py-4 rounded-full hover:shadow-xl transition-all hover:-translate-y-1 shadow-lg">
              Đăng ký miễn phí
            </Link>
            <Link href="/khoa-hoc" className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all">
              Xem khóa học
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
