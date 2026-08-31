"use client";

import { useState } from "react";
import { createPractice, deletePractice, updatePractice } from "@/app/actions/practice";
import Link from "next/link";
import { generateSlug } from "@/lib/utils";

export default function PracticeClient({ initialPractices, categories }: { initialPractices: any[], categories: any[] }) {
  const [practices, setPractices] = useState(initialPractices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("draft");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setLevel("");
    setStatus("draft");
    setCategoryId("");
    setError("");
    setEditingPractice(null);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (practice: any) => {
    setEditingPractice(practice);
    setTitle(practice.title);
    setSlug(practice.slug);
    setDescription(practice.description || "");
    setLevel(practice.level || "");
    setStatus(practice.status);
    setCategoryId(practice.categoryId || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!editingPractice) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const data = { title, slug, description, level, status, categoryId };
    
    if (editingPractice) {
      const res = await updatePractice(editingPractice.id, data);
      if (res.success) {
        setPractices(practices.map(p => p.id === editingPractice.id ? { ...p, ...data, category: categories.find(c => c.id === categoryId) } : p));
        setIsModalOpen(false);
      } else {
        setError(res.error || "Lỗi cập nhật");
      }
    } else {
      const res = await createPractice(data);
      if (res.success) {
        setPractices([res.practice, ...practices]);
        setIsModalOpen(false);
      } else {
        setError(res.error || "Lỗi tạo mới");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài luyện tập này? Hành động này không thể hoàn tác.")) {
      setIsDeleting(id);
      const res = await deletePractice(id);
      if (res.success) {
        setPractices(practices.filter(p => p.id !== id));
      } else {
        alert(res.error || "Lỗi xóa bài luyện tập");
      }
      setIsDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button onClick={openNewModal} className="bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 font-medium">
          + Thêm Bài Luyện Tập
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp độ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {practices.map((practice) => (
              <tr key={practice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{practice.title}</div>
                  <div className="text-sm text-gray-500">{practice.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    practice.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {practice.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {practice.level || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/admin/practices/${practice.id}/editor`}
                    className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-md mr-3"
                  >
                    Biên tập Nội Dung (6 Kỹ Năng)
                  </Link>
                  <button
                    onClick={() => openEditModal(practice)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Sửa thông tin
                  </button>
                  <button
                    onClick={() => handleDelete(practice.id)}
                    disabled={isDeleting === practice.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {isDeleting === practice.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </td>
              </tr>
            ))}
            {practices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Chưa có bài luyện tập nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPractice ? 'Sửa thông tin bài luyện tập' : 'Thêm bài luyện tập mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Slug)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                  rows={3}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                  >
                    <option value="">Không yêu cầu</option>
                    <option value="HSK 1">HSK 1</option>
                    <option value="HSK 2">HSK 2</option>
                    <option value="HSK 3">HSK 3</option>
                    <option value="HSK 4">HSK 4</option>
                    <option value="HSK 5">HSK 5</option>
                    <option value="HSK 6">HSK 6</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-opacity-90 font-medium"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
