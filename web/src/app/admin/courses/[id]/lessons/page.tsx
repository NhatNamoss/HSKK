import prisma from "@/lib/prisma";
import LessonClient from "./LessonClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Bài giảng - Admin",
};

export default async function CourseLessonsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cấu trúc khóa học</h2>
          <p className="text-gray-500 mt-1">Khóa học: <span className="font-bold text-brand-coral">{course.title}</span></p>
        </div>
      </div>

      <LessonClient course={course} />
    </div>
  );
}
