"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createSection, createLesson, updateLesson, deleteLesson } from "@/app/actions/course";

type LessonProps = {
  id: string;
  title: string;
  lessonType: string;
  orderIndex: number;
  videoUrl?: string | null;
  quiz?: { id: string, title: string } | null;
};

type SectionProps = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonProps[];
};

type CourseProps = {
  id: string;
  title: string;
  sections: SectionProps[];
};

type QuizProps = {
  id: string;
  title: string;
  quizType: string;
};

export default function LessonClient({ course, quizzes }: { course: CourseProps, quizzes: QuizProps[] }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeLessonType, setActiveLessonType] = useState("VIDEO");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const handleCreateSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("courseId", course.id);
    
    const res = await createSection(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("courseId", course.id);
    if (activeSectionId) {
      formData.append("sectionId", activeSectionId);
    }

    const res = await createLesson(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
      setActiveSectionId(null);
      setActiveLessonType("VIDEO");
    }
    setLoading(false);
  };

  const handleUpdateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("courseId", course.id);

    const res = await updateLesson(formData);
    
    if (res?.error) {
      alert(res.error);
    } else {
      setEditingLessonId(null);
    }
    setLoading(false);
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài học này không?")) {
      const res = await deleteLesson(id, course.id);
      if (res?.error) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Cấu trúc Chương & Bài giảng */}
      <div className="lg:col-span-2 space-y-6">
        {course.sections.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-200">
            <p className="text-gray-500">Khóa học chưa có chương nào. Hãy tạo chương đầu tiên.</p>
          </div>
        ) : (
          course.sections.map((section, idx) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4 group transition-all hover:shadow-md">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-sm">Chương {idx + 1}</span>
                  {section.title}
                </h3>
                <button 
                  onClick={() => {
                    setActiveSectionId(activeSectionId === section.id ? null : section.id);
                    setActiveLessonType("VIDEO");
                  }}
                  className="text-sm font-medium text-brand-teal hover:text-brand-coral bg-white px-3 py-1.5 border border-gray-200 rounded-md shadow-sm"
                >
                  + Thêm bài học
                </button>
              </div>
              
              <div className="p-0">
                {section.lessons.length === 0 ? (
                  <p className="text-gray-500 italic p-6 text-sm">Chưa có bài học nào trong chương này.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {section.lessons.map((lesson, lIdx) => (
                      <React.Fragment key={lesson.id}>
                      <li className="p-4 px-6 flex items-start hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 mr-4 mt-1 w-24">
                          {lesson.lessonType === "VIDEO" && <span className="bg-brand-coral/10 text-brand-coral p-2 rounded-lg text-xs font-bold block">VIDEO</span>}
                          {lesson.lessonType === "PDF" && <span className="bg-brand-teal/10 text-brand-teal p-2 rounded-lg text-xs font-bold block">PDF</span>}
                          {lesson.lessonType === "QUIZ" && <span className="bg-brand-earth/10 text-brand-earth p-2 rounded-lg text-xs font-bold block">QUIZ</span>}
                          {lesson.lessonType === "FLASHCARDS" && <span className="bg-purple-500/10 text-purple-600 p-2 rounded-lg text-xs font-bold block">TỪ VỰNG</span>}
                          {lesson.lessonType === "SENTENCES" && <span className="bg-purple-500/10 text-purple-600 p-2 rounded-lg text-xs font-bold block">MẪU CÂU</span>}
                          {lesson.lessonType === "SITUATIONS" && <span className="bg-purple-500/10 text-purple-600 p-2 rounded-lg text-xs font-bold block">TÌNH HUỐNG</span>}
                          {lesson.lessonType === "DIALOGUES" && <span className="bg-purple-500/10 text-purple-600 p-2 rounded-lg text-xs font-bold block">HỘI THOẠI</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-base mb-1">
                            {lIdx + 1}. {lesson.title} 
                          </p>
                          {lesson.lessonType === "QUIZ" && lesson.quiz && (
                             <div className="mt-2">
                               <Link 
                                  href={`/admin/courses/${course.id}/lessons/${lesson.id}/editor`}
                                  className="inline-flex items-center px-4 py-2 bg-brand-teal/10 text-brand-teal text-xs font-bold rounded-lg hover:bg-brand-teal hover:text-white transition-all shadow-sm"
                               >
                                 <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                 Soạn thảo bài tập ({lesson.quiz.title})
                               </Link>
                             </div>
                          )}
                          {["FLASHCARDS", "SENTENCES", "SITUATIONS", "DIALOGUES"].includes(lesson.lessonType) && (
                             <div className="mt-2">
                               <Link 
                                  href={`/admin/courses/${course.id}/lessons/${lesson.id}/interactive-editor`}
                                  className="inline-flex items-center px-4 py-2 bg-purple-500/10 text-purple-600 text-xs font-bold rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                               >
                                 <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                 Soạn thảo nội dung tương tác
                               </Link>
                             </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button onClick={() => setEditingLessonId(lesson.id)} className="text-gray-400 hover:text-blue-500 text-xs font-bold bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors">Sửa</button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="text-gray-400 hover:text-red-500 text-xs font-bold bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded transition-colors">Xóa</button>
                        </div>
                      </li>
                      
                      {/* Form Edit Lesson Inline */}
                      {editingLessonId === lesson.id && (
                        <li className="bg-blue-50/50 p-6 border-b border-gray-100 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                          <h4 className="text-sm font-bold text-gray-800 mb-3">Chỉnh sửa bài học: {lesson.title}</h4>
                          <form onSubmit={handleUpdateLesson} className="space-y-4">
                            <input type="hidden" name="id" value={lesson.id} />
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Tên bài học</label>
                              <input name="title" type="text" required defaultValue={lesson.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                            </div>
                            
                            {["VIDEO", "PDF"].includes(lesson.lessonType) && (
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Đường dẫn Video / PDF</label>
                                <input name="videoUrl" type="text" defaultValue={lesson.videoUrl || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                              <button type="button" onClick={() => setEditingLessonId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg bg-gray-100 font-medium">Hủy</button>
                              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Lưu thay đổi</button>
                            </div>
                          </form>
                        </li>
                      )}
                    </React.Fragment>
                    ))}
                  </ul>
                )}
              </div>

              {/* Form thêm bài học nhanh */}
              {activeSectionId === section.id && (
                <div className="bg-brand-teal/5 p-6 border-t border-brand-teal/20">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Thêm bài học mới vào Chương {idx + 1}</h4>
                  <form onSubmit={handleCreateLesson} className="space-y-4">
                    <div>
                      <input name="title" type="text" required placeholder="Tên bài học..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        name="lessonType" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        value={activeLessonType}
                        onChange={(e) => setActiveLessonType(e.target.value)}
                      >
                        <option value="VIDEO">Video</option>
                        <option value="PDF">Tài liệu PDF</option>
                        <option value="QUIZ">Trắc nghiệm</option>
                        <option value="TEXT">Văn bản</option>
                        <option value="FLASHCARDS">Thẻ từ vựng</option>
                        <option value="SENTENCES">Mẫu câu thông dụng</option>
                        <option value="SITUATIONS">Tình huống thực tế</option>
                        <option value="DIALOGUES">Hội thoại mẫu</option>
                      </select>
                      
                      {activeLessonType === "QUIZ" ? (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          Hệ thống sẽ tự động tạo bài tập cho bài học này. Bạn có thể soạn thảo nội dung sau khi lưu.
                        </div>
                      ) : ["FLASHCARDS", "SENTENCES", "SITUATIONS", "DIALOGUES"].includes(activeLessonType) ? (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          Bạn có thể soạn thảo nội dung tương tác cho dạng bài này sau khi lưu.
                        </div>
                      ) : (
                        <input name="videoUrl" type="text" placeholder="URL Video/Tài liệu (Vimeo/S3...)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      )}
                    </div>
                    <div>
                      <textarea name="content" rows={2} placeholder="Ghi chú bài học..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setActiveSectionId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                      <button type="submit" disabled={loading} className="bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-bold">Lưu bài học</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Tạo Chương mới */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Tạo Chương Mới</h3>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal text-sm"
                placeholder="VD: Tuần 1 - Nhập môn"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang xử lý..." : "+ THÊM CHƯƠNG"}
            </button>
          </form>

          <div className="mt-8">
            <Link href="/admin/courses" className="text-brand-coral text-sm font-medium hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Quay lại danh sách khóa học
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
