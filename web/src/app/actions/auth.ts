"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email này đã được sử dụng" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Default role is USER (student)
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user", error);
    return { error: "Đã xảy ra lỗi khi tạo tài khoản" };
  }
}
