import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l08',
  emoji: '🌸',
  title: vn('Truyện thơ Nôm và Truyện Kiều'),
  blurb: vn('Lục bát, song thất lục bát, Nguyễn Du và nghệ thuật của Truyện Kiều'),
  lessons: [
    {
      id: 'l08-1',
      title: vn('Thể lục bát và song thất lục bát'),
      steps: [
        {
          kind: 'read',
          title: vn('Thể thơ lục bát'),
          text: vn(
            'Lục bát là thể thơ thuần Việt, gồm từng cặp câu: câu sáu tiếng (lục) và câu tám tiếng (bát).\n• Vần: tiếng thứ 6 câu lục vần với tiếng thứ 6 câu bát; tiếng thứ 8 câu bát lại vần với tiếng thứ 6 của câu lục tiếp theo. Vần nối nhau như sợi chỉ xuyên suốt bài.\n• Thanh: các tiếng thứ 2, 6, 8 là thanh bằng; tiếng thứ 4 là thanh trắc. Trong câu bát, tiếng 6 và tiếng 8 cùng thanh bằng nhưng thường khác nhau (một tiếng thanh ngang, một tiếng thanh huyền).\n• Nhịp: chủ yếu nhịp chẵn (2/2/2, 4/4), có thể thay đổi để diễn tả cảm xúc.\nVí dụ quen thuộc trong ca dao:',
          ),
          code: 'Bầu ơi thương lấy bí cùng,\nTuy rằng khác giống nhưng chung một giàn.',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Phân tích hai câu mở đầu Truyện Kiều của Nguyễn Du.\nBước 1 – Đếm tiếng: câu trên 6 tiếng, câu dưới 8 tiếng → đúng lục bát.\nBước 2 – Tìm vần: tiếng thứ 6 câu lục là “ta”, tiếng thứ 6 câu bát là “là” → vần “a”.\nBước 3 – Kiểm tra thanh: câu bát có tiếng 2 “tài” (bằng), tiếng 4 “mệnh” (trắc), tiếng 6 “là” (bằng, thanh huyền), tiếng 8 “nhau” (bằng, thanh ngang) → đúng luật.\nBước 4 – Nhịp: “Trăm năm / trong cõi / người ta” (2/2/2); “Chữ tài / chữ mệnh / khéo là / ghét nhau” (2/2/2/2), nhịp chậm rãi như một lời suy ngẫm.',
          ),
          code: 'Trăm năm trong cõi người ta,\nChữ tài chữ mệnh khéo là ghét nhau.',
        },
        {
          kind: 'fill',
          ask: vn('Tìm cặp tiếng vần với nhau trong câu ca dao “Bầu ơi thương lấy bí cùng, / Tuy rằng khác giống nhưng chung một giàn.”'),
          code: 'Tiếng thứ 6 câu lục là “___” vần với tiếng thứ 6 câu bát là “___”.',
          answers: ['cùng', 'chung'],
          extra: ['giàn', 'bí', 'giống'],
          why: vn('“cùng” và “chung” cùng vần “ung”. “giàn” là tiếng thứ 8 của câu bát: nó sẽ vần với tiếng thứ 6 của câu lục tiếp theo nếu bài còn kéo dài.'),
        },
        {
          kind: 'choice',
          ask: vn('Trong một câu bát đúng luật, tiếng thứ 4 mang thanh gì?'),
          options: ['Thanh bằng', 'Thanh trắc', 'Thanh nào cũng được'],
          answer: 1,
          why: vn('Tiếng 2 bằng, tiếng 4 trắc, tiếng 6 bằng: sự xen kẽ bằng – trắc này tạo nên âm điệu nhịp nhàng, dễ nghe, dễ thuộc của lục bát. Như “Chữ tài chữ mệnh”: “mệnh” là thanh nặng, thuộc thanh trắc.'),
        },
        {
          kind: 'read',
          title: vn('Thể song thất lục bát'),
          text: vn(
            'Song thất lục bát cũng là thể thơ của dân tộc. Mỗi khổ gồm bốn câu: hai câu bảy tiếng (song thất), tiếp theo là một cặp lục bát.\n• Câu bảy tiếng thường ngắt nhịp 3/4.\n• Vần: tiếng cuối câu bảy thứ nhất vần với tiếng thứ 5 câu bảy thứ hai; tiếng cuối câu bảy thứ hai vần với tiếng cuối câu lục; cặp lục bát gieo vần như lục bát.\nThể thơ này giàu nhạc điệu, hợp để giãi bày nỗi buồn thương. Tiêu biểu là “Chinh phụ ngâm” (nguyên tác chữ Hán của Đặng Trần Côn; bản diễn Nôm thường được cho là của Đoàn Thị Điểm). Bốn câu mở đầu:',
          ),
          code: 'Thuở trời đất nổi cơn gió bụi,\nKhách má hồng nhiều nỗi truân chuyên.\nXanh kia thăm thẳm từng trên,\nVì ai gây dựng cho nên nỗi này?',
        },
        {
          kind: 'choice',
          ask: vn('Trong khổ thơ trên, tiếng “bụi” (cuối câu đầu) vần với tiếng nào ở câu thứ hai?'),
          options: ['má', 'hồng', 'nỗi', 'chuyên'],
          answer: 2,
          why: vn('“nỗi” là tiếng thứ 5 của câu “Khách má hồng nhiều nỗi truân chuyên”, vần với “bụi” (vần “ui – ôi”). Còn “chuyên” lại vần với “trên” ở cuối câu lục.'),
        },
        {
          kind: 'compose',
          task: vn('Thử làm “nhà thơ”: viết một cặp lục bát (2 câu) về mùa thu ở trường em.'),
          frame: 'Câu lục (6 tiếng): … … … … … [vần A]\nCâu bát (8 tiếng): … … … … … [vần A] … …',
          model: 'Sân trường lá đỏ bay bay,\nNắng thu ấm cả bàn tay học trò.',
          checklist: [
            'Câu trên đúng 6 tiếng, câu dưới đúng 8 tiếng',
            'Tiếng thứ 6 câu lục vần với tiếng thứ 6 câu bát (ở mẫu: “bay” – “tay”)',
            'Tiếng 2, 6, 8 là thanh bằng; tiếng 4 là thanh trắc',
          ],
          tip: vn('Đọc to hai câu của em. Nếu thấy “trôi” và êm tai thì em đã gần đúng luật rồi đấy!'),
        },
      ],
    },
    {
      id: 'l08-2',
      title: vn('Truyện thơ Nôm, Nguyễn Du và Truyện Kiều'),
      steps: [
        {
          kind: 'read',
          title: vn('Truyện thơ Nôm là gì?'),
          text: vn(
            'Truyện thơ Nôm là tác phẩm tự sự viết bằng chữ Nôm, phần lớn bằng thể lục bát: kể một câu chuyện có cốt truyện, nhân vật, nhưng bằng lời thơ.\n• Có truyện thơ Nôm bình dân, thường khuyết danh, như “Thạch Sanh”.\n• Có truyện thơ Nôm bác học, do nhà nho, trí thức sáng tác, như “Truyện Kiều” của Nguyễn Du, “Lục Vân Tiên” của Nguyễn Đình Chiểu.\nNhân vật thường chia thành hai tuyến thiện – ác; câu chuyện hay đi theo mô hình gặp gỡ → chia li, lưu lạc → đoàn tụ.',
          ),
        },
        {
          kind: 'read',
          title: vn('Nguyễn Du và Truyện Kiều'),
          text: vn(
            'Nguyễn Du (1765–1820), hiệu Tố Như, là đại thi hào của dân tộc. Kiệt tác “Truyện Kiều” (tên chữ là “Đoạn trường tân thanh”) gồm 3254 câu lục bát, dựa trên cốt truyện “Kim Vân Kiều truyện” của Thanh Tâm Tài Nhân (Trung Quốc), nhưng Nguyễn Du đã sáng tạo lại bằng tài năng và tấm lòng của mình.\nTruyện kể về Thúy Kiều, người con gái tài sắc vẹn toàn, có cuộc đời đầy sóng gió.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: tóm tắt trong ba câu'),
          text: vn(
            'Bước 1 – Chia truyện thành ba phần theo mô hình quen thuộc: gặp gỡ và đính ước → gia biến và lưu lạc → đoàn tụ.\nBước 2 – Mỗi phần viết một câu, chỉ giữ sự việc chính:\n(1) Thúy Kiều gặp chàng thư sinh Kim Trọng, hai người thề nguyền gắn bó.\n(2) Gia đình gặp nạn, Kiều bán mình chuộc cha, rồi trải qua mười lăm năm lưu lạc, bị lừa gạt, đọa đày.\n(3) Cuối cùng, Kiều được đoàn tụ với gia đình và gặp lại Kim Trọng.\nBước 3 – Kiểm tra: đủ ba phần, đúng thứ tự, không sa vào chi tiết phụ.',
          ),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các phần của Truyện Kiều theo đúng trình tự.'),
          lines: [
            'Gặp gỡ và đính ước: Kiều gặp Kim Trọng, hai người thề nguyền.',
            'Gia biến: cha và em bị vu oan, Kiều bán mình chuộc cha.',
            'Lưu lạc: mười lăm năm Kiều chịu bao đau khổ, đọa đày.',
            'Đoàn tụ: Kiều trở về với gia đình, gặp lại Kim Trọng.',
          ],
          why: vn('Đây chính là mô hình gặp gỡ → chia li, lưu lạc → đoàn tụ của truyện thơ Nôm. Nhớ mô hình này, em tóm tắt được hầu hết các truyện thơ Nôm.'),
        },
        {
          kind: 'choice',
          ask: vn('Điều gì cho thấy Truyện Kiều là một truyện thơ Nôm?'),
          options: [
            'Được viết bằng chữ Hán, theo thể thơ Đường luật.',
            'Là một bài thơ ngắn tả cảnh thiên nhiên.',
            'Được viết bằng chữ Nôm, thể lục bát, kể một câu chuyện có cốt truyện và nhân vật.',
          ],
          answer: 2,
          why: vn('Truyện thơ Nôm = chữ Nôm + thể thơ dân tộc (chủ yếu lục bát) + câu chuyện có nhân vật, sự việc. Truyện Kiều có đủ cả ba điều đó.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền thông tin về tác phẩm.'),
          code: 'Truyện Kiều của Nguyễn Du còn có tên chữ là “___”, gồm 3254 câu thơ ___.',
          answers: ['Đoạn trường tân thanh', 'lục bát'],
          extra: ['Truyền kì mạn lục', 'song thất lục bát'],
          why: vn('“Đoạn trường tân thanh” nghĩa là “tiếng kêu mới đứt ruột”, gợi nỗi đau của số phận Thúy Kiều. “Truyền kì mạn lục” là tác phẩm của Nguyễn Dữ, em đã học ở bài trước.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu giới thiệu ngắn về Truyện Kiều cho một bạn chưa từng đọc.'),
          frame: 'Truyện Kiều là … của … Tác phẩm kể về …',
          model: 'Truyện Kiều là truyện thơ Nôm viết bằng thể lục bát của đại thi hào Nguyễn Du. Tác phẩm kể về Thúy Kiều, một người con gái tài sắc vẹn toàn nhưng phải bán mình chuộc cha và trải qua mười lăm năm lưu lạc. Qua số phận Kiều, Nguyễn Du bày tỏ niềm thương cảm sâu sắc với con người, nhất là người phụ nữ.',
          checklist: [
            'Nêu đúng tác giả và thể loại',
            'Tóm được nội dung chính trong một câu',
            'Có một câu về ý nghĩa của tác phẩm',
          ],
        },
      ],
    },
    {
      id: 'l08-3',
      title: vn('Ước lệ, tả cảnh ngụ tình và từ Hán Việt'),
      steps: [
        {
          kind: 'read',
          title: vn('Bút pháp ước lệ tượng trưng'),
          text: vn(
            'Văn chương xưa thường không tả con người thật chi tiết như chụp ảnh, mà mượn vẻ đẹp của thiên nhiên làm chuẩn mực: mắt như nước mùa thu, lông mày như dáng núi mùa xuân, tóc như mây, da như tuyết. Cách tả “quy ước” như vậy gọi là bút pháp ước lệ tượng trưng.\nKhi tả Thúy Kiều, Nguyễn Du viết:',
          ),
          code: 'Làn thu thủy nét xuân sơn,\nHoa ghen thua thắm liễu hờn kém xanh.',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Bước 1 – Tìm hình ảnh ước lệ: “thu thủy” (nước mùa thu) gợi đôi mắt trong sáng; “xuân sơn” (núi mùa xuân) gợi đôi lông mày thanh tú.\nBước 2 – Tìm biện pháp nghệ thuật: hoa “ghen”, liễu “hờn” → nhân hóa. Thiên nhiên phải ghen tị với vẻ đẹp của Kiều.\nBước 3 – Rút ra ý nghĩa: vẻ đẹp của Kiều vượt lên cả thiên nhiên. Khi thiên nhiên đã “ghen” và “hờn”, người đọc lo lắng rằng nàng sẽ gặp nhiều trắc trở, đúng với ý “chữ tài chữ mệnh khéo là ghét nhau”.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Cụm từ “Làn thu thủy” dùng để gợi tả bộ phận nào của Thúy Kiều?'),
          options: ['Mái tóc', 'Làn da', 'Đôi mắt', 'Giọng nói'],
          answer: 2,
          why: vn('“Thu thủy” là nước mùa thu, trong và long lanh. Người xưa dùng hình ảnh này để gợi một đôi mắt trong sáng, có hồn.'),
        },
        {
          kind: 'read',
          title: vn('Tả cảnh ngụ tình'),
          text: vn(
            'Tả cảnh ngụ tình là mượn cảnh để nói tình: cảnh vật nhuốm màu tâm trạng nhân vật. Nguyễn Du có câu thơ nổi tiếng nói rõ điều này: “Cảnh nào cảnh chẳng đeo sầu, / Người buồn cảnh có vui đâu bao giờ.”\nKhi Kiều ở lầu Ngưng Bích, cô đơn giữa trời nước, nàng nhìn ra xa:',
          ),
          code: 'Buồn trông cửa bể chiều hôm,\nThuyền ai thấp thoáng cánh buồm xa xa?',
        },
        {
          kind: 'choice',
          ask: vn('Hình ảnh cánh buồm “thấp thoáng”, “xa xa” trong buổi “chiều hôm” gợi tâm trạng gì của Kiều?'),
          options: [
            'Vui vẻ, háo hức được đi chơi',
            'Cô đơn, nhớ nhà, lạc lõng không biết tương lai về đâu',
            'Bình thản, không suy nghĩ gì',
          ],
          answer: 1,
          why: vn('Chiều hôm là lúc người ta mong về nhà; cánh buồm nhỏ, xa, lúc ẩn lúc hiện như thân phận Kiều trôi nổi. Điệp ngữ “Buồn trông” mở đầu câu thơ cho thấy nỗi buồn thấm vào cảnh. Đó chính là tả cảnh ngụ tình.'),
        },
        {
          kind: 'fill',
          ask: vn('Tiếng Việt: giải nghĩa một số từ Hán Việt trong Truyện Kiều.'),
          code: '“Thu thủy” nghĩa là nước mùa ___; “xuân sơn” nghĩa là ___ mùa xuân; “tố nga” chỉ người con gái ___.',
          answers: ['thu', 'núi', 'đẹp'],
          extra: ['hạ', 'sông', 'già'],
          why: vn('Tách từng tiếng để đoán nghĩa: “thủy” là nước, “sơn” là núi, “nga” là người con gái đẹp. Từ Hán Việt giúp lời thơ trang trọng, cô đọng, như câu “Đầu lòng hai ả tố nga, / Thúy Kiều là chị em là Thúy Vân.”'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nêu cảm nhận của em về câu thơ tả cảnh mùa xuân: “Cỏ non xanh tận chân trời, / Cành lê trắng điểm một vài bông hoa.”'),
          frame: 'Câu thơ vẽ ra … Màu xanh của … hòa với màu trắng của … Em cảm nhận được …',
          model: 'Câu thơ vẽ ra một bức tranh mùa xuân rộng mở, tươi mới. Màu xanh non của thảm cỏ trải dài đến tận chân trời làm nền cho sắc trắng tinh khôi của vài bông hoa lê. Em cảm nhận được một mùa xuân trong trẻo, nhẹ nhàng, như chính tâm hồn của những người trẻ đi chơi xuân.',
          checklist: [
            'Nêu được bức tranh mà câu thơ vẽ ra',
            'Chỉ ra ít nhất một từ ngữ hoặc màu sắc cụ thể (“xanh”, “trắng”, “điểm”…)',
            'Có cảm xúc, suy nghĩ của riêng em',
          ],
          tip: vn('Để ý chữ “điểm”: chỉ vài bông hoa trắng “chấm” lên nền xanh, giống một nét chấm phá trong tranh.'),
        },
      ],
    },
  ],
};
