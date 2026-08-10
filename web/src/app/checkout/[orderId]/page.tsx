import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh toán khóa học - Hán Ngữ Natra",
};

export default async function CheckoutPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: { 
      id: orderId,
      userId: session.user.id // Only allow the owner to see their order
    },
    include: {
      items: {
        include: {
          course: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  if (order.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-600 mb-6">Đơn hàng của bạn đã được duyệt. Bạn có thể bắt đầu học ngay bây giờ.</p>
          <Link href="/ca-nhan" className="block w-full py-3 bg-brand-teal text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors">
            VÀO KHU VỰC HỌC TẬP
          </Link>
        </div>
      </div>
    );
  }

  const course = order.items[0]?.course;
  if (!course) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Thanh toán khóa học</h1>
          <p className="text-gray-500 mt-2">Vui lòng hoàn tất thanh toán để nhận quyền truy cập khóa học.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cột thông tin khóa học */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin đơn hàng</h3>
            
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-teal flex items-center justify-center opacity-80">
                    <span className="text-white text-xs font-bold">NATRA</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 line-clamp-2">{course.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{course.level || "Tất cả trình độ"}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tài khoản mua:</span>
                <span className="font-medium text-gray-900">{session.user.email}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-100">
                <span className="text-gray-900">Tổng thanh toán:</span>
                <span className="text-brand-coral">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                </span>
              </div>
            </div>

            <div className="bg-brand-teal/10 p-4 rounded-xl text-brand-teal flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <p className="text-sm font-medium">Khóa học sẽ được tự động kích hoạt sau khi Admin duyệt giao dịch chuyển khoản thành công (Thường mất 5-15 phút).</p>
            </div>
          </div>

          {/* Cột hướng dẫn thanh toán */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-brand-teal/20 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-teal/5 rounded-full blur-3xl"></div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-6 relative">Chuyển khoản ngân hàng</h3>
            
            <div className="flex justify-center mb-8 relative">
              <div className="w-48 h-48 bg-gray-100 p-2 rounded-xl shadow-inner border border-gray-200">
                {/* Generate VietQR link based on order info. For demo, we use a placeholder QR */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChuyenKhoan-${order.id}`} 
                  alt="QR Code" 
                  className="w-full h-full object-contain mix-blend-multiply" 
                />
              </div>
            </div>

            <div className="space-y-4 relative">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Ngân hàng</p>
                <p className="font-bold text-gray-900">Vietcombank</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Số tài khoản</p>
                  <p className="font-bold text-brand-teal text-lg">0123456789</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Nội dung chuyển khoản</p>
                  <p className="font-bold text-brand-coral">{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            
            <div className="mt-8 text-center relative">
              <Link href="/ca-nhan" className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                TÔI ĐÃ CHUYỂN KHOẢN
              </Link>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
