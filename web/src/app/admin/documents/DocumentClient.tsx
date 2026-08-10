"use client";

import { useState } from "react";
import { createDocument, deleteDocument } from "@/app/actions/document";

type DocumentProps = {
  id: string;
  title: string;
  fileType: string;
  filePath: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  };
};

type CategoryProps = {
  id: string;
  name: string;
};

export default function DocumentClient({ 
  initialDocuments, 
  categories 
}: { 
  initialDocuments: DocumentProps[];
  categories: CategoryProps[];
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      const res = await deleteDocument(id);
      if (res?.error) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          {showAddForm ? "Hủy" : "+ Thêm Tài Liệu"}
        </button>
      </div>

      {/* Form Thêm tài liệu */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thêm Tài Liệu Mới</h3>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài liệu *</label>
                <input name="title" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                <select name="categoryId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại file *</label>
                <select name="fileType" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal">
                  <option value="PDF">PDF</option>
                  <option value="DOCX">Word (DOCX)</option>
                  <option value="XLSX">Excel (XLSX)</option>
                  <option value="MP3">Audio (MP3)</option>
                  <option value="ZIP">File nén (ZIP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn file (URL) *</label>
                <input name="filePath" type="url" required placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal" />
                <p className="text-xs text-gray-500 mt-1">Lưu trữ trên Google Drive / Cloudflare R2 / S3 và dán link vào đây.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tài liệu</label>
              <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-coral text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Đang xử lý..." : "LƯU TÀI LIỆU"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách tài liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên tài liệu</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{doc.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs" title={doc.filePath}>{doc.filePath}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                      {doc.fileType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={doc.filePath} target="_blank" rel="noreferrer" className="text-brand-teal hover:text-brand-earth mr-4">
                      Xem
                    </a>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {initialDocuments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Chưa có tài liệu nào trong thư viện.
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
