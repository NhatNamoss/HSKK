import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản cá nhân - Hán Ngữ Natra",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Lấy danh sách khóa học đã đăng ký
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: {
            select: { sections: true }
          }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  });

  // Lấy lịch sử đơn hàng
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          course: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Khu vực học tập cá nhân</h1>
          <p className="text-gray-500 mt-2">Xin chào, <span className="font-bold text-brand-teal">{session.user.name || session.user.email}</span>!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột chính: Khóa học của tôi */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-brand-coral" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                Khóa học của bạn
              </h2>
              
              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map(enr => (
                    <div key={enr.id} className="border border-gray-200 rounded-xl overflow-hidden group hover:border-brand-teal transition-colors flex flex-col">
                      <div className="h-32 bg-gray-100 relative">
                        {enr.course.thumbnail ? (
                          <img src={enr.course.thumbnail} alt={enr.course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-teal to-brand-earth opacity-80 flex items-center justify-center">
                            <span className="text-white font-bold opacity-30">NATRA</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{enr.course.title}</h3>
                        <p className="text-xs text-gray-500 mb-4">{enr.course._count.sections} Chương</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <Link href={`/hoc/${enr.course.slug}`} className="block text-center w-full bg-gray-50 text-brand-teal font-bold py-2 rounded-lg hover:bg-brand-teal hover:text-white transition-colors">
                            TIẾP TỤC HỌC
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào.</p>
                  <Link href="/khoa-hoc" className="inline-block bg-brand-coral text-white font-bold px-6 py-2.5 rounded-xl hover:bg-opacity-90">
                    Khám phá khóa học
                  </Link>
                </div>
              )}
            </div>

          </div>
          
          {/* Cột phụ: Lịch sử đơn hàng */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-brand-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                Lịch sử thanh toán
              </h2>
              
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                            #{order.id.slice(-6)}
                          </p>
                          <p className="font-bold text-gray-900 text-sm line-clamp-1">
                            {order.items[0]?.course?.title || "Khóa học"}
                          </p>
                        </div>
                        {order.status === "COMPLETED" && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Đã duyệt</span>
                        )}
                        {order.status === "PENDING" && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">Chờ duyệt</span>
                        )}
                        {order.status === "CANCELLED" && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Đã hủy</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="font-bold text-brand-coral">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                        </span>
                      </div>
                      
                      {order.status === "PENDING" && (
                        <div className="mt-3">
                          <Link href={`/checkout/${order.id}`} className="block w-full text-center text-xs text-brand-teal font-bold py-2 bg-brand-teal/10 rounded-lg hover:bg-brand-teal/20 transition-colors">
                            XEM HƯỚNG DẪN THANH TOÁN
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Chưa có giao dịch nào.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
