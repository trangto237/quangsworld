import { vn, type PyUnit } from '../code/learn/types';

export const unit: PyUnit = {
  id: 'l07',
  emoji: '🏮',
  title: vn('Truyện truyền kì'),
  blurb: vn('Kì ảo đan xen hiện thực, Chuyện người con gái Nam Xương và điển tích, điển cố'),
  lessons: [
    {
      id: 'l07-1',
      title: vn('Truyện truyền kì là gì?'),
      steps: [
        {
          kind: 'read',
          title: vn('Đặc điểm của truyện truyền kì'),
          text: vn(
            'Truyện truyền kì là thể loại văn xuôi tự sự thời trung đại, ở nước ta thường được viết bằng chữ Hán. “Truyền kì” nghĩa là ghi chép, lưu truyền những chuyện lạ.\n• Yếu tố kì ảo đan xen hiện thực: chuyện đời thường (gia đình, chiến tranh, oan khuất) xen với chuyện thần tiên, ma quỷ, cõi âm, thủy cung.\n• Nhân vật: có con người bình thường, có cả thần, tiên, hồn ma…\n• Ý nghĩa: qua cái kì ảo, tác giả phản ánh hiện thực xã hội và gửi gắm ước mơ về công bằng, về cái thiện được đền đáp.\nTiêu biểu là “Truyền kì mạn lục” của Nguyễn Dữ (thế kỉ XVI), gồm 20 truyện.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu'),
          text: vn(
            'Đọc mẩu truyện cô tự viết theo lối truyền kì trong khung, rồi phân tích ba bước.\nBước 1 – Chi tiết hiện thực: người tiều phu nghèo, mẹ ốm, đi rừng kiếm củi. Đó là cuộc sống thật của người lao động.\nBước 2 – Chi tiết kì ảo: ông lão tóc bạc hiện ra rồi biến mất, cây thuốc mọc lên nơi giọt nước mắt rơi.\nBước 3 – Ý nghĩa: cái kì ảo cho thấy lòng hiếu thảo được trời đất đền đáp. Đó là ước mơ “ở hiền gặp lành” của nhân dân.',
          ),
          code: 'Ngày xưa, có anh tiều phu nghèo, mẹ già ốm nặng mà không có tiền mua thuốc. Một chiều, anh ngồi khóc bên gốc cây giữa rừng. Bỗng một ông lão tóc bạc hiện ra, bảo: “Lòng con hiếu thảo, trời đã biết.” Nói rồi ông biến mất. Chỗ nước mắt anh rơi mọc lên một cây thuốc lạ. Anh đem về sắc cho mẹ uống, bệnh của bà khỏi hẳn.',
        },
        {
          kind: 'choice',
          ask: vn('Trong mẩu truyện trên, chi tiết nào là chi tiết kì ảo?'),
          options: [
            'Mẹ anh tiều phu ốm nặng.',
            'Anh ngồi khóc bên gốc cây.',
            'Chỗ nước mắt rơi mọc lên một cây thuốc lạ.',
            'Anh đem thuốc về sắc cho mẹ.',
          ],
          answer: 2,
          why: vn('Nước mắt không thể làm mọc cây thuốc ngay lập tức. Đây là điều không có trong đời thực, do trí tưởng tượng tạo ra, nên là chi tiết kì ảo. Ba chi tiết còn lại đều có thể xảy ra trong cuộc sống.'),
        },
        {
          kind: 'fill',
          ask: vn('Điền từ để hoàn thành định nghĩa.'),
          code: 'Truyện truyền kì đưa yếu tố ___ (thần tiên, ma quái) vào giữa câu chuyện đời ___, để phản ánh hiện thực và gửi gắm ước mơ.',
          answers: ['kì ảo', 'thường'],
          extra: ['hài hước', 'tương lai'],
          why: vn('Điểm đặc biệt của truyền kì là sự đan xen: cái kì ảo không đứng riêng mà luôn gắn với số phận con người trong đời thật.'),
        },
        {
          kind: 'choice',
          ask: vn('Vì sao tác giả truyện truyền kì lại dùng yếu tố kì ảo?'),
          options: [
            'Chỉ để câu chuyện thêm đáng sợ.',
            'Để thể hiện ước mơ công bằng và làm nổi bật số phận con người trong hiện thực.',
            'Vì người xưa không biết viết chuyện có thật.',
          ],
          answer: 1,
          why: vn('Cái kì ảo là “phương tiện” để nói điều thật: khi ngoài đời người tốt chịu thiệt, câu chuyện để thần tiên hay cõi khác đứng ra bênh vực, đền đáp họ. Nhờ vậy, ta vừa thấy được nỗi bất công, vừa thấy được khát vọng của con người.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 1–2 câu nêu ý nghĩa của chi tiết “ông lão tóc bạc hiện ra rồi biến mất” trong mẩu truyện mẫu.'),
          frame: 'Chi tiết ông lão hiện ra rồi biến mất cho thấy …',
          model: 'Chi tiết ông lão hiện ra rồi biến mất cho thấy lòng hiếu thảo của anh tiều phu đã “thấu đến trời”. Qua đó, câu chuyện gửi gắm niềm tin của nhân dân rằng người sống hiền lành, hiếu nghĩa sẽ được giúp đỡ.',
          checklist: [
            'Nêu đúng chi tiết kì ảo',
            'Nói được chi tiết đó cho thấy điều gì về nhân vật',
            'Nói được ước mơ, niềm tin mà chi tiết gửi gắm',
          ],
        },
      ],
    },
    {
      id: 'l07-2',
      title: vn('Chuyện người con gái Nam Xương'),
      steps: [
        {
          kind: 'read',
          title: vn('Tóm tắt câu chuyện'),
          text: vn(
            'Đây là một truyện trong “Truyền kì mạn lục” của Nguyễn Dữ. Cô kể lại bằng lời của cô nhé.\nVũ Nương (Vũ Thị Thiết), người con gái quê Nam Xương, đẹp người đẹp nết, lấy Trương Sinh – con nhà giàu nhưng ít học, tính hay ghen. Chẳng bao lâu, Trương Sinh phải đi lính. Ở nhà, Vũ Nương sinh con trai là bé Đản, một mình nuôi con, chăm sóc mẹ chồng. Mẹ chồng ốm rồi mất, nàng lo ma chay chu đáo như với cha mẹ đẻ.\nĐêm đêm, nàng chỉ vào bóng mình trên vách, nói đùa với con đó là cha Đản. Khi Trương Sinh trở về, bé Đản ngây thơ bảo cha nó đêm nào cũng đến. Trương Sinh nghi vợ thất tiết, mắng nhiếc, đánh đuổi nàng. Không thể giải được nỗi oan, Vũ Nương gieo mình xuống sông Hoàng Giang.\nMột đêm, bé Đản chỉ bóng của Trương Sinh trên vách mà gọi là cha. Lúc ấy chàng mới hiểu vợ bị oan, nhưng đã quá muộn.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: chi tiết cái bóng'),
          text: vn(
            'Cùng phân tích một chi tiết quan trọng nhất truyện.\nBước 1 – Chi tiết là gì? Vũ Nương chỉ bóng mình trên vách, bảo con đó là cha.\nBước 2 – Nó cho thấy gì về nhân vật? Nàng thương con, muốn con không thiếu vắng cha; nàng nhớ chồng, mong gia đình luôn đủ đầy.\nBước 3 – Nó có vai trò gì trong truyện? Cái bóng là “nút thắt” gây ra nỗi oan (Trương Sinh nghi ngờ) và cũng là “nút mở” giải oan (bé Đản chỉ bóng cha). Một chi tiết nhỏ mà làm nên bi kịch.\nBước 4 – Ý nghĩa sâu xa: hạnh phúc gia đình mong manh khi thiếu niềm tin; người phụ nữ hiền lành có thể chịu oan chỉ vì một lời nói ngây thơ.',
          ),
        },
        {
          kind: 'order',
          ask: vn('Sắp xếp các sự việc theo đúng trình tự câu chuyện.'),
          lines: [
            'Trương Sinh đi lính, Vũ Nương ở nhà nuôi con, chăm mẹ chồng.',
            'Đêm đêm, Vũ Nương chỉ bóng mình trên vách, bảo con đó là cha.',
            'Trương Sinh trở về, nghe lời con, nghi oan và đuổi vợ đi.',
            'Vũ Nương gieo mình xuống sông Hoàng Giang.',
            'Bé Đản chỉ bóng cha trên vách, Trương Sinh mới hiểu vợ bị oan.',
          ],
          why: vn('Câu chuyện đi theo trình tự thời gian: chia li → chi tiết cái bóng → nỗi oan → cái chết → sự thật được sáng tỏ. Nắm được trình tự này, em tóm tắt truyện rất dễ.'),
        },
        {
          kind: 'choice',
          ask: vn('Điều gì KHÔNG phải là nguyên nhân dẫn đến nỗi oan của Vũ Nương?'),
          options: [
            'Tính đa nghi, hay ghen của Trương Sinh.',
            'Lời nói ngây thơ của bé Đản.',
            'Cuộc chia li vì chiến tranh khiến vợ chồng xa cách.',
            'Vũ Nương không chăm sóc mẹ chồng chu đáo.',
          ],
          answer: 3,
          why: vn('Ngược lại, Vũ Nương là người con dâu hiếu thảo, lo cho mẹ chồng cả lúc ốm đau lẫn khi mất. Nỗi oan đến từ tính đa nghi của chồng, lời trẻ thơ và hoàn cảnh chiến tranh chia cắt.'),
        },
        {
          kind: 'choice',
          ask: vn('Qua cách cư xử với chồng, con và mẹ chồng, Vũ Nương hiện lên là người thế nào?'),
          options: [
            'Đảm đang, hiếu thảo, thủy chung',
            'Mạnh mẽ, thích tranh cãi',
            'Nhút nhát, không lo việc nhà',
          ],
          answer: 0,
          why: vn('Một mình nuôi con là đảm đang; lo cho mẹ chồng là hiếu thảo; một lòng chờ chồng là thủy chung. Chính vì nàng tốt đẹp như vậy nên nỗi oan của nàng càng khiến người đọc xót xa.'),
        },
        {
          kind: 'fill',
          ask: vn('Hoàn thành nhận xét về chi tiết cái bóng.'),
          code: 'Chi tiết cái bóng vừa là nguyên nhân gây ra nỗi ___ của Vũ Nương, vừa là chìa khóa để ___ nỗi oan ấy.',
          answers: ['oan', 'giải'],
          extra: ['vui', 'giấu'],
          why: vn('Cùng một chiếc bóng: lần đầu khiến Trương Sinh nghi ngờ, lần sau giúp chàng nhận ra sự thật. Đó là nghệ thuật dùng chi tiết rất khéo của Nguyễn Dữ.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2 câu nhận xét về phẩm chất của Vũ Nương.'),
          frame: 'Vũ Nương là người … Điều đó thể hiện qua việc …',
          model: 'Vũ Nương là người phụ nữ đảm đang, hiếu thảo và thủy chung. Điều đó thể hiện qua việc nàng một mình nuôi con, chăm sóc mẹ chồng lúc ốm đau và lo ma chay chu đáo khi bà mất.',
          checklist: [
            'Nêu được ít nhất hai phẩm chất',
            'Có dẫn chứng là việc làm cụ thể của nhân vật',
            'Không kể lại cả câu chuyện, chỉ chọn chi tiết tiêu biểu',
          ],
        },
      ],
    },
    {
      id: 'l07-3',
      title: vn('Yếu tố kì ảo, kết thúc truyện và điển tích'),
      steps: [
        {
          kind: 'read',
          title: vn('Phần kì ảo của câu chuyện'),
          text: vn(
            'Câu chuyện không dừng ở cái chết của Vũ Nương. Nàng được các nàng tiên dưới thủy cung của Linh Phi cứu. Phan Lang, người cùng làng, bị đắm thuyền, cũng được Linh Phi cứu, nhờ trước kia từng thả một con rùa. Ở thủy cung, Phan Lang gặp Vũ Nương, nàng gửi lại một kỉ vật để nhắn Trương Sinh.\nTrương Sinh lập đàn giải oan bên bến Hoàng Giang. Vũ Nương hiện về giữa dòng sông, rực rỡ cờ hoa, nói lời tạ từ rằng nàng không thể trở lại nhân gian, rồi bóng nàng mờ dần và biến mất.',
          ),
        },
        {
          kind: 'read',
          title: vn('Cùng làm mẫu: ý nghĩa của kết thúc'),
          text: vn(
            'Bước 1 – Kết thúc này có hậu ở điểm nào? Vũ Nương được minh oan, được sống ở thủy cung, hiện về rực rỡ. Đây là ước mơ người tốt được đền đáp.\nBước 2 – Có gì vẫn là bi kịch? Nàng không thể trở về đoàn tụ với chồng con. Cái chết và nỗi oan đã không thể xóa bỏ.\nBước 3 – Kết luận: kết thúc vừa có hậu vừa đượm buồn. Yếu tố kì ảo làm câu chuyện đẹp hơn, nhưng không che được hiện thực: người phụ nữ đã phải chịu bất công không thể bù đắp.',
          ),
        },
        {
          kind: 'choice',
          ask: vn('Vì sao Vũ Nương hiện về mà không trở lại cuộc sống cùng chồng con?'),
          options: [
            'Vì nàng không còn thương con.',
            'Vì Linh Phi cấm nàng nói chuyện.',
            'Vì tác giả muốn kết thúc thật vui.',
            'Vì hạnh phúc đã tan vỡ không thể hàn gắn, cho thấy bi kịch của người phụ nữ là có thật.',
          ],
          answer: 3,
          why: vn('Nếu Vũ Nương trở về, câu chuyện sẽ trở thành cổ tích vui vẻ và nỗi đau bị xem nhẹ. Việc nàng chỉ hiện về rồi biến mất nhắc người đọc: có những sai lầm, những nỗi oan không thể làm lại.'),
        },
        {
          kind: 'read',
          title: vn('Tiếng Việt: điển tích, điển cố'),
          text: vn(
            'Điển tích là câu chuyện trong sách xưa được người sau nhắc lại. Điển cố là từ ngữ, hình ảnh rút gọn từ điển tích, dùng trong văn thơ để nói một ý sâu xa bằng vài chữ.\nVí dụ:\n• “Tri âm”: Bá Nha gảy đàn, chỉ Chung Tử Kỳ hiểu được tiếng đàn ấy. Về sau “tri âm” chỉ người bạn hiểu mình sâu sắc.\n• “Tái ông thất mã” (ông lão ở biên ải mất ngựa): ngựa mất rồi lại dẫn về ngựa quý. Ý nói họa và phúc có thể đổi chỗ cho nhau.\n• “Cầu Ô Thước”: chiếc cầu do đàn quạ bắc qua sông Ngân cho Ngưu Lang, Chức Nữ gặp nhau mỗi năm một lần. Dùng để nói sự gặp gỡ của đôi lứa xa cách.\nMuốn hiểu điển cố, phải biết câu chuyện gốc; vì thế khi đọc văn xưa, em nhớ đọc chú thích.',
          ),
        },
        {
          kind: 'fill',
          ask: vn('Chọn điển cố phù hợp.'),
          code: 'Hai bạn hiểu nhau đến mức chỉ nhìn ánh mắt là biết bạn nghĩ gì, đúng là đôi bạn ___. Còn khi gặp chuyện không may, bà lại an ủi: “___, biết đâu lại là điều may.”',
          answers: ['tri âm', 'Tái ông thất mã'],
          extra: ['Cầu Ô Thước', 'Ngưu Lang'],
          why: vn('“Tri âm” chỉ người hiểu mình sâu sắc như Chung Tử Kỳ hiểu tiếng đàn của Bá Nha. “Tái ông thất mã” nhắc ta rằng điều tưởng là rủi có khi lại thành may.'),
        },
        {
          kind: 'choice',
          ask: vn('Dùng điển tích, điển cố trong văn chương có tác dụng gì?'),
          options: [
            'Làm câu văn khó hiểu để người đọc phải đoán.',
            'Diễn đạt ý sâu sắc một cách ngắn gọn, hàm súc, tạo vẻ trang trọng.',
            'Thay thế hoàn toàn cho việc miêu tả nhân vật.',
          ],
          answer: 1,
          why: vn('Chỉ hai chữ “tri âm” đã gợi cả một câu chuyện về tình bạn. Đó là sức mạnh của điển cố: ít chữ mà nhiều ý.'),
        },
        {
          kind: 'compose',
          task: vn('Viết 2–3 câu nêu ý nghĩa của chi tiết kì ảo: Vũ Nương hiện về giữa dòng Hoàng Giang rồi biến mất.'),
          frame: 'Chi tiết Vũ Nương hiện về … cho thấy … Tuy nhiên, việc nàng biến mất …',
          model: 'Chi tiết Vũ Nương hiện về giữa dòng sông rực rỡ cờ hoa cho thấy nàng đã được minh oan, thể hiện ước mơ của nhân dân rằng người hiền lành phải được đền đáp. Tuy nhiên, việc nàng biến mất, không thể trở về với chồng con, khiến kết thúc thêm xót xa: hạnh phúc đã tan vỡ thì không thể hàn gắn.',
          checklist: [
            'Nêu đúng chi tiết kì ảo',
            'Chỉ ra ý nghĩa có hậu (được minh oan, ước mơ công bằng)',
            'Chỉ ra nét bi kịch (không thể đoàn tụ)',
            'Viết 2–3 câu, không kể lại cả truyện',
          ],
          tip: vn('Công thức nhớ nhanh: Chi tiết gì? → Cho thấy điều gì về nhân vật? → Gửi gắm thông điệp gì?'),
        },
      ],
    },
  ],
};
