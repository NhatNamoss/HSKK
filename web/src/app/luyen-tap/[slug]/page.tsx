import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PracticeViewer from "./PracticeViewer";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const practice = await prisma.practice.findUnique({
    where: { slug }
  });

  if (!practice) return { title: "Không tìm thấy bài luyện tập" };

  return {
    title: `${practice.title} - Luyện Tập Kỹ Năng`,
    description: practice.description || "Bài luyện tập 6 kỹ năng",
  };
}

export default async function PracticeDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const practice = await prisma.practice.findUnique({
    where: { slug, status: "published" },
    include: {
      category: true,
    }
  });

  if (!practice) {
    notFound();
  }

  let parsedContent = {
    flashcards: [],
    sentences: [],
    situations: [],
    dialogues: [],
    games: [],
    writeTranslate: []
  };

  if (practice.content) {
    try {
      parsedContent = { ...parsedContent, ...JSON.parse(practice.content) };
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <PracticeViewer practice={practice} content={parsedContent} />
    </div>
  );
}
