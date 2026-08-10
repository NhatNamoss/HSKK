import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding dummy course data...')

  // 1. Create a dummy Course
  const course = await prisma.course.create({
    data: {
      title: 'Khóa học HSK 3 - Test Hệ thống mới',
      slug: 'hsk-3-test-he-thong-moi-' + Date.now(),
      description: 'Khóa học được tự động tạo ra để test tính năng Editor và các dạng bài tập mới.',
      thumbnail: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      price: 0,
      level: 'HSK3',
      status: 'published'
    }
  })
  console.log(`Created Course: ${course.id}`)

  // 2. Create a Section
  const section = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Chương 1: Trải nghiệm Bài tập tương tác',
      orderIndex: 0
    }
  })
  console.log(`Created Section: ${section.id}`)

  // 3. Create a Quiz (the hidden quiz for the lesson)
  const quiz = await prisma.quiz.create({
    data: {
      title: '[Bài tập] Trắc nghiệm & Nối từ & Điền từ',
      quizType: 'EXERCISE',
      status: 'published'
    }
  })
  console.log(`Created Quiz: ${quiz.id}`)

  // 4. Create a Lesson of type QUIZ linked to the Quiz
  const lesson = await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Bài 1: Làm thử các dạng bài tập mới',
      lessonType: 'QUIZ',
      quizId: quiz.id,
      orderIndex: 0
    }
  })
  console.log(`Created Lesson: ${lesson.id}`)

  // 5. Populate Questions

  // Q1: MULTIPLE_CHOICE
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionType: 'MULTIPLE_CHOICE',
      question: 'Từ "Xin chào" trong tiếng Trung viết như thế nào?',
      explanation: '你好 (Nǐ hǎo) nghĩa là Xin chào.',
      points: 10,
      orderIndex: 0,
      choices: {
        create: [
          { content: '你好', isCorrect: true, orderIndex: 0 },
          { content: '谢谢', isCorrect: false, orderIndex: 1 },
          { content: '再见', isCorrect: false, orderIndex: 2 },
          { content: '对不起', isCorrect: false, orderIndex: 3 }
        ]
      }
    }
  })

  // Q2: FILL_IN_BLANK (Multiple blanks)
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionType: 'FILL_IN_BLANK',
      question: 'Hôm qua tôi đi ___ mua ___.',
      explanation: 'Đi siêu thị (超市) mua hoa quả (水果)',
      points: 20,
      orderIndex: 1,
      choices: {
        create: [
          { content: 'siêu thị, chợ, cửa hàng', isCorrect: true, orderIndex: 0 }, // Blank 1
          { content: 'hoa quả, trái cây, đồ ăn', isCorrect: true, orderIndex: 1 }  // Blank 2
        ]
      }
    }
  })

  // Q3: MATCHING
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionType: 'MATCHING',
      question: 'Nối chữ Hán với nghĩa Tiếng Việt tương ứng',
      explanation: '苹果 = Quả táo, 漂亮 = Xinh đẹp, 喜欢 = Thích',
      points: 30,
      orderIndex: 2,
      choices: {
        create: [
          { content: '苹果', isCorrect: true, matchGroup: 'left', orderIndex: 0 },
          { content: 'Quả táo', isCorrect: true, matchGroup: 'right', orderIndex: 0 },
          
          { content: '漂亮', isCorrect: true, matchGroup: 'left', orderIndex: 1 },
          { content: 'Xinh đẹp', isCorrect: true, matchGroup: 'right', orderIndex: 1 },
          
          { content: '喜欢', isCorrect: true, matchGroup: 'left', orderIndex: 2 },
          { content: 'Thích', isCorrect: true, matchGroup: 'right', orderIndex: 2 },
        ]
      }
    }
  })

  // Q4: WORD_ORDER
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionType: 'WORD_ORDER',
      question: 'Sắp xếp thành câu hoàn chỉnh: "Tôi rất thích học tiếng Trung"',
      explanation: '我 很 喜欢 学 中文',
      points: 15,
      orderIndex: 3,
      choices: {
        create: [
          { content: '我', isCorrect: true, orderIndex: 0 },
          { content: '很', isCorrect: true, orderIndex: 1 },
          { content: '喜欢', isCorrect: true, orderIndex: 2 },
          { content: '学', isCorrect: true, orderIndex: 3 },
          { content: '中文', isCorrect: true, orderIndex: 4 }
        ]
      }
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
