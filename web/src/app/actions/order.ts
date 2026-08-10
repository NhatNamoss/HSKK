"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function enrollFreeCourse(courseId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Bạn cần đăng nhập để đăng ký khóa học." };
    }

    const userId = session.user.id;

    // Kiểm tra xem khóa học có miễn phí không
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return { error: "Không tìm thấy khóa học." };
    }

    if (course.price > 0) {
      return { error: "Đây là khóa học trả phí. Vui lòng thanh toán để tham gia." };
    }

    // Kiểm tra đã đăng ký chưa
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return { success: true, message: "Bạn đã đăng ký khóa học này rồi." };
    }

    // Tính ngày hết hạn nếu có
    let expiresAt = null;
    if (course.validityPeriod && course.validityPeriod > 0) {
      const date = new Date();
      date.setDate(date.getDate() + course.validityPeriod);
      expiresAt = date;
    }

    // Tạo enrollment
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
        expiresAt
      }
    });

    revalidatePath(`/khoa-hoc/${course.slug}`);
    revalidatePath("/ca-nhan");
    return { success: true };
  } catch (error) {
    console.error("Error enrolling free course:", error);
    return { error: "Đã xảy ra lỗi hệ thống." };
  }
}

export async function createOrder(courseId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Bạn cần đăng nhập để mua khóa học." };
    }

    const userId = session.user.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return { error: "Không tìm thấy khóa học." };
    }

    // Kiểm tra xem đã đăng ký chưa
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return { error: "Bạn đã sở hữu khóa học này rồi." };
    }

    // Kiểm tra xem có đơn hàng nào đang chờ thanh toán cho khóa này không
    const pendingOrder = await prisma.orderItem.findFirst({
      where: {
        courseId,
        order: {
          userId,
          status: "PENDING"
        }
      },
      include: {
        order: true
      }
    });

    if (pendingOrder) {
      return { 
        success: true, 
        orderId: pendingOrder.order.id, 
        message: "Bạn đã có đơn hàng đang chờ thanh toán cho khóa học này." 
      };
    }

    // Tạo order mới
    const newOrder = await prisma.order.create({
      data: {
        userId,
        total: course.price,
        status: "PENDING",
        paymentMethod: "BANK_TRANSFER",
        items: {
          create: {
            courseId,
            price: course.price
          }
        }
      }
    });

    revalidatePath("/ca-nhan");
    return { success: true, orderId: newOrder.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: "Đã xảy ra lỗi khi tạo đơn hàng." };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return { error: "Không có quyền thực hiện." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { course: true } } }
    });

    if (!order) return { error: "Không tìm thấy đơn hàng." };

    // Cập nhật trạng thái
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    // Nếu chuyển sang COMPLETED, cấp quyền học (tạo Enrollment)
    if (status === "COMPLETED" && order.status !== "COMPLETED") {
      for (const item of order.items) {
        // Kiểm tra đã có enrollment chưa
        const existing = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: item.courseId
            }
          }
        });

        if (!existing) {
          let expiresAt = null;
          if (item.course.validityPeriod && item.course.validityPeriod > 0) {
            const date = new Date();
            date.setDate(date.getDate() + item.course.validityPeriod);
            expiresAt = date;
          }

          await prisma.enrollment.create({
            data: {
              userId: order.userId,
              courseId: item.courseId,
              progress: 0,
              expiresAt
            }
          });
        }
      }
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Đã xảy ra lỗi hệ thống." };
  }
}
