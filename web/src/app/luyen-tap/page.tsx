import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện Tập Kỹ Năng - Học tiếng cùng cô Mỹ - Hán ngữ Natra",
  description: "Hệ thống bài luyện tập tương tác 6 kỹ năng: Từ vựng, Mẫu câu, Tình huống, Hội thoại, Trò chơi, Viết - Dịch.",
};

export default async function PracticeListingPage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const { level } = await searchParams;

  const whereCondition: any = { status: "published" };
  if (level) whereCondition.level = level;

  const practices = await prisma.practice.findMany({
    where: whereCondition,
    include: {
      category: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#6A5ACD] mb-4">Phòng Luyện Tập Tương Tác</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống bài tập 6 trong 1 giúp bạn ghi nhớ từ vựng, phản xạ mẫu câu và ứng dụng vào thực tế nhanh nhất.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-8 items-center justify-center">
          <Link
            href="/luyen-tap"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!level ? 'bg-[#6A5ACD] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tất cả
          </Link>
          <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
          {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map(hsk => (
            <Link
              key={hsk}
              href={`/luyen-tap?level=${hsk}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${level === hsk ? 'bg-[#6A5ACD] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {hsk}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practices.map((practice) => (
            <div key={practice.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700">
                    🎯 Luyện tập 6 kỹ năng
                  </span>
                  {practice.level && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {practice.level}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#6A5ACD] transition-colors line-clamp-2">
                  {practice.title}
                </h3>
                
                {practice.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {practice.description}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap text-[10px] uppercase font-bold text-gray-500 mt-4">
                  <span className="px-2 py-1 bg-gray-100 rounded">Từ vựng</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Mẫu câu</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Tình huống</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Hội thoại</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Trò chơi</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Viết & Dịch</span>
                </div>
              </div>
              
              <div className="p-4 border-t border-purple-50 bg-purple-50/30">
                <Link
                  href={`/luyen-tap/${practice.slug}`}
                  className="block w-full py-2.5 bg-white border-2 border-[#6A5ACD] text-[#6A5ACD] font-bold rounded-xl text-center hover:bg-[#6A5ACD] hover:text-white transition-colors"
                >
                  VÀO HỌC NGAY →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {practices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🏜️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài luyện tập nào</h3>
            <p className="text-gray-500">Thầy cô đang chuẩn bị nội dung cho phần này, bạn quay lại sau nhé.</p>
            <Link href="/" className="mt-6 inline-block bg-[#6A5ACD] text-white font-bold px-6 py-2.5 rounded-xl">Về trang chủ</Link>
          </div>
        )}

      </div>
    </div>
  );
}
