import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản cá nhân - Hán Ngữ Natra",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/ca-nhan");

  const userId = session.user.id;

  const [enrollments, orders, attempts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { sections: true } }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    }),
    prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { course: { select: { title: true, slug: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.quizAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: { quiz: { select: { id: true, title: true, quizType: true } } },
      orderBy: { finishedAt: 'desc' },
      take: 10
    })
  ]);

  const completedOrders = orders.filter((o: any) => o.status === "COMPLETED").length;
  const pendingOrders = orders.filter((o: any) => o.status === "PENDING").length;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header card */}
        <div className="bg-gradient-to-r from-brand-teal to-brand-teal/80 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-extrabold">
              {(session.user.name || session.user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{session.user.name || "Học viên"}</h1>
              <p className="text-white/70 text-sm mt-0.5">{session.user.email}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-extrabold">{enrollments.length}</div>
              <div className="text-xs text-white/70 mt-0.5">Khóa học</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold">{completedOrders}</div>
              <div className="text-xs text-white/70 mt-0.5">Giao dịch thành công</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold">{pendingOrders}</div>
              <div className="text-xs text-white/70 mt-0.5">Chờ duyệt</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Khóa học của tôi */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-brand-coral" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                Khóa học của tôi
              </h2>

              {enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.map((enr: any) => {
                    const progressPct = Math.round(enr.progress || 0);
                    return (
                      <div key={enr.id} className="border border-gray-100 rounded-xl p-5 hover:border-brand-teal/30 transition-colors group">
                        <div className="flex gap-4 items-start">
                          <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {enr.course.thumbnail ? (
                              <img src={enr.course.thumbnail} alt={enr.course.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-teal to-brand-earth flex items-center justify-center">
                                <span className="text-white text-xs font-bold opacity-50">NATRA</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-brand-teal transition-colors">
                              {enr.course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">{enr.course._count.sections} chương</p>
                            
                            {/* Progress bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Tiến độ học</span>
                                <span className="font-bold text-brand-teal">{progressPct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${progressPct === 100 ? 'bg-green-500' : 'bg-brand-teal'}`}
                                  style={{ width: `${progressPct}%` }}
                                ></div>
                              </div>
                              {progressPct === 100 && (
                                <p className="text-xs text-green-600 font-bold mt-1">✅ Đã hoàn thành!</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Đăng ký: {new Date(enr.enrolledAt).toLocaleDateString('vi-VN')}
                            {enr.expiresAt && ` • Hết hạn: ${new Date(enr.expiresAt).toLocaleDateString('vi-VN')}`}
                          </span>
                          <Link 
                            href={`/hoc/${enr.course.slug}`}
                            className="text-sm font-bold text-white bg-brand-teal px-4 py-1.5 rounded-lg hover:bg-opacity-90 transition-colors"
                          >
                            {progressPct === 0 ? 'Bắt đầu học' : progressPct === 100 ? 'Xem lại' : 'Tiếp tục học'} →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-14 bg-gray-50 rounded-xl border border-gray-100">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào.</p>
                  <Link href="/khoa-hoc" className="inline-block bg-brand-coral text-white font-bold px-6 py-2.5 rounded-xl hover:bg-opacity-90 transition-colors">
                    Khám phá khóa học
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Lịch sử đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-brand-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Lịch sử thanh toán
              </h2>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">
                          {order.items[0]?.course?.title || "Khóa học"}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          order.status === "COMPLETED" ? 'bg-green-100 text-green-700' :
                          order.status === "PENDING" ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status === "COMPLETED" ? "✅ Đã duyệt" : order.status === "PENDING" ? "⏳ Chờ duyệt" : "❌ Đã hủy"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="font-bold text-brand-coral text-sm">
                          {new Intl.NumberFormat('vi-VN').format(order.total)}đ
                        </span>
                      </div>
                      {order.status === "PENDING" && (
                        <Link href={`/checkout/${order.id}`} className="mt-2 block text-center text-xs text-brand-teal font-bold py-1.5 bg-brand-teal/10 rounded-lg hover:bg-brand-teal/20 transition-colors">
                          Xem hướng dẫn thanh toán →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p>Chưa có giao dịch nào.</p>
                  <Link href="/khoa-hoc" className="mt-3 inline-block text-brand-teal font-medium hover:underline text-xs">
                    Mua khóa học ngay →
                  </Link>
                </div>
              )}
            </div>

            {/* Lịch sử làm bài */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Lịch sử luyện tập
              </h2>

              {attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.map((attempt: any) => (
                    <div key={attempt.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">
                          {attempt.quiz.title}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          (attempt.score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                          (attempt.score || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {attempt.score}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{new Date(attempt.finishedAt!).toLocaleDateString('vi-VN')}</span>
                        <Link href={`/luyen-tap/${attempt.quiz.id}/ket-qua/${attempt.id}`} className="text-brand-teal font-medium hover:underline">
                          Xem chi tiết →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p>Chưa có lịch sử làm bài.</p>
                  <Link href="/luyen-tap" className="mt-3 inline-block text-brand-teal font-medium hover:underline text-xs">
                    Vào luyện tập ngay →
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
