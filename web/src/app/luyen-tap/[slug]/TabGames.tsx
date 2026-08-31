"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function EmptyState({ text = "Chưa có dữ liệu" }: { text?: string }) {
  return (
    <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-4xl mb-4">📭</div>
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  );
}

// 1. Memory Match
function MemoryMatch({ games }: { games: any[] }) {
  const [selectedCards, setSelectedCards] = useState<{id: string, text: string, type: 'left' | 'right'}[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [deck, setDeck] = useState<{id: string, text: string, type: 'left' | 'right'}[]>([]);

  useEffect(() => {
    if (!games || games.length === 0) return;
    const cards: any[] = [];
    games.forEach(g => {
      cards.push({ id: g.id, text: g.left, type: 'left' });
      cards.push({ id: g.id, text: g.right, type: 'right' });
    });
    setDeck(cards.sort(() => Math.random() - 0.5));
  }, [games]);

  const handleCardClick = (card: {id: string, text: string, type: 'left' | 'right'}) => {
    if (matched.includes(card.id)) return;
    if (selectedCards.find(c => c.text === card.text && c.type === card.type)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      if (newSelected[0].id === newSelected[1].id && newSelected[0].type !== newSelected[1].type) {
        setTimeout(() => {
          setMatched(prev => [...prev, newSelected[0].id]);
          setSelectedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  if (!games || games.length === 0) return <EmptyState text="Chưa có dữ liệu trò chơi nối thẻ" />;
  const isCompleted = matched.length === games.length && games.length > 0;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">Trò chơi nối thẻ</h2>
        <p className="text-gray-500 text-sm">Tìm và chọn các cặp thẻ tương ứng với nhau</p>
      </div>

      {isCompleted ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-green-100">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Hoàn thành xuất sắc!</h3>
          <p className="text-gray-500">Bạn đã tìm được tất cả các cặp thẻ.</p>
          <button 
            onClick={() => { setMatched([]); setSelectedCards([]); setDeck([...deck].sort(() => Math.random() - 0.5)); }}
            className="mt-6 bg-[#6A5ACD] text-white px-6 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-transform hover:scale-105"
          >
            Chơi lại
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <AnimatePresence>
            {deck.map((card, idx) => {
              const isMatched = matched.includes(card.id);
              const isSelected = !!selectedCards.find(c => c.text === card.text && c.type === card.type);
              
              return (
                <motion.button
                  key={`${card.id}-${card.type}-${idx}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => !isMatched && handleCardClick(card)}
                  disabled={isMatched}
                  className={`h-32 rounded-2xl p-4 text-center flex items-center justify-center font-bold text-lg transition-all ${
                    isMatched
                      ? 'bg-green-500 text-white shadow-md border-transparent cursor-default opacity-50 scale-95'
                      : isSelected 
                      ? 'bg-[#6A5ACD] text-white shadow-md transform scale-105 border-transparent ring-4 ring-[#6A5ACD]/30' 
                      : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-[#D8B4E2] hover:bg-purple-50 hover:shadow-sm cursor-pointer'
                  }`}
                >
                  {card.text}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// 2. Sentence Fill
function SentenceFill({ sentences }: { sentences: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle"|"correct"|"wrong">("idle");

  if (!sentences || sentences.length === 0) return <EmptyState text="Chưa có dữ liệu mẫu câu" />;
  
  const current = sentences[currentIndex];
  
  const handleCheck = () => {
    if (!answer.trim()) return;
    const expected = (current.expectedAnswer || "").toLowerCase().trim();
    if (!expected) {
        setStatus("correct"); // No expected answer = auto correct
        return;
    }
    const userAns = answer.toLowerCase().trim();
    if (userAns === expected || userAns.includes(expected)) {
        setStatus("correct");
    } else {
        setStatus("wrong");
    }
  };

  const handleNext = () => {
    setCurrentIndex(i => (i + 1) % sentences.length);
    setAnswer("");
    setStatus("idle");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">Điền từ vào mẫu câu</h2>
        <p className="text-gray-500 text-sm">Điền từ thích hợp vào chỗ trống để hoàn thành mẫu câu</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 text-sm font-bold text-gray-400">
            <span>Câu {currentIndex + 1}/{sentences.length}</span>
            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full">{current.pattern}</span>
        </div>
        
        <div className="text-2xl font-bold text-gray-800 text-center mb-4 leading-relaxed">
           {current.exampleZh.split(current.expectedAnswer || "XXXX").map((part: string, i: number, arr: any[]) => (
             <span key={i}>
                {part}
                {i < arr.length - 1 && (
                    <input 
                      type="text" 
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder={current.practicePlaceholder || "..."}
                      className="mx-2 w-32 border-b-2 border-[#6A5ACD] text-center text-[#6A5ACD] bg-transparent focus:outline-none focus:border-purple-800 placeholder-gray-300"
                    />
                )}
             </span>
           ))}
           {/* Fallback if expectedAnswer not found in exampleZh */}
           {!current.exampleZh.includes(current.expectedAnswer || "XXXX") && (
              <div className="mt-4">
                  <input 
                      type="text" 
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder={current.practicePlaceholder || "..."}
                      className="mx-2 w-48 border-b-2 border-[#6A5ACD] text-center text-[#6A5ACD] bg-transparent focus:outline-none focus:border-purple-800 placeholder-gray-300"
                  />
              </div>
           )}
        </div>
        
        <p className="text-gray-500 text-center italic mb-8">Ý nghĩa: {current.exampleVi}</p>

        {status === "correct" && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-bold text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Chính xác!
            </div>
        )}
        {status === "wrong" && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                Chưa đúng, hãy thử lại!
            </div>
        )}

        <div className="flex gap-4 justify-center">
            {status !== "correct" ? (
                <button 
                  onClick={handleCheck}
                  className="px-8 py-3 bg-[#6A5ACD] text-white font-bold rounded-xl hover:bg-opacity-90 shadow-md hover:-translate-y-0.5 transition-transform"
                >
                  Kiểm tra
                </button>
            ) : (
                <button 
                  onClick={handleNext}
                  className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-md hover:-translate-y-0.5 transition-transform"
                >
                  Tiếp theo →
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

// 3. Word Order (Dialogue Reorder)
function DialogueReorder({ dialogues }: { dialogues: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrambled, setScrambled] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const [status, setStatus] = useState<"idle"|"correct"|"wrong">("idle");

    if (!dialogues || dialogues.length === 0) return <EmptyState text="Chưa có dữ liệu hội thoại" />;
    const current = dialogues[currentIndex];
    const lines = current.lines || [];

    useEffect(() => {
        if (lines.length > 0) {
            setScrambled([...lines].sort(() => Math.random() - 0.5).map((l, i) => ({ ...l, sid: i })));
            setSelected([]);
            setStatus("idle");
        }
    }, [currentIndex, dialogues]);

    const handleSelect = (line: any) => {
        if (status === "correct") return;
        setScrambled(prev => prev.filter(l => l.sid !== line.sid));
        setSelected(prev => [...prev, line]);
        setStatus("idle");
    };

    const handleDeselect = (line: any) => {
        if (status === "correct") return;
        setSelected(prev => prev.filter(l => l.sid !== line.sid));
        setScrambled(prev => [...prev, line]);
        setStatus("idle");
    };

    const handleCheck = () => {
        if (selected.length !== lines.length) return;
        // Check if selected matches original order
        const isCorrect = selected.every((l, idx) => l.zh === lines[idx].zh);
        setStatus(isCorrect ? "correct" : "wrong");
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">Sắp xếp hội thoại</h2>
                <p className="text-gray-500 text-sm">Sắp xếp các câu sau để tạo thành đoạn hội thoại hợp lý</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 text-center text-lg">{current.scene}</h3>
                
                {/* Selected Area */}
                <div className="min-h-[200px] bg-[#FAF9F6] border-2 border-dashed border-gray-200 rounded-xl p-4 mb-6 flex flex-col gap-3">
                    {selected.length === 0 && <p className="text-gray-400 text-center m-auto">Nhấp vào các câu bên dưới để sắp xếp...</p>}
                    <AnimatePresence>
                        {selected.map((line, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={line.sid} 
                                onClick={() => handleDeselect(line)}
                                className={`p-4 rounded-xl font-bold cursor-pointer transition-all shadow-sm flex items-center gap-3 ${status === "correct" ? 'bg-green-50 border border-green-200 text-green-800 cursor-default' : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'}`}
                            >
                                <span className="bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                                <div>
                                    <div>{line.zh}</div>
                                    <div className="text-xs text-gray-400 font-normal">{line.vi}</div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Scrambled Area */}
                <div className="flex flex-col gap-3 mb-8">
                    {scrambled.map((line) => (
                        <motion.div 
                            layout
                            key={line.sid} 
                            onClick={() => handleSelect(line)}
                            className="p-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 cursor-pointer hover:border-[#6A5ACD] hover:bg-purple-50 transition-all shadow-sm"
                        >
                            {line.zh} <span className="text-xs text-gray-400 font-normal ml-2">({line.vi})</span>
                        </motion.div>
                    ))}
                </div>

                {status === "wrong" && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-center text-sm">
                        Chưa chính xác, hãy nhấp vào câu đã chọn để gỡ ra và thử lại!
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    {status !== "correct" ? (
                        <button 
                            onClick={handleCheck}
                            disabled={selected.length !== lines.length}
                            className="px-8 py-3 bg-[#6A5ACD] text-white font-bold rounded-xl hover:bg-opacity-90 shadow-md hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Kiểm tra
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentIndex(i => (i + 1) % dialogues.length)}
                            className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-md hover:-translate-y-0.5 transition-transform"
                        >
                            Đoạn tiếp theo →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// 4. Situational Q&A
function SituationalQA({ situations }: { situations: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    if (!situations || situations.length === 0) return <EmptyState text="Chưa có dữ liệu tình huống" />;
    const current = situations[currentIndex];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">Hỏi đáp tình huống</h2>
                <p className="text-gray-500 text-sm">Đọc tình huống và thử tự trả lời trước khi xem gợi ý</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                    💬
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
                    {current.description}
                </h3>
                
                <p className="text-gray-500 mb-8">Bạn sẽ nói gì trong tình huống này?</p>

                {showAnswer ? (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-left mb-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="font-bold text-green-800 mb-4 uppercase text-xs tracking-wider border-b border-green-200 pb-2">Gợi ý trả lời</div>
                        <ul className="space-y-4">
                            {current.phrases?.map((p: any, i: number) => (
                                <li key={i} className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-lg">{p.zh}</span>
                                    <span className="text-gray-500 text-sm">{p.vi}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowAnswer(true)}
                        className="px-8 py-3 bg-[#6A5ACD] text-white font-bold rounded-xl hover:bg-opacity-90 shadow-md mb-8 inline-block"
                    >
                        Xem gợi ý trả lời
                    </button>
                )}

                <div className="border-t border-gray-100 pt-6">
                    <button 
                        onClick={() => {
                            setCurrentIndex(i => (i + 1) % situations.length);
                            setShowAnswer(false);
                        }}
                        className="text-gray-500 font-bold hover:text-[#6A5ACD] transition-colors"
                    >
                        Tình huống tiếp theo →
                    </button>
                </div>
            </div>
        </div>
    );
}

// 5. Comprehensive Challenge (Multiple Choice)
function MCQChallenge({ mcqs, flashcardsFallback }: { mcqs: any[], flashcardsFallback: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string|null>(null);
    const [status, setStatus] = useState<"idle"|"correct"|"wrong">("idle");
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Use mcqs if available, else fallback to auto-generating from flashcards
    const items = mcqs && mcqs.length > 0 ? mcqs : flashcardsFallback;

    useEffect(() => {
        if (!items || items.length === 0) return;
        const current = items[currentIndex];
        
        let opts = [];
        if (mcqs && mcqs.length > 0 && current.optionA) {
            // Use explicit options
            opts = [
                { id: current.id, text: current.translation, isCorrect: true },
                { id: "A", text: current.optionA, isCorrect: false },
                { id: "B", text: current.optionB, isCorrect: false },
                { id: "C", text: current.optionC, isCorrect: false }
            ].filter(o => o.text).sort(() => Math.random() - 0.5);
        } else {
            // Auto generate from items
            const others = items.filter((f:any) => f.id !== current.id).sort(() => Math.random() - 0.5).slice(0, 3);
            opts = [current, ...others].map(o => ({ id: o.id, text: o.translation, isCorrect: o.id === current.id })).sort(() => Math.random() - 0.5);
        }
        
        setOptions(opts);
        setSelectedId(null);
        setStatus("idle");
    }, [currentIndex, items]);

    if (!items || items.length === 0) return <EmptyState text="Chưa có dữ liệu bài trắc nghiệm" />;

    const current = items[currentIndex];

    const handleSelect = (opt: any) => {
        if (status !== "idle") return;
        setSelectedId(opt.id);
        if (opt.isCorrect) {
            setStatus("correct");
            setScore(s => s + 1);
        } else {
            setStatus("wrong");
        }
    };

    const handleNext = () => {
        if (currentIndex === items.length - 1) {
            setIsFinished(true);
        } else {
            setCurrentIndex(i => i + 1);
        }
    };

    if (isFinished) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hoàn thành thử thách!</h3>
                <p className="text-gray-500 mb-8">Bạn đạt được {score} / {items.length} điểm.</p>
                <button 
                    onClick={() => { setCurrentIndex(0); setScore(0); setIsFinished(false); }}
                    className="px-8 py-3 bg-[#6A5ACD] text-white font-bold rounded-xl hover:bg-opacity-90 shadow-md"
                >
                    Chơi lại từ đầu
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">Trắc nghiệm tổng hợp</h2>
                <p className="text-gray-500 text-sm">Chọn nghĩa đúng nhất cho từ vựng sau</p>
                <div className="mt-4 text-xs font-bold text-gray-400 uppercase">Câu {currentIndex + 1} / {items.length}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="text-5xl font-extrabold text-gray-800 mb-4">{current.word}</div>
                    <div className="text-xl text-gray-500">{current.pinyin}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {options.map(opt => {
                        const isSelected = selectedId === opt.id;
                        const isActuallyCorrect = opt.isCorrect;
                        let btnClass = "bg-white border-2 border-gray-100 text-gray-700 hover:border-[#D8B4E2] hover:bg-purple-50";
                        
                        if (status !== "idle") {
                            if (isActuallyCorrect) btnClass = "bg-green-50 border-2 border-green-500 text-green-700 font-bold";
                            else if (isSelected) btnClass = "bg-red-50 border-2 border-red-500 text-red-700 font-bold";
                            else btnClass = "bg-white border-2 border-gray-100 text-gray-400 opacity-50";
                        }

                        return (
                            <button
                                key={opt.id}
                                disabled={status !== "idle"}
                                onClick={() => handleSelect(opt)}
                                className={`p-4 rounded-xl text-lg font-medium transition-all text-center shadow-sm ${btnClass}`}
                            >
                                {opt.text}
                            </button>
                        )
                    })}
                </div>

                {status !== "idle" && (
                    <div className="text-center animate-in fade-in">
                        <button 
                            onClick={handleNext}
                            className="px-8 py-3 bg-[#6A5ACD] text-white font-bold rounded-xl hover:bg-opacity-90 shadow-md"
                        >
                            {currentIndex === items.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


// Main Tab Component
export default function TabGames({ content }: { content: any }) {
  const [activeGame, setActiveGame] = useState("match");

  const games = [
      { id: "match", label: "1. 记忆配对 Nối thẻ" },
      { id: "fill", label: "2. 句子填空 Điền từ" },
      { id: "order", label: "3. 对话排序 Sắp xếp" },
      { id: "qa", label: "4. 情景问答 Hỏi đáp" },
      { id: "mcq", label: "5. 综合挑战 Trắc nghiệm" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-fit mx-auto">
          {games.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeGame === g.id ? 'bg-[#6A5ACD] text-white shadow-md' : 'text-gray-500 hover:bg-purple-50 hover:text-[#6A5ACD]'}`}
              >
                  {g.label}
              </button>
          ))}
      </div>

      <AnimatePresence mode="wait">
          <motion.div
              key={activeGame}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
          >
              {activeGame === "match" && <MemoryMatch games={content.games || []} />}
              {activeGame === "fill" && <SentenceFill sentences={content.gameFill?.length > 0 ? content.gameFill : (content.sentences || [])} />}
              {activeGame === "order" && <DialogueReorder dialogues={content.gameOrder?.length > 0 ? content.gameOrder : (content.dialogues || [])} />}
              {activeGame === "qa" && <SituationalQA situations={content.gameQA?.length > 0 ? content.gameQA : (content.situations || [])} />}
              {activeGame === "mcq" && <MCQChallenge mcqs={content.gameMCQ || []} flashcardsFallback={content.flashcards || []} />}
          </motion.div>
      </AnimatePresence>
    </div>
  );
}
