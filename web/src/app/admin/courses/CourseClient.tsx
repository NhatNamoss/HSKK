"use client";

import { useState } from "react";
import Link from "next/link";
import { createCourse, deleteCourse } from "@/app/actions/course";

type CourseProps = {
  id: string;
  title: string;
  slug: string;
  price: number;
  level: string | null;
  status: string;
  _count: {
    enrollments: number;
    sections: number;
  };
};

export default function CourseClient({ initialCourses }: { initialCourses: CourseProps[] }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createCourse(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
      setShowAddForm(false);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      if (!confirm(`Khóa học này đang có ${count} học viên. Bạn có chắc chắn muốn xóa không?`)) {
        return;
      }
    } else {
      if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
        return;
      }
    }
    
    const res = await deleteCourse(id);
    if (res?.error) {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          {showAddForm ? "Hủy" : "+ Tạo Khóa Học Mới"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Khởi tạo khóa học</h3>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học *</label>
                <input name="title" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Đường dẫn tĩnh) *</label>
                <input name="slug" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal" placeholder="vd: hsk-1-toan-dien" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                <select name="level" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal">
                  <option value="HSK 1">HSK 1</option>
                  <option value="HSK 2">HSK 2</option>
                  <option value="HSK 3">HSK 3</option>
                  <option value="HSK 4">HSK 4</option>
                  <option value="HSK 5">HSK 5</option>
                  <option value="HSK 6">HSK 6</option>
                  <option value="HSKK">HSKK</option>
                  <option value="Giao tiếp">Giao tiếp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                <input name="price" type="number" required defaultValue={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn gọn</label>
              <textarea name="description" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-coral text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Đang xử lý..." : "TẠO KHÓA HỌC"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên khóa học</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trình độ</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giá bán</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học viên</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.slug} • {course._count.sections} Chương</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-earth/10 text-brand-earth">
                      {course.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-coral">
                    {course.price === 0 ? "Miễn phí" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                    {course._count.enrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/courses/${course.id}/lessons`} className="text-brand-teal hover:text-brand-earth mr-4 font-bold">
                      Quản lý nội dung
                    </Link>
                    <button 
                      onClick={() => handleDelete(course.id, course._count.enrollments)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {initialCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Chưa có khóa học nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
