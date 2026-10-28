import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l01',
  emoji: '🏯',
  title: vn('Truyện lịch sử'),
  blurb: vn('Đọc truyện về người xưa, việc xưa — và hiểu vì sao nhà văn kể lại'),
  lessons: [
    {
      id: 'l01-1',
      title: vn('Truyện lịch sử là gì?'),
      steps: [
        {
          kind: 'read',
          title: vn('Kể chuyện xưa bằng văn chương'),
          text: vn(
            'Truyện lịch sử là truyện lấy chất liệu từ lịch sử: một thời đại có thật, những sự kiện có thật và những con người có thật. Nhưng đây là văn chương chứ không phải sách sử, nên nhà văn được phép hư cấu: thêm lời nói, cử chỉ, suy nghĩ, thậm chí thêm nhân vật, để câu chuyện sống động hơn. Em hãy nhớ bốn chữ: bối cảnh – sự kiện – nhân vật – hư cấu.',
          ),
        },
        {
          kind: 'read',
          title: vn('Bốn yếu tố cần nhận ra'),
          text: vn(
            '• Bối cảnh: thời gian, không gian lịch sử (triều đại nào, năm nào, ở đâu).\n• Cốt truyện: dựa trên một sự kiện lịch sử (một trận đánh, một cuộc khởi nghĩa…).\n• Nhân vật: thường có nhân vật lịch sử thật (vua, tướng, anh hùng) và có thể có nhân vật do nhà văn sáng tạo.\n• Ngôn ngữ: hợp với thời xưa, hay có từ Hán Việt, cách xưng hô cổ (bệ hạ, thần, trẫm…).',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Đọc đoạn văn ngắn (do lớp học tự viết) rồi xem cô phân tích.\n\nBước 1 – Bối cảnh: năm 938, sông Bạch Đằng.\nBước 2 – Sự kiện: Ngô Quyền đánh quân Nam Hán, dùng bãi cọc và con nước thủy triều.\nBước 3 – Nhân vật lịch sử: Ngô Quyền. Lời nói “Nước rút rồi…” là chi tiết hư cấu, giúp ta thấy ông bình tĩnh, tính toán kĩ.\nBước 4 – Ngôn ngữ: “quân giặc”, “hạ lệnh” mang màu sắc chuyện xưa.',
          ),
          code: 'Năm ấy là năm 938. Trên sông Bạch Đằng, nước triều đang rút. Ngô Quyền đứng trên mũi thuyền, nhìn những hàng cọc nhọn dần nhô lên khỏi mặt nước. Ông khẽ nói: “Nước rút rồi, thuyền giặc không còn đường lui.” Rồi ông giơ tay hạ lệnh. Tiếng trống trận vang dậy cả khúc sông.',
        },
        {
          kind: 'choice',
          ask: vn('Trong đoạn văn mẫu, chi tiết nào nhiều khả năng là do nhà văn hư cấu?'),
          options: ['Trận đánh diễn ra năm 938', 'Trận đánh diễn ra trên sông Bạch Đằng', 'Ngô Quyền khẽ nói: “Nước rút rồi…”', 'Quân ta dùng bãi cọc nhọn'],
          answer: 2,
          why: vn('Sử sách ghi năm, địa điểm và cách đánh, nhưng không ghi lại từng câu nói. Lời thoại thường là phần nhà văn sáng tạo để khắc họa nhân vật.'),
        },
        {
          kind: 'choice',
          ask: vn('Vì sao truyện lịch sử được phép hư cấu?'),
          options: [
            'Vì nhà văn không biết lịch sử',
            'Vì đó là tác phẩm văn chương, hư cấu giúp nhân vật và sự kiện sống động, gửi gắm thông điệp',
            'Vì truyện lịch sử không cần đúng với sự thật nào cả',
          ],
          answer: 1,
          why: vn('Đúng rồi! Cái “khung” lịch sử vẫn phải tôn trọng, còn phần hư cấu như lời nói, tâm trạng giúp người đọc cảm nhận lịch sử bằng trái tim.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền vào chỗ trống để nhớ các yếu tố của truyện lịch sử.'),
          code: 'Truyện lịch sử có ___ là một thời đại có thật, cốt truyện dựa trên ___ lịch sử, và nhân vật trung tâm thường là ___ lịch sử.',
          answers: ['bối cảnh', 'sự kiện', 'nhân vật'],
          extra: ['vần thơ', 'lời bình', 'tác giả'],
          why: vn('Bối cảnh – sự kiện – nhân vật là ba “chiếc cột” của truyện lịch sử. Thêm hư cấu nữa là đủ bốn chữ cần nhớ.'),
        },
        {
          kind: 'compose',
          task: vn('Giới thiệu ngắn (2–3 câu) một sự kiện lịch sử mà em biết: nó xảy ra khi nào, ở đâu, ai là người làm nên sự kiện và vì sao đáng nhớ.'),
          frame: 'Vào năm …, tại …, … đã … . Sự kiện này đáng nhớ vì …',
          model:
            'Vào năm 938, tại sông Bạch Đằng, Ngô Quyền đã chỉ huy quân dân đánh tan quân Nam Hán bằng trận địa cọc ngầm. Sự kiện này đáng nhớ vì nó mở ra thời kì độc lập lâu dài cho đất nước và cho thấy trí thông minh của cha ông ta.',
          checklist: ['Em đã nêu thời gian và địa điểm chưa?', 'Em đã nói ai là người làm nên sự kiện chưa?', 'Em đã có một câu nói vì sao sự kiện đáng nhớ chưa?'],
          tip: vn('Chỉ viết những điều em chắc chắn là đúng. Nếu không nhớ năm chính xác, hãy chọn một sự kiện khác em nhớ rõ hơn.'),
        },
      ],
    },
    {
      id: 'l01-2',
      title: vn('Đọc một truyện lịch sử'),
      steps: [
        {
          kind: 'read',
          title: vn('Bốn bước đọc'),
          text: vn(
            'Khi gặp một truyện lịch sử, em đọc theo bốn bước:\n1. Xác định bối cảnh: thời nào, ở đâu, đất nước đang gặp chuyện gì.\n2. Tóm tắt sự kiện chính.\n3. Tìm nhân vật qua chi tiết: lời nói, hành động, cử chỉ, suy nghĩ.\n4. Hỏi: nhà văn muốn nhắn gửi điều gì? (lòng yêu nước, tinh thần đoàn kết, bài học về người tài…)',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: đọc nhân vật qua chi tiết'),
          text: vn(
            'Đoạn văn do lớp học tự viết, kể về vua Quang Trung trước trận đánh mùa xuân năm 1789.\n\nBước 1 – Tìm chi tiết: “chỉ vài ngày đầu xuân”, “ngày mồng bảy… ăn Tết ở Thăng Long”.\nBước 2 – Chi tiết nói lên gì: nhà vua tự tin, đã tính trước thời gian, hành quân rất nhanh.\nBước 3 – Đánh giá: đó là một vị tướng tài, quyết đoán và biết khích lệ lòng quân.',
          ),
          code: 'Đêm cuối năm, vua Quang Trung cho mở tiệc khao quân. Ngài nâng chén nói với các tướng: “Chỉ vài ngày đầu xuân, ta sẽ đánh tan giặc. Ngày mồng bảy, các ngươi hãy hẹn nhau vào ăn Tết ở Thăng Long!” Các tướng nhìn nhau, ai nấy đều thấy lòng nóng rực.',
        },
        {
          kind: 'choice',
          ask: vn('Chi tiết “Các tướng nhìn nhau, ai nấy đều thấy lòng nóng rực” cho thấy điều gì?'),
          options: ['Các tướng đang sợ hãi', 'Lời nói của nhà vua đã khích lệ tinh thần quân sĩ', 'Trời đêm cuối năm rất nóng', 'Các tướng không tin nhà vua'],
          answer: 1,
          why: vn('Phản ứng của người xung quanh cũng là một cách khắc họa nhân vật chính. “Lòng nóng rực” cho thấy sức truyền cảm của nhà vua.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu hỏi nào giúp em tìm ra thông điệp của một truyện lịch sử?'),
          options: ['Truyện này dài bao nhiêu trang?', 'Nhân vật mặc áo màu gì?', 'Qua câu chuyện xưa, nhà văn muốn người đọc hôm nay hiểu và trân trọng điều gì?'],
          answer: 2,
          why: vn('Nhà văn kể chuyện xưa để nói với người nay. Hãy luôn hỏi: câu chuyện này còn ý nghĩa gì với chúng ta hôm nay?'),
        },
        {
          kind: 'read',
          title: vn('Ngôn ngữ của truyện lịch sử'),
          text: vn(
            'Ngôn ngữ giúp ta “bước vào” thời xưa: từ Hán Việt (hoàng đế, tướng sĩ, xã tắc), cách xưng hô (trẫm – khanh, bệ hạ – thần, ta – các ngươi), tên chức quan, tên địa danh cổ. Khi đọc, em không cần nhớ hết, chỉ cần nhận ra chúng làm cho truyện mang không khí lịch sử.',
          ),
        },
        {
          kind: 'fill',
          ask: vn('Chọn cách xưng hô hợp với không khí truyện lịch sử.'),
          code: 'Vị tướng quỳ xuống tâu: “Muôn tâu ___, ___ xin đem quân đi trước mở đường.”',
          answers: ['bệ hạ', 'thần'],
          extra: ['bạn', 'tớ', 'anh'],
          why: vn('Bề tôi gọi vua là “bệ hạ” và tự xưng “thần”. Cách xưng hô này cho thấy quan hệ vua – tôi thời phong kiến.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các câu thành một đoạn nhận xét nhân vật hoàn chỉnh.'),
          lines: [
            'Vua Quang Trung hiện lên là một vị tướng tài và tự tin.',
            'Ngay từ đêm cuối năm, ngài đã hẹn các tướng ngày mồng bảy vào ăn Tết ở Thăng Long.',
            'Lời hẹn ấy cho thấy nhà vua đã tính toán kĩ và tin chắc vào chiến thắng.',
            'Qua đó, người đọc thêm khâm phục tài năng của người anh hùng áo vải.',
          ],
          why: vn('Một đoạn nhận xét tốt đi theo thứ tự: câu chủ đề → dẫn chứng (chi tiết) → phân tích → đánh giá.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nhận xét về vua Quang Trung qua một chi tiết trong đoạn văn mẫu.'),
          frame: 'Chi tiết … cho thấy vua Quang Trung là người … . Qua đó, em cảm thấy …',
          model:
            'Chi tiết vua Quang Trung hẹn các tướng ngày mồng bảy vào ăn Tết ở Thăng Long cho thấy ngài là người tự tin, quyết đoán và đã tính toán trước mọi việc. Qua đó, em cảm thấy khâm phục tài cầm quân của người anh hùng.',
          checklist: ['Em đã nêu đúng một chi tiết chưa?', 'Em đã nói chi tiết ấy cho thấy phẩm chất gì chưa?', 'Em đã nêu cảm nghĩ của mình chưa?'],
        },
      ],
    },
    {
      id: 'l01-3',
      title: vn('Biệt ngữ xã hội và từ ngữ địa phương'),
      steps: [
        {
          kind: 'read',
          title: vn('Từ ngữ địa phương'),
          text: vn(
            'Từ ngữ địa phương là từ chỉ dùng (hoặc dùng nhiều) ở một vùng. Ví dụ: người miền Trung nói “mô” (đâu), “răng” (sao), “rứa” (thế); người miền Nam nói “heo” (lợn), “trái” (quả), “bắp” (ngô), “má” (mẹ). Từ dùng chung cả nước, như “lợn”, “quả”, gọi là từ toàn dân.',
          ),
          code: 'Mẹ ơi, con để cái nón ở mô rồi?\n→ “mô” là từ địa phương miền Trung, nghĩa là “đâu”.',
        },
        {
          kind: 'read',
          title: vn('Biệt ngữ xã hội'),
          text: vn(
            'Biệt ngữ xã hội là từ ngữ chỉ một nhóm người trong xã hội hiểu và dùng với nhau. Ví dụ, học sinh hay gọi điểm 0 là “trứng”, gọi việc học thuộc mà không hiểu là “học vẹt”. Người ngoài nhóm có thể không hiểu, nên chỉ nên dùng đúng lúc, đúng chỗ.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Câu (tự viết): “Bà nội dặn: Con ra vườn hái mấy trái ớt, rồi coi chừng con heo nghe!”\n\nBước 1 – Tìm từ lạ so với từ toàn dân: “trái”, “coi chừng”, “heo”.\nBước 2 – Đổi sang từ toàn dân: trái → quả, coi chừng → trông chừng, heo → lợn.\nBước 3 – Nhận xét tác dụng: trong truyện, những từ này giúp lời bà mang màu sắc miền Nam, thân mật và chân thật.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Từ nào là từ địa phương?'),
          options: ['quả dứa', 'trái thơm', 'bông hoa', 'cái bát'],
          answer: 1,
          why: vn('Người miền Nam gọi quả dứa là “trái thơm”. “Quả dứa”, “bông hoa”, “cái bát” là cách nói phổ biến hơn trong ngôn ngữ chung.'),
        },
        {
          kind: 'fill',
          ask: vn('Đổi từ địa phương miền Trung sang từ toàn dân.'),
          code: '“Răng mi không đi học?” nghĩa là: “___ mày không đi học?”',
          answers: ['Sao'],
          extra: ['Đâu', 'Thế', 'Ai'],
          why: vn('“Răng” nghĩa là “sao”, “mi” nghĩa là “mày”. Biết những từ này, em sẽ đọc dễ hơn các truyện viết về miền Trung.'),
        },
        {
          kind: 'choice',
          ask: vn('Khi nào dùng biệt ngữ xã hội là KHÔNG phù hợp?'),
          options: ['Khi nhân vật học sinh trò chuyện với bạn trong truyện', 'Khi viết bài văn nghị luận gửi thầy cô chấm', 'Khi nhà văn muốn khắc họa lời nói của một nhóm người'],
          answer: 1,
          why: vn('Bài văn cần ngôn ngữ chuẩn mực để ai cũng hiểu. Biệt ngữ chỉ hợp khi muốn tái hiện lời nói của một nhóm người.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu: câu thứ nhất là một lời nói có dùng một từ địa phương; câu thứ hai giải thích nghĩa của từ ấy và tác dụng khi dùng nó trong truyện.'),
          frame: 'Câu 1: “…” \nCâu 2: Từ “…” là từ địa phương …, nghĩa là … ; dùng từ này giúp …',
          model:
            'Câu 1: “Con đi mô mà về trễ rứa?” – mẹ hỏi.\nCâu 2: Từ “mô” và “rứa” là từ địa phương miền Trung, nghĩa là “đâu” và “thế”; dùng chúng giúp lời của người mẹ chân thật, gần gũi và mang đậm màu sắc quê hương.',
          checklist: ['Câu 1 có ít nhất một từ địa phương chưa?', 'Em đã giải thích nghĩa bằng từ toàn dân chưa?', 'Em đã nói tác dụng của từ ấy chưa?'],
        },
      ],
    },
  ],
};
