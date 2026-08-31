"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return <div className="flex items-center justify-center min-h-screen">Đang tải dữ liệu...</div>;
  }

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Quản lý Tài liệu", path: "/admin/documents", icon: "📚" },
    { name: "Danh mục & Thẻ", path: "/admin/categories", icon: "🏷️" },
    { name: "Quản lý Khóa học", path: "/admin/courses", icon: "🎓" },
    { name: "Bài Luyện Tập", path: "/admin/practices", icon: "🎯" },
    { name: "Đề thi thử", path: "/admin/quizzes", icon: "📝" },
    { name: "Người dùng", path: "/admin/users", icon: "👥" },
    { name: "Đơn hàng", path: "/admin/orders", icon: "🛒" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-brand-coral">
            Học tiếng cùng cô Mỹ - Hán ngữ Natra <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded ml-1">ADMIN</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-brand-teal/10 text-brand-teal font-bold" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <Link href="/" className="text-xs text-brand-coral hover:underline">Quay lại website</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.path === pathname)?.name || "Bảng điều khiển"}
          </h1>
          <div>
            {/* User profile dropdown space */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
