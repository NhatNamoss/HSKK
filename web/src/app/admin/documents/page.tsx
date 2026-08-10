import prisma from "@/lib/prisma";
import DocumentClient from "./DocumentClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Tài liệu - Admin",
};

export default async function DocumentsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const documents = await prisma.document.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Tài liệu Thư viện</h2>
      </div>

      <DocumentClient initialDocuments={documents} categories={categories} />
    </div>
  );
}
