import { vn, type PyUnit } from '../code/learn/types';

const QUA_DEO_NGANG = `Bước tới Đèo Ngang, bóng xế tà,
Cỏ cây chen đá, lá chen hoa.
Lom khom dưới núi, tiều vài chú,
Lác đác bên sông, chợ mấy nhà.
Nhớ nước đau lòng, con quốc quốc,
Thương nhà mỏi miệng, cái gia gia.
Dừng chân đứng lại, trời, non, nước,
Một mảnh tình riêng, ta với ta.
(Qua Đèo Ngang – Bà Huyện Thanh Quan)`;

export const unit: PyUnit = {
  id: 'l02',
  emoji: '🏮',
  title: vn('Thơ Đường luật'),
  blurb: vn('Luật thơ chặt chẽ: số câu, số chữ, vần, đối và bố cục'),
  lessons: [
    {
      id: 'l02-1',
      title: vn('Nhận diện thơ Đường luật'),
      steps: [
        {
          kind: 'read',
          title: vn('Hai thể thơ hay gặp'),
          text: vn(
            'Thơ Đường luật là thể thơ có luật rất chặt, ra đời từ thời nhà Đường (Trung Quốc) và được ông cha ta dùng để sáng tác bằng cả chữ Hán lẫn chữ Nôm. Hai thể em hay gặp:\n• Thất ngôn bát cú: 8 câu, mỗi câu 7 chữ.\n• Thất ngôn tứ tuyệt: 4 câu, mỗi câu 7 chữ.\n(“Thất ngôn” là bảy chữ, “bát cú” là tám câu, “tứ tuyệt” là bốn câu.)',
          ),
        },
        {
          kind: 'read',
          title: vn('Vần và đối'),
          text: vn(
            '• Vần: thường là vần bằng, gieo ở cuối câu 1, 2, 4, 6, 8 (thơ bát cú) hoặc cuối câu 1, 2, 4 (thơ tứ tuyệt). Cả bài thường chỉ dùng một vần.\n• Đối: trong thơ bát cú, câu 3 đối với câu 4, câu 5 đối với câu 6. Đối là đặt hai câu song song: từ loại giống nhau, ý tương ứng hoặc tương phản.\n• Thanh bằng: không dấu và dấu huyền. Thanh trắc: sắc, hỏi, ngã, nặng.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: tìm vần trong một bài tứ tuyệt'),
          text: vn(
            'Bài “Bánh trôi nước” của Hồ Xuân Hương.\n\nBước 1 – Đếm: 4 câu, mỗi câu 7 chữ → thất ngôn tứ tuyệt.\nBước 2 – Nhìn chữ cuối câu 1, 2, 4: “tròn”, “non”, “son” → cùng vần “on”, đều là thanh bằng.\nBước 3 – Câu 3 kết thúc bằng “nặn” (thanh trắc), không gieo vần — đúng luật.',
          ),
          code: 'Thân em vừa trắng lại vừa tròn,\nBảy nổi ba chìm với nước non.\nRắn nát mặc dầu tay kẻ nặn,\nMà em vẫn giữ tấm lòng son.\n(Bánh trôi nước – Hồ Xuân Hương)',
        },
        {
          kind: 'choice',
          ask: vn('Bài “Qua Đèo Ngang” có 8 câu, mỗi câu 7 chữ. Bài thơ thuộc thể nào?'),
          code: QUA_DEO_NGANG,
          options: ['Thất ngôn tứ tuyệt', 'Lục bát', 'Thất ngôn bát cú Đường luật', 'Song thất lục bát'],
          answer: 2,
          why: vn('8 câu × 7 chữ là thất ngôn bát cú. Em cứ đếm số câu và số chữ trước, đó là bước nhận diện nhanh nhất.'),
        },
        {
          kind: 'fill',
          ask: vn('Tìm các chữ gieo vần trong “Qua Đèo Ngang” (cuối câu 1, 2, 4).'),
          code: 'Các chữ gieo vần: ___ (câu 1), ___ (câu 2), ___ (câu 4), gia (câu 6), ta (câu 8).',
          answers: ['tà', 'hoa', 'nhà'],
          extra: ['chú', 'quốc', 'nước'],
          why: vn('Tà – hoa – nhà – gia – ta: tất cả cùng vần “a” và là thanh bằng. Một vần xuyên suốt làm bài thơ liền mạch, ngân nga.'),
        },
        {
          kind: 'choice',
          ask: vn('Trong bài thơ thất ngôn bát cú, những cặp câu nào thường phải đối nhau?'),
          options: ['Câu 1–2 và câu 7–8', 'Câu 3–4 và câu 5–6', 'Câu 1 và câu 8', 'Không có câu nào đối'],
          answer: 1,
          why: vn('Hai cặp câu ở giữa bài (3–4 và 5–6) phải đối. Đây là “xương sống” cân đối của bài thơ Đường luật.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu giới thiệu hình thức bài “Bánh trôi nước”: thể thơ và cách gieo vần.'),
          frame: 'Bài thơ “…” được viết theo thể … . Bài thơ gieo vần … ở cuối các câu …',
          model:
            'Bài thơ “Bánh trôi nước” của Hồ Xuân Hương được viết theo thể thất ngôn tứ tuyệt Đường luật, gồm 4 câu, mỗi câu 7 chữ. Bài thơ gieo vần “on” ở cuối các câu 1, 2, 4 với các chữ “tròn”, “non”, “son”.',
          checklist: ['Em đã gọi đúng tên thể thơ chưa?', 'Em đã nêu số câu, số chữ chưa?', 'Em đã chỉ ra các chữ gieo vần chưa?'],
        },
      ],
    },
    {
      id: 'l02-2',
      title: vn('Bố cục đề – thực – luận – kết'),
      steps: [
        {
          kind: 'read',
          title: vn('Bốn phần của bài bát cú'),
          text: vn(
            'Bài thất ngôn bát cú thường chia thành bốn cặp câu:\n• Đề (câu 1–2): mở ra cảnh, nêu đề tài.\n• Thực (câu 3–4): tả cụ thể, làm rõ cảnh hoặc việc.\n• Luận (câu 5–6): bàn luận, bộc lộ cảm xúc, suy nghĩ.\n• Kết (câu 7–8): khép lại, chốt ý chính của bài.\nBài tứ tuyệt thì có bố cục khai – thừa – chuyển – hợp, mỗi phần một câu.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: đọc cặp câu thực'),
          text: vn(
            'Bước 1 – Xác định vị trí: câu 3–4 là cặp câu thực.\nBước 2 – Tìm phép đối: “Lom khom dưới núi” đối “Lác đác bên sông”; “tiều vài chú” đối “chợ mấy nhà”.\nBước 3 – Tìm từ ngữ đặc sắc: “lom khom”, “lác đác” gợi dáng người nhỏ bé, thưa thớt; “vài”, “mấy” chỉ số ít.\nBước 4 – Rút ra ý: có sự sống con người nhưng rất ít ỏi, càng làm cảnh đèo thêm vắng vẻ, hoang sơ.',
          ),
          code: 'Lom khom dưới núi, tiều vài chú,\nLác đác bên sông, chợ mấy nhà.',
        },
        {
          kind: 'choice',
          ask: vn('Hai câu “Nhớ nước đau lòng, con quốc quốc / Thương nhà mỏi miệng, cái gia gia” thuộc phần nào?'),
          code: QUA_DEO_NGANG,
          options: ['Đề', 'Thực', 'Luận', 'Kết'],
          answer: 2,
          why: vn('Đó là câu 5–6, phần luận. Ở đây nhà thơ mượn tiếng chim quốc, chim đa đa để bộc lộ nỗi nhớ nước, thương nhà.'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành phép đối trong cặp câu luận.'),
          code: '“Nhớ nước” đối với “___”; “đau lòng” đối với “___”; “con quốc quốc” đối với “cái gia gia”.',
          answers: ['thương nhà', 'mỏi miệng'],
          extra: ['dừng chân', 'bên sông', 'trời non'],
          why: vn('Các vế đối nhau từng chữ: nhớ – thương, nước – nhà, đau lòng – mỏi miệng. Phép đối làm cảm xúc như được nhân đôi.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu kết “Một mảnh tình riêng, ta với ta” gợi cảm xúc gì?'),
          options: ['Niềm vui được đi chơi xa', 'Nỗi cô đơn, chỉ còn mình đối diện với chính mình giữa trời đất rộng lớn', 'Sự tức giận với cảnh vật', 'Sự thờ ơ, không quan tâm'],
          answer: 1,
          why: vn('“Ta với ta” là chỉ có một mình. Đặt bên “trời, non, nước” bao la, con người càng thấy nhỏ bé, cô đơn.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp thành đoạn văn nhận xét cặp câu thực.'),
          lines: [
            'Hai câu thực vẽ ra hình ảnh con người ở Đèo Ngang.',
            'Nhà thơ viết: “Lom khom dưới núi, tiều vài chú / Lác đác bên sông, chợ mấy nhà.”',
            'Từ “lom khom”, “lác đác” cùng phép đối cho thấy con người ít ỏi, nhỏ bé.',
            'Vì thế, cảnh đèo càng hiện lên hoang vắng, gợi nỗi buồn cho người lữ khách.',
          ],
          why: vn('Câu chủ đề → dẫn thơ → phân tích từ ngữ, biện pháp → đánh giá. Em dùng khung này cho mọi đoạn phân tích thơ.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nhận xét về cặp câu thực của bài “Qua Đèo Ngang”.'),
          frame: 'Ở hai câu thực, tác giả dùng … và phép đối … . Hình ảnh … gợi ra …, qua đó cho thấy …',
          model:
            'Ở hai câu thực, tác giả dùng từ “lom khom”, “lác đác” và phép đối “dưới núi – bên sông”, “tiều vài chú – chợ mấy nhà”. Hình ảnh mấy chú tiều nhỏ bé, vài nhà chợ thưa thớt gợi ra sự sống ít ỏi, qua đó cho thấy cảnh Đèo Ngang hoang vắng và nỗi buồn của nhà thơ.',
          checklist: ['Em đã gọi tên biện pháp (phép đối) chưa?', 'Em đã trích ít nhất một từ ngữ trong thơ chưa?', 'Em đã nói hình ảnh ấy gợi ra cảnh và tâm trạng gì chưa?'],
          tip: vn('Đừng chỉ kể lại câu thơ bằng lời văn. Hãy nói câu thơ dùng cách gì và cách ấy giúp ta thấy điều gì.'),
        },
      ],
    },
    {
      id: 'l02-3',
      title: vn('Từ tượng hình, từ tượng thanh, đảo ngữ'),
      steps: [
        {
          kind: 'read',
          title: vn('Từ tượng hình và từ tượng thanh'),
          text: vn(
            '• Từ tượng hình gợi dáng vẻ, hình ảnh, trạng thái: lom khom, lác đác, lơ lửng, quanh co, lênh khênh…\n• Từ tượng thanh mô phỏng âm thanh: róc rách, ầm ầm, lộp độp, rì rào…\nChúng giúp câu văn, câu thơ sinh động như ta đang nhìn thấy, nghe thấy.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu với “Thu điếu”'),
          text: vn(
            'Sáu câu đầu bài “Thu điếu” (Câu cá mùa thu) của Nguyễn Khuyến.\n\nBước 1 – Tìm từ gợi hình: “tẻo teo” (rất nhỏ), “lơ lửng” (treo nhẹ giữa không trung), “quanh co” (uốn lượn).\nBước 2 – Hỏi: từ ấy vẽ ra hình ảnh gì? Chiếc thuyền bé xíu, tầng mây nhẹ, con ngõ nhỏ uốn khúc.\nBước 3 – Kết luận: cảnh thu nhỏ nhắn, tĩnh lặng, rất đặc trưng của làng quê Bắc Bộ.',
          ),
          code: 'Ao thu lạnh lẽo nước trong veo,\nMột chiếc thuyền câu bé tẻo teo.\nSóng biếc theo làn hơi gợn tí,\nLá vàng trước gió khẽ đưa vèo.\nTầng mây lơ lửng trời xanh ngắt,\nNgõ trúc quanh co khách vắng teo.\n(Thu điếu – Nguyễn Khuyến)',
        },
        {
          kind: 'choice',
          ask: vn('Từ nào sau đây là từ tượng thanh?'),
          options: ['lơ lửng', 'quanh co', 'róc rách', 'lom khom'],
          answer: 2,
          why: vn('“Róc rách” mô phỏng tiếng nước chảy nên là từ tượng thanh. Ba từ còn lại gợi hình dáng, là từ tượng hình.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền từ tượng hình phù hợp vào câu (câu tự viết).'),
          code: 'Con đường làng ___ chạy giữa hai hàng tre, mấy ngọn khói bếp ___ trên mái rạ.',
          answers: ['quanh co', 'lơ lửng'],
          extra: ['ầm ầm', 'lộp độp'],
          why: vn('“Quanh co” gợi dáng con đường uốn lượn, “lơ lửng” gợi làn khói nhẹ trôi. “Ầm ầm”, “lộp độp” là âm thanh nên không hợp ở đây.'),
        },
        {
          kind: 'read',
          title: vn('Đảo ngữ'),
          text: vn(
            'Đảo ngữ là đảo vị trí bình thường của các thành phần trong câu để nhấn mạnh. Trật tự bình thường: “Vài chú tiều lom khom dưới núi.” Bà Huyện Thanh Quan viết: “Lom khom dưới núi, tiều vài chú” — đưa từ tượng hình “lom khom” lên đầu câu để nhấn mạnh dáng vẻ nhỏ bé, vất vả của con người.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào có dùng phép đảo ngữ?'),
          options: ['Chợ mấy nhà lác đác bên sông.', 'Lác đác bên sông, chợ mấy nhà.', 'Bên sông có mấy nhà chợ.'],
          answer: 1,
          why: vn('Từ “lác đác” được đưa lên đầu câu. Nhờ vậy, sự thưa thớt, vắng vẻ được nhấn mạnh ngay khi ta vừa đọc.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nhận xét về cặp câu luận của “Thu điếu”: “Tầng mây lơ lửng trời xanh ngắt, / Ngõ trúc quanh co khách vắng teo.”'),
          frame: 'Hai câu thơ dùng từ tượng hình … và … . Hình ảnh … gợi ra …, qua đó cho thấy …',
          model:
            'Hai câu thơ dùng từ tượng hình “lơ lửng”, “quanh co” cùng phép đối giữa cảnh trời cao và ngõ trúc nhỏ. Hình ảnh tầng mây lơ lửng, ngõ trúc vắng teo gợi ra một không gian thu vừa cao rộng vừa tĩnh lặng, qua đó cho thấy tâm hồn nhà thơ nhạy cảm và có phần cô quạnh.',
          checklist: ['Em đã gọi tên từ tượng hình chưa?', 'Em đã nói từ ấy vẽ ra hình ảnh gì chưa?', 'Em đã nêu cảm xúc hoặc tâm trạng gợi ra chưa?'],
        },
      ],
    },
  ],
};
