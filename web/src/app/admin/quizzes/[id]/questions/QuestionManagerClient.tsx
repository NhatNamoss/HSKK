"use client";

import { useState } from "react";
import { deleteQuestion, reorderQuestion } from "@/app/actions/quiz";
import QuestionForm from "./QuestionForm";

type ChoiceProps = {
  id: string;
  content: string;
  isCorrect: boolean;
  matchGroup: string | null;
  orderIndex: number;
};

type QuestionProps = {
  id: string;
  questionType: string;
  question: string;
  explanation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  orderIndex: number;
  points: number;
  choices: ChoiceProps[];
};

export default function QuestionManagerClient({
  quizId,
  initialQuestions,
}: {
  quizId: string;
  initialQuestions: QuestionProps[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuestionProps | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    setLoadingId(id);
    const res = await deleteQuestion(id, quizId);
    if (res?.error) alert(res.error);
    else setQuestions((prev) => prev.filter((q) => q.id !== id));
    setLoadingId(null);
  };

  const moveQuestion = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= questions.length) return;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index + direction];
    newQuestions[index + direction] = temp;

    setQuestions(newQuestions);

    // Update in DB (simple approach: just update the moved ones)
    await reorderQuestion(newQuestions[index].id, quizId, index);
    await reorderQuestion(newQuestions[index + direction].id, quizId, index + direction);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE": return "Trắc nghiệm";
      case "FILL_IN_BLANK": return "Điền từ";
      case "MATCHING": return "Nối đôi";
      case "WORD_ORDER": return "Sắp xếp câu";
      case "TONE_RECOGNITION": return "Nhận biết thanh điệu";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Forms (Modals) */}
      {(showAddForm || editQuestion) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 relative">
            <button
              onClick={() => { setShowAddForm(false); setEditQuestion(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
              </h3>
              <QuestionForm
                quizId={quizId}
                initialData={editQuestion}
                onSuccess={(newQ) => {
                  if (editQuestion) {
                    setQuestions(questions.map((q) => (q.id === newQ.id ? newQ : q)));
                  } else {
                    setQuestions([...questions, newQ]);
                  }
                  setShowAddForm(false);
                  setEditQuestion(null);
                }}
                onCancel={() => { setShowAddForm(false); setEditQuestion(null); }}
                nextOrderIndex={questions.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">
          Tổng số: <span className="font-bold text-gray-900">{questions.length}</span> câu hỏi
          (Tổng điểm: {questions.reduce((sum, q) => sum + q.points, 0)})
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-brand-teal text-white px-5 py-2.5 rounded-xl font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Thêm câu hỏi
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
            Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <button
                  onClick={() => moveQuestion(idx, -1)}
                  disabled={idx === 0}
                  className="hover:text-brand-teal disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <span className="font-bold text-gray-900 text-lg">{idx + 1}</span>
                <button
                  onClick={() => moveQuestion(idx, 1)}
                  disabled={idx === questions.length - 1}
                  className="hover:text-brand-teal disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <div className="flex-1 min-w-0 border-l border-gray-100 pl-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-600 mb-2">
                      {getQuestionTypeLabel(q.questionType)} • {q.points} điểm
                    </span>
                    <div className="text-gray-900 font-medium whitespace-pre-wrap">{q.question}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditQuestion(q)}
                      disabled={loadingId === q.id}
                      className="text-gray-400 hover:text-brand-teal transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={loadingId === q.id}
                      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                {q.choices && q.choices.length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
                    {q.questionType === "MULTIPLE_CHOICE" || q.questionType === "TONE_RECOGNITION" ? (
                      <ul className="space-y-1">
                        {q.choices.map((c, i) => (
                          <li key={i} className={`flex items-center gap-2 ${c.isCorrect ? "text-green-600 font-bold" : "text-gray-600"}`}>
                            {c.isCorrect ? "✓" : "○"} {c.content}
                          </li>
                        ))}
                      </ul>
                    ) : q.questionType === "MATCHING" ? (
                      <div className="grid grid-cols-2 gap-2">
                        {q.choices.filter(c => c.matchGroup === "left").map(c => {
                          const right = q.choices.find(r => r.matchGroup === "right" && r.orderIndex === c.orderIndex);
                          return (
                            <div key={c.id} className="bg-white border border-gray-200 p-2 rounded flex items-center justify-between col-span-2 sm:col-span-1">
                              <span>{c.content}</span>
                              <span className="text-gray-400">↔</span>
                              <span>{right?.content}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : q.questionType === "WORD_ORDER" ? (
                      <div className="flex flex-wrap gap-2">
                        {q.choices.sort((a,b) => a.orderIndex - b.orderIndex).map((c, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded">{c.content}</span>
                        ))}
                        <div className="w-full text-xs text-gray-500 mt-1">Câu hoàn chỉnh: {q.explanation}</div>
                      </div>
                    ) : (
                      // FILL IN BLANK
                      <div className="text-gray-600">
                        Đáp án đúng: {q.choices.map(c => <span key={c.id} className="font-bold text-green-600 mr-2 bg-green-50 px-1 rounded">{c.content}</span>)}
                      </div>
                    )}
                  </div>
                )}
                
                {(q.audioUrl || q.imageUrl) && (
                   <div className="mt-3 flex gap-4 text-xs text-brand-teal">
                      {q.audioUrl && <span>🎵 Có âm thanh</span>}
                      {q.imageUrl && <span>🖼️ Có hình ảnh</span>}
                   </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
