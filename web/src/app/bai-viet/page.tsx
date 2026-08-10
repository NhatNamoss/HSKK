import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bài viết - Kiến thức tiếng Trung | Hán Ngữ Natra",
  description: "Cẩm nang học tiếng Trung, mẹo làm bài thi HSK, ngữ pháp và từ vựng thú vị từ Hán Ngữ Natra.",
};

const samplePosts = [
  {
    id: "1",
    title: "5 Bí quyết học phiên âm Pinyin nhanh nhất cho người mới bắt đầu",
    summary: "Pinyin là nền tảng của tiếng Trung. Nắm vững phiên âm ngay từ đầu sẽ giúp bạn tránh được rất nhiều khó khăn về sau.",
    category: "Ngữ âm",
    readTime: 5,
    date: "2024-08-01",
    emoji: "🎯",
  },
  {
    id: "2",
    title: "Phân biệt HSK và HSKK: Bạn nên thi chứng chỉ nào?",
    summary: "HSK và HSKK là hai chứng chỉ quan trọng nhất dành cho người học tiếng Trung. Bài viết này giúp bạn hiểu rõ sự khác biệt và đưa ra lựa chọn phù hợp.",
    category: "Luyện thi",
    readTime: 8,
    date: "2024-07-25",
    emoji: "📝",
  },
  {
    id: "3",
    title: "100 Từ vựng HSK 1 bắt buộc phải thuộc - Kèm ví dụ thực tế",
    summary: "Danh sách từ vựng HSK 1 được tổng hợp có hệ thống, kèm cách dùng trong câu giúp bạn ghi nhớ lâu hơn.",
    category: "Từ vựng",
    readTime: 12,
    date: "2024-07-18",
    emoji: "📚",
  },
  {
    id: "4",
    title: "Cách dùng 了 (le) trong tiếng Trung - Đừng học vẹt!",
    summary: "Trợ từ ngữ khí 了 là một trong những điểm ngữ pháp phức tạp và thường gây nhầm lẫn nhất. Hãy hiểu bản chất thay vì học thuộc.",
    category: "Ngữ pháp",
    readTime: 10,
    date: "2024-07-10",
    emoji: "🧩",
  },
  {
    id: "5",
    title: "Mẹo học chữ Hán: Hiểu bộ thủ để nhớ hàng nghìn chữ cùng lúc",
    summary: "Hơn 80% chữ Hán được cấu thành từ các bộ thủ. Học bộ thủ trước sẽ giúp bạn đoán được nghĩa và cách đọc của hàng nghìn chữ mới.",
    category: "Chữ Hán",
    readTime: 7,
    date: "2024-07-03",
    emoji: "✍️",
  },
  {
    id: "6",
    title: "Kinh nghiệm thi đỗ HSK 4 trong 6 tháng tự học",
    summary: "Chia sẻ lộ trình học tập chi tiết, nguồn tài liệu và cách ôn thi hiệu quả giúp một học viên của Hán Ngữ Natra đạt HSK 4 chỉ sau 6 tháng.",
    category: "Kinh nghiệm",
    readTime: 15,
    date: "2024-06-28",
    emoji: "🏆",
  },
];

const categoryColors: Record<string, string> = {
  "Ngữ âm": "bg-brand-teal/10 text-brand-teal",
  "Luyện thi": "bg-brand-coral/10 text-brand-coral",
  "Từ vựng": "bg-brand-earth/10 text-brand-earth",
  "Ngữ pháp": "bg-purple-100 text-purple-700",
  "Chữ Hán": "bg-blue-100 text-blue-700",
  "Kinh nghiệm": "bg-green-100 text-green-700",
};

export default function BlogPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Kiến thức tiếng Trung
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chia sẻ kiến thức, mẹo học và kinh nghiệm thực chiến từ đội ngũ giáo viên Hán Ngữ Natra.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {["Tất cả", "Ngữ âm", "Từ vựng", "Ngữ pháp", "Luyện thi", "Chữ Hán", "Kinh nghiệm"].map(cat => (
            <span key={cat} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 cursor-pointer hover:border-brand-teal hover:text-brand-teal transition-colors">
              {cat}
            </span>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {samplePosts.map(post => (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              {/* Thumbnail placeholder */}
              <div className="h-44 bg-gradient-to-br from-brand-cream to-gray-100 flex items-center justify-center text-6xl border-b border-gray-50">
                {post.emoji}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime} phút đọc</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-teal transition-colors line-clamp-2 flex-1">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-5 line-clamp-2">{post.summary}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span className="text-xs text-gray-400">
                    {new Date(post.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  <Link href={`/bai-viet/${post.id}`} className="text-sm font-bold text-brand-teal hover:text-brand-coral transition-colors flex items-center gap-1">
                    Đọc thêm <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-16 bg-gradient-to-r from-brand-teal/10 to-brand-earth/10 rounded-2xl p-8 text-center border border-brand-teal/20">
          <p className="text-brand-teal font-bold text-lg mb-2">✍️ Nội dung đang được cập nhật!</p>
          <p className="text-gray-600">Đội ngũ biên soạn đang tích cực viết thêm nội dung mới. Theo dõi Fanpage để không bỏ lỡ bài đăng mới nhất.</p>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="inline-block mt-4 bg-brand-teal text-white font-bold px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-colors">
            Theo dõi Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
