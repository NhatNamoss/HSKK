"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteQuiz, publishQuiz } from "@/app/actions/quiz";

type QuizProps = {
  id: string;
  title: string;
  level: string | null;
  quizType: string;
  status: string;
  createdAt: Date;
  category: { name: string } | null;
  _count: { questions: number; attempts: number };
};

export default function QuizListClient({ quizzes }: { quizzes: QuizProps[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.level && q.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string, attempts: number) => {
    if (attempts > 0) {
      if (!confirm(`Bài kiểm tra này đã có ${attempts} lượt làm. Nếu xóa, toàn bộ kết quả của học viên sẽ bị xóa theo. Bạn có chắc chắn muốn xóa không?`)) {
        return;
      }
    } else {
      if (!confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;
    }

    setLoadingId(id);
    const res = await deleteQuiz(id);
    if (res?.error) alert(res.error);
    setLoadingId(null);
  };

  const handlePublishToggle = async (id: string) => {
    setLoadingId(id);
    const res = await publishQuiz(id);
    if (res?.error) alert(res.error);
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <input
          type="text"
          placeholder="Tìm kiếm bài kiểm tra..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-teal focus:border-brand-teal w-full max-w-sm"
        />
        <div className="text-sm text-gray-500">
          Hiển thị <span className="font-bold">{filtered.length}</span> kết quả
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên bài kiểm tra</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Loại / Cấp độ</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Câu hỏi</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{quiz.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Tạo: {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                    {quiz.category && ` • ${quiz.category.name}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{quiz.quizType === "MOCK_EXAM" ? "Thi thử" : "Luyện tập"}</div>
                  <div className="text-xs text-gray-500 mt-1">{quiz.level || "Tất cả"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Link href={`/admin/quizzes/${quiz.id}/questions`} className="inline-flex items-center justify-center px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full font-bold text-xs hover:bg-brand-teal/20 transition-colors">
                    {quiz._count.questions} câu
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handlePublishToggle(quiz.id)}
                    disabled={loadingId === quiz.id || (quiz.status === "draft" && quiz._count.questions === 0)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      quiz.status === "published"
                        ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                        : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
                    } ${(loadingId === quiz.id || (quiz.status === "draft" && quiz._count.questions === 0)) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    title={quiz.status === "draft" && quiz._count.questions === 0 ? "Cần ít nhất 1 câu hỏi để xuất bản" : "Click để đổi trạng thái"}
                  >
                    {quiz.status === "published" ? "✓ Đã xuất bản" : "Bản nháp"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3 items-center">
                    <Link
                      href={`/admin/quizzes/${quiz.id}/edit`}
                      className="text-gray-500 hover:text-brand-teal transition-colors"
                      title="Sửa thông tin"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <Link
                      href={`/admin/quizzes/${quiz.id}/questions`}
                      className="text-gray-500 hover:text-brand-teal transition-colors"
                      title="Quản lý câu hỏi"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id, quiz._count.attempts)}
                      disabled={loadingId === quiz.id}
                      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Chưa có bài kiểm tra nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
