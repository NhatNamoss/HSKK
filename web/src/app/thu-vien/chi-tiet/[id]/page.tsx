import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return { title: "Không tìm thấy tài liệu" };
  }

  return {
    title: `${document.title} - Thư Viện Hán Ngữ Natra`,
    description: document.description || "Tài liệu học tiếng Trung miễn phí.",
  };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-500 hover:text-brand-teal transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/thu-vien" className="text-gray-500 hover:text-brand-teal transition-colors">
                  Thư viện
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href={`/thu-vien?category=${document.category.slug}`} className="text-gray-500 hover:text-brand-teal transition-colors">
                  {document.category.name}
                </Link>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:flex">
            {/* Left/Top: Preview Graphic */}
            <div className="md:w-1/3 bg-brand-teal/5 flex flex-col items-center justify-center p-12 border-b md:border-b-0 md:border-r border-gray-100">
              <svg className="w-32 h-32 text-brand-teal/40 mb-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div className="bg-white px-4 py-2 rounded-lg font-bold text-gray-700 shadow-sm border border-gray-100 text-sm flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Định dạng: {document.fileType}
              </div>
            </div>

            {/* Right/Bottom: Content */}
            <div className="md:w-2/3 p-8 md:p-12">
              <div className="inline-block px-3 py-1 bg-brand-earth/10 text-brand-earth text-sm font-bold uppercase tracking-wider rounded-full mb-4">
                {document.category.name}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {document.title}
              </h1>
              
              <div className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
                {document.description}
              </div>

              <div className="pt-8 border-t border-gray-100">
                <a 
                  href={document.filePath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-brand-coral hover:bg-opacity-90 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  TẢI XUỐNG TÀI LIỆU
                </a>
                <p className="text-xs text-gray-400 mt-3 text-center md:text-left">
                  Tài liệu này được cung cấp miễn phí bởi Hán Ngữ Natra.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
