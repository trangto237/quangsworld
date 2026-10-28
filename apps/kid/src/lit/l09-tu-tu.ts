import { vn, type PyUnit } from '../code/learn/types';

/**
 * Biện pháp tu từ: nhận ra, phân biệt và nêu tác dụng theo công thức 3 bước.
 * Ví dụ: ca dao, tục ngữ, thơ cổ điển (Bà Huyện Thanh Quan, Nguyễn Khuyến) hoặc câu tự viết.
 */
export const unit: PyUnit = {
  id: 'l09',
  emoji: '🎨',
  title: vn('Biện pháp tu từ'),
  blurb: vn('Nhận ra, phân biệt và nói được tác dụng của biện pháp tu từ theo công thức 3 bước'),
  lessons: [
    {
      id: 'l09-1',
      title: vn('So sánh, ẩn dụ, nhân hóa và công thức 3 bước'),
      steps: [
        {
          kind: 'read',
          title: vn('So sánh'),
          text: vn(
            'Biện pháp tu từ là cách dùng từ ngữ, câu văn một cách đặc biệt để lời nói gợi hình, gợi cảm và ấn tượng hơn.\n\nSo sánh là đặt sự vật A bên cạnh sự vật B vì chúng có nét giống nhau. Dấu hiệu dễ nhận ra: thường có từ so sánh như "như", "tựa", "giống như", "là", "bao nhiêu… bấy nhiêu".\n\nỞ câu ca dao dưới đây: "công cha" (A) – "như" (từ so sánh) – "núi Thái Sơn" (B). Công cha to lớn như ngọn núi cao.',
          ),
          code: 'Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.\n(Ca dao)',
        },
        {
          kind: 'read',
          title: vn('Ẩn dụ: so sánh ngầm'),
          text: vn(
            'Ẩn dụ là gọi tên sự vật A bằng tên sự vật B vì giữa chúng có nét giống nhau. Khác với so sánh, ở ẩn dụ A bị giấu đi, chỉ còn lại B.\n\nTrong câu ca dao dưới đây, "thuyền" là người ra đi, "bến" là người ở lại chờ đợi. Thuyền thì đi rồi về, bến thì đứng yên một chỗ, giống như người đi xa và người ở nhà thủy chung chờ đợi.\n\nMẹo nhớ: thấy cả A lẫn B (thường có chữ "như", "là") → so sánh. Chỉ thấy B, em phải tự đoán ra A → ẩn dụ.',
          ),
          code: 'Thuyền về có nhớ bến chăng,\nBến thì một dạ khăng khăng đợi thuyền.\n(Ca dao)',
        },
        {
          kind: 'choice',
          ask: vn('Câu "Mẹ là ngọn đèn soi đường cho con." dùng biện pháp tu từ nào?'),
          options: ['Ẩn dụ', 'So sánh', 'Nhân hóa'],
          answer: 1,
          why: vn(
            'Câu có cả A ("mẹ") lẫn B ("ngọn đèn"), nối với nhau bằng từ "là" → so sánh. Nếu chỉ nói "ngọn đèn của con" mà không nhắc đến mẹ, người đọc phải tự hiểu ngọn đèn là mẹ, thì lúc đó mới là ẩn dụ.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Trong tục ngữ "Uống nước nhớ nguồn", hình ảnh "nguồn" là ẩn dụ cho điều gì?'),
          options: ['Con sông chảy qua quê mình', 'Nước sạch để uống hằng ngày', 'Những người đã làm ra thành quả cho mình được hưởng', 'Cơn mưa đầu mùa'],
          answer: 2,
          why: vn(
            '"Uống nước" là được hưởng thành quả, "nguồn" là những người đã tạo ra thành quả ấy: ông bà, cha mẹ, thầy cô, thế hệ đi trước. Câu tục ngữ khuyên ta sống biết ơn. Nguồn và người tạo ra thành quả giống nhau ở chỗ đều là "nơi bắt đầu" → ẩn dụ.',
          ),
        },
        {
          kind: 'read',
          title: vn('Nhân hóa'),
          text: vn(
            'Nhân hóa là gọi, tả hoặc trò chuyện với con vật, cây cối, đồ vật bằng những từ vốn dùng cho con người. Có ba cách hay gặp:\n1. Gọi vật bằng từ gọi người: chị gió, ông mặt trời.\n2. Tả vật bằng từ chỉ hoạt động, tính cách của người: hàng cây vẫy tay, chú mèo hờn dỗi.\n3. Trò chuyện, xưng hô với vật như với người, như câu ca dao dưới đây.\n\nNhân hóa làm sự vật trở nên sống động, có hồn, gần gũi với con người.',
          ),
          code: 'Trâu ơi, ta bảo trâu này,\nTrâu ra ngoài ruộng, trâu cày với ta.\n(Ca dao)',
        },
        {
          kind: 'fill',
          ask: vn('Chọn từ để hàng tre được nhân hóa.'),
          code: 'Sáng sớm, hàng tre ___ trong gió, những chiếc lá ___ to nhỏ với nhau.',
          answers: ['vươn vai', 'thì thầm'],
          extra: ['rung rinh', 'xào xạc'],
          why: vn(
            '"Vươn vai" và "thì thầm" là hoạt động của con người. Gán cho hàng tre, câu văn khiến cây cối như đang thức dậy và trò chuyện. "Rung rinh", "xào xạc" chỉ tả cây lá bình thường nên không tạo ra nhân hóa.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: công thức 3 bước'),
          text: vn(
            'Đề: "Chỉ ra và nêu tác dụng của biện pháp tu từ trong câu ca dao: Công cha như núi Thái Sơn…"\n\nBước 1 – Gọi tên + chỉ rõ từ ngữ: biện pháp so sánh, "công cha" được so sánh với "núi Thái Sơn", "nghĩa mẹ" với "nước trong nguồn chảy ra".\n\nBước 2 – Tác dụng nghệ thuật: làm lời thơ gợi hình, gợi cảm; biến điều trừu tượng (công, nghĩa) thành hình ảnh cụ thể, dễ hình dung.\n\nBước 3 – Tác dụng nội dung: nhấn mạnh công cha to lớn, nghĩa mẹ dạt dào không bao giờ cạn; thể hiện lòng biết ơn và nhắc nhở con cái sống hiếu thảo.\n\nGhép ba bước lại là có câu trả lời hoàn chỉnh:',
          ),
          code: 'Câu ca dao sử dụng biện pháp so sánh: "công cha" như "núi Thái Sơn", "nghĩa mẹ" như "nước trong nguồn chảy ra". Phép so sánh làm lời thơ giàu hình ảnh, biến công ơn trừu tượng thành điều cụ thể, dễ cảm nhận. Qua đó, câu ca dao nhấn mạnh công lao to lớn của cha mẹ và nhắc nhở con cái phải biết ơn, hiếu thảo.',
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp ba câu thành câu trả lời đúng công thức cho hai câu ca dao "Trâu ơi, ta bảo trâu này…"'),
          lines: [
            'Hai câu ca dao sử dụng biện pháp nhân hóa: người nông dân gọi "trâu ơi", trò chuyện với trâu như với một người bạn.',
            'Biện pháp này làm lời ca dao thân mật, gần gũi, giàu cảm xúc.',
            'Qua đó, tác giả dân gian thể hiện tình cảm gắn bó của người nông dân với con trâu, người bạn cùng làm lụng trên đồng ruộng.',
          ],
          why: vn('Đúng thứ tự công thức: (1) gọi tên và chỉ rõ từ ngữ → (2) tác dụng nghệ thuật → (3) tác dụng nội dung. Câu thứ ba thường mở đầu bằng "Qua đó…" hoặc "Từ đó…".'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nêu tác dụng của biện pháp ẩn dụ trong câu ca dao "Thuyền về có nhớ bến chăng, / Bến thì một dạ khăng khăng đợi thuyền." theo công thức 3 bước.'),
          frame: 'Câu ca dao sử dụng biện pháp ẩn dụ: "thuyền" chỉ …, "bến" chỉ …\nCách nói này giúp lời thơ …\nQua đó, câu ca dao thể hiện …',
          model:
            'Câu ca dao sử dụng biện pháp ẩn dụ: hình ảnh "thuyền" chỉ người ra đi, "bến" chỉ người ở lại chờ đợi. Cách nói này làm lời thơ kín đáo, tế nhị mà vẫn giàu hình ảnh. Qua đó, câu ca dao thể hiện tấm lòng thủy chung, một lòng một dạ chờ đợi của người ở lại.',
          checklist: [
            'Gọi đúng tên biện pháp và chỉ ra hình ảnh "thuyền", "bến" tượng trưng cho ai',
            'Có tác dụng nghệ thuật (gợi hình, gợi cảm, kín đáo, tế nhị…)',
            'Có tác dụng nội dung (tình cảm thủy chung, chờ đợi)',
            'Chỉ 2–3 câu, không kể lể dài dòng',
          ],
          tip: vn('Nhớ nhanh ba chữ: Tên – Nghệ thuật – Nội dung.'),
        },
      ],
    },
    {
      id: 'l09-2',
      title: vn('Hoán dụ, điệp ngữ, đảo ngữ, liệt kê'),
      steps: [
        {
          kind: 'read',
          title: vn('Hoán dụ: gọi tên bằng cái gắn liền'),
          text: vn(
            'Hoán dụ là gọi tên sự vật A bằng tên sự vật B vì A và B gần gũi, gắn liền với nhau (chứ không phải vì giống nhau). Các kiểu hay gặp:\n• Lấy bộ phận để chỉ toàn thể: "năm miệng ăn" → năm người.\n• Lấy vật chứa đựng để chỉ vật bị chứa đựng: "cả sân trường" → mọi người trong sân trường.\n• Lấy dấu hiệu để chỉ người: "tà áo trắng" → các nữ sinh.\n• Lấy cái cụ thể để chỉ cái trừu tượng.',
          ),
          code: 'Nhà bác Tư có năm miệng ăn.\nCả sân trường vỡ òa khi đội nhà ghi bàn.\nNhững tà áo trắng tung tăng đến trường.',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: ẩn dụ hay hoán dụ?'),
          text: vn(
            'Chỉ cần hỏi một câu: A và B GIỐNG nhau hay GẮN LIỀN với nhau?\n\nVí dụ: "Cả sân trường vỡ òa khi đội nhà ghi bàn."\nBước 1 – Tìm từ được dùng (B): "sân trường".\nBước 2 – Tìm cái thật sự được nói tới (A): các bạn học sinh, thầy cô.\nBước 3 – Sân trường có giống học sinh không? Không. Sân trường là nơi chứa học sinh, hai thứ gắn liền với nhau → hoán dụ.\n\nSo với ca dao "Thuyền về có nhớ bến chăng": người ra đi giống con thuyền ở chỗ hay đi xa → giống nhau → ẩn dụ.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('"Những tà áo trắng tung tăng đến trường." Hình ảnh "tà áo trắng" là gì?'),
          options: ['Ẩn dụ, vì áo trắng giống các nữ sinh', 'Nhân hóa, vì chiếc áo biết tung tăng', 'Hoán dụ, vì áo trắng là dấu hiệu gắn liền với các nữ sinh'],
          answer: 2,
          why: vn(
            'Áo trắng không "giống" nữ sinh, mà là thứ các bạn mặc, gắn liền với các bạn → hoán dụ (lấy dấu hiệu để chỉ người). "Tung tăng" thật ra là hoạt động của chính các bạn, nên đây không phải nhân hóa.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào dùng biện pháp hoán dụ?'),
          options: ['Em bé cười tươi như hoa nở.', 'Ông mặt trời thức dậy sau rặng tre.', 'Cả làng kéo nhau ra bến sông xem đua thuyền.', 'Uống nước nhớ nguồn.'],
          answer: 2,
          why: vn(
            '"Cả làng" là nơi chốn, dùng để chỉ người dân sống trong làng → hoán dụ (vật chứa đựng chỉ vật bị chứa đựng). Câu 1 là so sánh (có "như"), câu 2 là nhân hóa ("ông", "thức dậy"), câu 4 là ẩn dụ ("nguồn").',
          ),
        },
        {
          kind: 'read',
          title: vn('Điệp ngữ, đảo ngữ, liệt kê'),
          text: vn(
            '• Điệp ngữ: lặp lại một từ hoặc cụm từ để nhấn mạnh và tạo nhịp điệu. Ví dụ: "Em nhớ trường, nhớ lớp, nhớ cả tiếng trống mỗi sáng."\n• Liệt kê: kể ra một loạt sự vật, hành động để diễn tả đầy đủ, nhiều mặt.\n• Đảo ngữ: thay đổi trật tự bình thường trong câu (thường đưa vị ngữ lên trước chủ ngữ) để nhấn mạnh.\n\nHai câu thơ dưới đây, trật tự bình thường là "Vài chú tiều lom khom dưới núi, mấy nhà chợ lác đác bên sông". Nhà thơ đưa hai từ láy "lom khom", "lác đác" lên đầu câu để nhấn mạnh dáng người nhỏ bé, cảnh vật thưa thớt.',
          ),
          code: 'Lom khom dưới núi, tiều vài chú,\nLác đác bên sông, chợ mấy nhà.\n(Bà Huyện Thanh Quan, Qua Đèo Ngang)',
        },
        {
          kind: 'choice',
          ask: vn('"Góc học tập của Quang có sách, vở, bút chì, thước kẻ và một chậu xương rồng nhỏ." Biện pháp nổi bật là gì?'),
          options: ['Liệt kê', 'Điệp ngữ', 'Đảo ngữ', 'Hoán dụ'],
          answer: 0,
          why: vn('Câu kể ra một loạt đồ vật nối tiếp nhau → liệt kê. Nhờ vậy góc học tập hiện lên cụ thể, đầy đủ, ngăn nắp. Câu không lặp từ (không phải điệp ngữ) và giữ trật tự bình thường (không phải đảo ngữ).'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành nhận xét về câu thơ của Bà Huyện Thanh Quan.'),
          code: 'Câu thơ "Lom khom dưới núi, tiều vài chú" dùng biện pháp ___: đưa từ láy "___" lên đầu câu để nhấn mạnh dáng người tiều phu nhỏ bé, vất vả.',
          answers: ['đảo ngữ', 'lom khom'],
          extra: ['điệp ngữ', 'tiều vài chú', 'liệt kê'],
          why: vn('Trật tự bình thường là "vài chú tiều lom khom dưới núi". Đưa "lom khom" lên trước là đảo ngữ. Khi nêu biện pháp, nhớ chỉ rõ từ ngữ được đảo, đó chính là bước 1 của công thức.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nêu tác dụng của biện pháp đảo ngữ trong hai câu thơ "Lom khom dưới núi, tiều vài chú, / Lác đác bên sông, chợ mấy nhà."'),
          frame: 'Hai câu thơ sử dụng biện pháp đảo ngữ, đưa "…" và "…" lên đầu câu.\nCách đảo này nhấn mạnh …\nQua đó, …',
          model:
            'Hai câu thơ sử dụng biện pháp đảo ngữ, đưa hai từ láy "lom khom", "lác đác" lên đầu câu. Cách đảo này nhấn mạnh dáng người nhỏ bé, cảnh vật thưa thớt và tạo nhịp thơ chậm, buồn. Qua đó, cảnh Đèo Ngang lúc chiều tà hiện lên hoang vắng, gợi nỗi buồn cô đơn của nhà thơ.',
          checklist: [
            'Gọi tên đảo ngữ và chỉ ra hai từ láy được đảo lên đầu',
            'Có tác dụng nghệ thuật (nhấn mạnh, gợi hình, nhịp thơ…)',
            'Có tác dụng nội dung (cảnh vắng vẻ, tâm trạng buồn của nhà thơ)',
          ],
        },
      ],
    },
    {
      id: 'l09-3',
      title: vn('Nói quá, nói giảm nói tránh, chơi chữ, câu hỏi tu từ'),
      steps: [
        {
          kind: 'read',
          title: vn('Nói quá và nói giảm nói tránh'),
          text: vn(
            '• Nói quá: phóng đại mức độ, quy mô, tính chất của sự vật để nhấn mạnh, gây ấn tượng. Nói quá khác nói khoác: nói quá có mục đích nghệ thuật, người nghe hiểu đó là cách nói.\n• Nói giảm nói tránh: nói nhẹ đi, tế nhị hơn để tránh gây đau buồn, ghê sợ hoặc thiếu lịch sự.\n\nỞ ví dụ dưới đây: "mồ hôi thánh thót như mưa" là nói quá (kết hợp so sánh), nhấn mạnh nỗi vất vả. "Thôi đã thôi rồi" là cách Nguyễn Khuyến nói tránh cái chết của người bạn, để nỗi đau được nói ra nhẹ nhàng mà thấm thía.',
          ),
          code: 'Cày đồng đang buổi ban trưa,\nMồ hôi thánh thót như mưa ruộng cày.\n(Ca dao)\n\nBác Dương thôi đã thôi rồi,\nNước mây man mác ngậm ngùi lòng ta.\n(Nguyễn Khuyến, Khóc Dương Khuê)',
        },
        {
          kind: 'choice',
          ask: vn('"Bà em đã về với tổ tiên từ mùa đông năm ngoái." Cụm "về với tổ tiên" dùng biện pháp gì?'),
          options: ['Nói quá', 'Liệt kê', 'Nói giảm nói tránh'],
          answer: 2,
          why: vn('"Về với tổ tiên" thay cho từ "mất", "chết" để lời nói nhẹ nhàng, bớt đau buồn và thể hiện sự kính trọng với người đã khuất → nói giảm nói tránh.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào dùng biện pháp nói quá?'),
          options: ['Hôm nay trời nắng gắt.', 'Bài tập nhiều đến mức làm đến Tết cũng chưa xong.', 'Em làm bài tập trong một tiếng.', 'Trời nóng, em uống hai cốc nước.'],
          answer: 1,
          why: vn('Không ai làm bài tập đến tận Tết: đây là cách phóng đại để nhấn mạnh bài tập rất nhiều → nói quá. Các câu còn lại chỉ kể đúng sự thật, không phóng đại.'),
        },
        {
          kind: 'read',
          title: vn('Chơi chữ và câu hỏi tu từ'),
          text: vn(
            '• Chơi chữ: lợi dụng âm và nghĩa của từ (từ đồng âm, gần âm, nói lái…) để tạo sự dí dỏm, hài hước. Trong câu ca dao dưới đây, "lợi" vừa là "có lợi", vừa là "lợi" giữ chân răng. Bà già đã rụng hết răng: câu đùa nhẹ nhàng mà thâm thúy.\n• Câu hỏi tu từ: có hình thức câu hỏi nhưng không cần trả lời, dùng để bộc lộ cảm xúc, khẳng định hoặc phủ định một điều. Ví dụ: "Ai mà chẳng nhớ ngôi trường đầu tiên mình đã học?" nghĩa là: ai cũng nhớ.',
          ),
          code: 'Bà già đi chợ Cầu Đông,\nBói xem một quẻ lấy chồng lợi chăng.\nThầy bói xem quẻ nói rằng:\nLợi thì có lợi nhưng răng chẳng còn.\n(Ca dao)',
        },
        {
          kind: 'choice',
          ask: vn('"Có ai lại không thương mẹ của mình?" Câu hỏi này dùng để làm gì?'),
          options: ['Hỏi để biết ai không thương mẹ', 'Khẳng định: ai cũng thương mẹ của mình', 'Ra lệnh cho người nghe phải thương mẹ'],
          answer: 1,
          why: vn('Người nói không chờ câu trả lời. Đây là câu hỏi tu từ, mượn hình thức hỏi để khẳng định mạnh mẽ hơn một câu kể bình thường: ai cũng thương mẹ.'),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: đoạn văn có nhiều biện pháp'),
          text: vn(
            'Đề thi hay cho một đoạn có 2–3 biện pháp và hỏi "biện pháp tu từ nổi bật". Cách làm:\nBước 1 – Gạch chân những chỗ "lạ": từ so sánh, từ ngữ lặp lại, trật tự đảo, từ chỉ người dùng cho vật.\nBước 2 – Đặt tên cho từng chỗ.\nBước 3 – Chọn biện pháp gắn với ý chính của đoạn, rồi trả lời theo công thức 3 bước.\n\nVới đoạn dưới đây: cụm "mưa rơi trên" lặp ba lần (điệp ngữ), kể ra mái nhà, cánh đồng, vai mẹ (liệt kê), "như một món quà" (so sánh). Nổi bật nhất là điệp ngữ kết hợp liệt kê: nhấn mạnh cơn mưa có mặt ở khắp nơi, tạo nhịp văn đều đều như tiếng mưa.',
          ),
          code: 'Mưa rơi trên mái nhà, mưa rơi trên cánh đồng, mưa rơi trên vai mẹ. Cơn mưa đầu mùa như một món quà trời gửi xuống.',
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành nhận xét về đoạn văn trên.'),
          code: 'Cụm từ "___" được lặp lại ba lần, đó là biện pháp ___.',
          answers: ['mưa rơi trên', 'điệp ngữ'],
          extra: ['món quà', 'nói quá', 'đảo ngữ'],
          why: vn('Lặp lại một cụm từ có chủ ý là điệp ngữ. Khi trả lời, luôn trích đúng cụm từ được lặp, đừng chỉ viết "có điệp ngữ".'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nêu tác dụng của biện pháp nói quá trong câu ca dao "Cày đồng đang buổi ban trưa, / Mồ hôi thánh thót như mưa ruộng cày."'),
          frame: 'Câu ca dao sử dụng biện pháp nói quá: …\nCách nói này giúp …\nQua đó, câu ca dao …',
          model:
            'Câu ca dao sử dụng biện pháp nói quá kết hợp so sánh: mồ hôi "thánh thót như mưa". Cách nói phóng đại này tạo nên hình ảnh cụ thể, ấn tượng, dễ hình dung. Qua đó, câu ca dao nhấn mạnh nỗi vất vả của người nông dân và nhắc ta trân trọng từng hạt gạo.',
          checklist: [
            'Gọi tên nói quá và trích đúng "thánh thót như mưa"',
            'Có tác dụng nghệ thuật (ấn tượng, gợi hình)',
            'Có tác dụng nội dung (sự vất vả của người nông dân, thái độ trân trọng)',
          ],
          tip: vn('Nếu câu có hai biện pháp đi cùng nhau, em có thể gọi tên cả hai: "nói quá kết hợp so sánh".'),
        },
      ],
    },
  ],
};
