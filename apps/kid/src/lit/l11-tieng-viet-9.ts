import { vn, type PyUnit } from '../code/learn/types';

/** Tiếng Việt thực hành: từ Hán Việt, kiểu câu, thành phần biệt lập, câu ghép, liên kết câu. Câu ví dụ tự viết. */
export const unit: PyUnit = {
  id: 'l11',
  emoji: '🔤',
  title: vn('Tiếng Việt thực hành'),
  blurb: vn('Từ Hán Việt, câu, thành phần biệt lập và cách nối câu cho mạch lạc'),
  lessons: [
    {
      id: 'l11-1',
      title: vn('Từ Hán Việt và lỗi dùng từ'),
      steps: [
        {
          kind: 'read',
          title: vn('Từ Hán Việt'),
          text: vn(
            'Từ Hán Việt là những từ tiếng Việt mượn từ tiếng Hán và đọc theo cách đọc của người Việt. Mỗi từ thường được ghép từ các yếu tố Hán Việt, mỗi yếu tố mang một nghĩa.\n\nBí quyết: biết nghĩa của từng yếu tố thì em đoán được nghĩa của rất nhiều từ. Xem bảng dưới đây.',
          ),
          code: 'gia (nhà): gia đình, gia cảnh, gia sản\nthủy (nước): thủy sản, thủy thủ, thủy triều\nsơn (núi): giang sơn, sơn hà\nnhân (người): nhân dân, nhân loại, nhân vật',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: một yếu tố, nhiều nghĩa'),
          text: vn(
            'Có những yếu tố đọc giống nhau nhưng nghĩa khác nhau. Ví dụ "thiên":\n• thiên = trời: thiên nhiên, thiên tai\n• thiên = nghìn: thiên niên kỉ\n• thiên = dời đi: thiên đô (dời đô)\n• thiên = lệch về một phía: thiên vị\n\nCách đoán nghĩa một từ lạ:\nBước 1 – Tách từ thành từng yếu tố.\nBước 2 – Với mỗi yếu tố, nghĩ đến một từ quen có yếu tố đó.\nBước 3 – Ghép nghĩa lại rồi thử đặt vào câu xem có hợp không.\n\nVí dụ "thủy triều": "thủy" như trong "thủy sản" là nước; "triều" là con nước lên xuống → hiện tượng nước biển dâng lên, rút xuống.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Trong từ "thiên tai", yếu tố "thiên" có nghĩa là gì?'),
          options: ['Nghìn', 'Dời đi', 'Trời', 'Lệch về một phía'],
          answer: 2,
          why: vn('"Thiên tai" là tai họa do thiên nhiên (trời đất) gây ra như bão, lũ, hạn hán. Nghĩ đến từ quen "thiên nhiên" là đoán ra ngay "thiên" ở đây là trời.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền nghĩa của yếu tố Hán Việt.'),
          code: '"Thủy" trong "thủy sản" nghĩa là ___; "gia" trong "gia cảnh" nghĩa là ___.',
          answers: ['nước', 'nhà'],
          extra: ['núi', 'trời', 'người'],
          why: vn('"Thủy sản" là sản vật dưới nước (cá, tôm…). "Gia cảnh" là hoàn cảnh của gia đình, của một nhà.'),
        },
        {
          kind: 'read',
          title: vn('Lỗi dùng từ hay gặp'),
          text: vn(
            '1. Lặp từ không cần thiết: một từ xuất hiện quá nhiều lần làm câu nặng nề.\n2. Lẫn lộn từ gần âm: "bàng quan" (thờ ơ, đứng ngoài cuộc) khác "bàng quang" (một bộ phận trong cơ thể).\n3. Dùng sai nghĩa: "yếu điểm" nghĩa là điểm quan trọng, KHÔNG phải điểm yếu. Muốn nói điểm yếu thì dùng "điểm yếu", "nhược điểm".\n\nKhi phân vân, hãy tách yếu tố Hán Việt ra để kiểm tra: "yếu" trong "yếu điểm" là quan trọng (như "trọng yếu"), không phải là yếu đuối.',
          ),
          code: 'Sai: Bạn ấy rất bàng quang với việc chung của lớp.\nĐúng: Bạn ấy rất bàng quan với việc chung của lớp.\n\nSai: Yếu điểm của em là hay quên.\nĐúng: Nhược điểm của em là hay quên.',
        },
        {
          kind: 'choice',
          ask: vn('Câu nào dùng từ ĐÚNG?'),
          options: [
            'Chúng ta không được bàng quang trước khó khăn của bạn bè.',
            'Yếu điểm lớn nhất của em là hay ngủ dậy muộn.',
            'Chúng ta không được bàng quan trước khó khăn của bạn bè.',
          ],
          answer: 2,
          why: vn('"Bàng quan" là đứng ngoài, thờ ơ, đúng với ý câu. "Bàng quang" là bộ phận cơ thể, dùng ở đây là sai. "Yếu điểm" là điểm quan trọng nên câu thứ hai dùng sai nghĩa; phải sửa thành "nhược điểm" hoặc "điểm yếu".'),
        },
        {
          kind: 'choice',
          ask: vn('Đoạn sau mắc lỗi gì?'),
          code: 'Truyện Kiều là tác phẩm nổi tiếng. Truyện Kiều được nhiều người yêu thích. Truyện Kiều đã được dịch ra nhiều thứ tiếng.',
          options: ['Dùng sai nghĩa của từ', 'Lặp từ không cần thiết', 'Lẫn lộn từ gần âm'],
          answer: 1,
          why: vn('"Truyện Kiều" lặp lại ba lần làm đoạn văn nặng nề. Sửa bằng phép thế: "Truyện Kiều là tác phẩm nổi tiếng. Tác phẩm được nhiều người yêu thích và đã được dịch ra nhiều thứ tiếng."'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu về một người bạn hoặc một việc ở lớp, trong đó dùng đúng từ "bàng quan" và một từ Hán Việt có yếu tố "gia" (nhà).'),
          frame: 'Trước …, chúng ta không nên bàng quan …\n…',
          model:
            'Trước khó khăn của bạn bè, chúng ta không nên bàng quan mà cần chung tay giúp đỡ. Khi biết gia cảnh bạn Nam khó khăn, cả lớp em đã góp sách vở tặng bạn.',
          checklist: [
            '"Bàng quan" dùng đúng nghĩa: thờ ơ, đứng ngoài',
            'Có một từ chứa yếu tố "gia" (gia đình, gia cảnh…) dùng đúng',
            'Hai câu không lặp từ không cần thiết',
          ],
        },
      ],
    },
    {
      id: 'l11-2',
      title: vn('Câu rút gọn, câu đặc biệt, thành phần biệt lập'),
      steps: [
        {
          kind: 'read',
          title: vn('Câu rút gọn và câu đặc biệt'),
          text: vn(
            '• Câu rút gọn: câu bị lược bớt một số thành phần (thường là chủ ngữ hoặc vị ngữ) nhưng người nghe vẫn hiểu nhờ ngữ cảnh. Em có thể khôi phục lại phần bị lược: "Làm rồi." → "Tớ làm rồi."\n• Câu đặc biệt: câu vốn không được cấu tạo theo mô hình chủ ngữ – vị ngữ, không cần khôi phục gì cả. Thường dùng để nêu thời gian, nơi chốn, bộc lộ cảm xúc, gọi đáp hoặc liệt kê.\n\nCâu rút gọn giúp lời nói gọn, tránh lặp; câu đặc biệt tạo ấn tượng, gợi không khí.',
          ),
          code: '– Cậu làm bài chưa?\n– Làm rồi. (câu rút gọn chủ ngữ)\n\nHọc ăn, học nói, học gói, học mở. (tục ngữ, rút gọn chủ ngữ)\n\nMưa. Mưa rả rích suốt đêm. ("Mưa." là câu đặc biệt)',
        },
        {
          kind: 'choice',
          ask: vn('Câu "Một đêm mùa đông." mở đầu một câu chuyện là kiểu câu gì?'),
          options: ['Câu rút gọn', 'Câu đặc biệt', 'Câu ghép'],
          answer: 1,
          why: vn('Câu chỉ có một cụm từ, không có cấu trúc chủ ngữ – vị ngữ và cũng không phải bị lược bớt → câu đặc biệt. Nó dùng để nêu thời gian, mở ra khung cảnh cho câu chuyện.'),
        },
        {
          kind: 'read',
          title: vn('Bốn thành phần biệt lập'),
          text: vn(
            'Thành phần biệt lập không tham gia diễn đạt nghĩa chính của câu, bỏ đi thì câu vẫn đủ ý.\n• Tình thái: thể hiện cách nhìn, độ tin cậy của người nói: chắc chắn, có lẽ, hình như, dường như.\n• Cảm thán: bộc lộ cảm xúc: ôi, chao ôi, trời ơi.\n• Gọi – đáp: dùng để gọi hoặc đáp lời: này, ơi, vâng, dạ.\n• Phụ chú: giải thích, bổ sung thêm, thường đặt giữa hai dấu phẩy, hai dấu gạch ngang hoặc trong ngoặc đơn.',
          ),
          code: 'Có lẽ chiều nay trời sẽ mưa. (tình thái)\nChao ôi, cánh đồng lúa chín đẹp quá! (cảm thán)\nNày, cậu có đi thư viện không? (gọi – đáp)\nBà em – năm nay đã tám mươi tuổi – vẫn đọc báo hằng ngày. (phụ chú)',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: tìm thành phần biệt lập'),
          text: vn(
            'Câu: "Hình như, bạn Lan – lớp trưởng lớp em – đã về quê."\n\nBước 1 – Tìm phần đứng tách riêng (có dấu phẩy, gạch ngang, ngoặc đơn): "Hình như" và "lớp trưởng lớp em".\nBước 2 – Thử bỏ đi: "Bạn Lan đã về quê." Câu vẫn đủ nghĩa chính → đúng là thành phần biệt lập.\nBước 3 – Xem mỗi phần làm gì: "Hình như" thể hiện sự phỏng đoán, chưa chắc chắn → tình thái. "Lớp trưởng lớp em" giải thích thêm Lan là ai → phụ chú.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Trong câu "Bạn Minh – lớp trưởng lớp 9A – vừa đạt giải nhất.", phần đặt giữa hai dấu gạch ngang là thành phần gì?'),
          options: ['Tình thái', 'Cảm thán', 'Phụ chú', 'Gọi – đáp'],
          answer: 2,
          why: vn('Phần này giải thích thêm Minh là ai, bỏ đi câu vẫn đủ nghĩa → phụ chú. Dấu gạch ngang ở hai đầu là dấu hiệu quen thuộc của thành phần phụ chú.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền thành phần biệt lập đúng loại được ghi trong ngoặc.'),
          code: '___, hoàng hôn trên hồ Tây đẹp quá! (cảm thán)\n___ ngày mai lớp mình được nghỉ học. (tình thái)\n___, cho mình mượn cây bút nhé! (gọi – đáp)',
          answers: ['Chao ôi', 'Hình như', 'Này'],
          extra: ['Vì vậy', 'Tuy nhiên'],
          why: vn('"Chao ôi" bộc lộ cảm xúc (cảm thán), "hình như" thể hiện sự phỏng đoán (tình thái), "này" dùng để gọi (gọi – đáp). "Vì vậy", "tuy nhiên" là từ nối câu, không phải thành phần biệt lập.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu về một buổi sáng ở trường em, trong đó có một thành phần tình thái và một thành phần phụ chú.'),
          frame: 'Có lẽ, …\n… – … – …',
          model:
            'Có lẽ, sáng nay là buổi sáng đẹp nhất của mùa thu. Cây bàng già – người bạn thân của lớp em – đã bắt đầu đổi lá vàng.',
          checklist: [
            'Có một từ tình thái (có lẽ, chắc chắn, hình như…)',
            'Có một phần phụ chú đặt giữa hai dấu gạch ngang, dấu phẩy hoặc ngoặc đơn',
            'Bỏ hai thành phần đó đi, câu vẫn đủ nghĩa',
          ],
        },
      ],
    },
    {
      id: 'l11-3',
      title: vn('Câu ghép, quan hệ từ và phép liên kết câu'),
      steps: [
        {
          kind: 'read',
          title: vn('Câu ghép và cặp quan hệ từ'),
          text: vn(
            'Câu ghép có từ hai cụm chủ ngữ – vị ngữ trở lên, các cụm không bao chứa nhau. Các vế thường được nối bằng quan hệ từ hoặc cặp quan hệ từ:\n• vì… nên…: nguyên nhân – kết quả\n• nếu… thì…: điều kiện – kết quả\n• tuy… nhưng…: tương phản\n• không những… mà còn…: tăng tiến\n\nLỗi hay gặp: ghép nhầm cặp, như "tuy… nên…" hay "vì… nhưng…".',
          ),
          code: 'Vì trời mưa to nên trận bóng phải hoãn lại.\nTuy nhà xa nhưng Lan chưa bao giờ đi học muộn.\nQuang không những học giỏi mà còn chơi cờ rất hay.',
        },
        {
          kind: 'fill',
          ask: vn('Điền cặp quan hệ từ thể hiện quan hệ điều kiện – kết quả.'),
          code: '___ em chăm đọc sách ___ vốn từ của em sẽ ngày càng phong phú.',
          answers: ['Nếu', 'thì'],
          extra: ['Tuy', 'nhưng', 'mà còn'],
          why: vn('"Chăm đọc sách" là điều kiện, "vốn từ phong phú" là kết quả → dùng cặp "nếu… thì…". "Tuy… nhưng…" chỉ dùng khi hai vế trái ngược nhau.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu "Tuy nhà xa nên Lan vẫn đi học đúng giờ." sai ở đâu?'),
          options: [
            'Thiếu chủ ngữ',
            'Ghép sai cặp quan hệ từ: "tuy" phải đi với "nhưng"',
            'Không có lỗi gì',
          ],
          answer: 1,
          why: vn('Hai vế trái ngược nhau (nhà xa mà vẫn đúng giờ) nên phải dùng "tuy… nhưng…". Sửa: "Tuy nhà xa nhưng Lan vẫn đi học đúng giờ."'),
        },
        {
          kind: 'read',
          title: vn('Bốn phép liên kết câu'),
          text: vn(
            'Các câu trong đoạn văn phải nối với nhau cho mạch lạc. Có bốn phép liên kết hay dùng:\n• Phép lặp: lặp lại từ ngữ ở câu trước.\n• Phép thế: dùng từ ngữ khác (đại từ, từ đồng nghĩa) thay cho từ ở câu trước: cậu, nó, đó, ấy, việc này, như vậy…\n• Phép nối: dùng từ nối: nhưng, tuy nhiên, vì vậy, do đó, ngoài ra…\n• Phép liên tưởng: dùng từ ngữ cùng trường nghĩa, đồng nghĩa hoặc trái nghĩa với từ ở câu trước (trường học – lớp – thầy cô…).',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: tìm phép liên kết'),
          text: vn(
            'Bước 1 – Đọc câu sau, tìm từ ngữ "hướng về" câu trước.\nBước 2 – Xem từ ấy được lặp lại, thay thế, nối hay liên tưởng.\n\nTrong đoạn dưới:\n• Câu 2: "cậu" thay cho "Quang" ở câu 1 → phép thế.\n• Câu 3: "Nhờ vậy" nối câu 3 với câu trước → phép nối; "Quang" xuất hiện lại → phép lặp.\n• "Đọc" ở câu 2 lặp lại từ "đọc" ở câu 1 → phép lặp.',
          ),
          code: '(1) Quang rất thích đọc sách. (2) Mỗi tối, cậu dành nửa giờ để đọc. (3) Nhờ vậy, vốn từ của Quang ngày càng phong phú.',
        },
        {
          kind: 'choice',
          ask: vn('"Hà Nội có hồ Hoàn Kiếm. Nơi ấy gắn với truyền thuyết trả gươm cho Rùa Vàng." Hai câu được liên kết chủ yếu bằng phép gì?'),
          options: ['Phép lặp', 'Phép nối', 'Phép thế'],
          answer: 2,
          why: vn('"Nơi ấy" được dùng thay cho "hồ Hoàn Kiếm" ở câu trước → phép thế. Nhờ vậy câu văn không phải lặp lại tên hồ.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các câu thành đoạn văn mạch lạc (chú ý từ nối và từ thế).'),
          lines: [
            'Sáng nay, lớp 9A trồng cây ở sân trường.',
            'Các bạn chia nhau đào hố, đặt cây và tưới nước.',
            'Tuy trời nắng gắt nhưng không ai kêu mệt.',
            'Vì vậy, chỉ một giờ sau, hàng cây non đã đứng thẳng tắp bên bồn hoa.',
          ],
          why: vn('Câu 1 nêu sự việc. "Các bạn" (câu 2) thế cho "lớp 9A". Câu 3 dùng "tuy… nhưng…" nói về khó khăn. "Vì vậy" (câu 4) nối kết quả với cố gắng ở các câu trước nên phải đứng cuối.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu về việc học môn Ngữ văn, có dùng ít nhất một phép nối và một phép thế.'),
          frame: 'Em …\n… (dùng từ thế như: môn học này, việc ấy…)\nVì vậy / Nhờ đó, …',
          model:
            'Em từng nghĩ học Ngữ văn chỉ là học thuộc lòng. Nhưng khi biết cách phân tích từ ngữ, em thấy môn học này giống như một trò chơi giải mã thú vị. Nhờ đó, em đã tự tin hơn mỗi khi viết đoạn văn.',
          checklist: [
            'Có ít nhất một từ nối (nhưng, vì vậy, nhờ đó…)',
            'Có ít nhất một từ thế thay cho từ ở câu trước (môn học này, việc ấy…)',
            'Các câu cùng nói về một ý, đọc lên liền mạch',
          ],
          tip: vn('Viết xong, em thử gạch chân từ nối và khoanh tròn từ thế để tự kiểm tra.'),
        },
      ],
    },
  ],
};
