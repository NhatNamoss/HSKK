const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // Create Categories
  const categories = [
    { name: 'HSK 1', slug: 'hsk-1' },
    { name: 'HSK 2', slug: 'hsk-2' },
    { name: 'HSK 3', slug: 'hsk-3' },
    { name: 'HSK 4', slug: 'hsk-4' },
    { name: 'Ngữ pháp', slug: 'ngu-phap' },
    { name: 'Luyện nghe', slug: 'luyen-nghe' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(createdCat);
    console.log(`Created category: ${createdCat.name}`);
  }

  // Create Documents
  const documents = [
    {
      title: 'Tài liệu HSK 1 Tiêu chuẩn',
      description: 'Tổng hợp từ vựng và ngữ pháp cơ bản nhất cho người mới bắt đầu học tiếng Trung.',
      filePath: 'https://example.com/hsk1.pdf',
      fileType: 'PDF',
      categoryId: createdCategories[0].id,
    },
    {
      title: 'Bộ đề thi thử HSK 2',
      description: 'Cập nhật 5 bộ đề thi HSK 2 mới nhất năm 2024.',
      filePath: 'https://example.com/hsk2-test.pdf',
      fileType: 'PDF',
      categoryId: createdCategories[1].id,
    },
    {
      title: '100 Cấu trúc ngữ pháp HSK 3 - 4',
      description: 'Tổng hợp các cấu trúc ngữ pháp thông dụng giúp bạn tự tin viết câu tiếng Trung.',
      filePath: 'https://example.com/ngu-phap.pdf',
      fileType: 'PDF',
      categoryId: createdCategories[4].id,
    }
  ];

  for (const doc of documents) {
    // There is no slug on Document in Prisma schema. It's ID-based.
    // Wait, does Document have a slug? Let me check schema. No.
    // It has id, title, description, filePath, fileType, coverImage, categoryId.
    const createdDoc = await prisma.document.create({
      data: doc,
    });
    console.log(`Created document: ${createdDoc.title}`);
  }

  // ----------------------------------------------------------------
  // Create Mock Courses
  // ----------------------------------------------------------------
  const course = await prisma.course.upsert({
    where: { slug: 'hsk-1-toan-dien' },
    update: {},
    create: {
      title: 'Khóa học HSK 1 Toàn diện',
      slug: 'hsk-1-toan-dien',
      description: 'Khóa học dành cho người mới bắt đầu, trang bị đầy đủ từ vựng và ngữ pháp để thi HSK 1.',
      price: 0,
      originalPrice: 500000,
      status: 'published',
      level: 'HSK 1',
      validityPeriod: 365,
    },
  });
  console.log(`Created course: ${course.title}`);

  // Create Sections
  const section1 = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Tuần 1: Nhập môn Tiếng Trung',
      orderIndex: 0,
    }
  });

  const section2 = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Tuần 2: Giao tiếp cơ bản',
      orderIndex: 1,
    }
  });

  // Create Lessons
  await prisma.lesson.createMany({
    data: [
      {
        sectionId: section1.id,
        title: 'Bài 1: Xin chào! Phiên âm Pinyin cơ bản',
        lessonType: 'VIDEO',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // demo video
        content: 'Hôm nay chúng ta sẽ học cách phát âm Pinyin chuẩn.',
        orderIndex: 0,
        isPreview: true,
      },
      {
        sectionId: section1.id,
        title: 'Tài liệu Tập viết Chữ Hán',
        lessonType: 'PDF',
        videoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // demo pdf
        content: 'Tải tài liệu PDF và tập viết theo hướng dẫn.',
        orderIndex: 1,
        isPreview: false,
      },
      {
        sectionId: section2.id,
        title: 'Bài 2: Bạn tên là gì?',
        lessonType: 'VIDEO',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        content: 'Cách hỏi tên và giới thiệu bản thân.',
        orderIndex: 0,
        isPreview: false,
      }
    ]
  });
  console.log('Created sections and lessons for course.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
