"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TabGames from "./TabGames";

export default function PracticeViewer({ practice, content }: { practice: any, content: any }) {
  const [activeTab, setActiveTab] = useState("flashcards");

  const tabs = [
    { id: "flashcards", label: "① 生词 Từ vựng" },
    { id: "sentences", label: "② 句型 Mẫu câu" },
    { id: "situations", label: "③ 情景 Tình huống" },
    { id: "dialogues", label: "④ 对话 Hội thoại" },
    { id: "games", label: "⑤ 游戏 Trò chơi" },
    { id: "writeTranslate", label: "⑥ 写作-翻译 Viết-Dịch" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Top Header */}
      <header className="bg-[#6A5ACD] text-white py-4 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/luyen-tap" className="text-white/80 hover:text-white font-medium flex items-center gap-2">
            <span>← Quay lại</span>
          </Link>
          <h1 className="text-xl font-bold text-center flex-1 mx-4 line-clamp-1">{practice.title}</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto mt-6 flex overflow-x-auto gap-2 no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-[#6A5ACD] shadow-sm" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto mt-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "flashcards" && <TabFlashcards cards={content.flashcards || []} />}
            {activeTab === "sentences" && <TabSentences sentences={content.sentences || []} />}
            {activeTab === "situations" && <TabSituations situations={content.situations || []} />}
            {activeTab === "dialogues" && <TabDialogues dialogues={content.dialogues || []} />}
            {activeTab === "games" && <TabGames content={content} />}
            {activeTab === "writeTranslate" && <TabWriteTranslate tasks={content.writeTranslate || []} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// TAB COMPONENTS
// -------------------------------------------------------------

function TabFlashcards({ cards }: { cards: any[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  if (cards.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">① 生词卡片 – Thẻ từ vựng</h2>
        <p className="text-gray-500 text-sm">Chạm vào thẻ để lật xem nghĩa · Bấm 🔊 để nghe phát âm</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="h-48 cursor-pointer relative perspective-1000 group"
            onClick={() => toggleFlip(card.id)}
          >
            <motion.div 
              className="w-full h-full preserve-3d relative transition-all duration-500 shadow-sm rounded-2xl"
              animate={{ rotateY: flipped[card.id] ? 180 : 0 }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-[#F0E6FF] border border-[#D8B4E2] rounded-2xl flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-extrabold text-[#6A5ACD] mb-2">{card.word}</span>
                <span className="text-sm text-gray-500 font-medium">{card.pinyin}</span>
                <span className="text-[10px] text-gray-400 mt-4">Chạm để xem nghĩa</span>
                <button 
                  onClick={(e) => playAudio(e, card.word)}
                  className="absolute top-3 right-3 text-[#6A5ACD] hover:bg-[#6A5ACD]/10 p-1.5 rounded-full"
                >
                  🔊
                </button>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#6A5ACD] text-white rounded-2xl flex flex-col items-center justify-center p-4">
                <div className="text-lg font-bold text-center mb-1">{card.translation}</div>
                {card.type && <div className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90 mb-3">{card.type}</div>}
                {card.example && <div className="text-xs text-center text-white/80 line-clamp-3 italic">"{card.example}"</div>}
                
                <button 
                  onClick={(e) => playAudio(e, card.word)}
                  className="absolute bottom-3 text-white/80 hover:text-white p-1.5 rounded-full text-xs flex items-center gap-1"
                >
                  🔊 Nghe
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabSentences({ sentences }: { sentences: any[] }) {
  const [expanded, setExpanded] = useState<string | null>(sentences.length > 0 ? sentences[0].id : null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, boolean | null>>({});

  const toggle = (id: string) => {
    setExpanded(prev => prev === id ? null : id);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  const checkAnswer = (id: string, expected: string) => {
    if (!expected) {
      setFeedbacks(prev => ({ ...prev, [id]: true }));
      return;
    }
    const userAns = answers[id] || "";
    // Simple inclusion check
    const isCorrect = userAns.includes(expected);
    setFeedbacks(prev => ({ ...prev, [id]: isCorrect }));
  };

  if (sentences.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">② 常用句型 – Mẫu câu thông dụng</h2>
        <p className="text-gray-500 text-sm">Bấm vào từng mẫu câu để xem ví dụ và luyện điền từ thay thế</p>
      </div>

      <div className="space-y-4">
        {sentences.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => toggle(s.id)}
              className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-bold text-[#6A5ACD]">{s.pattern}</span>
              <span className="text-gray-400 transform transition-transform duration-200" style={{ transform: expanded === s.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                ▾
              </span>
            </button>
            
            <AnimatePresence>
              {expanded === s.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-50"
                >
                  <div className="p-6 space-y-6">
                    {/* Example Box */}
                    <div className="border-2 border-dashed border-[#D8B4E2] rounded-xl p-4 bg-[#F0E6FF]/50 relative">
                      <button onClick={() => playAudio(s.exampleZh)} className="absolute top-4 right-4 text-[#6A5ACD]">🔊</button>
                      <div className="text-lg font-medium text-gray-900 mb-1 pr-8">{s.exampleZh}</div>
                      <div className="text-gray-600 text-sm">{s.exampleVi}</div>
                    </div>

                    {/* Practice Box */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2">✏️ Luyện tập:</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={answers[s.id] || ""}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [s.id]: e.target.value }))}
                          placeholder={s.practicePlaceholder}
                          className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-[#6A5ACD] focus:ring-0 transition-colors"
                        />
                        <button 
                          onClick={() => checkAnswer(s.id, s.expectedAnswer)}
                          className="bg-[#6A5ACD] text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90"
                        >
                          Kiểm tra
                        </button>
                      </div>
                      
                      {feedbacks[s.id] !== undefined && (
                        <div className={`mt-3 text-sm font-medium ${feedbacks[s.id] ? 'text-green-600' : 'text-red-500'}`}>
                          {feedbacks[s.id] ? "✅ Chính xác! Giỏi lắm." : "❌ Chưa đúng lắm, bạn thử lại nhé."}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabSituations({ situations }: { situations: any[] }) {
  const [activeSit, setActiveSit] = useState<string>(situations.length > 0 ? situations[0].id : "");

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  if (situations.length === 0) return <EmptyState />;

  const currentSit = situations.find(s => s.id === activeSit);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">③ Tình huống sử dụng thực tế</h2>
        <p className="text-gray-500 text-sm">Cùng xem các mẫu câu được sử dụng trong các bối cảnh khác nhau</p>
      </div>

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {situations.map((sit, idx) => (
          <button
            key={sit.id}
            onClick={() => setActiveSit(sit.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
              activeSit === sit.id 
                ? 'bg-purple-100 border-[#6A5ACD] text-[#6A5ACD]' 
                : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'
            }`}
          >
            {sit.context}
          </button>
        ))}
      </div>

      {currentSit && (
        <motion.div 
          key={currentSit.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <p className="text-gray-600 italic mb-6 text-center">"{currentSit.description}"</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentSit.phrases || []).map((phrase: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative group hover:border-[#D8B4E2] transition-colors">
                <button 
                  onClick={() => playAudio(phrase.zh)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#6A5ACD]"
                >
                  🔊
                </button>
                <div className="text-lg font-bold text-gray-900 mb-1 pr-8">{phrase.zh}</div>
                <div className="text-sm text-gray-500 mb-2">{phrase.pinyin}</div>
                <div className="text-sm text-[#6A5ACD] font-medium">{phrase.vi}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TabDialogues({ dialogues }: { dialogues: any[] }) {
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  if (dialogues.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">④ 示范对话 — Hội thoại mẫu</h2>
        <p className="text-gray-500 text-sm">Đọc theo, có thể bấm 🔊 để nghe từng câu</p>
      </div>

      <div className="space-y-12">
        {dialogues.map((dialogue: any, dIdx: number) => (
          <div key={dialogue.id}>
            <div className="text-center mb-6">
              <span className="inline-block bg-white text-gray-500 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-gray-200 shadow-sm">
                Cảnh {dIdx + 1} · {dialogue.scene}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-4">
              {(dialogue.lines || []).map((line: any, lIdx: number) => {
                const isA = line.speaker === "A";
                return (
                  <div key={lIdx} className={`flex w-full ${isA ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 relative group ${
                      isA ? 'bg-[#F0E6FF] rounded-tl-none' : 'bg-teal-50 rounded-tr-none'
                    }`}>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="text-xs font-bold text-gray-500 opacity-60">{line.speaker}</span>
                        <button onClick={() => playAudio(line.zh)} className="text-xs text-gray-400 hover:text-[#6A5ACD]">🔊</button>
                      </div>
                      <div className="text-lg font-medium text-gray-900 mb-1">{line.zh}</div>
                      <div className="text-sm text-gray-600">{line.vi}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function TabWriteTranslate({ tasks }: { tasks: any[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, boolean>>({});

  const checkAnswer = (id: string, expected: string) => {
    const userAns = (answers[id] || "").trim().toLowerCase();
    const exp = expected.trim().toLowerCase();
    
    // Very simple exact match for now
    if (userAns === exp || userAns.replace(/[.,!?，。]/g, '') === exp.replace(/[.,!?，。]/g, '')) {
      setFeedbacks(prev => ({ ...prev, [id]: true }));
    } else {
      setFeedbacks(prev => ({ ...prev, [id]: false }));
    }
  };

  if (tasks.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#6A5ACD] mb-2">⑥ 写作-翻译 Viết - Dịch</h2>
        <p className="text-gray-500 text-sm">Luyện kỹ năng gõ và dịch câu tiếng Trung</p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {tasks.map((task: any, idx: number) => (
          <div key={task.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#6A5ACD]"></div>
            
            <div className="mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Câu {idx + 1}</span>
              <h3 className="text-lg font-bold text-gray-900">{task.prompt}</h3>
              {task.hint && <p className="text-sm text-purple-600 mt-2 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-100">💡 Gợi ý: {task.hint}</p>}
            </div>

            <div className="space-y-3">
              <textarea 
                rows={2}
                value={answers[task.id] || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                placeholder="Nhập câu trả lời bằng tiếng Trung..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-[#6A5ACD] focus:ring-0 transition-colors resize-none font-medium text-lg"
              ></textarea>
              
              <div className="flex justify-between items-center">
                <div>
                  {feedbacks[task.id] === true && <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">✅ Xuất sắc! Dịch chuẩn xác.</span>}
                  {feedbacks[task.id] === false && <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg text-sm">❌ Chưa chính xác. Vui lòng kiểm tra lại.</span>}
                </div>
                <button 
                  onClick={() => checkAnswer(task.id, task.expectedAnswer)}
                  className="bg-[#6A5ACD] text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-colors shadow-sm"
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <div className="text-6xl mb-4">🏜️</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có nội dung</h3>
      <p className="text-gray-500">Giáo viên chưa cập nhật nội dung cho phần này.</p>
    </div>
  );
}
