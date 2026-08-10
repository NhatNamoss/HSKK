"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/order";

type OrderItemProps = {
  id: string;
  price: number;
  course: {
    title: string;
  };
};

type OrderProps = {
  id: string;
  total: number;
  status: string;
  paymentMethod: string | null;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
  };
  items: OrderItemProps[];
};

export default function OrderClient({ initialOrders }: { initialOrders: OrderProps[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === "COMPLETED") {
      if (!confirm("Xác nhận đã nhận được tiền và cấp quyền học viên cho đơn hàng này?")) {
        return;
      }
    } else if (newStatus === "CANCELLED") {
      if (!confirm("Chắc chắn muốn hủy đơn hàng này?")) {
        return;
      }
    }

    setLoadingId(orderId);
    const res = await updateOrderStatus(orderId, newStatus);
    setLoadingId(null);

    if (res?.error) {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã / Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khóa học / Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-gray-900 uppercase">#{order.id.slice(-6)}</div>
                  <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{order.user.name || "Học viên"}</div>
                  <div className="text-xs text-gray-500">{order.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium line-clamp-1">{order.items[0]?.course.title}</div>
                  <div className="font-bold text-brand-coral">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.status === "COMPLETED" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      Đã duyệt (Thành công)
                    </span>
                  )}
                  {order.status === "PENDING" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                      Chờ chuyển khoản
                    </span>
                  )}
                  {order.status === "CANCELLED" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      Đã hủy
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleStatusChange(order.id, "COMPLETED")}
                        disabled={loadingId === order.id}
                        className="bg-brand-teal text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {loadingId === order.id ? "Đang xử lý..." : "Duyệt Đơn & Cấp Quyền"}
                      </button>
                      <button 
                        onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        disabled={loadingId === order.id}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-100 disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {initialOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
