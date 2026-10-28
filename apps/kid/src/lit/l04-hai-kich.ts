import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l04',
  emoji: '🎭',
  title: vn('Hài kịch và truyện cười'),
  blurb: vn('Vì sao ta bật cười — xung đột, nhân vật, lời thoại và các kiểu câu'),
  lessons: [
    {
      id: 'l04-1',
      title: vn('Hài kịch: xung đột, nhân vật, lời thoại'),
      steps: [
        {
          kind: 'read',
          title: vn('Hài kịch là gì?'),
          text: vn(
            'Hài kịch là kịch dùng tiếng cười để chế giễu thói xấu của con người. Em cần nhận ra:\n• Xung đột: sự vênh nhau giữa cái nhân vật tưởng mình là và cái thật sự là (muốn tỏ ra sang mà lại quê, muốn tỏ ra giỏi mà lại dốt).\n• Nhân vật hài: mang một thói xấu được phóng to (khoe khoang, hám danh, keo kiệt…).\n• Lời thoại: lời nhân vật nói ra để lộ chính cái xấu của họ.\nVí dụ nổi tiếng: vở “Trưởng giả học làm sang” của Mô-li-e (Molière, Pháp), kể về ông Giuốc-đanh giàu có nhưng cứ muốn học làm quý tộc nên bị bọn thợ, thầy dạy lợi dụng.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: đọc một cảnh hài ngắn'),
          text: vn(
            'Cảnh hài do lớp học tự viết.\n\nBước 1 – Nhân vật muốn tỏ ra thế nào? Ông Phú muốn tỏ ra là người sành ăn, sang trọng.\nBước 2 – Thực tế thế nào? Ông không biết món mình gọi chỉ là rau muống.\nBước 3 – Xung đột: vẻ “sang” bề ngoài ↔ sự thiếu hiểu biết bên trong.\nBước 4 – Thủ pháp gây cười: lời thoại tự lộ, kết thúc bất ngờ.',
          ),
          code: 'PHÚ (vênh mặt): Cho tôi món đắt nhất! Người sang như tôi chỉ ăn đồ Tây.\nNGƯỜI PHỤC VỤ: Dạ, món đắt nhất hôm nay là “rau xanh xào tỏi kiểu Pháp” ạ.\nPHÚ: Tuyệt! Ở quê tôi làm gì có món này.\n(Người phục vụ bưng ra một đĩa rau muống xào tỏi.)\nPHÚ (gật gù, nếm): Đúng là hương vị Paris!',
        },
        {
          kind: 'choice',
          ask: vn('Xung đột gây cười trong cảnh trên là gì?'),
          options: [
            'Ông Phú đói bụng mà nhà hàng hết món',
            'Ông Phú muốn tỏ ra sang trọng, sành ăn nhưng thật ra không nhận ra đĩa rau muống quen thuộc',
            'Người phục vụ cãi nhau với ông Phú',
          ],
          answer: 1,
          why: vn('Cái cười bật ra từ khoảng cách giữa “muốn tỏ ra” và “thực chất”. Đó là xung đột cơ bản của hài kịch.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu thoại nào của ông Phú gây cười nhất, vì tự để lộ cái dốt của mình?'),
          options: ['“Cho tôi món đắt nhất!”', '“Tuyệt!”', '“Đúng là hương vị Paris!”'],
          answer: 2,
          why: vn('Ông khen rau muống là “hương vị Paris”. Câu thoại càng tự tin thì cái dốt càng lộ rõ — người xem bật cười.'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành ghi nhớ về hài kịch.'),
          code: 'Nhân vật hài kịch thường mang một ___ được phóng đại; tiếng cười bật ra từ ___ giữa cái nhân vật muốn tỏ ra và cái họ thật sự là.',
          answers: ['thói xấu', 'xung đột'],
          extra: ['phẩm chất tốt', 'lời ru', 'vần thơ'],
          why: vn('Thói xấu + xung đột = tiếng cười hài kịch. Nhớ công thức nhỏ này, em đọc vở hài nào cũng dễ hơn.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu giải thích vì sao câu “Đúng là hương vị Paris!” của ông Phú gây cười.'),
          frame: 'Câu thoại gây cười vì … . Qua đó, tác giả chế giễu …',
          model:
            'Câu thoại gây cười vì ông Phú khen một đĩa rau muống xào bình thường là “hương vị Paris”, tự để lộ sự thiếu hiểu biết của mình. Qua đó, tác giả chế giễu thói học đòi, thích tỏ ra sang trọng mà không có thực chất.',
          checklist: ['Em đã chỉ ra sự vênh nhau giữa lời nói và sự thật chưa?', 'Em đã nói thói xấu bị chế giễu chưa?'],
        },
      ],
    },
    {
      id: 'l04-2',
      title: vn('Truyện cười dân gian'),
      steps: [
        {
          kind: 'read',
          title: vn('Truyện cười: ngắn mà sâu'),
          text: vn(
            'Truyện cười dân gian rất ngắn, thường có một tình huống gây cười và một “cú chốt” bất ngờ ở cuối. Truyện chế giễu thói xấu như khoe khoang, keo kiệt, dốt mà hay nói chữ. Thủ pháp hay gặp: phóng đại, lời nói tự lộ, kết thúc bất ngờ.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: “Lợn cưới, áo mới”'),
          text: vn(
            'Bước 1 – Tình huống: hai anh đều thích khoe, gặp đúng nhau.\nBước 2 – Chi tiết gây cười: anh tìm lợn không hỏi “con lợn” mà hỏi “con lợn cưới”; anh kia không trả lời “không thấy” mà kể từ “lúc tôi mặc cái áo mới này”.\nBước 3 – Vì sao cười: lời nói thừa, chen vào chuyện chẳng liên quan, chỉ để khoe.\nBước 4 – Ý nghĩa: chế giễu thói khoe khoang lố bịch.',
          ),
          code: 'Tóm tắt (kể lại bằng lời của lớp học):\nMột anh có tính hay khoe, may được cái áo mới, đứng mãi ở cửa chờ người đi qua để khoe. Một anh khác cũng hay khoe, bị sổng con lợn, chạy đến hỏi: “Bác có thấy con lợn cưới của tôi chạy qua đây không?” Anh kia giơ vạt áo ra: “Từ lúc tôi mặc cái áo mới này, tôi chẳng thấy con lợn nào chạy qua cả!”',
        },
        {
          kind: 'choice',
          ask: vn('Vì sao câu hỏi của anh mất lợn lại gây cười?'),
          options: [
            'Vì anh hỏi rất lễ phép',
            'Vì đang vội tìm lợn mà vẫn cố chen chữ “cưới” vào để khoe',
            'Vì con lợn chạy rất nhanh',
            'Vì anh ấy không biết đường',
          ],
          answer: 1,
          why: vn('Đang mất lợn, cần hỏi nhanh, vậy mà vẫn nhớ khoe “lợn cưới”. Lời nói thừa ấy để lộ tính khoe khoang đến mức lố bịch.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các ý theo đúng diễn biến truyện cười “Lợn cưới, áo mới”.'),
          lines: [
            'Anh có áo mới đứng ở cửa chờ người qua để khoe.',
            'Anh mất lợn chạy đến hỏi có thấy “con lợn cưới” không.',
            'Anh áo mới giơ vạt áo, khoe “từ lúc tôi mặc cái áo mới này”.',
            'Người đọc bật cười trước hai kẻ khoe khoang gặp nhau.',
          ],
          why: vn('Truyện cười đi theo mạch: tình huống → sự việc dẫn đến cao trào → “cú chốt” → tiếng cười. Cú chốt luôn nằm ở cuối.'),
        },
        {
          kind: 'read',
          title: vn('Một truyện nữa: “Tam đại con gà”'),
          text: vn(
            'Tóm tắt: Một anh học trò dốt nhưng hay khoe chữ, đi dạy học. Gặp chữ “kê” (gà) mà không biết, anh đoán liều là “dủ dỉ là con dù dì”. Sợ sai, anh khấn thổ công, xin được ba đài âm dương, càng tin mình đúng. Đến khi bị bố học trò hỏi, anh còn cố chống chế rằng “dủ dỉ” là “dù dì”, “dù dì” là chị con công, con công là ông con gà — tức “tam đại con gà”.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Truyện “Tam đại con gà” chủ yếu chế giễu thói xấu nào?'),
          options: ['Keo kiệt', 'Dốt mà hay nói chữ, giấu dốt', 'Lười lao động', 'Nhút nhát'],
          answer: 1,
          why: vn('Anh thầy không biết mà không chịu nhận, càng chống chế càng lòi cái dốt. Bài học: không biết thì hỏi, đừng giấu dốt.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu giải thích vì sao câu trả lời “Từ lúc tôi mặc cái áo mới này, tôi chẳng thấy con lợn nào chạy qua cả!” gây cười.'),
          frame: 'Chi tiết này gây cười vì … . Qua đó, truyện phê phán …',
          model:
            'Chi tiết này gây cười vì đáng lẽ chỉ cần nói “không thấy”, anh ta lại kể thêm “từ lúc tôi mặc cái áo mới này” và giơ vạt áo ra để khoe. Qua đó, truyện phê phán thói khoe khoang đến mức lố bịch, không đúng lúc đúng chỗ.',
          checklist: ['Em đã chỉ ra phần lời nói “thừa” chưa?', 'Em đã nêu thói xấu bị phê phán chưa?'],
          tip: vn('Muốn giải thích vì sao buồn cười, hãy so sánh: bình thường người ta sẽ nói gì, còn nhân vật lại nói gì.'),
        },
      ],
    },
    {
      id: 'l04-3',
      title: vn('Trợ từ, thán từ và các kiểu câu'),
      steps: [
        {
          kind: 'read',
          title: vn('Trợ từ và thán từ'),
          text: vn(
            '• Trợ từ: đi kèm một từ ngữ để nhấn mạnh hoặc bày tỏ thái độ: những, có, chính, ngay, đích, cả… Ví dụ: “Nó ăn những ba bát cơm” (nhấn mạnh là nhiều); “Nó ăn có ba bát cơm” (nhấn mạnh là ít).\n• Thán từ: bộc lộ cảm xúc hoặc dùng để gọi – đáp: ôi, chao ôi, than ôi, trời ơi, ồ (cảm xúc); này, ơi, vâng, dạ (gọi – đáp).',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Câu (tự viết): “Ôi, chính em đã giải được bài toán khó nhất lớp!”\n\nBước 1 – Tìm từ bộc lộ cảm xúc, đứng tách riêng: “Ôi” → thán từ.\nBước 2 – Tìm từ đi kèm để nhấn mạnh: “chính” (nhấn mạnh “em”, không phải ai khác) → trợ từ.\nBước 3 – Xét mục đích câu: bộc lộ niềm vui, có dấu chấm than → câu cảm thán.',
          ),
        },
        {
          kind: 'fill',
          ask: vn('Điền trợ từ để nhấn mạnh ý được nêu trong ngoặc.'),
          code: 'Bạn ấy đọc ___ năm cuốn sách trong một tuần (nhấn mạnh là nhiều). Tớ mới đọc ___ một cuốn (nhấn mạnh là ít).',
          answers: ['những', 'có'],
          extra: ['ôi', 'này', 'vâng'],
          why: vn('“Những” nhấn mạnh số lượng nhiều, “có” nhấn mạnh số lượng ít. “Ôi, này, vâng” là thán từ, không đi kèm để nhấn mạnh.'),
        },
        {
          kind: 'read',
          title: vn('Bốn kiểu câu theo mục đích nói'),
          text: vn(
            '• Câu nghi vấn: dùng để hỏi (có ai, gì, sao, không, à…; dấu chấm hỏi).\n• Câu cầu khiến: ra lệnh, yêu cầu, đề nghị (hãy, đừng, chớ, đi, nào…).\n• Câu cảm thán: bộc lộ cảm xúc (ôi, chao ôi, biết bao, quá…; dấu chấm than).\n• Câu trần thuật: kể, tả, thông báo, nhận định — kiểu câu phổ biến nhất.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu “Bác có thấy con lợn cưới của tôi chạy qua đây không?” thuộc kiểu câu nào?'),
          options: ['Câu trần thuật', 'Câu cầu khiến', 'Câu cảm thán', 'Câu nghi vấn'],
          answer: 3,
          why: vn('Có cặp từ “có… không” và dấu chấm hỏi, dùng để hỏi nên là câu nghi vấn. Và chính trong câu hỏi ấy, nhân vật đã lén… khoe!'),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào là câu cầu khiến?'),
          options: ['Hôm nay trời đẹp quá!', 'Các em hãy giữ trật tự.', 'Ai đã làm vỡ cái cốc?', 'Mẹ em là giáo viên.'],
          answer: 1,
          why: vn('Từ “hãy” cho thấy lời yêu cầu, nên đó là câu cầu khiến. Câu 1 cảm thán, câu 3 nghi vấn, câu 4 trần thuật.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu thoại ngắn cho một nhân vật hài hay khoe khoang: một câu cảm thán có thán từ, một câu có trợ từ nhấn mạnh. Sau đó chỉ ra thán từ và trợ từ em dùng.'),
          frame: 'Câu 1: “Ôi, …!”\nCâu 2: “… những …”\n→ Thán từ: … ; trợ từ: …',
          model:
            'Câu 1: “Chao ôi, cái đồng hồ của tôi đẹp quá đi mất!”\nCâu 2: “Tôi mua nó những mười triệu đấy nhé.”\n→ Thán từ: “chao ôi”; trợ từ: “những” (nhấn mạnh là đắt, để khoe).',
          checklist: ['Câu 1 có thán từ và dấu chấm than chưa?', 'Câu 2 có trợ từ nhấn mạnh chưa?', 'Lời thoại có làm lộ thói khoe khoang của nhân vật không?'],
        },
      ],
    },
  ],
};
