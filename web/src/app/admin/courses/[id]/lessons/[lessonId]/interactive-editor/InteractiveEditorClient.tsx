"use client";

import { useState } from "react";
import { updateLessonContent } from "@/app/actions/course";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Flashcard = { id: string; front: string; back: string; pinyin: string; audioUrl: string };
type Sentence = { id: string; pattern: string; example: string; translation: string; audioUrl: string };
type Situation = { id: string; text: string; pinyin: string; translation: string; audioUrl: string };
type SituationTab = { id: string; title: string; situations: Situation[] };
type DialogueItem = { id: string; speaker: string; text: string; pinyin: string; translation: string; audioUrl: string };
type Dialogue = { id: string; title: string; items: DialogueItem[] };

export type LessonContentBlock = 
  | { type: "flashcards"; items: Flashcard[] }
  | { type: "sentences"; items: Sentence[] }
  | { type: "situations"; items: SituationTab[] }
  | { type: "dialogues"; items: Dialogue[] };

export default function InteractiveEditorClient({
  lessonId,
  initialContent,
  quizId,
  courseId,
  lessonType,
}: {
  lessonId: string;
  initialContent: string | null;
  quizId: string | null;
  courseId: string;
  lessonType: string;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<LessonContentBlock[]>(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed.blocks && parsed.blocks.length > 0) return parsed.blocks;
      } catch (e) {
        // ignore
      }
    }
    
    const typeMap: Record<string, "flashcards" | "sentences" | "situations" | "dialogues"> = {
      FLASHCARDS: "flashcards",
      SENTENCES: "sentences",
      SITUATIONS: "situations",
      DIALOGUES: "dialogues"
    };
    if (typeMap[lessonType]) {
      return [{ type: typeMap[lessonType], items: [] }];
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addBlock = (type: "flashcards" | "sentences" | "situations" | "dialogues") => {
    setBlocks([...blocks, { type, items: [] } as any]);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  const updateBlock = (index: number, newBlock: LessonContentBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setLoading(true);
    const contentStr = JSON.stringify({ blocks });
    await updateLessonContent(lessonId, contentStr);
    setLoading(false);
    alert("Đã lưu nội dung bài học thành công!");
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">Loại bài học không được hỗ trợ.</p>
          </div>
        ) : (
          blocks.map((block, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              
              {block.type === "flashcards" && (
                <FlashcardsEditor 
                  block={block} 
                  onChange={(b) => updateBlock(idx, b)} 
                  generateId={generateId} 
                />
              )}
              {block.type === "sentences" && (
                <SentencesEditor 
                  block={block} 
                  onChange={(b) => updateBlock(idx, b)} 
                  generateId={generateId} 
                />
              )}
              {block.type === "situations" && (
                <SituationsEditor 
                  block={block} 
                  onChange={(b) => updateBlock(idx, b)} 
                  generateId={generateId} 
                />
              )}
              {block.type === "dialogues" && (
                <DialoguesEditor 
                  block={block} 
                  onChange={(b) => updateBlock(idx, b)} 
                  generateId={generateId} 
                />
              )}
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Hành động</h3>
            <p className="text-sm text-gray-500">Lưu lại các thay đổi của bạn</p>
          </div>
          <div className="flex gap-4">
            {quizId && (
              <Link 
                href={`/admin/courses/${courseId}/lessons/${lessonId}/editor`}
                className="px-6 py-3 bg-purple-50 text-purple-600 font-bold rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
              >
                🎮 Quản lý Trò chơi (Quiz)
              </Link>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-brand-teal text-white font-bold rounded-lg shadow-sm hover:bg-brand-teal/90 transition-colors"
            >
              {loading ? "Đang lưu..." : "Lưu nội dung"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// EDITOR SUB-COMPONENTS
// -------------------------------------------------------------

function FlashcardsEditor({ block, onChange, generateId }: { block: any, onChange: (b: any) => void, generateId: () => string }) {
  const addItem = () => {
    const newItem = { id: generateId(), front: "", back: "", pinyin: "", audioUrl: "" };
    onChange({ ...block, items: [...block.items, newItem] });
  };
  
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...block.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...block, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...block.items];
    newItems.splice(index, 1);
    onChange({ ...block, items: newItems });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Thẻ từ vựng</h3>
      <div className="space-y-4">
        {block.items.map((item: any, idx: number) => (
          <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
            <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Chữ Hán (Mặt trước)</label>
                <input type="text" value={item.front} onChange={e => updateItem(idx, "front", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nghĩa (Mặt sau)</label>
                <input type="text" value={item.back} onChange={e => updateItem(idx, "back", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Pinyin</label>
                <input type="text" value={item.pinyin} onChange={e => updateItem(idx, "pinyin", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Audio URL (Tuỳ chọn)</label>
                <input type="text" value={item.audioUrl} onChange={e => updateItem(idx, "audioUrl", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">+ Thêm từ vựng</button>
    </div>
  );
}

function SentencesEditor({ block, onChange, generateId }: { block: any, onChange: (b: any) => void, generateId: () => string }) {
  const addItem = () => {
    const newItem = { id: generateId(), pattern: "", example: "", translation: "", audioUrl: "" };
    onChange({ ...block, items: [...block.items, newItem] });
  };
  
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...block.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...block, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...block.items];
    newItems.splice(index, 1);
    onChange({ ...block, items: newItems });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Mẫu câu thông dụng</h3>
      <div className="space-y-4">
        {block.items.map((item: any, idx: number) => (
          <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
            <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Cấu trúc mẫu câu (vd: 我叫 + [tên])</label>
                <input type="text" value={item.pattern} onChange={e => updateItem(idx, "pattern", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Ví dụ chữ Hán</label>
                <input type="text" value={item.example} onChange={e => updateItem(idx, "example", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nghĩa ví dụ</label>
                <input type="text" value={item.translation} onChange={e => updateItem(idx, "translation", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Audio URL</label>
                <input type="text" value={item.audioUrl} onChange={e => updateItem(idx, "audioUrl", e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">+ Thêm mẫu câu</button>
    </div>
  );
}

function SituationsEditor({ block, onChange, generateId }: { block: any, onChange: (b: any) => void, generateId: () => string }) {
  const addTab = () => {
    const newTab = { id: generateId(), title: "Tình huống mới", situations: [] };
    onChange({ ...block, items: [...block.items, newTab] });
  };
  
  const updateTabTitle = (index: number, title: string) => {
    const newItems = [...block.items];
    newItems[index].title = title;
    onChange({ ...block, items: newItems });
  };

  const removeTab = (index: number) => {
    const newItems = [...block.items];
    newItems.splice(index, 1);
    onChange({ ...block, items: newItems });
  };

  const addSituation = (tabIndex: number) => {
    const newItems = [...block.items];
    newItems[tabIndex].situations.push({ id: generateId(), text: "", pinyin: "", translation: "", audioUrl: "" });
    onChange({ ...block, items: newItems });
  };

  const updateSituation = (tabIndex: number, sitIndex: number, field: string, value: string) => {
    const newItems = [...block.items];
    newItems[tabIndex].situations[sitIndex][field] = value;
    onChange({ ...block, items: newItems });
  };

  const removeSituation = (tabIndex: number, sitIndex: number) => {
    const newItems = [...block.items];
    newItems[tabIndex].situations.splice(sitIndex, 1);
    onChange({ ...block, items: newItems });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tình huống thực tế</h3>
      <div className="space-y-6">
        {block.items.map((tab: any, tabIdx: number) => (
          <div key={tab.id} className="p-4 bg-gray-50 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <input 
                type="text" 
                value={tab.title} 
                onChange={e => updateTabTitle(tabIdx, e.target.value)} 
                className="font-bold text-gray-700 px-2 py-1 border-b-2 border-brand-teal bg-transparent outline-none w-1/2" 
                placeholder="Tên tình huống (vd: Lớp học)"
              />
              <button onClick={() => removeTab(tabIdx)} className="text-red-500 text-sm hover:underline">Xóa nhóm</button>
            </div>
            
            <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-gray-200">
              {tab.situations.map((sit: any, sitIdx: number) => (
                <div key={sit.id} className="bg-white p-3 rounded border border-gray-200 relative">
                  <button onClick={() => removeSituation(tabIdx, sitIdx)} className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-sm">&times;</button>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Chữ Hán" value={sit.text} onChange={e => updateSituation(tabIdx, sitIdx, "text", e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                    <input type="text" placeholder="Pinyin" value={sit.pinyin} onChange={e => updateSituation(tabIdx, sitIdx, "pinyin", e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                    <input type="text" placeholder="Nghĩa" value={sit.translation} onChange={e => updateSituation(tabIdx, sitIdx, "translation", e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                    <input type="text" placeholder="Audio URL" value={sit.audioUrl} onChange={e => updateSituation(tabIdx, sitIdx, "audioUrl", e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                  </div>
                </div>
              ))}
              <button onClick={() => addSituation(tabIdx)} className="text-left text-sm text-brand-teal font-medium hover:underline">+ Thêm từ/câu</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addTab} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">+ Thêm nhóm tình huống</button>
    </div>
  );
}

function DialoguesEditor({ block, onChange, generateId }: { block: any, onChange: (b: any) => void, generateId: () => string }) {
  const addDialogue = () => {
    const newDialogue = { id: generateId(), title: "Chủ đề hội thoại", items: [] };
    onChange({ ...block, items: [...block.items, newDialogue] });
  };
  
  const updateDialogueTitle = (index: number, title: string) => {
    const newItems = [...block.items];
    newItems[index].title = title;
    onChange({ ...block, items: newItems });
  };

  const removeDialogue = (index: number) => {
    const newItems = [...block.items];
    newItems.splice(index, 1);
    onChange({ ...block, items: newItems });
  };

  const addLine = (dlgIndex: number) => {
    const newItems = [...block.items];
    newItems[dlgIndex].items.push({ id: generateId(), speaker: "A", text: "", pinyin: "", translation: "", audioUrl: "" });
    onChange({ ...block, items: newItems });
  };

  const updateLine = (dlgIndex: number, itemIndex: number, field: string, value: string) => {
    const newItems = [...block.items];
    newItems[dlgIndex].items[itemIndex][field] = value;
    onChange({ ...block, items: newItems });
  };

  const removeLine = (dlgIndex: number, itemIndex: number) => {
    const newItems = [...block.items];
    newItems[dlgIndex].items.splice(itemIndex, 1);
    onChange({ ...block, items: newItems });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Hội thoại mẫu</h3>
      <div className="space-y-6">
        {block.items.map((dlg: any, dlgIdx: number) => (
          <div key={dlg.id} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <input 
                type="text" 
                value={dlg.title} 
                onChange={e => updateDialogueTitle(dlgIdx, e.target.value)} 
                className="font-bold text-gray-700 px-2 py-1 border-b-2 border-purple-400 bg-transparent outline-none w-1/2" 
                placeholder="Ngữ cảnh (vd: Lớp học mới quen)"
              />
              <button onClick={() => removeDialogue(dlgIdx)} className="text-red-500 text-sm hover:underline">Xóa hội thoại</button>
            </div>
            
            <div className="space-y-3">
              {dlg.items.map((line: any, lineIdx: number) => (
                <div key={line.id} className="bg-white p-3 rounded border border-gray-200 flex gap-3 relative">
                  <button onClick={() => removeLine(dlgIdx, lineIdx)} className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-sm">&times;</button>
                  <div className="w-16 flex-shrink-0">
                    <input 
                      type="text" 
                      value={line.speaker} 
                      onChange={e => updateLine(dlgIdx, lineIdx, "speaker", e.target.value)} 
                      className="w-full text-center font-bold px-1 py-2 bg-gray-100 rounded border" 
                      placeholder="Người"
                      maxLength={5}
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Chữ Hán" value={line.text} onChange={e => updateLine(dlgIdx, lineIdx, "text", e.target.value)} className="w-full px-2 py-1 text-sm border rounded col-span-2" />
                    <input type="text" placeholder="Pinyin" value={line.pinyin} onChange={e => updateLine(dlgIdx, lineIdx, "pinyin", e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                    <input type="text" placeholder="Nghĩa" value={line.translation} onChange={e => updateLine(dlgIdx, lineIdx, "translation", e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                    <input type="text" placeholder="Audio URL" value={line.audioUrl} onChange={e => updateLine(dlgIdx, lineIdx, "audioUrl", e.target.value)} className="w-full px-2 py-1 text-sm border rounded col-span-2" />
                  </div>
                </div>
              ))}
              <button onClick={() => addLine(dlgIdx)} className="text-left text-sm text-purple-600 font-medium hover:underline">+ Thêm câu thoại</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addDialogue} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">+ Thêm chủ đề hội thoại</button>
    </div>
  );
}
