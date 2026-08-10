import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Hán Ngữ Natra",
};

export default async function AdminDashboard() {
  // Lấy số liệu thật từ DB
  const [totalUsers, totalCourses, totalDocuments, totalOrders, pendingOrders, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.course.count({ where: { status: "published" } }),
    prisma.document.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { course: { select: { title: true } } } }
      }
    })
  ]);

  // Tổng doanh thu
  const revenueResult = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { total: true }
  });
  const totalRevenue = revenueResult._sum.total || 0;

  // Khóa học bán chạy
  const topCourses = await prisma.course.findMany({
    take: 5,
    orderBy: { enrollments: { _count: 'desc' } },
    include: {
      _count: { select: { enrollments: true } }
    }
  });

  const maxEnrollments = topCourses[0]?._count.enrollments || 1;

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Tổng học viên</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers.toLocaleString('vi-VN')}</p>
            </div>
            <div className="w-12 h-12 bg-brand-teal/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
          </div>
          <Link href="/admin/users" className="text-brand-teal text-xs font-medium mt-3 block hover:underline">Xem danh sách →</Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Khóa học đang mở</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-brand-coral/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
          </div>
          <Link href="/admin/courses" className="text-brand-coral text-xs font-medium mt-3 block hover:underline">Quản lý khóa học →</Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Tài liệu thư viện</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalDocuments}</p>
            </div>
            <div className="w-12 h-12 bg-brand-earth/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
          </div>
          <Link href="/admin/documents" className="text-brand-earth text-xs font-medium mt-3 block hover:underline">Quản lý tài liệu →</Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-brand-coral mt-2">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          {pendingOrders > 0 && (
            <Link href="/admin/orders" className="text-yellow-600 text-xs font-medium mt-3 block hover:underline">
              ⚠ {pendingOrders} đơn đang chờ duyệt →
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Giao dịch gần đây */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-900">Giao dịch gần đây</h3>
            <Link href="/admin/orders" className="text-sm text-brand-teal font-medium hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Chưa có giao dịch nào.</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      <span className="font-bold">{order.user.name || order.user.email}</span>
                      {" "}<span className="text-gray-500 font-normal">mua</span>{" "}
                      <span className="text-brand-teal">{order.items[0]?.course?.title || "Khóa học"}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                      {order.status === "PENDING" && <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold">Chờ duyệt</span>}
                      {order.status === "COMPLETED" && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold">Đã duyệt</span>}
                    </p>
                  </div>
                  <span className="text-brand-coral font-bold text-sm">
                    +{new Intl.NumberFormat('vi-VN').format(order.total)}đ
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Khóa học bán chạy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-900">Khóa học nhiều học viên nhất</h3>
            <Link href="/admin/courses" className="text-sm text-brand-teal font-medium hover:underline">Quản lý</Link>
          </div>
          <div className="space-y-5">
            {topCourses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Chưa có khóa học nào được đăng ký.</p>
            ) : (
              topCourses.map((course, idx) => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    idx === 0 ? 'bg-brand-teal/10 text-brand-teal' :
                    idx === 1 ? 'bg-brand-earth/10 text-brand-earth' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{course.title}</h4>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${idx === 0 ? 'bg-brand-teal' : idx === 1 ? 'bg-brand-earth' : 'bg-gray-400'}`}
                        style={{ width: `${(course._count.enrollments / maxEnrollments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 font-bold text-gray-500 text-sm flex-shrink-0">
                    {course._count.enrollments} HV
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/courses" className="inline-flex items-center px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-lg font-medium text-sm hover:bg-brand-teal hover:text-white transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Thêm khóa học
          </Link>
          <Link href="/admin/documents" className="inline-flex items-center px-4 py-2 bg-brand-earth/10 text-brand-earth rounded-lg font-medium text-sm hover:bg-brand-earth hover:text-white transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Tải tài liệu lên
          </Link>
          <Link href="/admin/orders" className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-medium text-sm hover:bg-yellow-100 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Duyệt đơn hàng {pendingOrders > 0 && <span className="ml-1 bg-yellow-200 text-yellow-800 text-xs font-bold px-1.5 rounded-full">{pendingOrders}</span>}
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            Quản lý danh mục
          </Link>
        </div>
      </div>
    </div>
  );
}
