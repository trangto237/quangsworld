import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l06',
  emoji: '📰',
  title: vn('Văn bản thông tin'),
  blurb: vn('Cách trình bày thông tin, sơ đồ – số liệu, sa pô, đề mục và các kiểu đoạn văn'),
  lessons: [
    {
      id: 'l06-1',
      title: vn('Văn bản thông tin và cách trình bày'),
      steps: [
        {
          kind: 'read',
          title: vn('Văn bản thông tin là gì?'),
          text: vn(
            'Văn bản thông tin được viết ra để cung cấp cho người đọc những hiểu biết chính xác, khách quan về một sự vật, sự việc, hiện tượng: một danh lam, một lễ hội, cách làm một món đồ… Người viết không bịa, không kể chuyện tưởng tượng.\nĐể người đọc dễ theo dõi, thông tin thường được sắp xếp theo một trật tự:\n• Thời gian: trước – sau, các bước làm.\n• Nhân quả: nguyên nhân dẫn đến kết quả.\n• So sánh, đối chiếu: điểm giống và khác.\n• Mức độ quan trọng: ý chính trước, ý phụ sau.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Đọc đoạn văn trong khung rồi phân tích theo ba bước.\nBước 1 – Mục đích: đoạn văn cho ta biết Tết Trung thu diễn ra khi nào và có những hoạt động gì.\nBước 2 – Tìm “dấu hiệu”: các cụm từ “Từ đầu tháng Tám”, “Đến tối rằm”, “Cuối buổi” chỉ thời gian.\nBước 3 – Kết luận: thông tin được trình bày theo trật tự thời gian, nên người đọc hình dung được ngày Tết diễn ra từ đầu đến cuối.',
          ),
          code: 'Tết Trung thu diễn ra vào ngày rằm tháng Tám âm lịch. Từ đầu tháng Tám, phố phường đã bày bán đèn ông sao, đèn kéo quân, bánh nướng, bánh dẻo. Đến tối rằm, trẻ em rước đèn, xem múa lân dưới ánh trăng. Cuối buổi, cả nhà quây quần phá cỗ, vừa ăn bánh vừa ngắm trăng.',
        },
        {
          kind: 'choice',
          ask: vn('Đoạn văn sau trình bày thông tin theo cách nào?'),
          code: 'Đá vôi ở vịnh Hạ Long bị nước mưa và sóng biển bào mòn qua thời gian rất dài. Vì thế, nhiều hòn đảo có hình thù độc đáo, và bên trong lòng đảo hình thành những hang động rộng lớn.',
          options: ['Trật tự thời gian', 'So sánh, đối chiếu', 'Nhân quả'],
          answer: 2,
          why: vn('Câu đầu nêu nguyên nhân (đá vôi bị bào mòn), câu sau nêu kết quả (đảo có hình thù lạ, có hang động). Từ “Vì thế” là dấu hiệu rõ nhất của cách trình bày nhân quả.'),
        },
        {
          kind: 'choice',
          ask: vn('Muốn giúp bạn đọc phân biệt bánh nướng và bánh dẻo, em nên trình bày theo cách nào?'),
          options: ['So sánh, đối chiếu', 'Trật tự thời gian', 'Nhân quả', 'Kể chuyện tưởng tượng'],
          answer: 0,
          why: vn('Khi cần chỉ ra điểm giống và khác giữa hai đối tượng, cách so sánh, đối chiếu là rõ ràng nhất: vỏ bánh nướng được nướng chín, có màu vàng nâu; vỏ bánh dẻo làm từ bột nếp, trắng và mềm.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các bước làm đèn ông sao theo trật tự thời gian.'),
          lines: [
            'Đầu tiên, chuẩn bị nan tre, giấy bóng kính màu, keo dán và dây buộc.',
            'Tiếp theo, buộc các nan tre thành hai ngôi sao năm cánh giống nhau.',
            'Sau đó, nối hai ngôi sao bằng những nan ngắn để tạo thành khung đèn.',
            'Cuối cùng, dán giấy màu quanh khung và gắn cán cầm.',
          ],
          why: vn('Với văn bản hướng dẫn cách làm, trật tự thời gian là bắt buộc: làm sai thứ tự thì không ra chiếc đèn. Các từ “Đầu tiên – Tiếp theo – Sau đó – Cuối cùng” giúp người đọc làm theo dễ dàng.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền từ còn thiếu.'),
          code: 'Văn bản thông tin cần cung cấp thông tin chính xác và ___; người viết không được ___ thêm chi tiết.',
          answers: ['khách quan', 'bịa'],
          extra: ['tưởng tượng', 'cảm động'],
          why: vn('Người đọc tin vào văn bản thông tin vì nó đúng sự thật. Một chi tiết bịa đặt có thể làm mất lòng tin vào cả bài viết.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu giới thiệu về Tết Trung thu ở nơi em sống, trình bày theo trật tự thời gian.'),
          frame: 'Tết Trung thu diễn ra vào … Trước Tết, … Đến tối rằm, …',
          model: 'Tết Trung thu diễn ra vào ngày rằm tháng Tám âm lịch. Trước Tết vài tuần, phố Hàng Mã đã rực rỡ đèn lồng, mặt nạ và đồ chơi. Đến tối rằm, trẻ em rước đèn, còn cả nhà quây quần bên mâm cỗ ngắm trăng.',
          checklist: [
            'Thông tin đúng sự thật, không bịa',
            'Có từ ngữ chỉ thời gian (trước, đến tối, sau đó…)',
            'Các câu xếp theo đúng thứ tự trước – sau',
          ],
        },
      ],
    },
    {
      id: 'l06-2',
      title: vn('Sa pô, đề mục và phương tiện phi ngôn ngữ'),
      steps: [
        {
          kind: 'read',
          title: vn('Những “trợ thủ” của văn bản thông tin'),
          text: vn(
            '• Nhan đề: tên bài, cho biết bài viết về cái gì.\n• Sa pô: đoạn văn ngắn (thường in đậm) ngay dưới nhan đề, tóm tắt nội dung chính và gợi sự tò mò để người đọc đọc tiếp.\n• Đề mục: các tiêu đề nhỏ chia bài thành từng phần.\n• Phương tiện phi ngôn ngữ: hình ảnh, sơ đồ, bảng biểu, số liệu, bản đồ… Chúng giúp thông tin trực quan, dễ hiểu, dễ nhớ hơn chữ viết đơn thuần.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Quan sát bài báo ngắn trong khung.\nBước 1 – Nhan đề: “Hội An – phố cổ bên sông Hoài”.\nBước 2 – Sa pô: hai câu ngay dưới nhan đề, tóm tắt điều bài sẽ nói (phố cổ, di sản thế giới) và mời người đọc khám phá.\nBước 3 – Đề mục: “1. Một thương cảng xưa”, “2. Phố đèn lồng” chia bài thành hai phần.\nBước 4 – Phi ngôn ngữ: dòng [Ảnh: …] cho thấy bài có kèm hình minh họa Chùa Cầu, giúp người đọc hình dung ngay.',
          ),
          code: 'HỘI AN – PHỐ CỔ BÊN SÔNG HOÀI\nNhững mái ngói rêu phong, những chiếc đèn lồng lung linh đã đưa Hội An trở thành Di sản Văn hóa Thế giới năm 1999. Cùng dạo một vòng phố cổ để hiểu vì sao nơi đây hấp dẫn đến thế.\n\n1. Một thương cảng xưa\nTừ nhiều thế kỉ trước, Hội An là nơi tàu thuyền nhiều nước ghé vào buôn bán…\n[Ảnh: Chùa Cầu – biểu tượng của phố cổ]\n\n2. Phố đèn lồng\nVề đêm, đèn lồng nhiều màu thắp sáng các con phố nhỏ…',
        },
        {
          kind: 'choice',
          ask: vn('Trong bài về Hội An ở trên, phần nào là sa pô?'),
          options: [
            '“Hội An – phố cổ bên sông Hoài”',
            '“1. Một thương cảng xưa”',
            'Hai câu bắt đầu bằng “Những mái ngói rêu phong…”',
            'Dòng [Ảnh: Chùa Cầu…]',
          ],
          answer: 2,
          why: vn('Sa pô nằm ngay dưới nhan đề, tóm tắt nội dung và gợi tò mò. Dòng đầu là nhan đề, “1. Một thương cảng xưa” là đề mục, còn dòng [Ảnh…] là phương tiện phi ngôn ngữ.'),
        },
        {
          kind: 'choice',
          ask: vn('Bài viết cần so sánh lượng khách du lịch đến Hội An qua 5 năm. Nên dùng phương tiện nào là rõ nhất?'),
          options: ['Một bài thơ', 'Biểu đồ cột hoặc bảng số liệu', 'Một bức ảnh phong cảnh'],
          answer: 1,
          why: vn('Số liệu thay đổi theo thời gian được thể hiện rõ nhất bằng biểu đồ hoặc bảng: chỉ nhìn qua là thấy năm nào tăng, năm nào giảm. Ảnh phong cảnh đẹp nhưng không cho biết con số.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền tên các bộ phận của văn bản.'),
          code: 'Đoạn ngắn in đậm dưới nhan đề gọi là ___; các tiêu đề nhỏ chia bài thành từng phần gọi là ___.',
          answers: ['sa pô', 'đề mục'],
          extra: ['chú thích', 'phụ lục', 'kết bài'],
          why: vn('Sa pô giúp người đọc nắm ý chính trong vài giây; đề mục giúp họ tìm nhanh phần mình cần. Cả hai làm bài viết “dễ đọc lướt”.'),
        },
        {
          kind: 'choice',
          ask: vn('Một sơ đồ tư duy đặt cạnh bài giới thiệu vịnh Hạ Long có tác dụng chính là gì?'),
          options: [
            'Thay thế hoàn toàn phần chữ',
            'Làm bài viết dài hơn',
            'Bày tỏ cảm xúc của người viết',
            'Hệ thống các ý chính, giúp người đọc nắm thông tin nhanh và dễ nhớ',
          ],
          answer: 3,
          why: vn('Phương tiện phi ngôn ngữ đi kèm và hỗ trợ phần chữ, không thay thế nó. Sơ đồ tư duy cho thấy mối liên hệ giữa các ý chỉ trong một cái nhìn.'),
        },
        {
          kind: 'compose',
          task: vn('Viết sa pô (2 câu) cho bài báo có nhan đề “Vịnh Hạ Long – kì quan đá và nước”.'),
          frame: 'Câu 1: tóm tắt điều đặc biệt nhất. Câu 2: mời người đọc khám phá.',
          model: 'Hàng nghìn hòn đảo đá vôi nhấp nhô giữa làn nước xanh đã làm nên vẻ đẹp của vịnh Hạ Long, Di sản Thiên nhiên Thế giới được UNESCO công nhận từ năm 1994. Hãy cùng ngồi thuyền đi qua những hang động kì ảo để hiểu vì sao du khách khắp nơi muốn đến đây.',
          checklist: [
            'Chỉ 2 câu, ngắn gọn',
            'Câu đầu tóm được điều nổi bật nhất của bài',
            'Câu sau gợi sự tò mò, mời người đọc đọc tiếp',
            'Thông tin chính xác, không phóng đại',
          ],
          tip: vn('Nếu không chắc một con số, đừng đưa vào. Một sa pô không có số liệu vẫn hay, miễn là đúng.'),
        },
      ],
    },
    {
      id: 'l06-3',
      title: vn('Tiếng Việt: các kiểu đoạn văn'),
      steps: [
        {
          kind: 'read',
          title: vn('Câu chủ đề nằm ở đâu?'),
          text: vn(
            'Câu chủ đề là câu nêu ý khái quát của cả đoạn. Dựa vào vị trí của nó, ta có bốn kiểu đoạn văn:\n• Diễn dịch: câu chủ đề ở đầu, các câu sau triển khai.\n• Quy nạp: các câu đầu nêu chi tiết, câu chủ đề ở cuối để chốt lại.\n• Song song: không có câu chủ đề; các câu ngang hàng, mỗi câu nói một khía cạnh.\n• Phối hợp: câu chủ đề ở đầu, cuối đoạn lại có câu khẳng định, mở rộng ý đó.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Cùng một nội dung về Hội An, ta viết thành hai kiểu đoạn.\nBước 1 – Viết câu chủ đề: “Hội An là một phố cổ độc đáo.”\nBước 2 – Tìm các chi tiết: mái ngói rêu phong, Chùa Cầu, đèn lồng về đêm.\nBước 3 – Đặt câu chủ đề lên đầu → đoạn diễn dịch (A). Đặt xuống cuối, có từ “Có thể nói” → đoạn quy nạp (B).',
          ),
          code: '(A) Hội An là một phố cổ độc đáo. Những dãy nhà mái ngói rêu phong vẫn còn nguyên dáng xưa. Chùa Cầu nằm vắt qua một con lạch nhỏ. Về đêm, đèn lồng nhiều màu thắp sáng từng con phố.\n\n(B) Những dãy nhà mái ngói rêu phong vẫn còn nguyên dáng xưa. Chùa Cầu nằm vắt qua một con lạch nhỏ. Về đêm, đèn lồng nhiều màu thắp sáng từng con phố. Có thể nói, Hội An là một phố cổ độc đáo.',
        },
        {
          kind: 'choice',
          ask: vn('Đoạn văn sau thuộc kiểu nào?'),
          code: 'Vào dịp Trung thu, trẻ em háo hức rước đèn ông sao. Người lớn chuẩn bị mâm cỗ với bánh nướng, bánh dẻo, hoa quả. Ở nhiều nơi, đội múa lân rộn ràng đi khắp các ngõ phố.',
          options: ['Diễn dịch', 'Quy nạp', 'Song song', 'Phối hợp'],
          answer: 2,
          why: vn('Không có câu nào khái quát cho cả đoạn. Ba câu ngang hàng, mỗi câu kể một hoạt động (trẻ em, người lớn, đội lân), nên đây là đoạn song song.'),
        },
        {
          kind: 'choice',
          ask: vn('Đoạn văn sau thuộc kiểu nào?'),
          code: 'Vịnh Hạ Long là một kì quan thiên nhiên của Việt Nam. Hàng nghìn đảo đá vôi nhô lên giữa làn nước xanh. Trong lòng nhiều đảo là những hang động rộng lớn như hang Sửng Sốt, động Thiên Cung. Bởi vậy, Hạ Long xứng đáng là niềm tự hào của đất nước.',
          options: ['Diễn dịch', 'Phối hợp', 'Quy nạp'],
          answer: 1,
          why: vn('Câu đầu là câu chủ đề (kì quan thiên nhiên), câu cuối lại khẳng định và nâng ý đó lên (niềm tự hào). Có câu chủ đề ở cả đầu và cuối nên là đoạn phối hợp.'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành ghi nhớ.'),
          code: 'Đoạn ___ có câu chủ đề ở đầu; đoạn ___ có câu chủ đề ở cuối.',
          answers: ['diễn dịch', 'quy nạp'],
          extra: ['song song', 'phối hợp'],
          why: vn('Mẹo nhớ: “diễn” là trình bày ra – nói ý chung trước rồi bày chi tiết; “nạp” là gom lại – gom chi tiết rồi mới chốt ý chung.'),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp thành một đoạn văn quy nạp.'),
          lines: [
            'Bánh nướng có lớp vỏ vàng nâu, thơm mùi bơ trứng.',
            'Bánh dẻo lại trắng mịn, mềm và ngọt thanh.',
            'Bên trong cả hai loại là nhân đậu xanh, hạt sen hay thập cẩm.',
            'Có thể nói, bánh trung thu là món quà không thể thiếu trong ngày rằm tháng Tám.',
          ],
          why: vn('Đoạn quy nạp đi từ các chi tiết (vỏ bánh nướng, vỏ bánh dẻo, nhân bánh) đến câu chủ đề ở cuối. Cụm “Có thể nói” báo hiệu câu chốt.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu giới thiệu một địa danh em yêu thích (ví dụ Hồ Gươm, Văn Miếu…) theo kiểu diễn dịch.'),
          frame: '[Tên địa danh] là … (câu chủ đề). Ở đó có … Ngoài ra, …',
          model: 'Hồ Gươm là một biểu tượng của Hà Nội. Giữa hồ có Tháp Rùa cổ kính, còn cầu Thê Húc đỏ thắm dẫn vào đền Ngọc Sơn. Sáng sớm, quanh hồ có nhiều người đi bộ, tập thể dục dưới hàng cây xanh mát.',
          checklist: [
            'Câu đầu là câu chủ đề, nêu ý khái quát',
            'Các câu sau đưa chi tiết làm rõ câu chủ đề',
            'Thông tin chính xác, khách quan',
          ],
          tip: vn('Thử viết lại đoạn của em theo kiểu quy nạp: đưa câu chủ đề xuống cuối và thêm “Có thể nói,”.'),
        },
      ],
    },
  ],
};
