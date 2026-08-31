"use client";

import { useState } from "react";
import CourseQuizEngineClient from "./CourseQuizEngineClient";

type Flashcard = { id: string; front: string; back: string; pinyin: string; audioUrl?: string };
type Sentence = { id: string; pattern: string; example: string; translation: string; audioUrl?: string };
type Situation = { id: string; text: string; pinyin: string; translation: string; audioUrl?: string };
type SituationTab = { id: string; title: string; situations: Situation[] };
type DialogueItem = { id: string; speaker: string; text: string; pinyin: string; translation: string; audioUrl?: string };
type Dialogue = { id: string; title: string; items: DialogueItem[] };

type LessonContentBlock = 
  | { type: "flashcards"; items: Flashcard[] }
  | { type: "sentences"; items: Sentence[] }
  | { type: "situations"; items: SituationTab[] }
  | { type: "dialogues"; items: Dialogue[] };

export default function InteractiveLessonClient({
  content,
  quiz,
  pastAttempt
}: {
  content: string | null;
  quiz: any;
  pastAttempt: any;
}) {
  const blocks: LessonContentBlock[] = content ? JSON.parse(content).blocks || [] : [];
  
  const flashcardsBlock = blocks.find(b => b.type === "flashcards") as { type: "flashcards"; items: Flashcard[] } | undefined;
  const sentencesBlock = blocks.find(b => b.type === "sentences") as { type: "sentences"; items: Sentence[] } | undefined;
  const situationsBlock = blocks.find(b => b.type === "situations") as { type: "situations"; items: SituationTab[] } | undefined;
  const dialoguesBlock = blocks.find(b => b.type === "dialogues") as { type: "dialogues"; items: Dialogue[] } | undefined;

  return (
    <div className="bg-[#FCF8F3] min-h-full p-4 md:p-8 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        
        {/* 1. Thẻ từ vựng */}
        {flashcardsBlock && flashcardsBlock.items.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#6D4C9E] mb-2">① 生词卡片 — Thẻ từ vựng</h2>
            <p className="text-sm text-gray-500 mb-6">Chạm vào thẻ để lật xem nghĩa • Bấm 🔊 để nghe phát âm</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashcardsBlock.items.map((card) => (
                <FlashcardItem key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}

        {/* 2. Mẫu câu */}
        {sentencesBlock && sentencesBlock.items.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#6D4C9E] mb-2">② 常用句型 — Mẫu câu thông dụng</h2>
            <p className="text-sm text-gray-500 mb-6">Bấm vào từng mẫu câu để xem ví dụ</p>
            <div className="space-y-4">
              {sentencesBlock.items.map((sent) => (
                <SentenceItem key={sent.id} sentence={sent} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Tình huống */}
        {situationsBlock && situationsBlock.items.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#6D4C9E] mb-2">③ Tình huống sử dụng thực tế</h2>
            <p className="text-sm text-gray-500 mb-6">Các bối cảnh phổ biến</p>
            <SituationsTabs tabs={situationsBlock.items} />
          </section>
        )}

        {/* 4. Hội thoại */}
        {dialoguesBlock && dialoguesBlock.items.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#6D4C9E] mb-2">④ 示范对话 — Hội thoại mẫu</h2>
            <p className="text-sm text-gray-500 mb-6">Đọc theo, có thể bấm 🔊 để nghe từng câu</p>
            <div className="space-y-8">
              {dialoguesBlock.items.map((dlg) => (
                <div key={dlg.id} className="bg-white border border-[#E9D5FF] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-[#6D4C9E] mb-6">{dlg.title}</h3>
                  <div className="space-y-4">
                    {dlg.items.map((line) => (
                      <DialogueLine key={line.id} line={line} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Quiz */}
        {quiz && (
          <section>
            <h2 className="text-xl font-bold text-[#6D4C9E] mb-4">⑤ 复习游戏 — Trò chơi ôn tập</h2>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E9D5FF] shadow-sm min-h-[500px]">
               <CourseQuizEngineClient quiz={quiz} pastAttempt={pastAttempt} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function FlashcardItem({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(card.front);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div 
      className="perspective-1000 w-full h-32 md:h-40 cursor-pointer" 
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-[#F3E8FF] rounded-2xl flex flex-col items-center justify-center border border-[#E9D5FF] p-2 text-center">
          <div className="text-2xl md:text-3xl font-bold text-[#6D4C9E] mb-1">{card.front}</div>
          <div className="text-gray-500 text-sm md:text-base">{card.pinyin}</div>
          <button onClick={playAudio} className="absolute top-2 right-2 text-gray-400 hover:text-[#6D4C9E]">🔊</button>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-2xl flex flex-col items-center justify-center border border-[#E9D5FF] rotate-y-180 p-4 text-center shadow-sm">
          <div className="text-base md:text-lg font-bold text-gray-800">{card.back}</div>
        </div>

      </div>
    </div>
  );
}

function SentenceItem({ sentence }: { sentence: Sentence }) {
  const [open, setOpen] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(sentence.example);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9D5FF] overflow-hidden shadow-sm">
      <button 
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-[#6D4C9E]">{sentence.pattern}</span>
        <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      {open && (
        <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="text-lg font-medium text-gray-800 mb-1">{sentence.example}</div>
              <div className="text-gray-600 text-sm">{sentence.translation}</div>
            </div>
            <button onClick={playAudio} className="p-3 bg-[#F3E8FF] rounded-full text-[#6D4C9E] hover:bg-[#E9D5FF] transition-colors">
              🔊
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SituationsTabs({ tabs }: { tabs: SituationTab[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(idx)}
            className={`px-5 py-2.5 rounded-full font-medium transition-colors text-sm ${
              activeTab === idx 
                ? "bg-[#6D4C9E] text-white shadow-md" 
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E9D5FF] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tabs[activeTab]?.situations.map((sit) => (
            <div key={sit.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#E9D5FF] transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-bold text-gray-800">{sit.text}</span>
                <button onClick={() => {
                  if ('speechSynthesis' in window) {
                    const msg = new SpeechSynthesisUtterance(sit.text);
                    msg.lang = 'zh-CN';
                    window.speechSynthesis.speak(msg);
                  }
                }} className="text-gray-300 group-hover:text-[#6D4C9E]">🔊</button>
              </div>
              <div className="text-sm text-gray-500 mb-1">{sit.pinyin}</div>
              <div className="text-sm text-gray-700">{sit.translation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DialogueLine({ line }: { line: DialogueItem }) {
  const isA = line.speaker.toUpperCase() === "A";
  
  return (
    <div className={`flex gap-4 ${isA ? '' : 'flex-row-reverse'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isA ? 'bg-[#A855F7]' : 'bg-[#10B981]'}`}>
        {line.speaker}
      </div>
      <div className={`max-w-[80%] rounded-2xl p-4 ${isA ? 'bg-[#F3E8FF] rounded-tl-sm' : 'bg-[#ECFDF5] rounded-tr-sm'}`}>
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="text-lg text-gray-800">{line.text}</div>
          <button onClick={() => {
            if ('speechSynthesis' in window) {
              const msg = new SpeechSynthesisUtterance(line.text);
              msg.lang = 'zh-CN';
              window.speechSynthesis.speak(msg);
            }
          }} className={`text-sm ${isA ? 'text-[#A855F7]' : 'text-[#10B981]'}`}>🔊</button>
        </div>
        <div className="text-xs text-gray-500 mb-1">{line.pinyin}</div>
        <div className={`text-sm ${isA ? 'text-gray-600' : 'text-gray-600'}`}>{line.translation}</div>
      </div>
    </div>
  );
}
