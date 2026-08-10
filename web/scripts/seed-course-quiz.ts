import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding Course with all types of exercises...');

  // 1. Create a Quiz with all question types
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Bài tập Tổng hợp 4 Kỹ năng HSKK',
      description: 'Bài kiểm tra tổng hợp chứa đầy đủ các dạng: Trắc nghiệm, Điền từ, Reading, Nối từ và Sắp xếp.',
      quizType: 'EXERCISE',
      status: 'published',
      questions: {
        create: [
          // 1. Multiple Choice
          {
            questionType: 'MULTIPLE_CHOICE',
            question: 'Từ "Cảm ơn" trong tiếng Trung viết như thế nào?',
            points: 10,
            orderIndex: 0,
            choices: {
              create: [
                { content: '你好', isCorrect: false, orderIndex: 0 },
                { content: '谢谢', isCorrect: true, orderIndex: 1 },
                { content: '再见', isCorrect: false, orderIndex: 2 },
              ]
            }
          },
          // 2. Fill in the Blank
          {
            questionType: 'FILL_IN_BLANK',
            question: 'Hôm nay tôi ___ cơm, ngày mai tôi ăn ___ ___ đi học.',
            points: 20,
            orderIndex: 1,
            choices: {
              create: [
                { content: 'ăn', isCorrect: true, orderIndex: 0 },
                { content: 'phở', isCorrect: true, orderIndex: 1 },
                { content: 'rồi', isCorrect: true, orderIndex: 2 },
              ]
            }
          },
          // 3. Reading (Split Screen using |||)
          {
            questionType: 'MULTIPLE_CHOICE',
            question: 'Xin chào, tôi là Tiểu Minh. Năm nay tôi 20 tuổi. Tôi đang học tại đại học Bắc Kinh. Sở thích của tôi là nghe nhạc và đọc sách. Cuối tuần tôi thường cùng bạn bè đi chơi bóng rổ. ||| Sở thích của Tiểu Minh là gì?',
            points: 15,
            orderIndex: 2,
            choices: {
              create: [
                { content: 'Đọc sách và bơi lội', isCorrect: false, orderIndex: 0 },
                { content: 'Nghe nhạc và đọc sách', isCorrect: true, orderIndex: 1 },
                { content: 'Đánh bóng rổ', isCorrect: false, orderIndex: 2 },
              ]
            }
          },
          // 4. Reading (Fill in Blank)
          {
            questionType: 'FILL_IN_BLANK',
            question: 'Mùa xuân thời tiết ấm áp, trăm hoa đua nở. Mùa hè rất nóng bức, thường có mưa rào. Mùa thu mát mẻ, lá rụng nhiều. Mùa đông lạnh giá, thỉnh thoảng có tuyết rơi. ||| Vào mùa thu, thời tiết như thế nào? ___',
            points: 15,
            orderIndex: 3,
            choices: {
              create: [
                { content: 'mát mẻ', isCorrect: true, orderIndex: 0 },
              ]
            }
          },
          // 5. Matching (Nối từ)
          {
            questionType: 'MATCHING',
            question: 'Nối các từ tiếng Trung với nghĩa tiếng Việt tương ứng:',
            points: 20,
            orderIndex: 4,
            choices: {
              create: [
                { content: '苹果', matchGroup: 'left', orderIndex: 0 },
                { content: 'Quả táo', matchGroup: 'right', orderIndex: 0, isCorrect: true },
                { content: '香蕉', matchGroup: 'left', orderIndex: 1 },
                { content: 'Quả chuối', matchGroup: 'right', orderIndex: 1, isCorrect: true },
                { content: '西瓜', matchGroup: 'left', orderIndex: 2 },
                { content: 'Dưa hấu', matchGroup: 'right', orderIndex: 2, isCorrect: true },
              ]
            }
          },
          // 6. Word Order (Sắp xếp từ)
          {
            questionType: 'WORD_ORDER',
            question: 'Sắp xếp các từ sau thành câu đúng: "Tôi là sinh viên"',
            points: 20,
            orderIndex: 5,
            choices: {
              create: [
                { content: '我', isCorrect: true, orderIndex: 0 },
                { content: '是', isCorrect: true, orderIndex: 1 },
                { content: '学生', isCorrect: true, orderIndex: 2 },
              ]
            }
          }
        ]
      }
    }
  });

  // 2. Create the Course
  const course = await prisma.course.create({
    data: {
      title: 'Khóa Học Mẫu: Đầy Đủ Các Dạng Bài Tập',
      slug: 'khoa-hoc-mau-day-du-cac-dang-bai-tap-' + Date.now(),
      description: 'Khóa học này được tạo ra để demo tất cả các tính năng của hệ thống LMS, bao gồm các loại câu hỏi trắc nghiệm, điền từ, đọc hiểu chia đôi màn hình, và nối thẻ.',
      price: 0,
      status: 'published',
      level: 'HSKK',
      thumbnail: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?q=80&w=2072&auto=format&fit=crop',
      sections: {
        create: [
          {
            title: 'Chương 1: Trải nghiệm Bài tập',
            orderIndex: 0,
            lessons: {
              create: [
                {
                  title: 'Giới thiệu về hệ thống bài tập',
                  lessonType: 'VIDEO',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  orderIndex: 0,
                  content: 'Đây là bài học giới thiệu.'
                },
                {
                  title: 'Thực hành các dạng câu hỏi',
                  lessonType: 'QUIZ',
                  quizId: quiz.id, // Link the quiz!
                  orderIndex: 1,
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Created Course:', course.title);
  console.log('✅ Added Quiz with all 5 question types to Lesson 2');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
