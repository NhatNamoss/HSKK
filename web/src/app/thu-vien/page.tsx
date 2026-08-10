import Link from "next/link";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thư viện tài liệu - Hán Ngữ Natra",
  description: "Kho tài liệu học tiếng Trung, bộ đề thi HSK, từ vựng và ngữ pháp miễn phí.",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const { category: currentCategorySlug, q: searchQuery } = await searchParams;

  // Lấy danh sách danh mục
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // Tạo query filter
  const whereClause: any = {};
  if (currentCategorySlug) {
    const selectedCat = categories.find(c => c.slug === currentCategorySlug);
    if (selectedCat) {
      whereClause.categoryId = selectedCat.id;
    }
  }

  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  // Lấy danh sách tài liệu
  const documents = await prisma.document.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Thư Viện Tài Liệu</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tổng hợp các tài liệu học tiếng Trung từ cơ bản đến nâng cao, bộ đề thi HSK, giáo trình chuẩn.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Danh mục</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/thu-vien"
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      !currentCategorySlug ? "bg-brand-teal text-white font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-brand-teal"
                    }`}
                  >
                    Tất cả tài liệu
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      href={`/thu-vien?category=${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg transition-colors ${
                        currentCategorySlug === cat.slug ? "bg-brand-teal text-white font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-brand-teal"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="flex-1">
            
            {/* Search Bar */}
            <div className="mb-8">
              <form action="/thu-vien" method="GET" className="relative max-w-lg">
                {currentCategorySlug && <input type="hidden" name="category" value={currentCategorySlug} />}
                <input 
                  type="text" 
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Tìm kiếm tài liệu..." 
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent shadow-sm"
                />
                <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-brand-teal">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </form>
            </div>

            {/* Document Grid */}
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {/* Document icon placeholder */}
                      <svg className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-brand-teal">
                        {doc.fileType}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs text-brand-earth font-bold uppercase tracking-wider mb-2">
                        {doc.category.name}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                        {doc.description}
                      </p>
                      
                      <Link 
                        href={`/thu-vien/chi-tiet/${doc.id}`}
                        className="mt-auto block w-full text-center bg-gray-50 hover:bg-brand-coral hover:text-white text-gray-700 font-medium py-2.5 rounded-lg transition-colors border border-gray-200 hover:border-transparent"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy tài liệu nào</h3>
                <p className="mt-1 text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
