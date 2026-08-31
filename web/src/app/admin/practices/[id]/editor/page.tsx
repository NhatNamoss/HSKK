import prisma from "@/lib/prisma";
import PracticeEditorClient from "./PracticeEditorClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Biên tập Bài Luyện Tập 6 Kỹ Năng - Admin",
};

export default async function PracticeEditorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const practice = await prisma.practice.findUnique({
    where: { id }
  });

  if (!practice) {
    notFound();
  }

  // Parse existing content or supply defaults for the 6 tabs
  let content = {
    flashcards: [],
    sentences: [],
    situations: [],
    dialogues: [],
    games: [],
    writeTranslate: []
  };

  if (practice.content) {
    try {
      content = { ...content, ...JSON.parse(practice.content) };
    } catch (e) {
      console.error("Error parsing practice content", e);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/practices" className="text-gray-500 hover:text-gray-900">
          ← Quay lại
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">
          Biên tập: {practice.title}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <PracticeEditorClient practiceId={practice.id} initialContent={content} />
      </div>
    </div>
  );
}
