/**
 * Xưởng viết — đề luyện viết theo hai dạng của đề thi vào lớp 10: đoạn văn nghị luận văn học
 * (khoảng 200 chữ) và bài văn nghị luận xã hội (khoảng 400–600 chữ). Mỗi đề có danh sách tự kiểm tra
 * và dàn ý gợi ý để xem sau khi viết.
 */

export interface WritingPrompt {
  id: string;
  kind: 'nlvh' | 'nlxh';
  title: string;
  task: string;
  /** Đoạn thơ / văn để phân tích (văn bản đã hết bản quyền). */
  text?: string;
  /** Số chữ nên đạt. */
  words: number;
  checklist: string[];
  outline: string[];
}

const NLVH_CHECK = [
  'Câu mở đoạn nêu tác giả, tác phẩm và nhận xét chung',
  'Có trích dẫn từ ngữ, hình ảnh cụ thể trong đoạn thơ',
  'Chỉ ra ít nhất một biện pháp nghệ thuật và tác dụng của nó',
  'Nêu cảm nhận của em, không chỉ kể lại nội dung',
  'Câu kết khẳng định giá trị của đoạn thơ',
];

const NLXH_CHECK = [
  'Mở bài nêu rõ vấn đề',
  'Giải thích vấn đề là gì',
  'Bàn luận có lí lẽ và ít nhất một dẫn chứng cụ thể',
  'Có ý phản đề (ý kiến trái chiều hoặc biểu hiện sai lệch)',
  'Rút ra bài học nhận thức và hành động của bản thân',
  'Kết bài khẳng định lại vấn đề',
];

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'nlvh-thu-dieu',
    kind: 'nlvh',
    title: 'Cảnh thu trong "Thu điếu"',
    task: 'Viết đoạn văn (khoảng 200 chữ) phân tích bốn câu thơ đầu bài "Thu điếu" của Nguyễn Khuyến.',
    text: 'Ao thu lạnh lẽo nước trong veo,\nMột chiếc thuyền câu bé tẻo teo.\nSóng biếc theo làn hơi gợn tí,\nLá vàng trước gió khẽ đưa vèo.',
    words: 200,
    checklist: NLVH_CHECK,
    outline: [
      'Mở đoạn: Nguyễn Khuyến – nhà thơ của làng quê Bắc Bộ; bốn câu đầu "Thu điếu" vẽ nên bức tranh thu trong trẻo, tĩnh lặng.',
      'Câu 1–2: ao thu "lạnh lẽo", nước "trong veo"; chiếc thuyền "bé tẻo teo" — vần "eo" và từ láy gợi không gian nhỏ, se lạnh.',
      'Câu 3–4: "sóng biếc", "lá vàng" — màu sắc hài hoà; chuyển động rất khẽ ("hơi gợn tí", "khẽ đưa vèo") → lấy động tả tĩnh.',
      'Đánh giá: cảnh đẹp nhưng vắng lặng, gợi nỗi buồn man mác, tâm sự thầm kín của nhà thơ.',
      'Kết đoạn: khẳng định tài quan sát tinh tế và tình yêu quê hương của Nguyễn Khuyến.',
    ],
  },
  {
    id: 'nlvh-banh-troi',
    kind: 'nlvh',
    title: 'Vẻ đẹp người phụ nữ trong "Bánh trôi nước"',
    task: 'Viết đoạn văn (khoảng 200 chữ) phân tích bài thơ "Bánh trôi nước" của Hồ Xuân Hương.',
    text: 'Thân em vừa trắng lại vừa tròn,\nBảy nổi ba chìm với nước non.\nRắn nát mặc dầu tay kẻ nặn,\nMà em vẫn giữ tấm lòng son.',
    words: 200,
    checklist: NLVH_CHECK,
    outline: [
      'Mở đoạn: Hồ Xuân Hương – "Bà chúa thơ Nôm"; bài thơ hai lớp nghĩa: chiếc bánh trôi và người phụ nữ.',
      'Câu 1: "trắng", "tròn" – vẻ đẹp hình thức, trong trắng.',
      'Câu 2–3: thành ngữ "bảy nổi ba chìm", "rắn nát mặc dầu tay kẻ nặn" – thân phận lênh đênh, phụ thuộc trong xã hội xưa.',
      'Câu 4: "Mà em vẫn giữ tấm lòng son" – quan hệ từ "mà" khẳng định phẩm chất son sắt, bản lĩnh.',
      'Kết đoạn: giọng thơ mộc mạc mà mạnh mẽ; tiếng nói cảm thông và tự hào về người phụ nữ.',
    ],
  },
  {
    id: 'nlvh-canh-xuan',
    kind: 'nlvh',
    title: 'Bức tranh xuân trong Truyện Kiều',
    task: 'Viết đoạn văn (khoảng 200 chữ) cảm nhận về bức tranh mùa xuân trong bốn câu thơ của Nguyễn Du.',
    text: 'Ngày xuân con én đưa thoi,\nThiều quang chín chục đã ngoài sáu mươi.\nCỏ non xanh tận chân trời,\nCành lê trắng điểm một vài bông hoa.',
    words: 200,
    checklist: NLVH_CHECK,
    outline: [
      'Mở đoạn: Nguyễn Du – bậc thầy tả cảnh; bốn câu thơ là bức tranh xuân tươi đẹp nổi tiếng.',
      'Câu 1–2: "con én đưa thoi", "thiều quang chín chục đã ngoài sáu mươi" – thời gian trôi nhanh, xuân đã sang tháng ba.',
      'Câu 3: "cỏ non xanh tận chân trời" – không gian khoáng đạt, gam xanh tươi mới.',
      'Câu 4: "trắng điểm" – màu trắng hoa lê trên nền xanh; nét chấm phá hài hoà, tinh khôi.',
      'Kết đoạn: bút pháp tả cảnh ước lệ mà sống động; tình yêu thiên nhiên của nhà thơ.',
    ],
  },
  {
    id: 'nlxh-tu-hoc',
    kind: 'nlxh',
    title: 'Ý nghĩa của việc tự học',
    task: 'Viết bài văn (khoảng 400 chữ) trình bày suy nghĩ của em về ý nghĩa của việc tự học đối với học sinh hôm nay.',
    words: 400,
    checklist: NLXH_CHECK,
    outline: [
      'Mở bài: Trong thời đại tri thức thay đổi từng ngày, tự học trở thành chìa khoá của thành công.',
      'Giải thích: tự học là tự đặt mục tiêu, tự tìm tòi, luyện tập, chủ động hỏi khi chưa hiểu.',
      'Bàn luận: giúp hiểu sâu, nhớ lâu; rèn tính chủ động, kỉ luật; có thể học suốt đời. Dẫn chứng: Lê Quý Đôn, Bác Hồ tự học ngoại ngữ…',
      'Phản đề: tự học không phải học một mình, bỏ qua thầy cô; cũng không phải lướt mạng không mục đích.',
      'Bài học: lập kế hoạch học mỗi ngày, ghi chép, tự kiểm tra; dùng Internet có chọn lọc.',
      'Kết bài: tự học là năng lực cần rèn luyện từ hôm nay.',
    ],
  },
  {
    id: 'nlxh-biet-on',
    kind: 'nlxh',
    title: 'Lòng biết ơn',
    task: 'Viết bài văn (khoảng 400 chữ) bàn về lòng biết ơn trong cuộc sống.',
    words: 400,
    checklist: NLXH_CHECK,
    outline: [
      'Mở bài: dẫn câu "Uống nước nhớ nguồn" – nêu vấn đề lòng biết ơn.',
      'Giải thích: biết ơn là ghi nhớ, trân trọng và đền đáp những người đã giúp đỡ, sinh thành, dạy dỗ mình.',
      'Bàn luận: biểu hiện (lời cảm ơn, hành động nhỏ, sống tốt); ý nghĩa (gắn kết con người, nuôi dưỡng lòng tốt). Dẫn chứng: ngày 27/7, 20/11, chăm sóc ông bà…',
      'Phản đề: phê phán lối sống vô ơn, coi mọi thứ là đương nhiên.',
      'Bài học: nói lời cảm ơn, giúp đỡ cha mẹ, học tốt để đền đáp thầy cô.',
      'Kết bài: lòng biết ơn làm cuộc sống ấm áp và đẹp hơn.',
    ],
  },
  {
    id: 'nlxh-mang-xa-hoi',
    kind: 'nlxh',
    title: 'Người trẻ và mạng xã hội',
    task: 'Viết bài văn (khoảng 400 chữ) trình bày suy nghĩ của em về việc sử dụng mạng xã hội của học sinh hiện nay.',
    words: 400,
    checklist: NLXH_CHECK,
    outline: [
      'Mở bài: mạng xã hội đã trở thành một phần cuộc sống của học sinh – cơ hội và thách thức.',
      'Giải thích: mạng xã hội là nền tảng trực tuyến để kết nối, chia sẻ thông tin.',
      'Bàn luận – mặt tích cực: học hỏi, kết nối, lan toả điều tốt. Mặt tiêu cực: nghiện, tin giả, bắt nạt trên mạng, ảnh hưởng học tập và sức khoẻ. Dẫn chứng cụ thể.',
      'Phản đề: không nên cấm hoàn toàn hay coi mạng xã hội là xấu; vấn đề là cách dùng.',
      'Bài học: giới hạn thời gian, kiểm chứng thông tin, cư xử văn minh trên mạng.',
      'Kết bài: làm chủ mạng xã hội thay vì để nó làm chủ mình.',
    ],
  },
];
