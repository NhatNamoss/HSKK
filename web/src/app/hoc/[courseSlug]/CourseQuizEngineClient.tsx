"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { startAttempt, submitAttempt } from "@/app/actions/attempt";

type SafeQuestion = {
  id: string;
  questionType: string;
  question: string;
  audioUrl: string | null;
  imageUrl: string | null;
  points: number;
  choices: { id: string; content: string; matchGroup: string | null; orderIndex: number; isCorrect?: boolean }[];
};

export default function CourseQuizEngineClient({ quiz, pastAttempt }: { quiz: any, pastAttempt?: any }) {
  const router = useRouter();
  
  const [showResults, setShowResults] = useState(pastAttempt && pastAttempt.status === "COMPLETED");
  const [showDetails, setShowDetails] = useState(false);

  // Intro, Playing, Submitting
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

  if (showResults) {
    if (showDetails) {
      return (
        <div className="bg-white rounded-2xl p-6 md:p-8 m-4 shadow-sm border border-[#E9D5FF] min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#6D4C9E]">Chi tiết bài làm</h2>
            <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-colors">
              Quay lại kết quả
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((q, idx) => {
              const userAnswerObj = pastAttempt?.answers?.find((a: any) => a.questionId === q.id);
              const isCorrect = userAnswerObj?.isCorrect;
              
              let displayAnswer = userAnswerObj?.answer || "Chưa trả lời";
              let displayCorrect = "";

              if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "TONE_RECOGNITION") {
                const uc = q.choices.find(c => c.id === displayAnswer);
                displayAnswer = uc ? uc.content : displayAnswer;
                const cc = q.choices.find(c => c.isCorrect);
                displayCorrect = cc ? cc.content : "N/A";
              }

              return (
                <div key={q.id} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-2 whitespace-pre-wrap">{q.question.replace(/\|\|\|/g, '\n')}</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Bạn chọn</div>
                          <div className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{displayAnswer}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Đáp án đúng</div>
                          <div className="font-medium text-green-600">{displayCorrect || "Tự luận/Ghép nối"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-[#E9D5FF] m-4 md:m-8 text-center min-h-[400px] shadow-sm">
        <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center mb-6 shadow-md bg-white 
          ${pastAttempt.score >= 50 ? 'border-brand-teal text-brand-teal' : 'border-brand-coral text-brand-coral'}`}
        >
          <span className="text-4xl font-extrabold">{pastAttempt.score}%</span>
        </div>
        <h2 className="text-2xl font-bold text-[#6D4C9E] mb-2">Kết quả làm bài</h2>
        <p className="text-gray-600 mb-8 text-lg bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
          Bạn đạt được <strong className="text-[#6D4C9E]">{pastAttempt.earnedPoints}</strong> / {pastAttempt.totalPoints} điểm.
          <br/>
          {pastAttempt.score >= 50 ? '🎉 Chúc mừng bạn đã hoàn thành bài học này!' : '💪 Bạn cần đạt 50% để qua bài này, hãy cố gắng lên nhé!'}
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => {
              setShowResults(false);
              setState("INTRO");
              setAnswers({});
              setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
              setCurrentIndex(0);
            }}
            className="px-8 py-3.5 bg-brand-teal text-white font-bold rounded-xl hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Làm lại bài
          </button>
          <button
             onClick={() => setShowDetails(true)}
             className="px-8 py-3.5 bg-white border-2 border-[#E9D5FF] text-[#6D4C9E] font-bold rounded-xl hover:bg-[#F3E8FF] transition-colors"
          >
             Xem chi tiết đáp án
          </button>
        </div>
      </div>
    );
  }

  if (state === "INTRO") {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#E9D5FF] text-center max-w-2xl mx-auto my-8">
        <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6D4C9E] text-sm font-bold rounded-full mb-4 border border-[#E9D5FF]">
          Bài Tập Khóa Học
        </span>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-500 mb-8">{quiz.description}</p>}
        
        <div className="grid grid-cols-2 gap-4 mb-8 bg-[#FAF9F6] p-6 rounded-2xl text-left border border-gray-100">
          <div>
            <div className="text-sm text-gray-500">Số câu hỏi</div>
            <div className="text-xl font-bold text-[#6D4C9E]">{questions.length} câu</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tổng điểm</div>
            <div className="text-xl font-bold text-[#6D4C9E]">{questions.reduce((s:number, q:any) => s + q.points, 0)} điểm</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Thời gian</div>
            <div className="text-xl font-bold text-[#6D4C9E]">{quiz.timeLimit ? `${quiz.timeLimit} phút` : "Không giới hạn"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Yêu cầu qua bài</div>
            <div className="text-xl font-bold text-brand-teal">50%</div>
          </div>
        </div>

        {error && <div className="text-brand-coral mb-4 font-medium p-3 bg-red-50 rounded-lg">{error}</div>}

        <button
          onClick={handleStart}
          className="w-full bg-brand-teal text-white text-lg font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          BẮT ĐẦU LÀM BÀI
        </button>
      </div>
    );
  }

  if (state === "SUBMITTING" && attemptId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#6D4C9E] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium text-lg">Đang chấm điểm, vui lòng chờ...</p>
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
        <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#6D4C9E] text-xs font-bold rounded-lg mb-3 border border-[#E9D5FF]">
          {currentQuestion.points} điểm • {
            currentQuestion.questionType === "MULTIPLE_CHOICE" ? "Trắc nghiệm" :
            currentQuestion.questionType === "FILL_IN_BLANK" ? "Điền từ" :
            currentQuestion.questionType === "MATCHING" ? "Nối đôi" :
            currentQuestion.questionType === "WORD_ORDER" ? "Sắp xếp" : "Thanh điệu"
          }
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
          {actualQuestionText.split("___").map((part, i, arr) => {
            let parsedAnswers: string[] = [];
            if (currentQuestion.questionType === "FILL_IN_BLANK") {
              try { parsedAnswers = JSON.parse(currentAnswer || "[]"); } catch {}
            }
            
            return (
              <Fragment key={i}>
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
                      className="inline-block w-32 mx-2 border-b-2 border-[#6D4C9E] text-[#6D4C9E] text-center focus:outline-none bg-[#F3E8FF] font-bold placeholder-gray-400"
                    />
                  ) : (
                    <span className="inline-block w-16 mx-1 border-b-2 border-gray-300 text-gray-400 text-center px-2">...</span>
                  )
                )}
              </Fragment>
            );
          })}
        </h2>
      </div>

      {currentQuestion.imageUrl && (
        <img src={currentQuestion.imageUrl} alt="Question" className="max-w-full rounded-xl mb-6 mx-auto max-h-64 object-contain shadow-sm" />
      )}
      {currentQuestion.audioUrl && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4 border border-gray-100">
          <div className="w-10 h-10 bg-[#F3E8FF] rounded-full flex items-center justify-center text-[#6D4C9E] flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
          </div>
          <audio controls src={currentQuestion.audioUrl} className="w-full opacity-90"></audio>
        </div>
      )}

      <div className="mt-8">
        {(currentQuestion.questionType === "MULTIPLE_CHOICE" || currentQuestion.questionType === "TONE_RECOGNITION") && (
          <div className="space-y-3">
            {currentQuestion.choices.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setAnswer(c.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  currentAnswer === c.id 
                    ? 'border-[#6D4C9E] bg-[#F3E8FF] font-bold text-[#6D4C9E]' 
                    : 'border-gray-100 hover:border-[#E9D5FF] text-gray-700 bg-white hover:bg-gray-50'
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
               <h4 className="text-center font-bold text-[#6D4C9E] mb-4 uppercase text-xs tracking-wider">Cột trái</h4>
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
                      className={`w-full p-4 rounded-xl border-2 font-bold transition-all ${
                        isMatched ? 'bg-gray-100 border-gray-200 text-gray-400 line-through' :
                        isSelected ? 'bg-[#F3E8FF] border-[#6D4C9E] text-[#6D4C9E] transform scale-105 shadow-md' :
                        'bg-white border-gray-100 hover:border-[#E9D5FF] text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {l.content}
                    </button>
                  )
               })}
             </div>
                 
             <div className="space-y-4">
               <h4 className="text-center font-bold text-[#6D4C9E] mb-4 uppercase text-xs tracking-wider">Cột phải</h4>
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
                      className={`w-full p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center min-h-[64px] ${
                        matchedPair ? 'bg-[#ECFDF5] border-green-200 text-green-700' :
                        selectedLeft ? 'bg-white border-[#E9D5FF] hover:bg-[#F3E8FF] cursor-pointer border-dashed' :
                        'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {matchedPair ? (
                        <div className="w-full flex items-center justify-between text-left">
                           <div className="flex-1 min-w-0 pr-2">
                              <div className="text-[10px] text-green-600 font-bold uppercase mb-0.5 border-b border-green-200 pb-0.5">Đã nối với: {matchedLeft?.content}</div>
                              <div className="font-bold text-green-700">{r.content}</div>
                           </div>
                           <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPairs = pairs.filter((p: any) => p.right !== r.id);
                                setAnswer(JSON.stringify(newPairs));
                              }}
                              className="text-red-500 hover:text-white hover:bg-red-500 cursor-pointer bg-red-50 rounded-full w-8 h-8 flex items-center justify-center border border-red-200 flex-shrink-0 transition-colors"
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
             <p className="text-sm text-gray-500 text-center">Bấm vào các từ bên dưới theo đúng thứ tự để tạo thành câu hoàn chỉnh.</p>
             
             <div className="min-h-[80px] p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-wrap gap-2 items-center justify-center">
               {(() => {
                  let selectedIds: string[] = [];
                  try { selectedIds = JSON.parse(currentAnswer || "[]"); } catch {}
                  
                  if (selectedIds.length === 0) return <span className="text-gray-400">Kết quả của bạn sẽ hiển thị ở đây...</span>;

                  return selectedIds.map((id, idx) => {
                    const c = currentQuestion.choices.find((x: any) => x.id === id);
                    return (
                      <button 
                        key={idx}
                        onClick={() => {
                          const newArr = selectedIds.filter(x => x !== id);
                          setAnswer(JSON.stringify(newArr));
                        }}
                        className="px-4 py-2 bg-[#6D4C9E] text-white rounded-lg shadow-sm font-bold hover:bg-opacity-90"
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
                      className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                        isSelected ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#6D4C9E] hover:bg-gray-50'
                      }`}
                    >
                      {c.content}
                    </button>
                  )
               })}
             </div>
             <div className="text-center">
               <button onClick={() => setAnswer("[]")} className="text-sm text-red-500 hover:text-red-700 hover:underline font-medium">Xóa làm lại</button>
             </div>
            </div>
        )}
      </div>
    </>
  );

  return (
    <div className={`p-4 md:p-8 flex flex-col min-h-full max-w-full ${isReadingSplit ? 'mx-0' : 'max-w-4xl mx-auto'}`}>
      <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-[#E9D5FF] flex items-center justify-between mb-6 sticky top-4 z-10">
        <div className="font-bold text-gray-700">
          Câu {currentIndex + 1} <span className="text-gray-400 mx-1">/</span> {questions.length}
        </div>
        
        {timeLeft !== null && (
          <div className={`font-mono text-lg font-bold px-4 py-1.5 rounded-lg border ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-[#F3E8FF] text-[#6D4C9E] border-[#E9D5FF]'}`}>
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
          <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl shadow-sm border border-[#E9D5FF] h-full overflow-y-auto custom-scrollbar">
             <div className="text-sm font-bold text-[#6D4C9E] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Bài đọc</div>
             <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{readingText}</div>
          </div>
          <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl shadow-sm border border-[#E9D5FF] h-full overflow-y-auto custom-scrollbar">
             {renderQuestionBody()}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E9D5FF] mb-6 flex-1">
          {renderQuestionBody()}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto bg-white p-4 rounded-2xl shadow-sm border border-[#E9D5FF]">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-3 font-bold text-gray-500 disabled:opacity-50 hover:bg-gray-100 rounded-xl transition-colors"
        >
          ← Trở lại
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-brand-coral text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,107,0.3)] hover:bg-opacity-90 transition-all hover:-translate-y-0.5"
          >
            NỘP BÀI THI
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
            className="px-8 py-3 bg-[#6D4C9E] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(109,76,158,0.3)] hover:bg-opacity-90 transition-all hover:-translate-y-0.5"
          >
            Tiếp theo →
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 justify-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {questions.map((q: any, idx: number) => {
          const isAnswered = !!answers[q.id];
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-10 h-10 rounded-lg text-sm font-bold border-2 transition-colors ${
                currentIndex === idx ? 'border-[#6D4C9E] bg-[#6D4C9E] text-white shadow-md' :
                isAnswered ? 'bg-[#F3E8FF] text-[#6D4C9E] border-[#E9D5FF]' :
                'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
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
