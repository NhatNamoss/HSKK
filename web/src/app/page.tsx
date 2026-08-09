import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-cream py-24 border-b-4 border-brand-earth/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal font-semibold text-sm mb-6 border border-brand-teal/20">
            Nền tảng học tiếng Trung hàng đầu
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            HỌC TIẾNG TRUNG <span className="text-brand-coral relative inline-block">
              DỄ HƠN
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-earth opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hệ thống tài liệu và khóa học bài bản từ Hán Ngữ Natra, giúp bạn chinh phục HSK và HSKK một cách toàn diện.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-brand-teal/20 rounded-full blur-md group-hover:bg-brand-teal/30 transition-all duration-300"></div>
            <div className="relative flex items-center bg-white rounded-full p-2 shadow-lg border border-gray-100">
              <input 
                type="text" 
                placeholder="Tìm kiếm tài liệu, khóa học..." 
                className="w-full px-6 py-3 rounded-full outline-none text-lg bg-transparent"
              />
              <button className="flex-shrink-0 bg-brand-teal text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-md">
                Tìm kiếm
              </button>
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
            {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6', 'HSKK', 'Giao tiếp', 'Thiếu nhi'].map((cat, i) => (
              <Link 
                key={cat} 
                href={`/thu-vien?category=${cat}`}
                className="px-6 py-3 bg-brand-cream/50 text-gray-800 rounded-xl font-medium border border-brand-earth/20 hover:border-brand-coral hover:bg-brand-coral hover:text-white transition-all duration-300 shadow-sm"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Khóa học nổi bật Section */}
      <section className="py-20 bg-[#f9fafb] border-t border-gray-100">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mẫu Card Khóa học 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-48 bg-brand-cream relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-brand-teal/5 group-hover:bg-brand-teal/15 transition-colors"></div>
                <div className="absolute top-4 left-4 bg-brand-coral text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                  Bán chạy
                </div>
                <span className="text-4xl text-brand-teal/40 font-bold tracking-widest relative z-0">HSK 3</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors">Khóa học HSK 3 Toàn diện</h3>
                <p className="text-gray-500 text-sm mb-5 line-clamp-2">Lộ trình học bài bản giúp bạn tự tin đạt điểm cao trong kỳ thi HSK 3.</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-brand-coral font-extrabold text-xl">499.000đ</span>
                  <span className="text-gray-400 text-sm line-through">800k</span>
                </div>
              </div>
            </div>

            {/* Mẫu Card Khóa học 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-48 bg-brand-cream relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-brand-earth/5 group-hover:bg-brand-earth/15 transition-colors"></div>
                <span className="text-4xl text-brand-earth/40 font-bold tracking-widest relative z-0">HSKK</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors">Luyện thi HSKK Trung Cấp</h3>
                <p className="text-gray-500 text-sm mb-5 line-clamp-2">Cải thiện phản xạ và phát âm chuẩn xác cho bài thi nói.</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-brand-coral font-extrabold text-xl">399.000đ</span>
                </div>
              </div>
            </div>

            {/* Mẫu Card Khóa học 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-48 bg-brand-cream relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-brand-coral/5 group-hover:bg-brand-coral/15 transition-colors"></div>
                <span className="text-4xl text-brand-coral/40 font-bold tracking-widest relative z-0">GIAO TIẾP</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors">Tiếng Trung Giao Tiếp</h3>
                <p className="text-gray-500 text-sm mb-5 line-clamp-2">Khóa học chuyên sâu khẩu ngữ, phản xạ tự nhiên trong đời sống.</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-brand-coral font-extrabold text-xl">599.000đ</span>
                </div>
              </div>
            </div>

            {/* Mẫu Card Khóa học 4 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-48 bg-brand-cream relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-brand-teal/10 group-hover:bg-brand-teal/20 transition-colors"></div>
                <div className="absolute top-4 left-4 bg-brand-earth text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                  Cơ bản
                </div>
                <span className="text-4xl text-brand-teal/50 font-bold tracking-widest relative z-0">NGỮ ÂM</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors">Nhập Môn Ngữ Âm</h3>
                <p className="text-gray-500 text-sm mb-5 line-clamp-2">Bước đầu tiên quan trọng nhất dành cho người mới bắt đầu.</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-brand-teal font-extrabold text-xl">Miễn phí</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
