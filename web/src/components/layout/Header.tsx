"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/thu-vien', label: 'Thư viện' },
    { href: '/khoa-hoc', label: 'Khóa học' },
    { href: '/bai-viet', label: 'Bài viết' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="bg-brand-cream border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl md:text-2xl font-bold text-brand-coral tracking-tight">
              Hán Ngữ Natra
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-teal bg-brand-teal/10'
                    : 'text-gray-700 hover:text-brand-teal hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {status === "loading" ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm text-brand-teal font-bold border border-brand-teal/30 px-3 py-1.5 rounded-lg hover:bg-brand-teal/10 transition-colors">
                    ⚙ Admin
                  </Link>
                )}
                <Link href="/ca-nhan" className="text-sm font-medium text-gray-700 hover:text-brand-teal transition-colors border border-gray-200 px-3 py-1.5 rounded-lg hover:border-brand-teal/30">
                  👤 {session.user.name?.split(' ').pop() || 'Cá nhân'}
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-700 font-medium text-sm hover:text-brand-teal transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" className="bg-brand-coral text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-opacity-90 shadow-sm transition-all hover:shadow">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Hamburger */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Mở menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-teal bg-brand-teal/10'
                    : 'text-gray-700 hover:text-brand-teal hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-2 border-t border-gray-100 mt-2">
              {session ? (
                <>
                  <Link href="/ca-nhan" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50">
                    👤 Tài khoản cá nhân
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-brand-teal font-bold rounded-xl hover:bg-brand-teal/10">
                      ⚙ Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }}
                    className="w-full text-left px-4 py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                    Đăng nhập
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 bg-brand-coral text-white rounded-xl font-medium hover:bg-opacity-90">
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
