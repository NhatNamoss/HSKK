import prisma from './src/lib/prisma';

async function main() {
  const course = await prisma.course.create({
    data: {
      title: 'Khóa học Test Tách bài',
      slug: 'test-tach-bai-' + Date.now(),
      description: 'Mỗi bài học một dạng riêng biệt',
      price: 0,
      status: 'published'
    }
  });

  const section = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Chương 1: Các dạng bài riêng biệt',
      orderIndex: 0
    }
  });

  // Bài 1: Từ vựng
  await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Bài 1: Thẻ từ vựng',
      lessonType: 'FLASHCARDS',
      content: JSON.stringify({
        blocks: [{
          type: 'flashcards',
          items: [
            { id: '1', front: '自我介绍', back: 'tự giới thiệu', pinyin: 'zìwǒ jièshào', audioUrl: '' },
            { id: '2', front: '姓名', back: 'họ và tên', pinyin: 'xìngmíng', audioUrl: '' },
            { id: '3', front: '家乡', back: 'quê hương', pinyin: 'jiāxiāng', audioUrl: '' }
          ]
        }]
      }),
      orderIndex: 0
    }
  });

  // Bài 2: Mẫu câu
  await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Bài 2: Mẫu câu thông dụng',
      lessonType: 'SENTENCES',
      content: JSON.stringify({
        blocks: [{
          type: 'sentences',
          items: [
            { id: '4', pattern: '我叫 + [tên], 你可以叫我 + [biệt danh]。', example: '我叫阮氏美，你可以叫我小美。', translation: 'Tôi tên là Nguyễn Thị Mỹ, bạn có thể gọi tôi là Tiểu Mỹ.', audioUrl: '' },
            { id: '5', pattern: '我是 + [quốc tịch] + 人，来自 + [nơi]。', example: '我是越南人，来自河内。', translation: 'Tôi là người Việt Nam, đến từ Hà Nội.', audioUrl: '' }
          ]
        }]
      }),
      orderIndex: 1
    }
  });

  // Bài 3: Tình huống
  await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Bài 3: Tình huống sử dụng',
      lessonType: 'SITUATIONS',
      content: JSON.stringify({
        blocks: [{
          type: 'situations',
          items: [
            {
              id: '6',
              title: 'Lớp học',
              situations: [
                { id: '7', text: '同学', pinyin: 'tóngxué', translation: 'bạn học', audioUrl: '' },
                { id: '8', text: '交朋友', pinyin: 'jiāo péngyou', translation: 'kết bạn', audioUrl: '' }
              ]
            }
          ]
        }]
      }),
      orderIndex: 2
    }
  });

  // Bài 4: Hội thoại
  await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Bài 4: Hội thoại mẫu',
      lessonType: 'DIALOGUES',
      content: JSON.stringify({
        blocks: [{
          type: 'dialogues',
          items: [
            {
              id: '9',
              title: 'Lớp học',
              items: [
                { id: '10', speaker: 'A', text: '你好，我叫马丽，你叫什么名字？', pinyin: 'Nǐ hǎo, wǒ jiào Mǎ Lì, nǐ jiào shénme míngzi?', translation: 'Chào bạn, mình tên Mã Lệ, bạn tên gì?', audioUrl: '' },
                { id: '11', speaker: 'B', text: '你好，我叫陈明，很高兴认识你。', pinyin: 'Nǐ hǎo, wǒ jiào Chén Míng, hěn gāoxìng rènshi nǐ.', translation: 'Chào bạn, mình tên Trần Minh, rất vui được quen bạn.', audioUrl: '' }
              ]
            }
          ]
        }]
      }),
      orderIndex: 3
    }
  });

  // Bài 5: Trò chơi (Quiz)
  const quiz = await prisma.quiz.create({
    data: {
      title: '[Bài tập] Test Game',
      quizType: 'EXERCISE',
      status: 'published'
    }
  });
  
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionType: 'MULTIPLE_CHOICE',
      question: 'Chọn từ đúng cho: tự giới thiệu',
      choices: {
        create: [
          { content: '自我介绍', isCorrect: true, orderIndex: 0 },
          { content: '姓名', isCorrect: false, orderIndex: 1 }
        ]
      }
    }
  });

  await prisma.lesson.create({
    data: {
      sectionId: section.id,
      title: 'Bài 5: Trò chơi ôn tập',
      lessonType: 'QUIZ',
      quizId: quiz.id,
      orderIndex: 4
    }
  });

  console.log('Tạo khóa học thành công! Truy cập trang /hoc/' + course.slug);
}

main().catch(console.error).finally(() => prisma.$disconnect());
