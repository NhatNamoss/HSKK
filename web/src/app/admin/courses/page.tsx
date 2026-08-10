import prisma from "@/lib/prisma";
import CourseClient from "./CourseClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Khóa học - Admin",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { enrollments: true, sections: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Khóa học</h2>
      </div>

      <CourseClient initialCourses={courses} />
    </div>
  );
}
