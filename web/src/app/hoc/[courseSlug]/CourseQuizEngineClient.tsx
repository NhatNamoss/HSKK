"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { startAttempt, submitAttempt } from "@/app/actions/attempt";

type SafeQuestion = {
  id: string;
  questionType: string;
  question: string;
  audioUrl: string | null;
  imageUrl: string | null;
  points: number;
  choices: { id: string; content: string; matchGroup: string | null; orderIndex: number }[];
};

export default function CourseQuizEngineClient({ quiz, pastAttempt }: { quiz: any, pastAttempt?: any }) {
  const router = useRouter();
  
  // Nếu đã làm bài xong, hiển thị kết quả
  if (pastAttempt && pastAttempt.status === "COMPLETED") {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl border border-gray-800 m-8 text-center min-h-[400px]">
        <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(45,212,191,0.2)] 
          ${pastAttempt.score >= 50 ? 'border-brand-teal text-brand-teal' : 'border-red-500 text-red-500'}"
        >
          <span className="text-3xl font-extrabold">{pastAttempt.score}%</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Kết quả làm bài</h2>
        <p className="text-gray-400 mb-6 text-lg">
          Bạn đạt được <strong className="text-white">{pastAttempt.earnedPoints}</strong> / {pastAttempt.totalPoints} điểm.
          <br/>
          {pastAttempt.score >= 50 ? 'Chúc mừng bạn đã hoàn thành bài học này!' : 'Bạn cần đạt 50% để qua bài này.'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-teal text-white font-bold rounded-xl hover:bg-opacity-90 shadow-lg"
          >
            Làm lại bài
          </button>
          <a
             href={`/luyen-tap/${quiz.id}/ket-qua/${pastAttempt.id}`}
             target="_blank"
             className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
          >
             Xem chi tiết đáp án
          </a>
        </div>
      </div>
    );
  }

  const [state, setState] = useState<"INTRO" | "PLAYING" | "SUBMITTING">("INTRO");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answer
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  
  const [error, setError] = useState("");
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const questions: SafeQuestion[] = quiz.questions;
  const currentQuestion = questions[currentIndex];

  const { leftCol, rightCol } = useMemo(() => {
    if (!currentQuestion || currentQuestion.questionType !== "MATCHING") return { leftCol: [], rightCol: [] };
    const lefts = currentQuestion.choices.filter((c: any) => c.matchGroup === "left");
    const rights = currentQuestion.choices.filter((c: any) => c.matchGroup === "right");
    
    const shuffle = (array: any[]) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    return { leftCol: shuffle(lefts), rightCol: shuffle(rights) };
  }, [currentQuestion]);

  useEffect(() => {
    if (state === "PLAYING" && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStart = async () => {
    setState("SUBMITTING");
    setError("");
    const res = await startAttempt(quiz.id);
    if (res.error) {
      setError(res.error);
      setState("INTRO");
    } else {
      setAttemptId(res.attemptId as string);
      setState("PLAYING");
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    setState("SUBMITTING");
    const res = await submitAttempt(attemptId, answers);
    if (res.error) {
      setError(res.error);
      setState("PLAYING");
    } else {
      window.location.reload();
    }
  };

  const setAnswer = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  };

  if (state === "INTRO") {
    return (
      <div className="bg-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-800 text-center max-w-2xl mx-auto my-8">
        <span className="inline-block px-3 py-1 bg-brand-teal/20 text-brand-teal text-sm font-bold rounded-full mb-4 border border-brand-teal/30">
          Bài Tập Khóa Học
        </span>
        <h1 className="text-3xl font-extrabold text-white mb-4">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-400 mb-8">{quiz.description}</p>}
        
        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-800 p-6 rounded-2xl text-left border border-gray-700 border-opacity-50">
          <div>
            <div className="text-sm text-gray-500">Số câu hỏi</div>
            <div className="text-xl font-bold text-gray-200">{questions.length} câu</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tổng điểm</div>
            <div className="text-xl font-bold text-gray-200">{questions.reduce((s:number, q:any) => s + q.points, 0)} điểm</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Thời gian</div>
            <div className="text-xl font-bold text-gray-200">{quiz.timeLimit ? `${quiz.timeLimit} phút` : "Không giới hạn"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Yêu cầu qua bài</div>
            <div className="text-xl font-bold text-brand-teal">50%</div>
          </div>
        </div>

        {error && <div className="text-red-400 mb-4 font-medium">{error}</div>}

        <button
          onClick={handleStart}
          className="w-full bg-brand-teal text-white text-lg font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
        >
          BẮT ĐẦU LÀM BÀI
        </button>
      </div>
    );
  }

  if (state === "SUBMITTING" && attemptId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-brand-teal rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium text-lg">Đang chấm điểm, vui lòng chờ...</p>
      </div>
    );
  }

  // PLAYING STATE
  const currentAnswer = answers[currentQuestion.id] || "";
  const isReadingSplit = currentQuestion.question.includes("|||");
  let readingText = "";
  let actualQuestionText = currentQuestion.question;
  
  if (isReadingSplit) {
    const parts = currentQuestion.question.split("|||");
    readingText = parts[0].trim();
    actualQuestionText = parts.slice(1).join("|||").trim();
  }

  const renderQuestionBody = () => (
    <>
      <div className="mb-6">
        <span className="inline-block px-2.5 py-1 bg-gray-800 text-gray-400 text-xs font-bold rounded-lg mb-3 border border-gray-700">
          {currentQuestion.points} điểm • {
            currentQuestion.questionType === "MULTIPLE_CHOICE" ? "Trắc nghiệm" :
            currentQuestion.questionType === "FILL_IN_BLANK" ? "Điền từ" :
            currentQuestion.questionType === "MATCHING" ? "Nối đôi" :
            currentQuestion.questionType === "WORD_ORDER" ? "Sắp xếp" : "Thanh điệu"
          }
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 leading-relaxed whitespace-pre-wrap">
          {actualQuestionText.split("___").map((part, i, arr) => {
            let parsedAnswers: string[] = [];
            if (currentQuestion.questionType === "FILL_IN_BLANK") {
              try { parsedAnswers = JSON.parse(currentAnswer || "[]"); } catch {}
            }
            
            return (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  currentQuestion.questionType === "FILL_IN_BLANK" ? (
                    <input 
                      type="text"
                      value={parsedAnswers[i] || ""}
                      onChange={(e) => {
                        const newAns = [...parsedAnswers];
                        newAns[i] = e.target.value;
                        setAnswer(JSON.stringify(newAns));
                      }}
                      className="inline-block w-32 mx-2 border-b-2 border-brand-teal text-brand-teal text-center focus:outline-none bg-brand-teal/10 font-bold placeholder-gray-600"
                    />
                  ) : (
                    <span className="inline-block w-16 mx-1 border-b-2 border-brand-teal text-brand-teal text-center px-2 opacity-50">...</span>
                  )
                )}
              </span>
            );
          })}
        </h2>
      </div>

      {currentQuestion.imageUrl && (
        <img src={currentQuestion.imageUrl} alt="Question" className="max-w-full rounded-xl mb-6 mx-auto max-h-64 object-contain" />
      )}
      {currentQuestion.audioUrl && (
        <div className="mb-6 p-4 bg-gray-800 rounded-xl flex items-center gap-4 border border-gray-700">
          <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
          </div>
          <audio controls src={currentQuestion.audioUrl} className="w-full grayscale opacity-80"></audio>
        </div>
      )}

      <div className="mt-8">
        {(currentQuestion.questionType === "MULTIPLE_CHOICE" || currentQuestion.questionType === "TONE_RECOGNITION") && (
          <div className="space-y-3">
            {currentQuestion.choices.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setAnswer(c.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  currentAnswer === c.id 
                    ? 'border-brand-teal bg-brand-teal/10 font-bold text-brand-teal shadow-[0_0_10px_rgba(45,212,191,0.1)]' 
                    : 'border-gray-700 hover:border-gray-500 text-gray-300 bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {currentQuestion.questionType === "TONE_RECOGNITION" ? <span className="text-2xl">{c.content}</span> : c.content}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.questionType === "MATCHING" && (
          <div className="grid grid-cols-2 gap-4 md:gap-8 mt-4">
             <div className="space-y-4">
               <h4 className="text-center font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Cột trái</h4>
               {leftCol.map((l: any) => {
                  let pairs: any[] = [];
                  try { pairs = JSON.parse(currentAnswer || "[]"); } catch {}
                  const isMatched = pairs.some((p: any) => p.left === l.id);
                  const isSelected = selectedLeft === l.id;

                  return (
                    <button
                      key={l.id}
                      disabled={isMatched}
                      onClick={() => setSelectedLeft(isSelected ? null : l.id)}
                      className={`w-full p-4 rounded-xl border font-bold transition-all ${
                        isMatched ? 'bg-gray-800 border-gray-700 text-gray-600 opacity-50 line-through' :
                        isSelected ? 'bg-brand-teal/10 border-brand-teal text-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.15)] transform scale-105' :
                        'bg-gray-800 border-gray-700 hover:border-brand-teal text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {l.content}
                    </button>
                  )
               })}
             </div>
                 
             <div className="space-y-4">
               <h4 className="text-center font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Cột phải</h4>
               {rightCol.map((r: any) => {
                  let pairs: any[] = [];
                  try { pairs = JSON.parse(currentAnswer || "[]"); } catch {}
                  const matchedPair = pairs.find((p: any) => p.right === r.id);
                  const matchedLeft = matchedPair ? leftCol.find((l: any) => l.id === matchedPair.left) : null;

                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (matchedPair) return;
                        if (!selectedLeft) return;
                        const newPairs = [...pairs, { left: selectedLeft, right: r.id }];
                        setAnswer(JSON.stringify(newPairs));
                        setSelectedLeft(null);
                      }}
                      className={`w-full p-4 rounded-xl border font-bold transition-all flex flex-col items-center justify-center min-h-[64px] ${
                        matchedPair ? 'bg-green-900/30 border-green-500/50 text-green-400 p-2' :
                        selectedLeft ? 'bg-gray-800 border-brand-teal/50 hover:bg-brand-teal/10 cursor-pointer border-dashed' :
                        'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {matchedPair ? (
                        <div className="w-full flex items-center justify-between text-left">
                          <div className="flex-1 min-w-0 pr-2">
                             <div className="text-[10px] text-green-500 font-bold uppercase mb-0.5 border-b border-green-500/30 pb-0.5">Đã nối với: {matchedLeft?.content}</div>
                             <div className="font-bold text-green-300">{r.content}</div>
                          </div>
                          <span 
                             onClick={(e) => {
                               e.stopPropagation();
                               const newPairs = pairs.filter((p: any) => p.right !== r.id);
                               setAnswer(JSON.stringify(newPairs));
                             }}
                             className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center border border-red-500/30 flex-shrink-0"
                             title="Hủy nối"
                          >✕</span>
                        </div>
                      ) : r.content}
                    </button>
                  )
               })}
             </div>
          </div>
        )}

        {currentQuestion.questionType === "WORD_ORDER" && (
          <div className="space-y-6">
             <p className="text-sm text-gray-400 text-center">Bấm vào các từ bên dưới theo đúng thứ tự để tạo thành câu hoàn chỉnh.</p>
             
             <div className="min-h-[80px] p-4 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl flex flex-wrap gap-2 items-center justify-center">
               {(() => {
                  let selectedIds: string[] = [];
                  try { selectedIds = JSON.parse(currentAnswer || "[]"); } catch {}
                  
                  if (selectedIds.length === 0) return <span className="text-gray-600">Kết quả của bạn sẽ hiển thị ở đây...</span>;

                  return selectedIds.map((id, idx) => {
                    const c = currentQuestion.choices.find((x: any) => x.id === id);
                    return (
                      <button 
                        key={idx}
                        onClick={() => {
                          const newArr = selectedIds.filter(x => x !== id);
                          setAnswer(JSON.stringify(newArr));
                        }}
                        className="px-4 py-2 bg-brand-teal text-white rounded-lg shadow-sm font-bold"
                      >
                        {c?.content}
                      </button>
                    )
                  });
               })()}
             </div>

             <div className="flex flex-wrap gap-3 justify-center">
               {currentQuestion.choices.map((c: any) => {
                  let selectedIds: string[] = [];
                  try { selectedIds = JSON.parse(currentAnswer || "[]"); } catch {}
                  const isSelected = selectedIds.includes(c.id);

                  return (
                    <button
                      key={c.id}
                      disabled={isSelected}
                      onClick={() => {
                        selectedIds.push(c.id);
                        setAnswer(JSON.stringify(selectedIds));
                      }}
                      className={`px-4 py-2 rounded-lg font-bold border transition-all ${
                        isSelected ? 'bg-gray-800 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed' 
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-brand-teal hover:bg-gray-700'
                      }`}
                    >
                      {c.content}
                    </button>
                  )
               })}
             </div>
             <div className="text-center">
               <button onClick={() => setAnswer("[]")} className="text-sm text-red-400 hover:text-red-300 hover:underline">Xóa làm lại</button>
             </div>
            </div>
        )}
      </div>
    </>
  );

  return (
    <div className={`p-4 md:p-8 flex flex-col min-h-full max-w-full ${isReadingSplit ? 'mx-0' : 'max-w-4xl mx-auto'}`}>
      <div className="bg-gray-800/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-gray-700 flex items-center justify-between mb-6 sticky top-4 z-10">
        <div className="font-bold text-gray-300">
          Câu {currentIndex + 1} <span className="text-gray-500 mx-1">/</span> {questions.length}
        </div>
        
        {timeLeft !== null && (
          <div className={`font-mono text-lg font-bold px-4 py-1.5 rounded-lg border ${timeLeft < 60 ? 'bg-red-900/30 text-red-400 border-red-500/30 animate-pulse' : 'bg-brand-teal/10 text-brand-teal border-brand-teal/20'}`}>
            {formatTime(timeLeft)}
          </div>
        )}

        <button
          onClick={() => {
            if(confirm("Bạn có chắc chắn muốn nộp bài sớm?")) handleSubmit();
          }}
          className="text-brand-coral font-bold text-sm hover:underline"
        >
          Nộp bài
        </button>
      </div>

      {isReadingSplit ? (
        <div className="flex flex-col md:flex-row gap-6 mb-6 h-[500px]">
          <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700 h-full overflow-y-auto custom-scrollbar">
             <div className="text-sm font-bold text-brand-teal uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">Bài đọc</div>
             <div className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{readingText}</div>
          </div>
          <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700 h-full overflow-y-auto custom-scrollbar">
             {renderQuestionBody()}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-700 mb-6 flex-1">
          {renderQuestionBody()}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-700">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-3 font-bold text-gray-400 disabled:opacity-30 hover:bg-gray-700 rounded-xl transition-colors"
        >
          ← Trở lại
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-brand-coral text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,107,0.3)] hover:bg-opacity-90 transition-all"
          >
            NỘP BÀI THI
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
            className="px-8 py-3 bg-brand-teal text-white font-bold rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:bg-opacity-90 transition-all"
          >
            Tiếp theo →
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {questions.map((q: any, idx: number) => {
          const isAnswered = !!answers[q.id];
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${
                currentIndex === idx ? 'border-brand-teal bg-gray-800 text-brand-teal shadow-[0_0_10px_rgba(45,212,191,0.2)]' :
                isAnswered ? 'bg-brand-teal/20 text-brand-teal border-brand-teal/50' :
                'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  );
}
