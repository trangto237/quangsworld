import { vn, type PyUnit } from '../code/learn/types';

/**
 * Ôn thi vào 10 Hà Nội: hiểu đề, đọc đề, các mức câu hỏi, tránh lỗi hay gặp.
 * Cấu trúc đề chỉ mô tả chung; thang điểm và thời gian cụ thể xem đề minh họa mới nhất của Sở.
 */
export const unit: PyUnit = {
  id: 'l12',
  emoji: '🎯',
  title: vn('Ôn thi vào 10 Hà Nội'),
  blurb: vn('Hiểu đề, đọc đề, trả lời đúng mức câu hỏi và tránh những lỗi mất điểm'),
  lessons: [
    {
      id: 'l12-1',
      title: vn('Cấu trúc đề và cách đọc đề'),
      steps: [
        {
          kind: 'read',
          title: vn('Đề thi gồm những gì?'),
          text: vn(
            'Đề Ngữ văn vào lớp 10 ở Hà Nội thường có hai mảng lớn:\n• Đọc hiểu: em đọc một (hoặc vài) văn bản, có thể là văn bản ngoài sách giáo khoa, rồi trả lời các câu hỏi về nội dung, nghệ thuật và kiến thức tiếng Việt (biện pháp tu từ, thành phần biệt lập, phép liên kết…).\n• Viết: em viết nghị luận văn học (phân tích, cảm nhận một đoạn thơ, một nhân vật…) và nghị luận xã hội (bàn về một vấn đề trong đời sống).\n\nCách sắp xếp các phần, thang điểm, thời gian và độ dài yêu cầu có thể thay đổi theo từng năm. Hãy cùng thầy cô xem đề minh họa mới nhất của Sở Giáo dục và Đào tạo Hà Nội để biết chính xác.\n\nVì văn bản có thể mới hoàn toàn, điều quan trọng nhất không phải là học thuộc bài mẫu, mà là biết CÁCH đọc và CÁCH trả lời.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: gạch chân từ khóa'),
          text: vn(
            'Đề: "Chỉ ra và nêu tác dụng của một biện pháp tu từ trong hai câu thơ cuối."\n\nBước 1 – Gạch chân từ chỉ việc phải làm: "chỉ ra", "nêu tác dụng".\nBước 2 – Gạch chân số lượng: "một biện pháp" (nêu một là đủ, nêu nhiều mà sai còn mất điểm).\nBước 3 – Gạch chân phạm vi: "hai câu thơ cuối" (không lấy ví dụ ở chỗ khác).\nBước 4 – Tự hỏi: đề cần mấy ý? → Hai ý: tên biện pháp kèm từ ngữ, và tác dụng (theo công thức 3 bước em đã học).',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Đề: "Nêu hai việc làm cụ thể để bảo vệ môi trường mà em rút ra từ văn bản." Đề yêu cầu gì?'),
          options: [
            'Phân tích nghệ thuật của văn bản',
            'Kể lại nội dung văn bản',
            'Viết một bài văn dài về môi trường',
            'Nêu đúng hai việc làm cụ thể, có liên quan đến văn bản',
          ],
          answer: 3,
          why: vn('Từ khóa: "hai" (số lượng), "việc làm cụ thể" (không phải lời kêu gọi chung chung), "rút ra từ văn bản" (phải bám vào văn bản). Viết dài hay kể lại đều không trúng yêu cầu.'),
        },
        {
          kind: 'fill',
          ask: vn('Tìm ba từ khóa trong đề.'),
          code: 'Đề: Chỉ ra hai từ láy trong đoạn thơ và nêu tác dụng của chúng.\nTừ khóa về số lượng: ___\nTừ khóa về loại từ: ___\nTừ khóa về việc phải làm thêm: ___',
          answers: ['hai', 'từ láy', 'nêu tác dụng'],
          extra: ['một', 'từ ghép', 'kể lại'],
          why: vn('Đọc đề, em gạch ba thứ: bao nhiêu (hai), cái gì (từ láy), làm gì (chỉ ra và nêu tác dụng). Bỏ sót "nêu tác dụng" là mất một nửa số điểm của câu.'),
        },
        {
          kind: 'choice',
          ask: vn('Đề yêu cầu "trình bày cảm nhận về hai khổ thơ đầu", nhưng bạn Nam phân tích cả bài thơ. Đó là lỗi gì?'),
          options: ['Lạc đề, sai phạm vi', 'Thiếu dẫn chứng', 'Sai chính tả'],
          answer: 0,
          why: vn('Đề giới hạn "hai khổ thơ đầu", viết lan ra cả bài là sai phạm vi. Phần viết thừa không được điểm, lại tốn thời gian. Có thể liên hệ một chút với phần khác, nhưng trọng tâm phải là hai khổ đầu.'),
        },
        {
          kind: 'read',
          title: vn('Phân bổ thời gian'),
          text: vn(
            'Một vài nguyên tắc để không bị "cháy giờ":\n• Chia thời gian theo số điểm: phần nhiều điểm hơn thì dành nhiều thời gian hơn.\n• Câu đọc hiểu ngắn thì trả lời ngắn, đúng ý; đừng viết cả trang cho một câu nhận biết.\n• Trước khi viết bài nghị luận, dành vài phút lập dàn ý nhanh ra nháp.\n• Luôn để lại vài phút cuối để đọc soát chính tả, xem đã trả lời đủ các câu chưa.',
          ),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các việc em nên làm khi nhận đề thi.'),
          lines: [
            'Đọc lướt toàn bộ đề, gạch chân từ khóa của từng câu.',
            'Ước lượng thời gian cho từng phần theo số điểm.',
            'Làm phần đọc hiểu, câu dễ làm trước.',
            'Lập dàn ý nhanh rồi viết các phần nghị luận.',
            'Dành vài phút cuối đọc soát chính tả và kiểm tra đủ câu.',
          ],
          why: vn('Hiểu đề trước, chia thời gian, làm phần chắc điểm, rồi mới viết phần dài, cuối cùng soát lại. Thứ tự này giúp em không bỏ sót câu nào.'),
        },
        {
          kind: 'compose',
          task: vn('Đọc đề: "Xác định thành phần biệt lập trong câu in đậm và cho biết đó là thành phần gì." Viết 1–2 câu nói rõ đề yêu cầu em làm những việc gì.'),
          frame: 'Đề yêu cầu em làm … việc: thứ nhất, …; thứ hai, …',
          model:
            'Đề yêu cầu em làm hai việc: thứ nhất, tìm và chép đúng thành phần biệt lập trong câu in đậm; thứ hai, gọi tên đó là thành phần tình thái, cảm thán, gọi – đáp hay phụ chú. Phạm vi chỉ là câu in đậm, không cần tìm ở câu khác.',
          checklist: ['Nêu đủ hai việc: xác định và gọi tên', 'Chỉ rõ phạm vi (câu in đậm)', 'Viết gọn, không quá 2 câu'],
        },
      ],
    },
    {
      id: 'l12-2',
      title: vn('Ba mức câu hỏi đọc hiểu'),
      steps: [
        {
          kind: 'read',
          title: vn('Nhận biết – thông hiểu – vận dụng'),
          text: vn(
            '• Nhận biết (từ khóa: chỉ ra, xác định, tìm, kể tên): trả lời ngắn, đúng, trích dẫn chính xác từ văn bản.\n• Thông hiểu (vì sao, em hiểu… như thế nào, nêu tác dụng, nội dung chính là gì): phải giải thích, nói được ý nghĩa và lí do, không chép lại văn bản.\n• Vận dụng (em có đồng ý không, bài học rút ra, nếu là em…): nêu rõ quan điểm của em, lí giải vì sao, liên hệ với bản thân và cuộc sống.\n\nCâu càng ở mức cao thì càng cần nhiều ý và lí lẽ hơn.',
          ),
          code: 'Có một hạt mầm nằm dưới lớp đất cứng. Mỗi ngày, nó cố vươn lên một chút. Đá đè, nó lách sang bên. Nắng gắt, nó cắm rễ sâu hơn. Rồi một sáng, hai chiếc lá non xanh mướt nhô lên khỏi mặt đất.',
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: ba câu hỏi về đoạn "hạt mầm"'),
          text: vn(
            'Câu 1 (nhận biết): "Chỉ ra một biện pháp tu từ trong đoạn văn."\n→ Bước 1: tìm chỗ "lạ": hạt mầm "cố", "lách", "cắm rễ sâu hơn" như con người. → Trả lời: Biện pháp nhân hóa: hạt mầm "cố vươn lên", "lách sang bên".\n\nCâu 2 (thông hiểu): "Hình ảnh hạt mầm gợi cho em suy nghĩ gì?"\n→ Nói ý nghĩa + dựa vào chi tiết: Hạt mầm tượng trưng cho người kiên trì; dù gặp khó khăn (đá đè, nắng gắt) vẫn tìm cách vượt qua để lớn lên.\n\nCâu 3 (vận dụng): "Em rút ra bài học gì?"\n→ Quan điểm + lí do + liên hệ: Em học được rằng gặp khó thì đừng bỏ cuộc mà hãy tìm cách khác; giống như khi em học yếu một môn, em có thể đổi cách học thay vì nản chí.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Câu hỏi "Em hiểu câu \'Đá đè, nó lách sang bên\' như thế nào?" thuộc mức nào?'),
          options: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
          answer: 1,
          why: vn('"Em hiểu… như thế nào" yêu cầu giải thích ý nghĩa của câu văn → thông hiểu. Em cần nói: khi gặp trở ngại, hạt mầm không đứng yên chịu thua mà linh hoạt tìm hướng khác.'),
        },
        {
          kind: 'choice',
          ask: vn('Chọn câu trả lời TỐT NHẤT cho câu hỏi: "Hình ảnh hạt mầm gợi cho em suy nghĩ gì?"'),
          options: [
            'Hạt mầm nằm dưới lớp đất cứng.',
            'Hạt mầm rất hay và ý nghĩa.',
            'Hạt mầm tượng trưng cho người biết kiên trì: gặp khó khăn như đá đè, nắng gắt vẫn tìm cách vượt qua để lớn lên.',
            'Hạt mầm cần nước và phân bón để lớn.',
          ],
          answer: 2,
          why: vn('Câu 1 chỉ chép lại văn bản. Câu 2 chung chung, không nói được gì. Câu 4 lạc sang kiến thức sinh học. Câu 3 nói được ý nghĩa và có dẫn chứng từ văn bản ("đá đè", "nắng gắt") → đầy đủ nhất.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu hỏi vận dụng: "Em có đồng ý rằng khó khăn giúp con người trưởng thành hơn không?" Câu trả lời nào đầy đủ nhất?'),
          options: [
            'Em đồng ý.',
            'Em đồng ý, vì khó khăn buộc ta phải cố gắng, tìm cách giải quyết và nhờ đó mạnh mẽ hơn; như hạt mầm phải lách qua đá mới nhô lên được, em cũng tiến bộ nhất sau những bài kiểm tra chưa tốt.',
            'Khó khăn thì ai cũng gặp, có người vượt qua được, có người không.',
          ],
          answer: 1,
          why: vn('Câu vận dụng cần đủ ba phần: quan điểm (đồng ý), lí giải (vì sao), liên hệ (văn bản và bản thân). Chỉ trả lời "Em đồng ý" thì gần như không được điểm; câu thứ ba không nêu rõ quan điểm.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các phần của một câu trả lời vận dụng.'),
          lines: [
            'Nêu rõ quan điểm: em đồng ý / không đồng ý / bài học là…',
            'Giải thích vì sao em nghĩ như vậy.',
            'Đưa dẫn chứng từ văn bản hoặc từ cuộc sống, liên hệ bản thân.',
            'Chốt lại bằng một câu ngắn.',
          ],
          why: vn('Nói thẳng quan điểm trước để người chấm thấy ngay ý chính, sau đó mới lí giải và đưa dẫn chứng. Câu chốt giúp câu trả lời trọn vẹn.'),
        },
        {
          kind: 'compose',
          task: vn('Trả lời câu hỏi thông hiểu trong 2–3 câu: "Vì sao tác giả để hạt mầm \'cắm rễ sâu hơn\' khi gặp nắng gắt?"'),
          frame: 'Chi tiết "cắm rễ sâu hơn" cho thấy …\nĐiều đó gợi …',
          model:
            'Chi tiết "cắm rễ sâu hơn" cho thấy khi gặp nắng gắt, hạt mầm không gục ngã mà tìm cách bám chắc vào đất để sống. Điều đó gợi bài học: khó khăn càng lớn, con người càng cần vững vàng, bồi đắp sức mạnh bên trong.',
          checklist: [
            'Có trích chi tiết từ văn bản trong ngoặc kép',
            'Có giải thích ý nghĩa, không chỉ chép lại',
            'Gọn trong 2–3 câu',
          ],
          tip: vn('Mẫu câu dùng được cho nhiều câu thông hiểu: "Chi tiết … cho thấy … Điều đó gợi …"'),
        },
      ],
    },
    {
      id: 'l12-3',
      title: vn('Bài viết nghị luận: tránh lỗi hay gặp'),
      steps: [
        {
          kind: 'read',
          title: vn('Năm lỗi làm mất điểm'),
          text: vn(
            '1. Lạc đề: viết sai đối tượng, sai phạm vi hoặc sai kiểu bài.\n2. Kể lể: kể lại nội dung tác phẩm thay vì phân tích.\n3. Thiếu dẫn chứng: nói "câu thơ rất hay" mà không trích câu nào, không phân tích từ nào.\n4. Diễn đạt lủng củng: câu quá dài, lặp từ, dùng sai từ.\n5. Chữ khó đọc, sai chính tả, gạch xóa nhiều.\n\nTin vui: cả năm lỗi đều sửa được nếu em luyện đúng cách.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: biến câu kể thành câu phân tích'),
          text: vn(
            'Câu kể lể: "Bà Huyện Thanh Quan đi qua Đèo Ngang lúc chiều, thấy cỏ cây, đá, lá, hoa, có vài chú tiều và mấy nhà chợ."\n\nBước 1 – Chọn một chi tiết đáng nói: "Lom khom dưới núi, tiều vài chú".\nBước 2 – Chỉ ra nghệ thuật: từ láy "lom khom", đảo ngữ, số từ "vài".\nBước 3 – Nói nó gợi gì: con người nhỏ bé, thưa thớt, cảnh càng hoang vắng.\n\nCâu phân tích: "Từ láy \'lom khom\' được đảo lên đầu câu cùng số từ \'vài\' gợi dáng người tiều phu nhỏ bé, thưa thớt, khiến cảnh Đèo Ngang càng thêm hoang vắng."',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Đoạn văn sau mắc lỗi chính nào?'),
          code: 'Bài thơ Thu điếu rất hay. Nhà thơ tả cảnh mùa thu rất đẹp. Em rất thích bài thơ này vì nó rất hay và có nhiều hình ảnh đẹp.',
          options: ['Lạc sang nghị luận xã hội', 'Thiếu dẫn chứng và không phân tích', 'Sai cặp quan hệ từ'],
          answer: 1,
          why: vn('Đoạn văn chỉ khen chung chung ("rất hay", "rất đẹp") mà không trích câu thơ nào, không chỉ ra từ ngữ nào. Lại lặp "rất hay" hai lần. Cần thêm dẫn chứng như "Ao thu lạnh lẽo nước trong veo" và phân tích.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào viết ĐÚNG chính tả?'),
          options: [
            'Bác sĩ chuẩn đoán bệnh rất nhanh.',
            'Em dành dụm tiền để mua sách.',
            'Tương lai của chúng ta thật sáng lạn.',
          ],
          answer: 1,
          why: vn('"Dành dụm" (để dành) viết với "d". Hai câu còn lại sai: phải là "chẩn đoán" và "xán lạn". Đây là những từ hay viết sai, em nên ghi vào sổ tay chính tả.'),
        },
        {
          kind: 'read',
          title: vn('Dàn ý nhanh cho bài nghị luận xã hội'),
          text: vn(
            'Khi viết về một vấn đề đời sống (ví dụ: tinh thần tự học, lòng biết ơn, sự kiên trì…), em có thể dùng khung sau:\n• Mở bài: giới thiệu vấn đề.\n• Thân bài: giải thích vấn đề là gì → bàn luận vì sao nó quan trọng, biểu hiện ra sao, có dẫn chứng → phê phán biểu hiện ngược lại → bài học, hành động.\n• Kết bài: khẳng định lại, liên hệ bản thân.\n\nDẫn chứng nên là việc có thật, gần gũi, em hiểu rõ; đừng bịa số liệu hay tên người.',
          ),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp dàn ý phần thân bài cho đề "Bàn về tinh thần tự học".'),
          lines: [
            'Giải thích: tự học là tự mình tìm tòi, chủ động học mà không cần ai nhắc.',
            'Bàn luận: tự học giúp hiểu bài sâu, nhớ lâu và rèn tính chủ động.',
            'Dẫn chứng: một bạn tự xem lại lỗi sai sau mỗi bài kiểm tra nên tiến bộ rõ.',
            'Phê phán: một số bạn chỉ học khi bị nhắc, học đối phó.',
            'Bài học: lập kế hoạch tự học mỗi ngày, bắt đầu từ việc nhỏ.',
          ],
          why: vn('Thứ tự quen thuộc: giải thích → bàn luận → dẫn chứng → phê phán mặt trái → bài học. Giải thích phải đi đầu, vì người đọc cần hiểu "tự học" là gì rồi mới bàn tiếp.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu mở bài cho đề nghị luận xã hội "Ý nghĩa của sự kiên trì trong học tập".'),
          frame: 'Trên con đường học tập, …\nTrong những phẩm chất ấy, sự kiên trì …',
          model:
            'Trên con đường học tập, ai cũng có lúc gặp bài khó, điểm kém hay muốn bỏ cuộc. Trong những lúc ấy, sự kiên trì chính là điều giúp ta đi tiếp. Có thể nói, kiên trì là chìa khóa đưa mỗi học sinh đến thành công.',
          checklist: [
            'Giới thiệu đúng vấn đề: sự kiên trì trong học tập',
            'Không bàn luận dài dòng ngay từ mở bài',
            'Câu văn ngắn gọn, đúng chính tả',
          ],
        },
      ],
    },
  ],
};
