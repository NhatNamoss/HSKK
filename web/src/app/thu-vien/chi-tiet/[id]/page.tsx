import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return { title: "Không tìm thấy tài liệu" };
  return {
    title: `${document.title} - Thư Viện Học tiếng cùng cô Mỹ - Hán ngữ Natra`,
    description: document.description || "Tài liệu học tiếng Trung miễn phí từ Học tiếng cùng cô Mỹ - Hán ngữ Natra.",
  };
}

// Kiểm tra link có phải PDF trực tiếp không
function isDirectPdfUrl(url: string) {
  return url.toLowerCase().includes(".pdf") && !url.includes("drive.google.com");
}

// Chuyển Google Drive link sang embed
function getEmbedUrl(url: string, fileType: string) {
  if (fileType === "PDF") {
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (isDirectPdfUrl(url)) {
      return url;
    }
  }
  return null;
}

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!document) notFound();

  // Lấy tài liệu liên quan (cùng danh mục)
  const relatedDocs = await prisma.document.findMany({
    where: { categoryId: document.categoryId, NOT: { id: document.id } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  const embedUrl = getEmbedUrl(document.filePath, document.fileType);
  const canPreview = !!embedUrl;

  const fileTypeConfig: Record<string, { color: string; label: string; icon: string }> = {
    PDF: { color: "bg-red-100 text-red-700", label: "PDF Document", icon: "📄" },
    DOCX: { color: "bg-blue-100 text-blue-700", label: "Word Document", icon: "📝" },
    XLSX: { color: "bg-green-100 text-green-700", label: "Excel Spreadsheet", icon: "📊" },
    MP3: { color: "bg-purple-100 text-purple-700", label: "Audio File", icon: "🎵" },
    ZIP: { color: "bg-gray-100 text-gray-700", label: "Archive File", icon: "🗜️" },
    VIDEO: { color: "bg-pink-100 text-pink-700", label: "Video File", icon: "🎬" },
  };

  const typeConfig = fileTypeConfig[document.fileType] || { color: "bg-gray-100 text-gray-700", label: document.fileType, icon: "📄" };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li><Link href="/" className="text-gray-500 hover:text-brand-teal transition-colors">Trang chủ</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><Link href="/thu-vien" className="text-gray-500 hover:text-brand-teal transition-colors">Thư viện</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><Link href={`/thu-vien?category=${document.category.slug}`} className="text-gray-500 hover:text-brand-teal transition-colors">{document.category.name}</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li className="text-gray-800 font-medium line-clamp-1">{document.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main: Document info + Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-4xl flex-shrink-0">{typeConfig.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                      <span className="text-xs text-gray-400 bg-brand-earth/10 text-brand-earth px-2.5 py-1 rounded-full font-medium">
                        {document.category.name}
                      </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                      {document.title}
                    </h1>
                  </div>
                </div>

                {document.description && (
                  <div className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {document.description}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={document.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-brand-coral hover:bg-opacity-90 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    TẢI XUỐNG TÀI LIỆU
                  </a>

                  {canPreview && (
                    <a
                      href={document.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Mở trong tab mới
                    </a>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  🔓 Tài liệu này được cung cấp miễn phí bởi Học tiếng cùng cô Mỹ - Hán ngữ Natra.
                </p>
              </div>
            </div>

            {/* PDF Preview */}
            {canPreview && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Xem trước tài liệu</h2>
                  <span className="text-xs text-gray-400">Nhấn mũi tên để xem toàn màn hình</span>
                </div>
                <div className="relative" style={{ height: "600px" }}>
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay"
                    title={`Xem trước: ${document.title}`}
                  ></iframe>
                </div>
              </div>
            )}

            {!canPreview && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="text-5xl mb-3">{typeConfig.icon}</div>
                <p className="text-gray-500 font-medium mb-1">Không hỗ trợ xem trước định dạng {document.fileType}</p>
                <p className="text-gray-400 text-sm">Bấm "Tải xuống" để xem tài liệu này trên thiết bị của bạn.</p>
              </div>
            )}
          </div>

          {/* Sidebar: Tài liệu liên quan */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-earth" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                Tài liệu cùng danh mục
              </h2>
              {relatedDocs.length > 0 ? (
                <ul className="space-y-3">
                  {relatedDocs.map(doc => (
                    <li key={doc.id}>
                      <Link
                        href={`/thu-vien/chi-tiet/${doc.id}`}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-2xl flex-shrink-0">
                          {fileTypeConfig[doc.fileType]?.icon || "📄"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-brand-teal transition-colors line-clamp-2">
                            {doc.title}
                          </p>
                          <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${fileTypeConfig[doc.fileType]?.color || "bg-gray-100 text-gray-600"}`}>
                            {doc.fileType}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Không có tài liệu liên quan.</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/thu-vien?category=${document.category.slug}`}
                  className="block text-center text-sm font-bold text-brand-teal hover:text-brand-coral transition-colors"
                >
                  Xem tất cả tài liệu {document.category.name} →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
