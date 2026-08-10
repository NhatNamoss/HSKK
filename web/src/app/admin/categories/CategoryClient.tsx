"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/app/actions/category";

type CategoryProps = {
  id: string;
  name: string;
  slug: string;
  _count: {
    documents: number;
  };
};

export default function CategoryClient({ initialCategories }: { initialCategories: CategoryProps[] }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createCategory(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, docCount: number) => {
    if (docCount > 0) {
      alert("Không thể xóa danh mục đang có tài liệu. Vui lòng chuyển hoặc xóa tài liệu trước.");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const res = await deleteCategory(id);
      if (res?.error) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Form Tạo danh mục mới */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm Danh Mục Mới</h3>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal text-sm"
              placeholder="VD: HSK 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (Đường dẫn)
            </label>
            <input
              name="slug"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal text-sm"
              placeholder="VD: hsk-5"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang thêm..." : "THÊM DANH MỤC"}
          </button>
        </form>
      </div>

      {/* Danh sách danh mục */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Số tài liệu
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{cat.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    {cat.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs font-bold">
                      {cat._count.documents}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(cat.id, cat._count.documents)}
                      className="text-red-500 hover:text-red-700 ml-4 transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {initialCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Chưa có danh mục nào.
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
