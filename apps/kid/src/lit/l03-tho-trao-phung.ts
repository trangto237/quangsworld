import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l03',
  emoji: '😏',
  title: vn('Thơ trào phúng'),
  blurb: vn('Tiếng cười để chê cái xấu — và cách đọc ra điều nhà thơ không nói thẳng'),
  lessons: [
    {
      id: 'l03-1',
      title: vn('Tiếng cười trào phúng'),
      steps: [
        {
          kind: 'read',
          title: vn('Cười để làm gì?'),
          text: vn(
            'Thơ trào phúng dùng tiếng cười để phê phán những điều xấu, điều lố bịch trong xã hội: thói khoe khoang, sự giả dối, cảnh thi cử lộn xộn, kẻ có danh mà không có thực… Tiếng cười ấy có nhiều mức: hài hước nhẹ nhàng, châm biếm sâu cay, đến đả kích gay gắt. Có khi nhà thơ còn tự cười chính mình — gọi là tự trào.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: tìm cái đáng cười'),
          text: vn(
            'Hai câu mở đầu bài “Thương vợ” của Tú Xương (Trần Tế Xương).\n\nBước 1 – Đọc kĩ: bà Tú buôn bán quanh năm để nuôi “năm con với một chồng”.\nBước 2 – Tìm chỗ “lạ”: người chồng được đếm chung với con, như một miệng ăn cần nuôi.\nBước 3 – Hỏi: cười ai? Ông Tú tự cười mình, một người chồng ăn bám vợ.\nBước 4 – Ý nghĩa: sau tiếng cười tự trào là lời cảm ơn, thương vợ và tự trách mình.',
          ),
          code: 'Quanh năm buôn bán ở mom sông,\nNuôi đủ năm con với một chồng.\n(Thương vợ – Tú Xương)',
        },
        {
          kind: 'choice',
          ask: vn('Mục đích chính của tiếng cười trào phúng là gì?'),
          options: ['Chỉ để giải trí cho vui', 'Phê phán cái xấu, cái lố bịch để con người và xã hội tốt đẹp hơn', 'Khen ngợi người giàu có', 'Kể lại một câu chuyện lịch sử'],
          answer: 1,
          why: vn('Tiếng cười trào phúng luôn có “mũi nhọn”: nó chỉ ra cái sai, cái xấu. Cười xong, người đọc phải suy nghĩ.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền từ để hoàn thành nhận xét.'),
          code: 'Trong câu “Nuôi đủ năm con với một chồng”, Tú Xương tự cười chính mình. Kiểu tiếng cười này gọi là ___.',
          answers: ['tự trào'],
          extra: ['đả kích', 'ca ngợi', 'tự sự'],
          why: vn('“Tự trào” là tự giễu mình. Đó là cách nhà thơ nhận lỗi một cách hóm hỉnh mà vẫn rất thật lòng.'),
        },
        {
          kind: 'choice',
          ask: vn('Câu nào cho thấy em đã hiểu đúng tiếng cười trong “Thương vợ”?'),
          options: [
            'Nhà thơ chê bà Tú buôn bán giỏi',
            'Nhà thơ tự giễu mình để bày tỏ lòng biết ơn và thương vợ',
            'Nhà thơ khoe gia đình đông con',
          ],
          answer: 1,
          why: vn('Đằng sau tiếng cười là tình cảm. Đọc thơ trào phúng, em luôn hỏi: nhà thơ cười ai, và thật ra muốn nói điều gì?'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu nhận xét về tiếng cười trong câu thơ “Nuôi đủ năm con với một chồng”.'),
          frame: 'Câu thơ gây cười vì … . Qua tiếng cười tự trào ấy, nhà thơ bày tỏ …',
          model:
            'Câu thơ gây cười vì người chồng được đếm chung với năm đứa con, như một miệng ăn mà bà Tú phải nuôi. Qua tiếng cười tự trào ấy, nhà thơ bày tỏ lòng thương, lòng biết ơn vợ và tự trách mình.',
          checklist: ['Em đã chỉ ra chỗ gây cười chưa?', 'Em đã gọi tên kiểu tiếng cười (tự trào) chưa?', 'Em đã nói tình cảm của nhà thơ chưa?'],
        },
      ],
    },
    {
      id: 'l03-2',
      title: vn('Các thủ pháp trào phúng'),
      steps: [
        {
          kind: 'read',
          title: vn('Bốn “vũ khí” của nhà thơ trào phúng'),
          text: vn(
            '• Phóng đại: nói quá lên để cái xấu lộ rõ.\n• Đối lập: đặt hai cảnh, hai người trái ngược cạnh nhau.\n• Chơi chữ: dùng từ nhiều nghĩa, đồng âm để tạo ý mỉa.\n• Giọng mỉa mai: bề ngoài như khen, bên trong là chê.\nMột câu thơ có thể dùng cùng lúc nhiều thủ pháp.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: “Vịnh khoa thi Hương”'),
          text: vn(
            'Bốn câu giữa bài “Vịnh khoa thi Hương” của Tú Xương, tả một kì thi thời Pháp thuộc.\n\nBước 1 – Nhìn từ ngữ: “lôi thôi” (luộm thuộm), “ậm ọe” (giọng ra oai mà chẳng rõ ràng).\nBước 2 – Tìm đối lập: sĩ tử lôi thôi ↔ quan trường ậm ọe; quan sứ lọng cắm “rợp trời” ↔ mụ đầm váy lê “quét đất”.\nBước 3 – Tìm phóng đại: “rợp trời”, “quét đất”.\nBước 4 – Kết luận: trường thi, nơi trang nghiêm, trở nên nhốn nháo, lố bịch; nhà thơ chua xót cho cảnh nước mất, Nho học suy tàn.',
          ),
          code: 'Lôi thôi sĩ tử vai đeo lọ,\nẬm ọe quan trường miệng thét loa.\nLọng cắm rợp trời quan sứ đến,\nVáy lê quét đất mụ đầm ra.\n(Vịnh khoa thi Hương – Tú Xương)',
        },
        {
          kind: 'choice',
          ask: vn('“Lọng cắm rợp trời” và “váy lê quét đất” chủ yếu dùng thủ pháp nào?'),
          options: ['Chơi chữ', 'Phóng đại kết hợp đối lập', 'Liệt kê số liệu', 'Nhân hóa'],
          answer: 1,
          why: vn('“Rợp trời” – “quét đất” là nói quá, lại đặt đối nhau (trời – đất). Cảnh phô trương của kẻ cầm quyền vì thế càng lố bịch.'),
        },
        {
          kind: 'fill',
          ask: vn('Gọi đúng tên thủ pháp.'),
          code: 'Đặt hình ảnh “sĩ tử lôi thôi” bên cạnh “quan trường ậm ọe” là thủ pháp ___; còn nói bề ngoài như khen mà thật ra là chê thì gọi là giọng ___.',
          answers: ['đối lập', 'mỉa mai'],
          extra: ['so sánh', 'tha thiết', 'điệp ngữ'],
          why: vn('Đối lập làm cả hai bên cùng lộ ra cái đáng cười. Giọng mỉa mai buộc người đọc phải hiểu ngược lại với lời nói bề ngoài.'),
        },
        {
          kind: 'read',
          title: vn('Một ví dụ khác: “Tiến sĩ giấy”'),
          text: vn(
            'Nguyễn Khuyến viết về ông tiến sĩ bằng giấy (đồ chơi cho trẻ em dịp Trung thu) để mỉa những kẻ đỗ đạt mà không có thực tài. Điệp từ “cũng” và câu hỏi “có kém ai” nghe như khen, nhưng thật ra là chê: chỉ “cũng” giống ở vẻ bề ngoài thôi.',
          ),
          code: 'Cũng cờ, cũng biển, cũng cân đai,\nCũng gọi ông nghè có kém ai.\n(Tiến sĩ giấy – Nguyễn Khuyến)',
        },
        {
          kind: 'choice',
          ask: vn('Điệp từ “cũng” trong hai câu thơ trên tạo ra hiệu quả gì?'),
          options: [
            'Ca ngợi tài năng thật sự của ông tiến sĩ',
            'Nhấn mạnh vẻ ngoài đủ đầy, qua đó mỉa mai sự trống rỗng bên trong',
            'Kể lại một kì thi có thật',
          ],
          answer: 1,
          why: vn('Cái gì “cũng” có, nhưng toàn là hình thức. Giọng mỉa mai nằm ở chỗ: càng kể đủ, càng thấy thiếu cái quan trọng nhất là thực tài.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu chỉ ra thủ pháp trào phúng trong hai câu: “Lọng cắm rợp trời quan sứ đến, / Váy lê quét đất mụ đầm ra.”'),
          frame: 'Hai câu thơ dùng thủ pháp … qua các hình ảnh … . Nhờ đó, … hiện lên … , thể hiện thái độ … của nhà thơ.',
          model:
            'Hai câu thơ dùng thủ pháp phóng đại và đối lập qua các hình ảnh “lọng cắm rợp trời”, “váy lê quét đất”. Nhờ đó, cảnh quan sứ và mụ đầm đến trường thi hiện lên phô trương, lố bịch, thể hiện thái độ mỉa mai và nỗi chua xót của nhà thơ trước cảnh nước mất.',
          checklist: ['Em đã gọi tên ít nhất một thủ pháp chưa?', 'Em đã trích hình ảnh cụ thể chưa?', 'Em đã nêu thái độ của nhà thơ chưa?'],
        },
      ],
    },
    {
      id: 'l03-3',
      title: vn('Nghĩa tường minh và hàm ý'),
      steps: [
        {
          kind: 'read',
          title: vn('Nói ra và ngụ ý'),
          text: vn(
            '• Nghĩa tường minh: phần nghĩa được nói thẳng ra bằng từ ngữ trong câu.\n• Hàm ý: phần nghĩa không nói thẳng, người nghe phải tự suy ra từ hoàn cảnh.\nVí dụ (tự viết): Mẹ nói: “Đã mười giờ đêm rồi đấy con.” Nghĩa tường minh: bây giờ là mười giờ đêm. Hàm ý: con đi ngủ đi.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Tình huống (tự viết): Lan rủ Minh đi đá bóng. Minh đáp: “Mai tớ thi Toán rồi.”\n\nBước 1 – Nghĩa tường minh: ngày mai Minh có bài thi Toán.\nBước 2 – Đặt vào hoàn cảnh: Minh đang được rủ đi chơi.\nBước 3 – Suy ra hàm ý: Minh từ chối, vì cần ở nhà ôn bài.\nBước 4 – Vì sao nói vậy: từ chối khéo, lịch sự, không làm bạn buồn.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Cô giáo bước vào lớp ồn ào và nói: “Cả lớp vui quá nhỉ!” Hàm ý của câu này là gì?'),
          options: ['Cô khen lớp rất vui vẻ', 'Cô nhắc lớp đang quá ồn, cần trật tự', 'Cô muốn cùng chơi với lớp', 'Cô hỏi lớp có vui không'],
          answer: 1,
          why: vn('Bề ngoài là lời khen, nhưng hoàn cảnh (lớp đang ồn) cho thấy đó là lời nhắc nhở. Giọng mỉa mai trong thơ trào phúng cũng hoạt động y như vậy!'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành phân tích.'),
          code: 'Câu “Ngoài trời đang mưa to lắm.” (nói khi bạn định đi về): nghĩa ___ là trời mưa to; ___ là bạn nên ở lại hoặc mang áo mưa.',
          answers: ['tường minh', 'hàm ý'],
          extra: ['bóng', 'chuyển', 'gốc'],
          why: vn('Phần nói ra bằng chữ là nghĩa tường minh; phần người nghe tự hiểu từ hoàn cảnh là hàm ý.'),
        },
        {
          kind: 'choice',
          ask: vn('Vì sao thơ trào phúng hay dùng hàm ý?'),
          options: [
            'Vì nhà thơ không biết cách nói thẳng',
            'Vì hàm ý làm lời chê thâm thúy, sâu cay hơn và buộc người đọc phải suy nghĩ',
            'Vì hàm ý làm bài thơ ngắn hơn',
          ],
          answer: 1,
          why: vn('Câu “Cũng gọi ông nghè có kém ai” không chê thẳng, nhưng hàm ý chê thì rất rõ. Người đọc tự “phát hiện” nên càng thấm.'),
        },
        {
          kind: 'compose',
          task: vn('Tình huống (tự viết): Bạn đến nhà chơi đã lâu, bà nhìn đồng hồ và nói: “Ồ, sắp đến giờ cơm tối rồi đấy!” Viết 2 câu chỉ ra nghĩa tường minh và hàm ý của câu nói.'),
          frame: 'Nghĩa tường minh của câu nói là … . Còn hàm ý là …, vì …',
          model:
            'Nghĩa tường minh của câu nói là đã gần đến giờ ăn cơm tối. Còn hàm ý là bà khéo nhắc bạn nên về nhà kẻo bố mẹ chờ, hoặc mời bạn ở lại ăn cơm, vì bà vừa nhìn đồng hồ khi bạn đã chơi lâu.',
          checklist: ['Em đã tách riêng nghĩa tường minh và hàm ý chưa?', 'Em đã dựa vào hoàn cảnh để giải thích hàm ý chưa?'],
          tip: vn('Một câu có thể có hơn một hàm ý. Hãy chọn hàm ý hợp nhất với hoàn cảnh và giải thích vì sao.'),
        },
      ],
    },
  ],
};
