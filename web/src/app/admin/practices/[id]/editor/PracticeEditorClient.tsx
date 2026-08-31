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
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("flashcards");
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
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Trò chơi - Nối thẻ (Matching Game)</h3>
              <p className="text-sm text-gray-500 mb-4">Nhập các cặp thẻ cần ghép (Ví dụ: Chữ Hán - Nghĩa tiếng Việt)</p>
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
                  <button onClick={() => removeItem("games", pair.id)} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-200">
                    ✕
                  </button>
                </div>
              ))}
            </div>
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
