import { vn, type PyUnit } from '../code/learn/types';

/**
 * Nghị luận văn học: viết đoạn văn phân tích thơ, nhân vật từng bước nhỏ.
 * Ví dụ: Thu điếu (Nguyễn Khuyến), Qua Đèo Ngang (Bà Huyện Thanh Quan), Chuyện người con gái Nam Xương
 * (Nguyễn Dữ, chỉ kể chi tiết, không trích bản dịch).
 */
export const unit: PyUnit = {
  id: 'l10',
  emoji: '✍️',
  title: vn('Nghị luận văn học'),
  blurb: vn('Viết đoạn văn phân tích thơ và nhân vật: từng viên gạch một'),
  lessons: [
    {
      id: 'l10-1',
      title: vn('Đoạn văn phân tích: bốn viên gạch'),
      steps: [
        {
          kind: 'read',
          title: vn('Bốn viên gạch của một đoạn văn phân tích'),
          text: vn(
            'Một đoạn văn phân tích thơ (hay nhân vật) giống như ngôi nhà nhỏ xây bằng bốn viên gạch:\n1. Câu chủ đề: nêu ý chính của cả đoạn.\n2. Dẫn chứng: trích câu thơ, chi tiết trong tác phẩm.\n3. Phân tích: chỉ ra từ ngữ, hình ảnh, biện pháp tu từ và nói chúng gợi ra điều gì.\n4. Đánh giá, liên hệ: khái quát giá trị, nói cảm nhận của em.\n\nThiếu viên gạch số 3, đoạn văn chỉ còn là kể lại. Thiếu viên số 2, lời em nói không có gì làm bằng chứng.',
          ),
          code: 'Ao thu lạnh lẽo nước trong veo,\nMột chiếc thuyền câu bé tẻo teo.\n(Nguyễn Khuyến, Thu điếu)',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: hai câu đề bài Thu điếu'),
          text: vn(
            'Bước 1 – Câu chủ đề: "Hai câu đề của bài Thu điếu mở ra cảnh ao thu trong trẻo, tĩnh lặng nơi làng quê."\n\nBước 2 – Dẫn chứng: trích hai câu thơ "Ao thu lạnh lẽo nước trong veo, / Một chiếc thuyền câu bé tẻo teo."\n\nBước 3 – Phân tích: từ láy "lạnh lẽo" gợi cái se lạnh của mùa thu; "trong veo" gợi làn nước trong đến tận đáy. Chiếc thuyền "bé tẻo teo" càng nhỏ bé giữa mặt ao. Vần "eo" (veo, teo) gợi không gian như thu hẹp lại, tĩnh lặng.\n\nBước 4 – Đánh giá: "Chỉ bằng vài nét chấm phá, Nguyễn Khuyến đã vẽ nên bức tranh thu rất riêng của làng quê, cho thấy tình yêu thiên nhiên tha thiết."',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào phù hợp nhất làm CÂU CHỦ ĐỀ cho đoạn phân tích hai câu đề bài Thu điếu?'),
          options: [
            'Bài thơ Thu điếu rất hay và em rất thích.',
            'Mùa thu là mùa đẹp nhất trong năm.',
            'Hai câu đề mở ra cảnh ao thu trong trẻo, tĩnh lặng với chiếc thuyền câu nhỏ bé.',
          ],
          answer: 2,
          why: vn('Câu chủ đề tốt phải nói đúng đối tượng (hai câu đề) và nêu rõ ý chính (ao thu trong trẻo, tĩnh lặng). Câu "rất hay, em rất thích" quá chung chung; câu về "mùa đẹp nhất" thì lạc khỏi bài thơ.'),
        },
        {
          kind: 'choice',
          ask: vn('Đâu là câu PHÂN TÍCH, không chỉ là diễn xuôi câu thơ?'),
          options: [
            'Ao thu thì lạnh lẽo, còn nước thì trong veo.',
            'Từ láy "lạnh lẽo" và từ "trong veo" gợi cái se lạnh và sự trong trẻo đến tận đáy của nước ao thu.',
            'Trong ao có một chiếc thuyền câu bé.',
          ],
          answer: 1,
          why: vn('Diễn xuôi là kể lại câu thơ bằng lời văn xuôi. Phân tích là chỉ ra từ ngữ cụ thể ("lạnh lẽo", "trong veo") rồi nói chúng gợi ra điều gì. Công thức dễ nhớ: "Từ … gợi …", "Hình ảnh … cho thấy …".'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành câu phân tích.'),
          code: 'Trong câu thơ "Một chiếc thuyền câu bé tẻo teo", từ ___ "tẻo teo" gợi sự nhỏ bé, ___ của chiếc thuyền giữa mặt ao thu.',
          answers: ['láy', 'đơn độc'],
          extra: ['ghép', 'ồn ào', 'to lớn'],
          why: vn('"Tẻo teo" là từ láy, nhấn mạnh độ nhỏ bé. Một chiếc thuyền bé xíu giữa ao gợi cảm giác lẻ loi, đơn độc, rất hợp với không khí tĩnh lặng của bài thơ.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp bốn câu thành đoạn văn phân tích hai câu thực bài Thu điếu.'),
          lines: [
            'Hai câu thực tiếp tục vẽ nên cảnh thu với những chuyển động rất khẽ.',
            'Nhà thơ viết: "Sóng biếc theo làn hơi gợn tí, / Lá vàng trước gió khẽ đưa vèo."',
            'Sóng chỉ "hơi gợn tí", lá chỉ "khẽ đưa": những chuyển động nhỏ bé ấy càng làm nổi bật sự tĩnh lặng của cảnh thu.',
            'Phải là người tinh tế, gắn bó sâu nặng với quê hương, Nguyễn Khuyến mới cảm nhận được những biến đổi nhỏ như vậy.',
          ],
          why: vn('Đúng bốn viên gạch: câu chủ đề → dẫn chứng → phân tích từ ngữ → đánh giá về tác giả. Nhìn câu mở đầu bằng "Nhà thơ viết:" là biết đó là phần dẫn chứng.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu cho hai câu luận "Tầng mây lơ lửng trời xanh ngắt, / Ngõ trúc quanh co khách vắng teo.": một câu chủ đề và một câu phân tích từ ngữ.'),
          frame: 'Hai câu luận …\nCác từ "…", "…" gợi …',
          model:
            'Hai câu luận mở rộng bức tranh thu lên bầu trời cao và con ngõ nhỏ quanh co. Các từ "lơ lửng", "xanh ngắt", "quanh co" cùng cụm "vắng teo" gợi một không gian cao rộng, trong xanh mà vắng lặng, không một bóng người qua lại.',
          checklist: [
            'Câu chủ đề nói đúng đối tượng (hai câu luận) và có ý chính',
            'Câu phân tích trích từ ngữ cụ thể trong ngoặc kép',
            'Có nói từ ngữ ấy "gợi" ra điều gì, không chỉ kể lại',
          ],
          tip: vn('Trong bài thơ thất ngôn bát cú: câu 1–2 là đề, 3–4 là thực, 5–6 là luận, 7–8 là kết.'),
        },
      ],
    },
    {
      id: 'l10-2',
      title: vn('Diễn dịch, quy nạp, tổng – phân – hợp và phân tích nhân vật'),
      steps: [
        {
          kind: 'read',
          title: vn('Ba mô hình đoạn văn'),
          text: vn(
            'Cùng những ý ấy, em có thể sắp theo ba cách:\n• Diễn dịch: câu chủ đề đứng ĐẦU đoạn, các câu sau triển khai, làm rõ.\n• Quy nạp: các câu phân tích đi trước, câu chủ đề đứng CUỐI đoạn để chốt lại.\n• Tổng – phân – hợp: câu đầu nêu ý khái quát, giữa phân tích, câu cuối khẳng định lại và nâng cao.\n\nKhi đề yêu cầu "viết đoạn văn theo cách quy nạp", em phải để câu chủ đề ở cuối. Đề không yêu cầu thì diễn dịch là cách an toàn, dễ viết nhất.',
          ),
          code: 'Bước tới Đèo Ngang, bóng xế tà,\nCỏ cây chen đá, lá chen hoa.\n(Bà Huyện Thanh Quan, Qua Đèo Ngang)',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: một ý, hai cách viết'),
          text: vn(
            'Bước 1 – Xác định ý chính: hai câu đề Qua Đèo Ngang vẽ cảnh đèo lúc chiều tà, cây cỏ um tùm mà buồn vắng.\nBước 2 – Viết theo diễn dịch: đặt ý chính lên đầu rồi phân tích.\nBước 3 – Muốn chuyển sang quy nạp: chuyển câu chủ đề xuống cuối và thêm từ chốt như "Như vậy", "Có thể thấy".\n\nĐọc hai đoạn mẫu trong khung để thấy sự khác nhau.',
          ),
          code:
            'DIỄN DỊCH: Hai câu đề vẽ nên cảnh Đèo Ngang lúc chiều tà vừa rậm rạp vừa buồn vắng. Thời điểm "bóng xế tà" là lúc ngày sắp tàn, dễ gợi buồn. Điệp từ "chen" cho thấy cỏ cây, đá, lá, hoa mọc chen chúc, um tùm mà hoang sơ.\n\nQUY NẠP: Thời điểm "bóng xế tà" là lúc ngày sắp tàn, dễ gợi buồn. Điệp từ "chen" cho thấy cỏ cây, đá, lá, hoa mọc chen chúc, um tùm mà hoang sơ. Có thể thấy, hai câu đề đã vẽ nên cảnh Đèo Ngang lúc chiều tà vừa rậm rạp vừa buồn vắng.',
        },
        {
          kind: 'choice',
          ask: vn('Đoạn văn sau viết theo mô hình nào?'),
          code: 'Sóng chỉ "hơi gợn tí". Lá vàng chỉ "khẽ đưa vèo". Mây "lơ lửng", ngõ trúc "vắng teo". Như vậy, cảnh thu trong bài Thu điếu là một cảnh thu tĩnh lặng, trong trẻo và vắng vẻ.',
          options: ['Diễn dịch', 'Quy nạp', 'Tổng – phân – hợp'],
          answer: 1,
          why: vn('Các câu dẫn chứng, phân tích đi trước; câu chủ đề nằm ở cuối, mở đầu bằng "Như vậy" → quy nạp.'),
        },
        {
          kind: 'choice',
          ask: vn('Một đoạn văn có câu đầu nêu ý khái quát, các câu giữa phân tích, và câu cuối khẳng định lại ý ấy ở mức sâu hơn. Đó là mô hình nào?'),
          options: ['Tổng – phân – hợp', 'Quy nạp', 'Diễn dịch'],
          answer: 0,
          why: vn('Tổng – phân – hợp có câu chủ đề ở cả đầu (tổng) và cuối (hợp). Câu cuối không chép lại câu đầu mà nâng ý lên, ví dụ thêm đánh giá về tài năng hay tấm lòng của tác giả.'),
        },
        {
          kind: 'read',
          title: vn('Phân tích nhân vật'),
          text: vn(
            'Khi phân tích nhân vật, hãy nhìn vào: ngoại hình, lời nói, hành động, suy nghĩ, và cách các nhân vật khác nhìn về nhân vật ấy. Mỗi đoạn văn chỉ nên làm rõ MỘT phẩm chất, có chi tiết làm dẫn chứng.\n\nVí dụ: nhân vật Vũ Nương trong "Chuyện người con gái Nam Xương" (Nguyễn Dữ). Phẩm chất hiếu thảo được thể hiện qua chi tiết: khi chồng đi lính, nàng một mình chăm sóc mẹ chồng lúc ốm đau, đến khi bà mất thì lo việc ma chay chu đáo, trọn đạo làm dâu.\n\nCông thức: Phẩm chất → Chi tiết → Chi tiết ấy cho thấy điều gì → Đánh giá.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Chi tiết nào làm dẫn chứng tốt nhất cho ý "Vũ Nương là người con dâu hiếu thảo"?'),
          options: [
            'Bé Đản chỉ cái bóng trên vách và bảo đó là cha.',
            'Nàng hết lòng chăm sóc mẹ chồng khi bà ốm, lo ma chay chu đáo khi bà mất.',
            'Trương Sinh nghi ngờ vợ không chung thủy.',
            'Nàng gieo mình xuống sông Hoàng Giang.',
          ],
          answer: 1,
          why: vn('Dẫn chứng phải khớp với phẩm chất đang bàn. Chăm mẹ chồng là chi tiết nói đúng về lòng hiếu thảo. Các chi tiết khác có thật trong truyện nhưng dùng cho ý khác (nỗi oan, bi kịch của nàng).'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu theo cách QUY NẠP về phẩm chất hiếu thảo của Vũ Nương: câu đầu nêu chi tiết và phân tích, câu sau chốt ý (câu chủ đề ở cuối).'),
          frame: 'Khi chồng đi lính, Vũ Nương …\nCó thể thấy, …',
          model:
            'Khi chồng đi lính, Vũ Nương một mình chăm sóc mẹ chồng ốm yếu và lo ma chay chu đáo khi bà mất, việc làm ấy cho thấy tấm lòng tận tụy, giàu tình nghĩa của nàng. Có thể thấy, Vũ Nương là một người con dâu hiếu thảo hết mực.',
          checklist: [
            'Câu chủ đề nằm ở CUỐI đoạn (đúng quy nạp)',
            'Có chi tiết cụ thể trong truyện làm dẫn chứng',
            'Có nói chi tiết ấy cho thấy điều gì về nhân vật',
          ],
        },
      ],
    },
    {
      id: 'l10-3',
      title: vn('Dẫn trực tiếp, gián tiếp và lắp trọn một đoạn văn'),
      steps: [
        {
          kind: 'read',
          title: vn('Hai cách dẫn'),
          text: vn(
            '• Dẫn trực tiếp: nhắc lại nguyên văn lời nói hay câu thơ, đặt trong dấu ngoặc kép, thường đứng sau dấu hai chấm.\n• Dẫn gián tiếp: thuật lại ý bằng lời của mình, không dùng dấu ngoặc kép, thường thêm "rằng" hoặc "là" trước phần dẫn.\n\nTrong bài phân tích thơ, khi trích câu thơ em phải dẫn trực tiếp, chép đúng từng chữ. Khi nhắc đến chi tiết truyện, em có thể dẫn gián tiếp.',
          ),
          code: 'Trực tiếp: Nguyễn Khuyến viết: "Ngõ trúc quanh co khách vắng teo."\nGián tiếp: Nguyễn Khuyến tả con ngõ trúc quanh co, vắng bóng người qua lại.',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: chuyển trực tiếp thành gián tiếp'),
          text: vn(
            'Câu gốc: Lan nói: "Hôm nay mình sẽ học bài cùng cậu."\n\nBước 1 – Bỏ dấu hai chấm và dấu ngoặc kép, thêm "rằng".\nBước 2 – Đổi từ xưng hô cho hợp với người thuật lại: "mình" (Lan) → "bạn ấy"; "cậu" (người nghe, là tôi) → "tôi".\nBước 3 – Đổi từ chỉ thời gian nếu cần: "hôm nay" → "hôm ấy".\n\nKết quả: Lan nói rằng hôm ấy bạn ấy sẽ học bài cùng tôi.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào là lời dẫn GIÁN TIẾP?'),
          options: [
            'Cô giáo dặn: "Các em nhớ ôn bài kĩ."',
            'Cô giáo dặn chúng em rằng phải ôn bài thật kĩ.',
            'Cô giáo dặn: "Ôn bài kĩ nhé!"',
          ],
          answer: 1,
          why: vn('Lời dẫn gián tiếp không có dấu hai chấm và ngoặc kép, ý được thuật lại bằng lời người viết, có từ "rằng" đứng trước. Hai câu còn lại giữ nguyên văn lời cô → dẫn trực tiếp.'),
        },
        {
          kind: 'fill',
          ask: vn('Chuyển câu sang lời dẫn gián tiếp.'),
          code: 'Câu gốc: Minh bảo: "Tớ sẽ đến sớm."\nGián tiếp: Minh bảo ___ ___ sẽ đến sớm.',
          answers: ['rằng', 'bạn ấy'],
          extra: ['tớ', 'nhưng', 'vì'],
          why: vn('Thêm "rằng" để mở phần thuật lại, và đổi "tớ" (Minh tự xưng) thành "bạn ấy" vì người kể lại không phải là Minh.'),
        },
        {
          kind: 'read',
          title: vn('Lắp một đoạn văn qua ba bước nhỏ'),
          text: vn(
            'Giờ em sẽ viết trọn một đoạn văn về hai câu luận bài Qua Đèo Ngang, mỗi bước chỉ 1–2 câu.\n\nGợi ý ý: tiếng chim quốc kêu "quốc quốc" gần âm với "quốc" (nước), tiếng chim đa đa kêu "gia gia" gần âm với "gia" (nhà). Nhà thơ mượn tiếng chim để nói nỗi nhớ nước, thương nhà. Hai câu còn đối nhau rất chỉnh: "nhớ nước" – "thương nhà", "đau lòng" – "mỏi miệng", "con quốc quốc" – "cái gia gia".',
          ),
          code: 'Nhớ nước đau lòng, con quốc quốc,\nThương nhà mỏi miệng, cái gia gia.\n(Bà Huyện Thanh Quan, Qua Đèo Ngang)',
        },
        {
          kind: 'compose',
          task: vn('Bước 1: Viết 1 câu chủ đề cho đoạn văn về hai câu luận "Nhớ nước đau lòng, con quốc quốc, / Thương nhà mỏi miệng, cái gia gia."'),
          frame: 'Đến hai câu luận, …',
          model: 'Đến hai câu luận, cảnh vật Đèo Ngang đã gợi lên trong lòng nhà thơ nỗi nhớ nước, thương nhà da diết.',
          checklist: ['Nói đúng đối tượng: hai câu luận', 'Nêu được ý chính: nỗi nhớ nước, thương nhà', 'Chỉ một câu, gọn gàng'],
        },
        {
          kind: 'compose',
          task: vn('Bước 2: Viết 1–2 câu dẫn chứng (dẫn trực tiếp) và phân tích nghệ thuật của hai câu thơ.'),
          frame: 'Nhà thơ viết: "…"\nTiếng chim "quốc quốc", "gia gia" …',
          model:
            'Nhà thơ viết: "Nhớ nước đau lòng, con quốc quốc, / Thương nhà mỏi miệng, cái gia gia." Tiếng chim "quốc quốc", "gia gia" gần âm với "quốc" (nước) và "gia" (nhà), cùng phép đối chỉnh giữa hai câu, đã biến tiếng chim thành tiếng lòng da diết của người lữ khách.',
          checklist: [
            'Câu thơ được trích đúng, trong ngoặc kép, có dấu "/" ngăn hai dòng',
            'Chỉ ra được nghệ thuật: chơi chữ gần âm, phép đối',
            'Nói được nghệ thuật ấy gợi tâm trạng gì',
          ],
        },
        {
          kind: 'compose',
          task: vn('Bước 3: Viết 1 câu đánh giá hoặc liên hệ để kết đoạn văn.'),
          frame: 'Qua hai câu thơ, …',
          model: 'Qua hai câu thơ, ta cảm nhận được một tâm hồn nặng lòng với đất nước và gia đình, khiến người đọc hôm nay vẫn xúc động.',
          checklist: ['Câu kết khái quát lại, không lặp nguyên câu chủ đề', 'Có đánh giá về tấm lòng tác giả hoặc cảm nhận của em'],
          tip: vn('Ghép ba bước lại là em đã có một đoạn văn diễn dịch hoàn chỉnh. Đọc to cả đoạn để kiểm tra các câu nối với nhau tự nhiên chưa.'),
        },
      ],
    },
  ],
};
