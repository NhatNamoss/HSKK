import prisma from "@/lib/prisma";
import OrderClient from "./OrderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Đơn hàng - Admin",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { email: true, name: true }
      },
      items: {
        include: {
          course: {
            select: { title: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng & Giao dịch</h2>
      </div>

      <OrderClient initialOrders={orders} />
    </div>
  );
}
