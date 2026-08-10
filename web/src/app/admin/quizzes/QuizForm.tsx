"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuiz, updateQuiz } from "@/app/actions/quiz";

type CategoryProps = {
  id: string;
  name: string;
};

type QuizFormProps = {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    level: string | null;
    quizType: string;
    timeLimit: number | null;
    categoryId: string | null;
  };
  categories: CategoryProps[];
};

export default function QuizForm({ initialData, categories }: QuizFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    let res;
    if (isEdit) {
      res = await updateQuiz(initialData.id, formData);
    } else {
      res = await createQuiz(formData);
    }

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Chuyển hướng về trang danh sách hoặc quản lý câu hỏi
      router.push("/admin/quizzes");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề bài kiểm tra *
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={initialData?.title}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
            placeholder="VD: Kiểm tra HSK 1 Bài 1-5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại bài
          </label>
          <select
            name="quizType"
            defaultValue={initialData?.quizType || "EXERCISE"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
          >
            <option value="EXERCISE">Luyện tập (Exercise)</option>
            <option value="MOCK_EXAM">Thi thử (Mock Exam)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cấp độ
          </label>
          <select
            name="level"
            defaultValue={initialData?.level || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
          >
            <option value="">-- Không chọn --</option>
            <option value="HSK 1">HSK 1</option>
            <option value="HSK 2">HSK 2</option>
            <option value="HSK 3">HSK 3</option>
            <option value="HSK 4">HSK 4</option>
            <option value="HSK 5">HSK 5</option>
            <option value="HSK 6">HSK 6</option>
            <option value="HSKK Sơ cấp">HSKK Sơ cấp</option>
            <option value="HSKK Trung cấp">HSKK Trung cấp</option>
            <option value="HSKK Cao cấp">HSKK Cao cấp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục (Tùy chọn)
          </label>
          <select
            name="categoryId"
            defaultValue={initialData?.categoryId || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
          >
            <option value="">-- Không chọn --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới hạn thời gian (Phút)
          </label>
          <input
            type="number"
            name="timeLimit"
            min="1"
            defaultValue={initialData?.timeLimit || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
            placeholder="Để trống nếu không giới hạn"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả ngắn
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData?.description || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
            placeholder="Mô tả nội dung bài kiểm tra..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-teal text-white rounded-xl font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bài kiểm tra"}
        </button>
      </div>
    </form>
  );
}
