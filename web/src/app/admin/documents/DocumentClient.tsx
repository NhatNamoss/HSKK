"use client";

import { useState } from "react";
import { createDocument, updateDocument, deleteDocument } from "@/app/actions/document";

type DocumentProps = {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  filePath: string;
  coverImage: string | null;
  createdAt: Date;
  category: { id: string; name: string };
};

type CategoryProps = { id: string; name: string };

const ITEMS_PER_PAGE = 10;

export default function DocumentClient({
  initialDocuments,
  categories,
}: {
  initialDocuments: DocumentProps[];
  categories: CategoryProps[];
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editDoc, setEditDoc] = useState<DocumentProps | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc + phân trang
  const filtered = initialDocuments.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createDocument(formData);
    if (res?.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
      setShowAddForm(false);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDoc) return;
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateDocument(editDoc.id, formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setEditDoc(null);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      const res = await deleteDocument(id);
      if (res?.error) alert(res.error);
    }
  };

  const DocumentForm = ({
    defaultValues,
    onSubmit,
    submitLabel,
  }: {
    defaultValues?: DocumentProps | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên tài liệu *
          </label>
          <input
            name="title"
            type="text"
            required
            defaultValue={defaultValues?.title || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục *
          </label>
          <select
            name="categoryId"
            required
            defaultValue={defaultValues?.category.id || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại file *
          </label>
          <select
            name="fileType"
            required
            defaultValue={defaultValues?.fileType || "PDF"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
          >
            <option value="PDF">PDF</option>
            <option value="DOCX">Word (DOCX)</option>
            <option value="XLSX">Excel (XLSX)</option>
            <option value="MP3">Audio (MP3)</option>
            <option value="ZIP">File nén (ZIP)</option>
            <option value="VIDEO">Video (MP4)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link file (URL) *
          </label>
          <input
            name="filePath"
            type="url"
            required
            defaultValue={defaultValues?.filePath || ""}
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lưu trữ trên Google Drive / S3 rồi dán link vào đây.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh bìa (URL - tùy chọn)
          </label>
          <input
            name="coverImage"
            type="url"
            defaultValue={defaultValues?.coverImage || ""}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả tài liệu
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description || ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-sm"
        ></textarea>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setShowAddForm(false);
            setEditDoc(null);
            setError("");
          }}
          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand-coral text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? "Đang xử lý..." : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Modal Edit */}
      {editDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Chỉnh sửa tài liệu
              </h3>
              <button
                onClick={() => setEditDoc(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <DocumentForm
                defaultValues={editDoc}
                onSubmit={handleUpdate}
                submitLabel="CẬP NHẬT TÀI LIỆU"
              />
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-teal focus:border-brand-teal w-full sm:w-72"
        />
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditDoc(null); setError(""); }}
          className="bg-brand-teal text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm whitespace-nowrap"
        >
          {showAddForm ? "Hủy" : "+ Thêm Tài Liệu"}
        </button>
      </div>

      {/* Form Thêm mới */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-teal/20">
          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Thêm Tài Liệu Mới
          </h3>
          <DocumentForm
            onSubmit={handleCreate}
            submitLabel="LƯU TÀI LIỆU"
          />
        </div>
      )}

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-bold text-gray-800">{paginated.length}</span> / {filtered.length} tài liệu
            {searchQuery && ` (lọc từ "${searchQuery}")`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên tài liệu</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginated.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 line-clamp-1">{doc.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs" title={doc.filePath}>
                      {doc.filePath}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-teal/10 text-brand-teal">
                      {doc.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      doc.fileType === "PDF" ? "bg-red-100 text-red-700" :
                      doc.fileType === "MP3" || doc.fileType === "VIDEO" ? "bg-purple-100 text-purple-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {doc.fileType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-teal hover:underline text-xs font-medium"
                      >
                        Xem
                      </a>
                      <button
                        onClick={() => { setEditDoc(doc); setShowAddForm(false); setError(""); }}
                        className="text-brand-earth hover:text-brand-coral text-xs font-medium transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400">
                    {searchQuery ? `Không tìm thấy tài liệu nào với từ khóa "${searchQuery}".` : "Chưa có tài liệu nào."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-brand-teal text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
