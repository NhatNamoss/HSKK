"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/category";

type CategoryProps = {
  id: string;
  name: string;
  slug: string;
  _count: { documents: number };
};

export default function CategoryClient({ initialCategories }: { initialCategories: CategoryProps[] }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<CategoryProps | null>(null);

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

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCat) return;
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateCategory(editCat.id, formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setEditCat(null);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, docCount: number) => {
    if (docCount > 0) {
      alert(`Không thể xóa danh mục đang có ${docCount} tài liệu. Vui lòng chuyển hoặc xóa tài liệu trước.`);
      return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const res = await deleteCategory(id);
      if (res?.error) alert(res.error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Edit Modal */}
      {editCat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa danh mục</h3>
              <button onClick={() => { setEditCat(null); setError(""); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editCat.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (đường dẫn) *</label>
                <input
                  name="slug"
                  type="text"
                  required
                  defaultValue={editCat.slug}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Chỉ dùng chữ thường, số và dấu gạch ngang.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setEditCat(null); setError(""); }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Đang cập nhật..." : "CẬP NHẬT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form tạo mới */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm Danh Mục Mới</h3>

        {error && !editCat && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
              placeholder="VD: HSK 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (đường dẫn)</label>
            <input
              name="slug"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
              placeholder="VD: hsk-5"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal text-white py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? "Đang thêm..." : "THÊM DANH MỤC"}
          </button>
        </form>
      </div>

      {/* Danh sách danh mục */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Danh sách danh mục ({initialCategories.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Số TL</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {initialCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{cat.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {cat.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      cat._count.documents > 0 ? "bg-brand-teal/10 text-brand-teal" : "bg-gray-100 text-gray-500"
                    }`}>
                      {cat._count.documents} tài liệu
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => { setEditCat(cat); setError(""); }}
                      className="text-brand-earth hover:text-brand-coral font-medium mr-4 transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat._count.documents)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {initialCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
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
