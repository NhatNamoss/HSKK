"use client";

import { useState } from "react";
import { markLessonComplete } from "@/app/actions/progress";

export default function LessonCompleteButton({ 
  lessonId, 
  courseSlug,
  isCompleted: initialCompleted 
}: { 
  lessonId: string; 
  courseSlug: string;
  isCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const handleMark = async () => {
    if (completed) return;
    setLoading(true);
    const res = await markLessonComplete(lessonId, courseSlug);
    setLoading(false);
    if (res?.success) {
      setCompleted(true);
    } else if (res?.error) {
      alert(res.error);
    }
  };

  return (
    <button
      onClick={handleMark}
      disabled={loading || completed}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
        completed
          ? 'bg-green-500/20 text-green-400 cursor-default'
          : loading
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-brand-teal text-white hover:bg-brand-teal/90 hover:-translate-y-0.5 shadow-lg hover:shadow-brand-teal/30'
      }`}
    >
      {completed ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Đã hoàn thành!
        </>
      ) : loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Đang lưu...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Đánh dấu hoàn thành
        </>
      )}
    </button>
  );
}
