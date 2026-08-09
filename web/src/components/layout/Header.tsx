"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-brand-cream border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-brand-coral">
              Hán Ngữ Natra
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/thu-vien" className="text-gray-700 hover:text-brand-teal font-medium transition-colors">
              Thư viện
            </Link>
            <Link href="/khoa-hoc" className="text-gray-700 hover:text-brand-teal font-medium transition-colors">
              Khóa học
            </Link>
            <Link href="/bai-viet" className="text-gray-700 hover:text-brand-teal font-medium transition-colors">
              Bài viết
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Chào, {session.user.name || session.user.email}
                </span>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm text-brand-teal font-bold hover:underline">
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => signOut()}
                  className="bg-white text-gray-700 border border-gray-300 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-brand-teal text-white px-5 py-2 rounded-full font-medium hover:bg-opacity-90 shadow-sm transition-all hover:shadow">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
