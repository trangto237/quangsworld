import { makeBank, type ConceptSeed } from '../helpers';

/** Ngữ văn — content is in Vietnamese, matching the school subject. */
export const literatureConcepts: ConceptSeed[] = [
  {
    id: 'lit.comprehension',
    domain: 'Đọc hiểu',
    skill: 'Reading comprehension',
    name: 'Đọc hiểu văn bản',
    missionName: 'Thư viện cổ',
    description: 'Xác định nội dung chính, chủ đề và thông điệp của văn bản.',
    lesson: 'Chủ đề là vấn đề chính văn bản nói tới; thông điệp là điều tác giả muốn gửi gắm.',
  },
  {
    id: 'lit.devices',
    domain: 'Từ ngữ',
    skill: 'Vocabulary & devices',
    name: 'Biện pháp tu từ',
    missionName: 'Vườn hình ảnh',
    description: 'So sánh, nhân hoá, ẩn dụ, hoán dụ, điệp ngữ.',
    lesson: 'So sánh có từ "như/là"; nhân hoá gán đặc điểm con người cho vật; ẩn dụ là so sánh ngầm.',
  },
  {
    id: 'lit.argument',
    domain: 'Nghị luận',
    skill: 'Argument analysis',
    name: 'Phân tích lập luận',
    missionName: 'Pháo đài lý lẽ',
    description: 'Luận điểm, lí lẽ, bằng chứng trong văn nghị luận.',
    lesson: 'Luận điểm = ý kiến chính. Lí lẽ giải thích vì sao. Bằng chứng là ví dụ, số liệu cụ thể.',
  },
  {
    id: 'lit.structure',
    domain: 'Viết',
    skill: 'Writing structure',
    name: 'Cấu trúc bài viết',
    missionName: 'Xưởng kiến trúc',
    description: 'Mở bài, thân bài, kết bài; đoạn văn diễn dịch, quy nạp.',
    lesson: 'Đoạn diễn dịch: câu chủ đề ở đầu. Đoạn quy nạp: câu chủ đề ở cuối.',
  },
];

const { add, list } = makeBank('Atlas original');

const Co = 'lit.comprehension';
add(Co, 1, 'Phương thức biểu đạt chính của một bài thơ trữ tình thường là gì?', ['Biểu cảm', 'Thuyết minh', 'Nghị luận', 'Hành chính – công vụ']);
add(Co, 2, 'Ngôi kể thứ nhất là khi người kể…', ['xưng "tôi" và kể chuyện mình chứng kiến', 'giấu mình, gọi tên nhân vật', 'là tác giả viết lời bạt', 'không xuất hiện trong truyện']);
add(Co, 3, '"Chủ đề" của văn bản là…', ['vấn đề chính mà văn bản đề cập', 'tên của văn bản', 'nhân vật chính', 'câu mở đầu']);
add(Co, 4, 'Điều tác giả muốn nhắn gửi tới người đọc qua văn bản được gọi là…', ['thông điệp', 'cốt truyện', 'bối cảnh', 'nhan đề']);
add(Co, 5, 'Khi đọc hiểu, việc liên hệ nội dung văn bản với trải nghiệm bản thân giúp…', ['hiểu sâu và ghi nhớ thông điệp', 'tìm lỗi chính tả', 'đếm số câu', 'xác định tác giả']);

const Dv = 'lit.devices';
add(Dv, 1, '"Trẻ em như búp trên cành" sử dụng biện pháp tu từ nào?', ['So sánh', 'Nhân hoá', 'Hoán dụ', 'Điệp ngữ']);
add(Dv, 2, '"Ông trời mặc áo giáp đen ra trận" sử dụng biện pháp nào?', ['Nhân hoá', 'So sánh', 'Liệt kê', 'Nói giảm nói tránh']);
add(Dv, 3, '"Thuyền về có nhớ bến chăng" — "thuyền" và "bến" là hình ảnh…', ['Ẩn dụ', 'So sánh', 'Điệp ngữ', 'Liệt kê']);
add(Dv, 4, '"Áo chàm đưa buổi phân li" — "áo chàm" chỉ người Việt Bắc. Đây là…', ['Hoán dụ', 'Ẩn dụ', 'So sánh', 'Nhân hoá']);
add(Dv, 4, 'Lặp lại một từ ngữ nhiều lần để nhấn mạnh là biện pháp…', ['Điệp ngữ', 'Liệt kê', 'Nói quá', 'Chơi chữ']);
add(Dv, 5, '"Bác đã đi rồi sao Bác ơi" — cách nói "đi" thay cho "mất" là…', ['Nói giảm nói tránh', 'Nói quá', 'Ẩn dụ', 'Hoán dụ']);

