import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l05',
  emoji: '💬',
  title: vn('Nghị luận xã hội'),
  blurb: vn('Luận đề, luận điểm, lí lẽ, bằng chứng và cách dựng đoạn văn 200 chữ từng bước'),
  lessons: [
    {
      id: 'l05-1',
      title: vn('Bốn “viên gạch” của bài nghị luận'),
      steps: [
        {
          kind: 'read',
          title: vn('Nghị luận là gì?'),
          text: vn(
            'Văn nghị luận xã hội là khi em bàn về một vấn đề của cuộc sống (dùng điện thoại, tự học, lòng biết ơn…) để người đọc đồng ý với mình. Muốn thuyết phục, em cần bốn “viên gạch”:\n• Luận đề: vấn đề chính cả bài bàn đến.\n• Luận điểm: những ý lớn em đưa ra để làm rõ luận đề.\n• Lí lẽ: lời giải thích “vì sao” ý đó đúng.\n• Bằng chứng: sự việc, con số, ví dụ có thật để chứng minh.\nHãy hình dung một ngôi nhà: luận đề là cả ngôi nhà, luận điểm là các cây cột, lí lẽ và bằng chứng là xi măng, gạch đá giữ cho cột đứng vững.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Đọc đoạn văn trong khung, rồi cùng cô tìm bốn viên gạch nhé.\nBước 1 – Tìm luận đề: đoạn văn bàn về điều gì? → Ích lợi của việc tự học.\nBước 2 – Tìm luận điểm: ý lớn được khẳng định là gì? → Câu (1): tự học giúp ta hiểu bài sâu và nhớ lâu.\nBước 3 – Tìm lí lẽ: câu nào giải thích “vì sao”? → Câu (2): khi tự tìm tòi, ta phải tự đặt câu hỏi và tự trả lời.\nBước 4 – Tìm bằng chứng: câu nào là ví dụ cụ thể? → Câu (3): bạn Minh tự giải lại bài toán khó và nhớ cách làm đến tận kì thi.\nCâu (4) chốt lại ý, nối với luận đề.',
          ),
          code: '(1) Tự học giúp chúng ta hiểu bài sâu hơn và nhớ lâu hơn. (2) Bởi vì khi tự tìm tòi, ta buộc phải tự đặt câu hỏi, tự suy nghĩ để tìm ra câu trả lời, chứ không chỉ nghe rồi chép lại. (3) Chẳng hạn, bạn Minh lớp em từng loay hoay cả buổi tối với một bài toán khó; khi tự giải được, bạn nhớ cách làm đến tận kì thi cuối năm. (4) Vì thế, tự học chính là cách học bền vững nhất.',
        },
        {
          kind: 'choice',
          ask: vn('Trong đoạn văn sau, câu nào nêu luận điểm?'),
          code: '(1) Ông bà, cha mẹ đã vất vả nuôi ta khôn lớn. (2) Vì vậy, lòng biết ơn là phẩm chất mà mỗi người cần nuôi dưỡng. (3) Một lời hỏi thăm ông bà mỗi cuối tuần cũng là cách bày tỏ lòng biết ơn.',
          options: ['Câu (1)', 'Câu (2)', 'Câu (3)'],
          answer: 1,
          why: vn('Câu (2) là ý lớn mà người viết muốn người đọc đồng ý: “lòng biết ơn là phẩm chất cần nuôi dưỡng”. Câu (1) là lí lẽ dẫn đến ý đó, câu (3) là bằng chứng, ví dụ cụ thể.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền từ thích hợp để phân biệt hai “viên gạch” hay bị nhầm.'),
          code: '___ là lời giải thích vì sao một ý là đúng, còn ___ là sự việc, con số, ví dụ có thật để chứng minh ý đó.',
          answers: ['Lí lẽ', 'bằng chứng'],
          extra: ['luận đề', 'cảm xúc', 'nhan đề'],
          why: vn('Mẹo nhớ: lí lẽ trả lời câu hỏi “Vì sao?”, bằng chứng trả lời câu hỏi “Ví dụ đâu?”. Một luận điểm thuyết phục thường có cả hai.'),
        },
        {
          kind: 'read',
          title: vn('Thế nào là bằng chứng tốt?'),
          text: vn(
            'Bằng chứng tốt cần ba điều:\n• Xác thực: có thật, không bịa, không phóng đại.\n• Tiêu biểu: là ví dụ rõ ràng, nhiều người có thể nhận ra.\n• Phù hợp: đúng với luận điểm đang bàn, không lạc sang chuyện khác.\nNhững câu như “ai cũng biết là…” hay “chắc chắn 100% mọi người…” không phải bằng chứng, vì chúng không chỉ ra được sự việc cụ thể nào.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Luận điểm: “Bắt nạt học đường để lại hậu quả lâu dài cho nạn nhân.” Chọn bằng chứng tốt nhất.'),
          options: [
            'Ai cũng biết bắt nạt là xấu.',
            'Em nghĩ bắt nạt thật đáng ghét.',
            'Bắt nạt học đường làm 100% học sinh bỏ học.',
            'Nhiều bạn từng bị trêu chọc, cô lập kể rằng các bạn sợ đến lớp, học sa sút và mất tự tin trong thời gian dài.',
          ],
          answer: 3,
          why: vn('Đáp án cuối chỉ ra những hậu quả cụ thể (sợ đến lớp, học sa sút, mất tự tin) và đúng với ý “lâu dài”. “Ai cũng biết” và “em nghĩ” chỉ là ý kiến, không chứng minh được gì; còn “100% học sinh bỏ học” là phóng đại, không xác thực.'),
        },
        {
          kind: 'compose',
          task: vn('Cho luận điểm: “Tự học giúp em chủ động hơn trong học tập.” Hãy viết 2 câu: một câu lí lẽ và một câu bằng chứng.'),
          frame: 'Bởi vì khi tự học, … Chẳng hạn, …',
          model: 'Bởi vì khi tự học, em tự biết mình còn yếu phần nào để dành thời gian ôn lại, không phải chờ thầy cô nhắc. Chẳng hạn, trước mỗi bài kiểm tra Toán, em tự lập danh sách dạng bài còn hay sai và luyện thêm, nên em không còn cảm giác bị động khi vào phòng thi.',
          checklist: [
            'Câu lí lẽ trả lời được câu hỏi “Vì sao?”',
            'Câu bằng chứng là một việc cụ thể, có thật, không phóng đại',
            'Cả hai câu đều bám đúng luận điểm “chủ động hơn”',
            'Có từ nối như “Bởi vì”, “Chẳng hạn”',
          ],
          tip: vn('Bằng chứng lấy từ chính trải nghiệm của em cũng được, miễn là cụ thể và trung thực.'),
        },
      ],
    },
    {
      id: 'l05-2',
      title: vn('Dựng đoạn văn 200 chữ theo bốn bước'),
      steps: [
        {
          kind: 'read',
          title: vn('Bộ khung của đoạn văn'),
          text: vn(
            'Một đoạn nghị luận xã hội khoảng 200 chữ (chừng 8–12 câu) có thể dựng theo bộ khung sau:\n0. Câu mở đoạn: giới thiệu vấn đề.\n1. Giải thích: vấn đề đó là gì? (1–2 câu)\n2. Bàn luận: vì sao nó quan trọng, biểu hiện ra sao, có ích lợi hay tác hại gì? Kèm lí lẽ và bằng chứng. (3–4 câu)\n3. Phản đề: nhìn mặt trái, phê phán những biểu hiện ngược lại. (1–2 câu)\n4. Bài học: em hiểu ra điều gì và sẽ làm gì. (1–2 câu)\nĐoạn văn chỉ có một ý chính, viết liền một mạch, không xuống dòng.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Đề: Viết đoạn văn khoảng 200 chữ bàn về lòng biết ơn.\nBước 0 – Mở đoạn: nêu vấn đề bằng một câu dễ hiểu.\nBước 1 – Giải thích: biết ơn là ghi nhớ và trân trọng công lao của người đã giúp mình.\nBước 2 – Bàn luận: vì sao cần biết ơn (gắn kết con người, khiến ta sống tử tế) + một ví dụ.\nBước 3 – Phản đề: phê phán người vô ơn, coi mọi sự giúp đỡ là đương nhiên.\nBước 4 – Bài học: hành động nhỏ, cụ thể.\nGhép lại, ta được đoạn văn trong khung. Em thử nhận ra từng bước nhé.',
          ),
          code: 'Trong cuộc sống, lòng biết ơn là một phẩm chất giản dị mà quý giá. Biết ơn là ghi nhớ và trân trọng công lao của những người đã giúp đỡ, nuôi dưỡng mình. Người biết ơn luôn khiến các mối quan hệ trở nên gắn bó, bởi ai cũng vui khi thấy việc tốt của mình được ghi nhận. Lòng biết ơn còn nhắc ta sống tử tế, muốn giúp lại người khác. Chẳng hạn, một học sinh cũ quay về thăm thầy cô ngày 20 tháng 11 sẽ làm thầy cô thấy những năm tháng dạy dỗ thật ý nghĩa. Tuy nhiên, vẫn có người coi sự giúp đỡ là điều đương nhiên, nhận mà không một lời cảm ơn. Lối sống ấy khiến con người dần xa cách nhau. Vì vậy, mỗi chúng ta hãy tập biết ơn từ những việc nhỏ: nói lời cảm ơn, hỏi thăm ông bà, giúp cha mẹ việc nhà. Biết ơn không khó, chỉ cần ta biết nhìn lại những gì mình đã nhận.',
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các câu sau thành đoạn văn ngắn về việc dùng điện thoại thông minh.'),
          lines: [
            'Điện thoại thông minh đã trở thành người bạn quen thuộc của tuổi học trò.',
            'Đó là thiết bị giúp ta liên lạc, tra cứu và giải trí chỉ bằng vài cú chạm.',
            'Nếu biết dùng đúng lúc, điện thoại giúp ta tìm tài liệu học tập, học thêm ngoại ngữ, giữ liên lạc với gia đình.',
            'Tuy nhiên, nhiều bạn lướt mạng đến khuya, mất ngủ và sao nhãng việc học.',
            'Vì vậy, mỗi chúng ta nên đặt giờ dùng điện thoại hợp lí và cất máy đi khi học bài.',
          ],
          why: vn('Đúng bộ khung: mở đoạn → giải thích (điện thoại là gì) → bàn luận (ích lợi) → phản đề (bắt đầu bằng “Tuy nhiên”) → bài học (bắt đầu bằng “Vì vậy”). Các từ nối chính là “biển chỉ đường” giúp em xếp đúng.'),
        },
        {
          kind: 'choice',
          ask: vn('Trong đề bàn về tự học, câu nào đóng vai trò phản đề?'),
          options: [
            'Tự học là tự mình tìm hiểu, ôn luyện kiến thức mà không cần ai nhắc nhở.',
            'Tự học giúp ta nhớ bài lâu hơn.',
            'Thế nhưng, có bạn chỉ học khi bị kiểm tra, hễ không ai nhắc là bỏ sách vở sang một bên.',
            'Em sẽ dành mỗi tối ba mươi phút để tự ôn bài.',
          ],
          answer: 2,
          why: vn('Phản đề nhìn vào mặt trái: những biểu hiện ngược với tinh thần tự học. Câu đầu là giải thích, câu thứ hai là bàn luận, câu cuối là bài học.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền từ nối cho đoạn văn mạch lạc.'),
          code: 'Biết ơn khiến các mối quan hệ thêm gắn bó, ___ một lời cảm ơn sau giờ học cũng làm thầy cô vui cả ngày. ___, vẫn có người coi sự giúp đỡ là điều đương nhiên. ___, mỗi chúng ta hãy tập nói lời cảm ơn mỗi ngày.',
          answers: ['chẳng hạn', 'Tuy nhiên', 'Vì vậy'],
          extra: ['Bởi vì', 'Mặc dù'],
          why: vn('“Chẳng hạn” mở ra bằng chứng, “Tuy nhiên” chuyển sang phản đề, “Vì vậy” dẫn đến bài học. Thuộc ba từ nối này, đoạn văn của em sẽ có “xương sống” rõ ràng.'),
        },
        {
          kind: 'choice',
          ask: vn('Phần giải thích trong đoạn văn nên làm gì?'),
          options: [
            'Kể thật dài một câu chuyện cảm động.',
            'Nói rõ vấn đề là gì, hiểu nghĩa từ khóa của đề.',
            'Đưa ra lời khuyên cho mọi người.',
          ],
          answer: 1,
          why: vn('Giải thích giúp người đọc hiểu đúng vấn đề trước khi bàn luận, ví dụ “Tự học là…”, “Biết ơn là…”. Câu chuyện là bằng chứng (nằm ở phần bàn luận), còn lời khuyên để dành cho phần bài học.'),
        },
        {
          kind: 'compose',
          task: vn('Đề: “Bàn về việc dùng điện thoại thông minh ở tuổi học trò.” Hãy viết câu mở đoạn và câu giải thích (2 câu).'),
          frame: 'Ngày nay, … Điện thoại thông minh là …',
          model: 'Ngày nay, gần như bạn học sinh nào cũng có trong tay một chiếc điện thoại thông minh. Điện thoại thông minh là thiết bị vừa để liên lạc, vừa có thể tra cứu, học tập và giải trí, nhưng dùng nó thế nào cho đúng lại là chuyện không đơn giản.',
          checklist: [
            'Câu mở đoạn nêu đúng vấn đề của đề',
            'Câu giải thích nói rõ điện thoại thông minh là gì',
            'Câu văn ngắn gọn, chưa vội đưa lời khuyên',
          ],
          tip: vn('Câu mở đoạn giống lời chào: ngắn, rõ, dẫn người đọc vào đúng chuyện mình sắp bàn.'),
        },
      ],
    },
    {
      id: 'l05-3',
      title: vn('Phản đề và bài học: viết từng mảnh'),
      steps: [
        {
          kind: 'read',
          title: vn('Hai phần cuối hay bị viết vội'),
          text: vn(
            'Phản đề giúp đoạn văn nhìn vấn đề nhiều chiều. Em có thể:\n• Phê phán biểu hiện ngược lại (người vô ơn, người ỷ lại…).\n• Hoặc nói rõ “không phải là…” để tránh hiểu sai (tự học không có nghĩa là không bao giờ hỏi ai).\nBài học có hai lớp:\n• Nhận thức: em hiểu ra điều gì.\n• Hành động: em sẽ làm gì, càng cụ thể càng tốt.\nTránh những câu chung chung như khẩu hiệu: “Chúng ta phải sống thật tốt!”',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Đề: Bàn về bắt nạt học đường.\nBước 1 – Phản đề: nghĩ xem ai đang “góp phần” để bắt nạt tiếp diễn? → Những người đứng xem, cười theo hoặc im lặng.\nViết: “Đáng buồn là nhiều bạn chứng kiến cảnh bắt nạt nhưng chỉ đứng xem, thậm chí quay video chia sẻ cho vui.”\nBước 2 – Bài học nhận thức: “Im lặng trước bắt nạt cũng là tiếp tay cho nó.”\nBước 3 – Bài học hành động (cụ thể): “Khi thấy bạn bị bắt nạt, em sẽ lên tiếng, ở bên bạn và báo ngay cho thầy cô.”',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu bài học nào cụ thể và thuyết phục nhất?'),
          options: [
            'Chúng ta phải sống thật tốt!',
            'Mọi người hãy cùng nhau yêu thương.',
            'Từ hôm nay, em sẽ để điện thoại ngoài phòng khi học bài và chỉ dùng sau chín giờ tối.',
            'Điện thoại là con dao hai lưỡi.',
          ],
          answer: 2,
          why: vn('Câu thứ ba nói rõ ai làm, làm gì, khi nào, nên người đọc tin là làm được. Hai câu đầu giống khẩu hiệu; câu cuối là một nhận xét, chưa phải hành động.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào là phản đề theo kiểu “không phải là…” cho đề bàn về tự học?'),
          options: [
            'Tự học không có nghĩa là tự làm tất cả một mình, gặp chỗ khó vẫn nên hỏi thầy cô, bạn bè.',
            'Tự học giúp ta tiến bộ mỗi ngày.',
            'Em sẽ lập thời gian biểu tự học.',
          ],
          answer: 0,
          why: vn('Câu đầu ngăn một cách hiểu sai về tự học, làm cho lập luận chặt chẽ hơn. Câu thứ hai là bàn luận, câu thứ ba là bài học.'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành ghi nhớ về phần bài học.'),
          code: 'Bài học gồm hai lớp: ___ (em hiểu ra điều gì) và ___ (em sẽ làm gì).',
          answers: ['nhận thức', 'hành động'],
          extra: ['cảm xúc', 'hình ảnh', 'luận đề'],
          why: vn('Hiểu đúng rồi mới làm đúng. Bài học có đủ hai lớp thì đoạn văn khép lại chắc chắn, không bị hẫng.'),
        },
        {
          kind: 'order',
          ask: vn('Xếp các câu thành một đoạn văn hoàn chỉnh về bắt nạt học đường.'),
          lines: [
            'Bắt nạt học đường là vấn đề khiến nhiều phụ huynh và học sinh lo lắng.',
            'Đó là việc một hay nhiều người cố ý trêu chọc, đe dọa, cô lập hoặc làm tổn thương người khác.',
            'Những lời chế giễu tưởng như đùa vui có thể khiến nạn nhân sợ đến lớp và mất niềm tin vào bạn bè.',
            'Đáng buồn là nhiều bạn chứng kiến nhưng chỉ đứng xem, coi như không liên quan đến mình.',
            'Vì thế, mỗi học sinh cần biết lên tiếng, ở bên bạn bị bắt nạt và báo ngay cho thầy cô.',
          ],
          why: vn('Mở đoạn → giải thích (“Đó là…”) → bàn luận về tác hại → phản đề (người đứng xem) → bài học (“Vì thế…”). Đây đúng là bộ khung em đã học.'),
        },
        {
          kind: 'compose',
          task: vn('Đề: “Bàn về việc dùng điện thoại thông minh ở tuổi học trò.” Hãy viết 2–3 câu: một câu phản đề và một đến hai câu bài học.'),
          frame: 'Tuy nhiên, … Vì vậy, em …',
          model: 'Tuy nhiên, không ít bạn cầm điện thoại đến tận khuya, sáng hôm sau ngủ gật trong lớp và bỏ dở bài tập. Vì vậy, em hiểu rằng điện thoại chỉ có ích khi mình làm chủ được nó. Từ tuần này, em sẽ tắt thông báo khi học bài và cất điện thoại trước mười giờ tối.',
          checklist: [
            'Câu phản đề chỉ ra một biểu hiện cụ thể, không chung chung',
            'Bài học có phần nhận thức (em hiểu ra…)',
            'Bài học có hành động cụ thể (làm gì, khi nào)',
            'Dùng từ nối “Tuy nhiên”, “Vì vậy”',
          ],
          tip: vn('Ghép mảnh này với câu mở đoạn và câu giải thích ở bài trước, em đã có gần trọn một đoạn văn 200 chữ rồi đấy!'),
        },
      ],
    },
  ],
};
