"use client";

import { useState, useEffect } from "react";
import { createQuestion, updateQuestion } from "@/app/actions/quiz";

type ChoiceProps = {
  id?: string;
  content: string;
  isCorrect: boolean;
  matchGroup: string | null;
  orderIndex: number;
};

type QuestionFormProps = {
  quizId: string;
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
  nextOrderIndex: number;
};

export default function QuestionForm({
  quizId,
  initialData,
  onSuccess,
  onCancel,
  nextOrderIndex,
}: QuestionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questionType, setQuestionType] = useState(initialData?.questionType || "MULTIPLE_CHOICE");
  const [question, setQuestion] = useState(initialData?.question || "");
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [points, setPoints] = useState<number>(initialData?.points || 1);

  // Dynamic choices state based on type
  const [mcqChoices, setMcqChoices] = useState<{content: string, isCorrect: boolean}[]>(
    initialData && (initialData.questionType === "MULTIPLE_CHOICE" || initialData.questionType === "TONE_RECOGNITION")
      ? initialData.choices
      : [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
        ]
  );

  const [fibAnswers, setFibAnswers] = useState<string[]>(
    initialData && initialData.questionType === "FILL_IN_BLANK"
      ? initialData.choices.map((c: any) => c.content)
      : [""]
  );

  const [matchPairs, setMatchPairs] = useState<{left: string, right: string}[]>(
    initialData && initialData.questionType === "MATCHING"
      ? (() => {
          const pairs = [];
          const lefts = initialData.choices.filter((c: any) => c.matchGroup === "left");
          for (const l of lefts) {
            const r = initialData.choices.find((c: any) => c.matchGroup === "right" && c.orderIndex === l.orderIndex);
            if (r) pairs.push({ left: l.content, right: r.content });
          }
          return pairs.length > 0 ? pairs : [{ left: "", right: "" }, { left: "", right: "" }];
        })()
      : [{ left: "", right: "" }, { left: "", right: "" }]
  );

  const [wordOrderWords, setWordOrderWords] = useState<string[]>(
    initialData && initialData.questionType === "WORD_ORDER"
      ? initialData.choices.sort((a:any,b:any) => a.orderIndex - b.orderIndex).map((c: any) => c.content)
      : ["", "", ""]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!question.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      setLoading(false);
      return;
    }

    let choicesToSubmit: ChoiceProps[] = [];

    if (questionType === "MULTIPLE_CHOICE" || questionType === "TONE_RECOGNITION") {
      const validChoices = mcqChoices.filter(c => c.content.trim() !== "");
      if (validChoices.length < 2) {
        setError("Cần ít nhất 2 đáp án.");
        setLoading(false);
        return;
      }
      if (!validChoices.some(c => c.isCorrect)) {
        setError("Vui lòng chọn 1 đáp án đúng.");
        setLoading(false);
        return;
      }
      choicesToSubmit = validChoices.map((c, i) => ({
        content: c.content,
        isCorrect: c.isCorrect,
        matchGroup: null,
        orderIndex: i,
      }));
    } else if (questionType === "FILL_IN_BLANK") {
      const validAnswers = fibAnswers.filter(a => a.trim() !== "");
      if (validAnswers.length === 0) {
        setError("Cần ít nhất 1 đáp án được chấp nhận.");
        setLoading(false);
        return;
      }
      choicesToSubmit = validAnswers.map((a, i) => ({
        content: a,
        isCorrect: true,
        matchGroup: null,
        orderIndex: i,
      }));
    } else if (questionType === "MATCHING") {
      const validPairs = matchPairs.filter(p => p.left.trim() !== "" && p.right.trim() !== "");
      if (validPairs.length < 2) {
        setError("Cần ít nhất 2 cặp nối.");
        setLoading(false);
        return;
      }
      validPairs.forEach((p, i) => {
        choicesToSubmit.push({ content: p.left, isCorrect: true, matchGroup: "left", orderIndex: i });
        choicesToSubmit.push({ content: p.right, isCorrect: true, matchGroup: "right", orderIndex: i });
      });
    } else if (questionType === "WORD_ORDER") {
      const validWords = wordOrderWords.filter(w => w.trim() !== "");
      if (validWords.length < 2) {
        setError("Cần ít nhất 2 từ để sắp xếp.");
        setLoading(false);
        return;
      }
      choicesToSubmit = validWords.map((w, i) => ({
        content: w,
        isCorrect: true,
        matchGroup: null,
        orderIndex: i,
      }));
    }

    const payload = {
      quizId,
      questionType,
      question,
      explanation,
      audioUrl,
      imageUrl,
      points,
      orderIndex: initialData ? initialData.orderIndex : nextOrderIndex,
      choices: choicesToSubmit,
    } as any;

    let res;
    if (initialData) {
      res = await updateQuestion(initialData.id, payload);
    } else {
      res = await createQuestion(payload);
    }

    if (res.error) {
      setError(res.error);
    } else {
      onSuccess({ id: initialData?.id || (res as any).id, ...payload });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            disabled={!!initialData} // Không cho đổi loại khi sửa
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm disabled:bg-gray-100"
          >
            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
            <option value="FILL_IN_BLANK">Điền từ vào chỗ trống</option>
            <option value="MATCHING">Nối đôi</option>
            <option value="WORD_ORDER">Sắp xếp câu</option>
            <option value="TONE_RECOGNITION">Nhận biết thanh điệu</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
          <input
            type="number"
            min="1"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi *</label>
        {questionType === "FILL_IN_BLANK" && (
          <p className="text-xs text-gray-500 mb-1">Sử dụng `___` (3 dấu gạch dưới) để tạo chỗ trống. VD: Hôm nay thời tiết rất ___.</p>
        )}
        <textarea
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
          placeholder="Nhập nội dung câu hỏi..."
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-bold text-gray-900 mb-3">Đáp án / Lựa chọn</label>
        
        {(questionType === "MULTIPLE_CHOICE" || questionType === "TONE_RECOGNITION") && (
          <div className="space-y-3">
            {mcqChoices.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={c.isCorrect}
                  onChange={() => setMcqChoices(mcqChoices.map((mc, i) => ({ ...mc, isCorrect: i === idx })))}
                  className="w-4 h-4 text-brand-teal focus:ring-brand-teal"
                />
                <input
                  type="text"
                  value={c.content}
                  onChange={(e) => setMcqChoices(mcqChoices.map((mc, i) => (i === idx ? { ...mc, content: e.target.value } : mc)))}
                  placeholder={`Lựa chọn ${idx + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <button
                  type="button"
                  onClick={() => setMcqChoices(mcqChoices.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMcqChoices([...mcqChoices, { content: "", isCorrect: false }])}
              className="text-sm text-brand-teal font-medium hover:underline"
            >
              + Thêm lựa chọn
            </button>
          </div>
        )}

        {questionType === "FILL_IN_BLANK" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 mb-2">Nhập đáp án cho từng ô trống theo đúng thứ tự xuất hiện trong câu. (Dùng dấu phẩy `,` nếu có nhiều đáp án chấp nhận được cho 1 ô).</p>
            {fibAnswers.map((ans, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={ans}
                  onChange={(e) => setFibAnswers(fibAnswers.map((a, i) => (i === idx ? e.target.value : a)))}
                  placeholder={`Đáp án ô trống thứ ${idx + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <button
                  type="button"
                  onClick={() => setFibAnswers(fibAnswers.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFibAnswers([...fibAnswers, ""])}
              className="text-sm text-brand-teal font-medium hover:underline"
            >
              + Thêm đáp án cho ô trống tiếp theo
            </button>
          </div>
        )}

        {questionType === "MATCHING" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 mb-1">
              <div>Cột trái (VD: Hán tự)</div>
              <div>Cột phải (VD: Pinyin / Nghĩa)</div>
            </div>
            {matchPairs.map((pair, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => setMatchPairs(matchPairs.map((p, i) => (i === idx ? { ...p, left: e.target.value } : p)))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <span className="text-gray-400">↔</span>
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => setMatchPairs(matchPairs.map((p, i) => (i === idx ? { ...p, right: e.target.value } : p)))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <button
                  type="button"
                  onClick={() => setMatchPairs(matchPairs.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMatchPairs([...matchPairs, { left: "", right: "" }])}
              className="text-sm text-brand-teal font-medium hover:underline"
            >
              + Thêm cặp
            </button>
          </div>
        )}

        {questionType === "WORD_ORDER" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 mb-2">Nhập các từ theo thứ tự đúng. Hệ thống sẽ tự xáo trộn khi hiển thị cho học viên.</p>
            {wordOrderWords.map((word, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-bold w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWordOrderWords(wordOrderWords.map((w, i) => (i === idx ? e.target.value : w)))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <button
                  type="button"
                  onClick={() => setWordOrderWords(wordOrderWords.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setWordOrderWords([...wordOrderWords, ""])}
              className="text-sm text-brand-teal font-medium hover:underline"
            >
              + Thêm từ
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL (Tùy chọn)</label>
          <input
            type="url"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
            placeholder="Link mp3..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh minh họa (Tùy chọn)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
            placeholder="Link ảnh..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích (Tùy chọn)</label>
        <textarea
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal text-sm"
          placeholder="Giải thích đáp án đúng sau khi làm..."
        />
        {questionType === "WORD_ORDER" && (
           <p className="text-xs text-gray-500 mt-1">Gợi ý: Nhập câu hoàn chỉnh vào đây để học viên đối chiếu.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Đang lưu..." : "Lưu câu hỏi"}
        </button>
      </div>
    </form>
  );
}