add(Dv, 2, '"Mặt trời xuống biển như hòn lửa" (Huy Cận) sử dụng biện pháp nào?', ['So sánh', 'Nhân hoá', 'Hoán dụ', 'Điệp ngữ']);
add(Dv, 2, '"Trâu ơi ta bảo trâu này" (ca dao) — trò chuyện với con trâu như với người là…', ['Nhân hoá', 'So sánh', 'Nói quá', 'Liệt kê']);
add(Dv, 3, '"Lỗ mũi mười tám gánh lông" (ca dao) phóng đại sự việc — đó là…', ['Nói quá', 'Nói giảm nói tránh', 'Ẩn dụ', 'So sánh']);
add(Dv, 3, '"Tre giữ làng, giữ nước, giữ mái nhà tranh, giữ đồng lúa chín" — từ "giữ" lặp lại là…', ['Điệp ngữ', 'Hoán dụ', 'So sánh', 'Nhân hoá']);
add(Dv, 4, '"Bàn tay ta làm nên tất cả" (Hoàng Trung Thông) — "bàn tay" chỉ người lao động. Đây là…', ['Hoán dụ', 'Ẩn dụ', 'Nói quá', 'Điệp ngữ']);
add(Dv, 5, '"Người Cha mái tóc bạc / Đốt lửa cho anh nằm" (Minh Huệ) — "Người Cha" chỉ Bác Hồ. Đây là…', ['Ẩn dụ', 'Hoán dụ', 'So sánh', 'Nói quá']);

const Ar = 'lit.argument';
add(Ar, 2, 'Trong văn nghị luận, ý kiến chính người viết muốn chứng minh gọi là…', ['Luận điểm', 'Bằng chứng', 'Lí lẽ', 'Kết bài']);
add(Ar, 3, '"Theo khảo sát năm 2023, 70% học sinh dùng điện thoại quá 3 giờ/ngày" là…', ['Bằng chứng', 'Luận điểm', 'Lí lẽ', 'Câu cảm thán']);
add(Ar, 4, 'Lí lẽ khác bằng chứng ở chỗ lí lẽ…', ['giải thích, phân tích vì sao luận điểm đúng', 'là số liệu cụ thể', 'luôn đứng ở cuối bài', 'là lời trích dẫn']);
add(Ar, 5, 'Phản đề (ý kiến trái chiều) được nêu trong bài nghị luận nhằm…', ['bác bỏ để làm luận điểm thuyết phục hơn', 'làm bài dài hơn', 'thay đổi chủ đề', 'kết thúc bài viết']);

const St = 'lit.structure';
add(St, 1, 'Một bài văn thường gồm mấy phần?', ['Ba phần: mở bài, thân bài, kết bài', 'Hai phần', 'Bốn phần', 'Một phần']);
add(St, 2, 'Đoạn văn có câu chủ đề đứng ở đầu đoạn là đoạn…', ['Diễn dịch', 'Quy nạp', 'Song song', 'Tổng – phân – hợp']);
add(St, 3, 'Đoạn văn có câu chủ đề đứng ở cuối đoạn là đoạn…', ['Quy nạp', 'Diễn dịch', 'Song song', 'Móc xích']);
add(St, 4, 'Nhiệm vụ chính của phần mở bài trong văn nghị luận là…', ['giới thiệu vấn đề cần bàn', 'đưa tất cả bằng chứng', 'tóm tắt lại bài', 'kể chuyện cá nhân dài']);
add(St, 5, 'Từ nối nào phù hợp để chuyển sang một ý phản bác?', ['Tuy nhiên', 'Hơn nữa', 'Thứ nhất', 'Tóm lại']);

export const literatureQuestions = list;
