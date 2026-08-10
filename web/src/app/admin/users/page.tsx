import prisma from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản lý Người dùng - Admin",
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { enrollments: true, orders: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <span className="bg-brand-teal/10 text-brand-teal font-bold text-sm px-3 py-1 rounded-full">
          {users.length} tài khoản
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khóa học</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold text-sm flex-shrink-0">
                        {(user.name || user.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name || "Chưa cập nhật"}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.role === 'ADMIN'
                        ? 'bg-brand-coral/10 text-brand-coral'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'ADMIN' ? '⚙ Admin' : '🎓 Học viên'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {user._count.enrollments} khóa học
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {user._count.orders} đơn hàng
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Chưa có người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
