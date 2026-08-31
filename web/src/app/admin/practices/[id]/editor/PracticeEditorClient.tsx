"use client";

import { useState } from "react";
import { updatePracticeContent } from "@/app/actions/practice";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, children, onRemove }: { id: string, children: React.ReactNode, onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm relative group">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-gray-400 hover:text-gray-600 px-2 py-4" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className="pl-8 pr-8">
        {children}
      </div>
      <button 
        onClick={onRemove}
        className="absolute right-4 top-4 text-red-400 hover:text-red-600 transition-colors"
        title="Xóa"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  );
}

export default function PracticeEditorClient({ practiceId, initialContent }: { practiceId: string, initialContent: any }) {
  const [content, setContent] = useState({
    games: [], gameFill: [], gameOrder: [], gameQA: [], gameMCQ: [],
    ...initialContent
  });
  const [activeTab, setActiveTab] = useState("flashcards");
  const [activeGameTab, setActiveGameTab] = useState("games"); // games, gameFill, gameOrder, gameQA, gameMCQ
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    const res = await updatePracticeContent(practiceId, JSON.stringify(content));
    setIsSaving(false);
    if (res.success) {
      setSaveMessage("✅ Đã lưu thành công!");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("❌ Lỗi lưu dữ liệu: " + res.error);
    }
  };

  const updateTabContent = (tabId: string, newItems: any[]) => {
    setContent((prev: any) => ({ ...prev, [tabId]: newItems }));
  };

  const handleDragEnd = (event: any, tabId: string) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const items = content[tabId];
      const oldIndex = items.findIndex((i: any) => i.id === active.id);
      const newIndex = items.findIndex((i: any) => i.id === over.id);
      updateTabContent(tabId, arrayMove(items, oldIndex, newIndex));
    }
  };

  const addItem = (tabId: string, itemTemplate: any) => {
    const newItem = { id: crypto.randomUUID(), ...itemTemplate };
    updateTabContent(tabId, [...content[tabId], newItem]);
  };

  const removeItem = (tabId: string, idToRemove: string) => {
    updateTabContent(tabId, content[tabId].filter((i: any) => i.id !== idToRemove));
  };

  const updateItem = (tabId: string, idToUpdate: string, field: string, value: any) => {
    updateTabContent(tabId, content[tabId].map((i: any) => i.id === idToUpdate ? { ...i, [field]: value } : i));
  };

  const tabs = [
    { id: "flashcards", label: "① Từ vựng" },
    { id: "sentences", label: "② Mẫu câu" },
    { id: "situations", label: "③ Tình huống" },
    { id: "dialogues", label: "④ Hội thoại" },
    { id: "games", label: "⑤ Trò chơi" },
    { id: "writeTranslate", label: "⑥ Viết - Dịch" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-[#6A5ACD] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">({content[tab.id]?.length || 0})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{saveMessage}</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-teal text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        
        {/* Flashcards */}
        {activeTab === "flashcards" && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Danh sách từ vựng</h3>
              <button 
                onClick={() => addItem("flashcards", { word: "", pinyin: "", translation: "", type: "", example: "" })}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200"
              >
                + Thêm thẻ từ
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, "flashcards")}>
              <SortableContext items={content.flashcards.map((i:any) => i.id)} strategy={verticalListSortingStrategy}>
                {content.flashcards.map((card: any) => (
                  <SortableItem key={card.id} id={card.id} onRemove={() => removeItem("flashcards", card.id)}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Chữ Hán</label>
                        <input type="text" value={card.word} onChange={(e) => updateItem("flashcards", card.id, "word", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2 text-xl font-bold" placeholder="VD: 你好" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Pinyin</label>
                        <input type="text" value={card.pinyin} onChange={(e) => updateItem("flashcards", card.id, "pinyin", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: nǐ hǎo" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Loại từ</label>
                        <input type="text" value={card.type} onChange={(e) => updateItem("flashcards", card.id, "type", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: v./n." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Nghĩa tiếng Việt</label>
                        <input type="text" value={card.translation} onChange={(e) => updateItem("flashcards", card.id, "translation", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: Xin chào" />
                      </div>
                      <div className="col-span-2 md:col-span-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase">Ví dụ (Tiếng Trung)</label>
                        <input type="text" value={card.example} onChange={(e) => updateItem("flashcards", card.id, "example", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="Câu ví dụ..." />
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Sentences */}
        {activeTab === "sentences" && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Mẫu câu thông dụng</h3>
              <button 
                onClick={() => addItem("sentences", { pattern: "", exampleZh: "", exampleVi: "", practicePlaceholder: "", expectedAnswer: "" })}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200"
              >
                + Thêm mẫu câu
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, "sentences")}>
              <SortableContext items={content.sentences.map((i:any) => i.id)} strategy={verticalListSortingStrategy}>
                {content.sentences.map((sentence: any) => (
                  <SortableItem key={sentence.id} id={sentence.id} onRemove={() => removeItem("sentences", sentence.id)}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Cấu trúc mẫu câu</label>
                        <input type="text" value={sentence.pattern} onChange={(e) => updateItem("sentences", sentence.id, "pattern", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2 text-lg font-bold text-purple-800" placeholder="VD: 我叫 + [tên]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Ví dụ Tiếng Trung</label>
                          <input type="text" value={sentence.exampleZh} onChange={(e) => updateItem("sentences", sentence.id, "exampleZh", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: 我叫阿美" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Ví dụ Tiếng Việt</label>
                          <input type="text" value={sentence.exampleVi} onChange={(e) => updateItem("sentences", sentence.id, "exampleVi", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: Tôi tên là Mỹ" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Gợi ý luyện tập</label>
                          <input type="text" value={sentence.practicePlaceholder} onChange={(e) => updateItem("sentences", sentence.id, "practicePlaceholder", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: Nhập tên của bạn vào..." />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Từ khóa mong đợi (Regex/Text để chấm điểm nhẹ)</label>
                          <input type="text" value={sentence.expectedAnswer} onChange={(e) => updateItem("sentences", sentence.id, "expectedAnswer", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="Để trống nếu không kiểm tra chặt" />
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Situations */}
        {activeTab === "situations" && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Tình huống sử dụng</h3>
              <button 
                onClick={() => addItem("situations", { context: "", description: "", phrases: [] })}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200"
              >
                + Thêm tình huống
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, "situations")}>
              <SortableContext items={content.situations.map((i:any) => i.id)} strategy={verticalListSortingStrategy}>
                {content.situations.map((situation: any) => (
                  <SortableItem key={situation.id} id={situation.id} onRemove={() => removeItem("situations", situation.id)}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Tên Tình Huống</label>
                          <input type="text" value={situation.context} onChange={(e) => updateItem("situations", situation.id, "context", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2 font-bold" placeholder="VD: Lớp học, Công sở..." />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Mô tả bối cảnh</label>
                          <input type="text" value={situation.description} onChange={(e) => updateItem("situations", situation.id, "description", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="Giải thích ngắn gọn..." />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase">Các câu nói trong tình huống</label>
                          <button 
                            onClick={() => {
                              const newPhrases = [...(situation.phrases || []), { zh: "", pinyin: "", vi: "" }];
                              updateItem("situations", situation.id, "phrases", newPhrases);
                            }}
                            className="text-xs font-bold text-purple-600 hover:underline"
                          >
                            + Thêm câu
                          </button>
                        </div>
                        {(situation.phrases || []).map((phrase: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start mb-2">
                            <input type="text" value={phrase.zh} onChange={(e) => {
                               const newPhrases = [...situation.phrases];
                               newPhrases[idx].zh = e.target.value;
                               updateItem("situations", situation.id, "phrases", newPhrases);
                            }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Tiếng Trung" />
                            <input type="text" value={phrase.pinyin} onChange={(e) => {
                               const newPhrases = [...situation.phrases];
                               newPhrases[idx].pinyin = e.target.value;
                               updateItem("situations", situation.id, "phrases", newPhrases);
                            }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Pinyin" />
                            <input type="text" value={phrase.vi} onChange={(e) => {
                               const newPhrases = [...situation.phrases];
                               newPhrases[idx].vi = e.target.value;
                               updateItem("situations", situation.id, "phrases", newPhrases);
                            }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Tiếng Việt" />
                            <button onClick={() => {
                               const newPhrases = situation.phrases.filter((_:any, i:number) => i !== idx);
                               updateItem("situations", situation.id, "phrases", newPhrases);
                            }} className="text-red-400 hover:text-red-600 p-1">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Dialogues */}
        {activeTab === "dialogues" && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Hội thoại mẫu</h3>
              <button 
                onClick={() => addItem("dialogues", { scene: "", lines: [] })}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200"
              >
                + Thêm phân cảnh
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, "dialogues")}>
              <SortableContext items={content.dialogues.map((i:any) => i.id)} strategy={verticalListSortingStrategy}>
                {content.dialogues.map((dialogue: any) => (
                  <SortableItem key={dialogue.id} id={dialogue.id} onRemove={() => removeItem("dialogues", dialogue.id)}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Tên Phân cảnh</label>
                        <input type="text" value={dialogue.scene} onChange={(e) => updateItem("dialogues", dialogue.id, "scene", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2 font-bold" placeholder="VD: Gặp nhau ở quán cafe..." />
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase">Dòng Chat</label>
                          <button 
                            onClick={() => {
                              const newLines = [...(dialogue.lines || []), { speaker: "A", zh: "", vi: "" }];
                              updateItem("dialogues", dialogue.id, "lines", newLines);
                            }}
                            className="text-xs font-bold text-purple-600 hover:underline"
                          >
                            + Thêm dòng
                          </button>
                        </div>
                        {(dialogue.lines || []).map((line: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start mb-2">
                            <select value={line.speaker} onChange={(e) => {
                               const newLines = [...dialogue.lines];
                               newLines[idx].speaker = e.target.value;
                               updateItem("dialogues", dialogue.id, "lines", newLines);
                            }} className="w-16 border-gray-300 rounded p-1 text-sm font-bold bg-white">
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                            </select>
                            <input type="text" value={line.zh} onChange={(e) => {
                               const newLines = [...dialogue.lines];
                               newLines[idx].zh = e.target.value;
                               updateItem("dialogues", dialogue.id, "lines", newLines);
                            }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Câu thoại tiếng Trung" />
                            <input type="text" value={line.vi} onChange={(e) => {
                               const newLines = [...dialogue.lines];
                               newLines[idx].vi = e.target.value;
                               updateItem("dialogues", dialogue.id, "lines", newLines);
                            }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Nghĩa tiếng Việt" />
                            <button onClick={() => {
                               const newLines = dialogue.lines.filter((_:any, i:number) => i !== idx);
                               updateItem("dialogues", dialogue.id, "lines", newLines);
                            }} className="text-red-400 hover:text-red-600 p-1">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Games */}
        {activeTab === "games" && (
          <div>
            <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
              {[
                { id: "games", label: "1. Nối thẻ" },
                { id: "gameFill", label: "2. Điền từ" },
                { id: "gameOrder", label: "3. Sắp xếp" },
                { id: "gameQA", label: "4. Hỏi đáp" },
                { id: "gameMCQ", label: "5. Trắc nghiệm" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveGameTab(t.id)}
                  className={`px-4 py-2 rounded-md font-bold text-sm whitespace-nowrap transition-colors ${activeGameTab === t.id ? 'bg-[#6A5ACD] text-white' : 'text-gray-500 hover:bg-purple-50'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 1. Nối thẻ */}
            {activeGameTab === "games" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Trò chơi - Nối thẻ (Memory Match)</h3>
                  <button 
                    onClick={() => addItem("games", { left: "", right: "" })}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200"
                  >
                    + Thêm Cặp Thẻ
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.games.map((pair: any) => (
                    <div key={pair.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4 items-center relative">
                      <div className="flex-1">
                        <input type="text" value={pair.left} onChange={(e) => updateItem("games", pair.id, "left", e.target.value)} className="w-full border-gray-300 rounded p-2 text-center" placeholder="Thẻ 1 (Ví dụ: 你好)" />
                      </div>
                      <span className="text-gray-400">↔</span>
                      <div className="flex-1">
                        <input type="text" value={pair.right} onChange={(e) => updateItem("games", pair.id, "right", e.target.value)} className="w-full border-gray-300 rounded p-2 text-center" placeholder="Thẻ 2 (Ví dụ: Xin chào)" />
                      </div>
                      <button onClick={() => removeItem("games", pair.id)} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-200">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Điền từ */}
            {activeGameTab === "gameFill" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Điền từ vào mẫu câu (Sentence Fill)</h3>
                    <p className="text-sm text-gray-500">Người học điền từ vào chỗ trống trong câu.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newItems = (content.sentences || []).map((s:any) => ({ id: crypto.randomUUID(), pattern: s.pattern, exampleZh: s.exampleZh, exampleVi: s.exampleVi, practicePlaceholder: s.practicePlaceholder, expectedAnswer: s.expectedAnswer }));
                        updateTabContent("gameFill", [...content.gameFill, ...newItems]);
                      }}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200"
                    >
                      ⟳ Tự động lấy từ "Mẫu câu"
                    </button>
                    <button onClick={() => addItem("gameFill", { pattern: "", exampleZh: "", exampleVi: "", practicePlaceholder: "", expectedAnswer: "" })} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200">+ Thêm Câu</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {content.gameFill.map((item: any) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                      <button onClick={() => removeItem("gameFill", item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">✕ Xóa</button>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Cấu trúc</label><input type="text" value={item.pattern} onChange={e => updateItem("gameFill", item.id, "pattern", e.target.value)} className="w-full border-gray-300 rounded p-2" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Ý nghĩa (Tiếng Việt)</label><input type="text" value={item.exampleVi} onChange={e => updateItem("gameFill", item.id, "exampleVi", e.target.value)} className="w-full border-gray-300 rounded p-2" /></div>
                        <div className="col-span-2"><label className="text-xs text-gray-500 font-bold uppercase">Câu tiếng Trung (Chứa đáp án đúng để hệ thống đục lỗ)</label><input type="text" value={item.exampleZh} onChange={e => updateItem("gameFill", item.id, "exampleZh", e.target.value)} className="w-full border-gray-300 rounded p-2 font-bold" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Từ cần điền (Đáp án đúng)</label><input type="text" value={item.expectedAnswer} onChange={e => updateItem("gameFill", item.id, "expectedAnswer", e.target.value)} className="w-full border-gray-300 rounded p-2 text-green-600 font-bold" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Gợi ý trong ô trống</label><input type="text" value={item.practicePlaceholder} onChange={e => updateItem("gameFill", item.id, "practicePlaceholder", e.target.value)} className="w-full border-gray-300 rounded p-2" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Sắp xếp */}
            {activeGameTab === "gameOrder" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Sắp xếp hội thoại (Dialogue Reorder)</h3>
                    <p className="text-sm text-gray-500">Xáo trộn các câu thoại để người học sắp xếp lại.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newItems = (content.dialogues || []).map((d:any) => ({ id: crypto.randomUUID(), scene: d.scene, lines: d.lines }));
                        updateTabContent("gameOrder", [...content.gameOrder, ...newItems]);
                      }}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200"
                    >
                      ⟳ Lấy từ "Hội thoại"
                    </button>
                    <button onClick={() => addItem("gameOrder", { scene: "", lines: [] })} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200">+ Thêm Hội thoại</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {content.gameOrder.map((item: any) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                      <button onClick={() => removeItem("gameOrder", item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">✕ Xóa</button>
                      <label className="text-xs text-gray-500 font-bold uppercase">Tên Phân Cảnh</label>
                      <input type="text" value={item.scene} onChange={e => updateItem("gameOrder", item.id, "scene", e.target.value)} className="w-full border-gray-300 rounded p-2 mb-4 font-bold" />
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-bold text-gray-700 uppercase">Các câu thoại (Đúng thứ tự)</label>
                          <button onClick={() => updateItem("gameOrder", item.id, "lines", [...(item.lines||[]), { zh: "", vi: "" }])} className="text-xs font-bold text-purple-600 hover:underline">+ Thêm dòng</button>
                        </div>
                        {(item.lines || []).map((line: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center mb-2">
                            <span className="text-gray-400 font-bold">{idx + 1}.</span>
                            <input type="text" value={line.zh} onChange={(e) => { const newLines = [...item.lines]; newLines[idx].zh = e.target.value; updateItem("gameOrder", item.id, "lines", newLines); }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Tiếng Trung" />
                            <input type="text" value={line.vi} onChange={(e) => { const newLines = [...item.lines]; newLines[idx].vi = e.target.value; updateItem("gameOrder", item.id, "lines", newLines); }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Tiếng Việt" />
                            <button onClick={() => { const newLines = item.lines.filter((_:any, i:number) => i !== idx); updateItem("gameOrder", item.id, "lines", newLines); }} className="text-red-400 hover:text-red-600 p-1">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Hỏi đáp */}
            {activeGameTab === "gameQA" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Hỏi đáp tình huống (Situational Q&A)</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newItems = (content.situations || []).map((s:any) => ({ id: crypto.randomUUID(), description: s.description, phrases: s.phrases }));
                        updateTabContent("gameQA", [...content.gameQA, ...newItems]);
                      }}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200"
                    >
                      ⟳ Lấy từ "Tình huống"
                    </button>
                    <button onClick={() => addItem("gameQA", { description: "", phrases: [] })} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200">+ Thêm Tình huống</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {content.gameQA.map((item: any) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                      <button onClick={() => removeItem("gameQA", item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">✕ Xóa</button>
                      <label className="text-xs text-gray-500 font-bold uppercase">Mô tả tình huống</label>
                      <input type="text" value={item.description} onChange={e => updateItem("gameQA", item.id, "description", e.target.value)} className="w-full border-gray-300 rounded p-2 mb-4 font-bold" />
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-bold text-gray-700 uppercase">Các câu trả lời gợi ý</label>
                          <button onClick={() => updateItem("gameQA", item.id, "phrases", [...(item.phrases||[]), { zh: "", vi: "" }])} className="text-xs font-bold text-purple-600 hover:underline">+ Thêm gợi ý</button>
                        </div>
                        {(item.phrases || []).map((phrase: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center mb-2">
                            <span className="text-gray-400">💡</span>
                            <input type="text" value={phrase.zh} onChange={(e) => { const newP = [...item.phrases]; newP[idx].zh = e.target.value; updateItem("gameQA", item.id, "phrases", newP); }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Tiếng Trung" />
                            <input type="text" value={phrase.vi} onChange={(e) => { const newP = [...item.phrases]; newP[idx].vi = e.target.value; updateItem("gameQA", item.id, "phrases", newP); }} className="flex-1 border-gray-300 rounded p-1 text-sm" placeholder="Tiếng Việt" />
                            <button onClick={() => { const newP = item.phrases.filter((_:any, i:number) => i !== idx); updateItem("gameQA", item.id, "phrases", newP); }} className="text-red-400 hover:text-red-600 p-1">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Trắc nghiệm */}
            {activeGameTab === "gameMCQ" && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Trắc nghiệm (MCQ Challenge)</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newItems = (content.flashcards || []).map((f:any) => ({ id: crypto.randomUUID(), word: f.word, pinyin: f.pinyin, translation: f.translation, optionA: "", optionB: "", optionC: "" }));
                        updateTabContent("gameMCQ", [...content.gameMCQ, ...newItems]);
                      }}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200"
                    >
                      ⟳ Lấy từ "Từ vựng" (Tạo câu hỏi)
                    </button>
                    <button onClick={() => addItem("gameMCQ", { word: "", pinyin: "", translation: "", optionA: "", optionB: "", optionC: "" })} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200">+ Thêm Câu MCQ</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {content.gameMCQ.map((item: any) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                      <button onClick={() => removeItem("gameMCQ", item.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">✕ Xóa</button>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Từ vựng (Câu hỏi)</label><input type="text" value={item.word} onChange={e => updateItem("gameMCQ", item.id, "word", e.target.value)} className="w-full border-gray-300 rounded p-2 text-xl font-bold" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase">Pinyin</label><input type="text" value={item.pinyin} onChange={e => updateItem("gameMCQ", item.id, "pinyin", e.target.value)} className="w-full border-gray-300 rounded p-2" /></div>
                        
                        <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                          <label className="text-xs font-bold text-green-600 uppercase mb-2 block">Đáp án đúng</label>
                          <input type="text" value={item.translation} onChange={e => updateItem("gameMCQ", item.id, "translation", e.target.value)} className="w-full border-green-300 rounded p-2 bg-green-50 mb-4 font-bold" placeholder="Nghĩa của từ..." />
                          
                          <label className="text-xs font-bold text-red-500 uppercase mb-2 block">3 Đáp án nhiễu (Sai)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" value={item.optionA} onChange={e => updateItem("gameMCQ", item.id, "optionA", e.target.value)} className="w-full border-red-200 rounded p-2 bg-red-50 text-sm" placeholder="Đáp án sai 1" />
                            <input type="text" value={item.optionB} onChange={e => updateItem("gameMCQ", item.id, "optionB", e.target.value)} className="w-full border-red-200 rounded p-2 bg-red-50 text-sm" placeholder="Đáp án sai 2" />
                            <input type="text" value={item.optionC} onChange={e => updateItem("gameMCQ", item.id, "optionC", e.target.value)} className="w-full border-red-200 rounded p-2 bg-red-50 text-sm" placeholder="Đáp án sai 3" />
                          </div>
                          <p className="text-xs text-gray-400 mt-2">* Nếu để trống đáp án nhiễu, hệ thống sẽ tự động trộn các từ vựng khác vào.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Write / Translate */}
        {activeTab === "writeTranslate" && (
          <div>
             <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Luyện Viết & Dịch</h3>
              <button 
                onClick={() => addItem("writeTranslate", { prompt: "", hint: "", expectedAnswer: "" })}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200"
              >
                + Thêm Bài Tập Dịch
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, "writeTranslate")}>
              <SortableContext items={content.writeTranslate.map((i:any) => i.id)} strategy={verticalListSortingStrategy}>
                {content.writeTranslate.map((task: any) => (
                  <SortableItem key={task.id} id={task.id} onRemove={() => removeItem("writeTranslate", task.id)}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Câu hỏi / Yêu cầu dịch (Tiếng Việt)</label>
                        <input type="text" value={task.prompt} onChange={(e) => updateItem("writeTranslate", task.id, "prompt", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2 font-bold" placeholder="VD: Hãy dịch câu 'Xin chào, tôi là Mỹ' sang tiếng Trung" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Gợi ý từ vựng (Tùy chọn)</label>
                          <input type="text" value={task.hint} onChange={(e) => updateItem("writeTranslate", task.id, "hint", e.target.value)} className="w-full mt-1 border-gray-300 rounded p-2" placeholder="VD: 你好，是" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase">Đáp án đúng (Tiếng Trung)</label>
                          <input type="text" value={task.expectedAnswer} onChange={(e) => updateItem("writeTranslate", task.id, "expectedAnswer", e.target.value)} className="w-full mt-1 border-green-500 rounded p-2 text-green-700" placeholder="VD: 你好，我是阿美" />
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

      </div>
    </div>
  );
}
