import { makeBank, type ConceptSeed } from '../helpers';

/**
 * Ngữ văn 9 — chương trình 2018, hướng tới kì thi vào lớp 10 Hà Nội.
 * Văn bản đọc hiểu: ca dao và thơ trung đại (đã hết bản quyền) cùng các đoạn văn tự viết — không chép
 * văn bản trong sách giáo khoa.
 */

export const grade9Concepts: ConceptSeed[] = [
  {
    id: 'lit.poetry-forms',
    domain: 'Đọc hiểu',
    skill: 'Poetry forms',
    name: 'Thể thơ, vần và nhịp',
    missionName: 'Đàn thơ',
    description: 'Lục bát, song thất lục bát, thất ngôn bát cú, tứ tuyệt, thơ tự do — nhận biết và đặc điểm.',
    lesson:
      'Lục bát: cặp câu 6 – 8 chữ; tiếng 6 câu lục vần với tiếng 6 câu bát. Song thất lục bát: hai câu 7 chữ rồi một cặp lục bát. Thất ngôn bát cú Đường luật: 8 câu × 7 chữ, bố cục đề – thực – luận – kết, hai câu thực và hai câu luận đối nhau. Thất ngôn tứ tuyệt: 4 câu × 7 chữ.',
  },
  {
    id: 'lit.narrative',
    domain: 'Đọc hiểu',
    skill: 'Narrative',
    name: 'Truyện: ngôi kể, điểm nhìn, nhân vật',
    missionName: 'Ngọn hải đăng kể chuyện',
    description: 'Ngôi kể, điểm nhìn, cốt truyện, chi tiết, nhân vật; truyện truyền kì, truyện thơ Nôm.',
    lesson:
      'Ngôi thứ nhất: người kể xưng "tôi", kể điều mình trải qua. Ngôi thứ ba: người kể giấu mình, gọi tên nhân vật, có thể biết hết mọi chuyện. Điểm nhìn là vị trí người kể đứng để quan sát. Truyện truyền kì có yếu tố kì ảo (thần tiên, ma quỷ, cõi âm…).',
  },
  {
    id: 'lit.classics',
    domain: 'Đọc hiểu',
    skill: 'Classical literature',
    name: 'Tác giả, tác phẩm văn học trung đại',
    missionName: 'Tàng thư cổ',
    description: 'Nguyễn Du, Nguyễn Dữ, Nguyễn Trãi, Hồ Xuân Hương, Nguyễn Khuyến, Nguyễn Đình Chiểu…',
    lesson: 'Văn học trung đại viết bằng chữ Hán và chữ Nôm. Truyện Kiều (Nguyễn Du) là truyện thơ Nôm viết bằng thể lục bát; Truyền kì mạn lục (Nguyễn Dữ) viết bằng chữ Hán.',
  },
  {
    id: 'lit.hanviet',
    domain: 'Từ ngữ',
    skill: 'Sino-Vietnamese words',
    name: 'Từ Hán Việt',
    missionName: 'Ấn triện Hán Việt',
    description: 'Nghĩa của các yếu tố Hán Việt thường gặp và cách dùng từ Hán Việt cho đúng.',
    lesson: 'Yếu tố Hán Việt hay gặp: thiên (trời), địa (đất), sơn (núi), thuỷ (nước), giang (sông), hải (biển), nhân (người), gia (nhà), quốc (nước), tiền (trước), hậu (sau), phụ (cha), mẫu (mẹ).',
  },
  {
    id: 'lit.allusion',
    domain: 'Từ ngữ',
    skill: 'Allusions',
    name: 'Điển tích, điển cố',
    missionName: 'Hang điển cố',
    description: 'Hiểu các điển tích, điển cố thường gặp trong văn thơ.',
    lesson: 'Điển tích, điển cố là câu chuyện hay hình ảnh trong sách xưa được dùng ngắn gọn để gợi một ý nghĩa: tri âm (bạn hiểu lòng nhau), Tái ông thất mã (hoạ phúc khó lường)…',
  },
  {
    id: 'lit.quotation',
    domain: 'Từ ngữ',
    skill: 'Quoting',
    name: 'Lời dẫn trực tiếp và gián tiếp',
    missionName: 'Thư lại chép lời',
    description: 'Phân biệt và chuyển đổi lời dẫn trực tiếp, gián tiếp.',
    lesson: 'Lời dẫn trực tiếp: nhắc nguyên văn, đặt sau dấu hai chấm, trong ngoặc kép. Lời dẫn gián tiếp: thuật lại có điều chỉnh, không dùng ngoặc kép, có thể thêm "rằng" hoặc "là", đổi đại từ nhân xưng cho phù hợp.',
  },
  {
    id: 'lit.linking',
    domain: 'Từ ngữ',
    skill: 'Cohesion',
    name: 'Liên kết câu và câu ghép',
    missionName: 'Cầu nối chữ',
    description: 'Phép lặp, phép thế, phép nối; câu ghép và quan hệ giữa các vế.',
    lesson: 'Phép lặp: nhắc lại từ ngữ ở câu trước. Phép thế: dùng từ khác (đại từ, từ đồng nghĩa) thay cho từ ngữ ở câu trước. Phép nối: dùng từ nối (nhưng, vì vậy, tuy nhiên…). Câu ghép có các quan hệ: nguyên nhân (vì… nên), điều kiện (nếu… thì), tương phản (tuy… nhưng), tăng tiến (không những… mà còn).',
  },
  {
    id: 'lit.nlxh',
    domain: 'Nghị luận',
    skill: 'Social argument',
    name: 'Nghị luận xã hội',
    missionName: 'Diễn đàn thành phố',
    description: 'Cách triển khai bài nghị luận về một vấn đề đời sống.',
    lesson: 'Bài nghị luận xã hội: Mở bài nêu vấn đề. Thân bài: giải thích → bàn luận (biểu hiện, ý nghĩa hoặc tác hại, dẫn chứng) → phản đề (ý kiến trái chiều) → bài học nhận thức và hành động. Kết bài khẳng định lại vấn đề.',
  },
  {
    id: 'lit.nlvh',
    domain: 'Nghị luận',
    skill: 'Literary argument',
    name: 'Nghị luận văn học',
    missionName: 'Thư phòng bình văn',
    description: 'Phân tích, đánh giá một đoạn thơ hay đoạn truyện: nội dung, nghệ thuật, dẫn chứng.',
    lesson: 'Đoạn văn nghị luận văn học: câu chủ đề nêu tác giả, tác phẩm và nhận xét chung → phân tích nội dung và nghệ thuật, trích dẫn từ ngữ, hình ảnh cụ thể → đánh giá → câu kết. Luôn đi từ dẫn chứng đến cảm nhận, không kể lại nội dung.',
  },
];

const { add, list } = makeBank('Atlas original', 'g9-');

// ── Thể thơ ──────────────────────────────────────────────
const PF = 'lit.poetry-forms';
add(PF, 1, 'Thể thơ gồm từng cặp câu 6 chữ và 8 chữ là…', ['Lục bát', 'Song thất lục bát', 'Thất ngôn bát cú', 'Thơ tự do']);
add(PF, 2, 'Trong thể lục bát, tiếng thứ 6 của câu lục vần với…', ['tiếng thứ 6 của câu bát', 'tiếng thứ 8 của câu bát', 'tiếng thứ 2 của câu bát', 'tiếng đầu của câu bát']);
add(PF, 2, 'Một bài thơ có 4 câu, mỗi câu 7 chữ là thể…', ['Thất ngôn tứ tuyệt', 'Thất ngôn bát cú', 'Ngũ ngôn', 'Lục bát']);
add(PF, 3, 'Bố cục thường gặp của bài thơ thất ngôn bát cú Đường luật là…', ['Đề – thực – luận – kết', 'Mở – thân – kết', 'Khai – thừa – chuyển – hợp', 'Tình – cảnh – tình']);
add(PF, 3, 'Trong thơ thất ngôn bát cú Đường luật, hai cặp câu nào phải đối nhau?', ['Hai câu thực và hai câu luận', 'Hai câu đề và hai câu kết', 'Câu 1 và câu 8', 'Không có cặp nào']);
add(PF, 3, 'Thể thơ có hai câu 7 chữ tiếp theo là một cặp lục bát gọi là…', ['Song thất lục bát', 'Lục bát biến thể', 'Thất ngôn tứ tuyệt', 'Thơ tám chữ']);
add(PF, 4, '"Chinh phụ ngâm" (bản dịch thường được cho là của Đoàn Thị Điểm) được viết theo thể…', ['Song thất lục bát', 'Lục bát', 'Thất ngôn bát cú', 'Thơ tự do']);
add(PF, 4, 'Thơ tự do khác thơ Đường luật chủ yếu ở chỗ…', ['không bị gò bó về số câu, số chữ, vần, đối', 'luôn có 8 câu', 'không bao giờ có vần', 'chỉ viết về thiên nhiên']);
add(PF, 5, '"Ao thu lạnh lẽo nước trong veo, / Một chiếc thuyền câu bé tẻo teo." Hai câu thơ gieo vần gì?', ['Vần "eo" (veo – teo)', 'Vần "ao"', 'Không có vần', 'Vần "âu"']);

// ── Truyện ──────────────────────────────────────────────
const NR = 'lit.narrative';
add(NR, 1, 'Người kể chuyện xưng "tôi" và kể những gì mình trải qua là ngôi kể…', ['thứ nhất', 'thứ hai', 'thứ ba', 'không xác định']);
add(NR, 2, 'Ưu điểm của ngôi kể thứ ba là…', ['người kể có thể biết và kể mọi chuyện, kể cả suy nghĩ của nhiều nhân vật', 'làm truyện ngắn hơn', 'người đọc biết rõ người kể là ai', 'không cần nhân vật']);
add(NR, 2, '"Điểm nhìn" trong truyện là…', ['vị trí, góc độ người kể đứng để quan sát và kể', 'tên của truyện', 'đoạn mở đầu', 'lời của tác giả ở cuối truyện']);
add(NR, 3, 'Yếu tố đặc trưng của truyện truyền kì là…', ['yếu tố kì ảo, hoang đường đan xen với hiện thực', 'chỉ có nhân vật lịch sử', 'được viết bằng thơ lục bát', 'luôn kết thúc buồn']);
add(NR, 3, 'Chi tiết "cái bóng" trong "Chuyện người con gái Nam Xương" có vai trò…', ['thắt nút và mở nút câu chuyện, dẫn đến bi kịch của Vũ Nương', 'tả cảnh thiên nhiên', 'giới thiệu tác giả', 'không quan trọng']);
add(NR, 3, 'Truyện thơ Nôm là…', ['truyện kể bằng thơ (thường là lục bát), viết bằng chữ Nôm', 'truyện cổ tích viết bằng chữ Hán', 'truyện ngắn hiện đại', 'thơ không có cốt truyện']);
add(NR, 4, 'Khi người kể ở ngôi thứ ba nhưng nhìn sự việc qua mắt một nhân vật, ta nói điểm nhìn đã…', ['dịch chuyển vào bên trong nhân vật', 'biến mất', 'chuyển sang ngôi thứ hai', 'trở thành lời tác giả']);
add(NR, 5, 'Chi tiết nào sau đây là chi tiết kì ảo?', ['Nhân vật sống dưới thuỷ cung rồi hiện về giữa dòng sông', 'Nhân vật đi lính xa nhà', 'Người mẹ ốm nặng rồi mất', 'Đứa trẻ hỏi về cha mình']);

// ── Tác giả, tác phẩm ──────────────────────────────────
const CL = 'lit.classics';
add(CL, 1, '"Truyện Kiều" là tác phẩm của…', ['Nguyễn Du', 'Nguyễn Trãi', 'Nguyễn Khuyến', 'Nguyễn Đình Chiểu']);
add(CL, 2, '"Truyện Kiều" được viết bằng chữ gì, theo thể thơ nào?', ['Chữ Nôm, thể lục bát', 'Chữ Hán, thể Đường luật', 'Chữ quốc ngữ, thơ tự do', 'Chữ Nôm, song thất lục bát']);
add(CL, 2, '"Chuyện người con gái Nam Xương" rút từ tập…', ['Truyền kì mạn lục của Nguyễn Dữ', 'Lĩnh Nam chích quái', 'Hoàng Lê nhất thống chí', 'Thánh Tông di thảo']);
add(CL, 2, '"Truyện Lục Vân Tiên" là truyện thơ Nôm của…', ['Nguyễn Đình Chiểu', 'Nguyễn Du', 'Hồ Xuân Hương', 'Nguyễn Dữ']);
add(CL, 3, 'Ai được mệnh danh là "Bà chúa thơ Nôm"?', ['Hồ Xuân Hương', 'Đoàn Thị Điểm', 'Bà Huyện Thanh Quan', 'Xuân Quỳnh']);
add(CL, 3, '"Bình Ngô đại cáo" (1428) là tác phẩm của…', ['Nguyễn Trãi', 'Lý Thường Kiệt', 'Trần Quốc Tuấn', 'Lê Lợi']);
add(CL, 3, 'Chùm ba bài thơ thu "Thu điếu", "Thu ẩm", "Thu vịnh" là của…', ['Nguyễn Khuyến', 'Tú Xương', 'Nguyễn Du', 'Hồ Xuân Hương']);
add(CL, 4, '"Truyện Kiều" dựa trên cốt truyện của tác phẩm nào?', ['Kim Vân Kiều truyện (Thanh Tâm Tài Nhân)', 'Tam quốc diễn nghĩa', 'Tây du kí', 'Liêu trai chí dị']);
add(CL, 5, 'Văn học trung đại Việt Nam chủ yếu được viết bằng…', ['chữ Hán và chữ Nôm', 'chữ quốc ngữ', 'chữ Pháp', 'chữ Phạn']);

// ── Từ Hán Việt ─────────────────────────────────────────
const HV = 'lit.hanviet';
add(HV, 1, 'Yếu tố "thiên" trong "thiên nhiên", "thiên thư" có nghĩa là…', ['trời', 'nghìn', 'dời đi', 'lệch']);
add(HV, 1, '"Giang sơn" có nghĩa là…', ['sông núi, đất nước', 'con đường', 'biển cả', 'làng xóm']);
add(HV, 2, 'Trong "Nam quốc sơn hà", "sơn hà" có nghĩa là…', ['núi sông', 'nhà cửa', 'trời đất', 'vua chúa']);
add(HV, 2, '"Phụ mẫu" là…', ['cha mẹ', 'ông bà', 'anh em', 'vợ chồng']);
add(HV, 3, 'Từ nào có yếu tố "hải" mang nghĩa "biển"?', ['hải cảng', 'hải đường (hoa)', 'hài lòng', 'hãi hùng']);
add(HV, 3, '"Thiên lí mã" là con ngựa…', ['chạy nghìn dặm', 'của nhà trời', 'màu trắng', 'đã già']);
add(HV, 4, 'Câu nào dùng từ Hán Việt KHÔNG phù hợp?', ['Em rất yếu điểm môn Toán.', 'Phụ nữ Việt Nam anh hùng, bất khuất.', 'Lễ hội được tổ chức trang trọng.', 'Bác là tấm gương giản dị.']);
add(HV, 4, 'Vì sao nói "phu nhân" mà không nói "vợ" trong ngữ cảnh ngoại giao?', ['Từ Hán Việt tạo sắc thái trang trọng', 'Vì "vợ" là từ sai', 'Vì "phu nhân" ngắn hơn', 'Vì đó là từ mượn tiếng Anh']);
add(HV, 5, 'Trong "tiền nhân", "hậu thế", "tiền" và "hậu" lần lượt nghĩa là…', ['trước – sau', 'tiền bạc – hậu đãi', 'sau – trước', 'trên – dưới']);

// ── Điển tích, điển cố ─────────────────────────────────
const AL = 'lit.allusion';
add(AL, 2, '"Tri âm" (tích Bá Nha – Tử Kỳ) chỉ…', ['người bạn thật sự hiểu lòng mình', 'người giỏi âm nhạc', 'người hàng xóm', 'thầy dạy đàn']);
add(AL, 2, 'Điển "Ngưu Lang – Chức Nữ" thường gợi điều gì?', ['tình yêu chung thuỷ nhưng phải xa cách', 'sự giàu sang', 'lòng hiếu thảo', 'sự lười biếng']);
add(AL, 3, '"Tái ông thất mã" (ông lão ở biên giới mất ngựa) muốn nói…', ['hoạ và phúc khó lường, có thể đổi chỗ cho nhau', 'phải giữ ngựa cẩn thận', 'người già hay quên', 'ngựa rất quý']);
add(AL, 3, '"Công cha như núi Thái Sơn" — "Thái Sơn" là…', ['ngọn núi cao lớn, tượng trưng cho công ơn to lớn', 'tên một người cha', 'một con sông', 'một ngôi chùa']);
add(AL, 4, 'Truyện "Mạnh mẫu ba lần dời nhà" thường được nhắc để nói về…', ['ảnh hưởng của môi trường sống tới việc giáo dục con', 'cách xây nhà', 'người mẹ khó tính', 'việc đi du lịch']);
add(AL, 4, 'Dùng điển tích, điển cố trong thơ văn giúp…', ['diễn đạt ngắn gọn mà hàm súc, gợi nhiều ý nghĩa', 'làm câu văn dài hơn', 'giải thích từ mới', 'thay cho dấu câu']);
add(AL, 5, 'Hình ảnh "nàng Tô Thị" (vọng phu) gợi…', ['người vợ chờ chồng đến hoá đá, biểu tượng của lòng chung thuỷ', 'người con gái giàu có', 'một nữ tướng', 'người mẹ nghiêm khắc']);

// ── Lời dẫn ────────────────────────────────────────────
const QT = 'lit.quotation';
add(QT, 1, 'Lời dẫn trực tiếp được đặt…', ['sau dấu hai chấm, trong dấu ngoặc kép', 'trong ngoặc đơn', 'sau dấu chấm phẩy', 'không cần dấu câu']);
add(QT, 2, 'Câu nào có lời dẫn gián tiếp?', ['Bác Hồ dạy rằng phải học tập suốt đời.', 'Bác Hồ dạy: "Học hỏi là một việc phải tiếp tục suốt đời."', '"Học, học nữa", Lê-nin nói.', 'Thầy hỏi: "Em đã làm bài chưa?"']);
add(QT, 3, 'Chuyển sang lời dẫn gián tiếp: Lan nói: "Mình sẽ đến muộn."', ['Lan nói rằng bạn ấy sẽ đến muộn.', 'Lan nói rằng: "Mình sẽ đến muộn."', 'Lan nói "mình sẽ đến muộn".', 'Lan nói: Lan sẽ đến muộn.']);
add(QT, 3, 'Khi chuyển lời dẫn trực tiếp sang gián tiếp, ta thường phải…', ['bỏ ngoặc kép và đổi đại từ nhân xưng cho phù hợp', 'giữ nguyên từng chữ', 'thêm dấu chấm than', 'thêm ngoặc đơn']);
add(QT, 4, 'Trong văn nghị luận, trích dẫn nguyên văn câu thơ làm dẫn chứng là dùng…', ['lời dẫn trực tiếp', 'lời dẫn gián tiếp', 'lời người kể', 'câu hỏi tu từ']);

// ── Liên kết, câu ghép ─────────────────────────────────
const LK = 'lit.linking';
add(LK, 2, '"Hà Nội có Hồ Gươm. Hồ Gươm gắn với truyền thuyết trả gươm." Hai câu liên kết bằng phép…', ['lặp', 'thế', 'nối', 'đối']);
add(LK, 2, '"Bác Hồ rất yêu trẻ em. Người luôn dành cho các cháu những món quà nhỏ." Từ "Người" thể hiện phép…', ['thế', 'lặp', 'nối', 'so sánh']);
add(LK, 2, '"Trời mưa rất to. Tuy vậy, chúng tôi vẫn đến trường đúng giờ." Phép liên kết là…', ['nối', 'lặp', 'thế', 'liên tưởng']);
add(LK, 3, '"Vì trời mưa nên trận đấu bị hoãn." Quan hệ giữa hai vế câu ghép là…', ['nguyên nhân – kết quả', 'tương phản', 'tăng tiến', 'lựa chọn']);
add(LK, 3, '"Tuy nhà xa nhưng Nam chưa bao giờ đi học muộn." Quan hệ là…', ['tương phản', 'nguyên nhân – kết quả', 'điều kiện – kết quả', 'tăng tiến']);
add(LK, 3, '"Không những Lan học giỏi mà bạn ấy còn hát hay." Quan hệ là…', ['tăng tiến', 'tương phản', 'lựa chọn', 'nguyên nhân']);
add(LK, 4, '"Nếu em chăm chỉ ôn tập thì em sẽ thi tốt." Đây là câu ghép chỉ quan hệ…', ['điều kiện – kết quả', 'tương phản', 'nguyên nhân – kết quả', 'tăng tiến']);
add(LK, 5, 'Đoạn văn mắc lỗi liên kết nào? "Em rất thích đọc sách. Tuy nhiên, sách giúp em hiểu biết thêm nhiều điều."', ['Dùng từ nối sai quan hệ (nên dùng "Bởi vì" / "Vì")', 'Lặp từ quá nhiều', 'Thiếu chủ ngữ', 'Sai chính tả']);

// ── Nghị luận xã hội ──────────────────────────────────
const XH = 'lit.nlxh';
add(XH, 1, 'Phần mở bài của bài nghị luận xã hội cần…', ['giới thiệu và nêu rõ vấn đề cần bàn', 'đưa toàn bộ dẫn chứng', 'nêu bài học cho bản thân', 'kể một câu chuyện dài']);
add(XH, 2, 'Bàn về "lòng biết ơn", bước "giải thích" là…', ['làm rõ biết ơn là gì', 'kể tên người cần biết ơn', 'phê phán người vô ơn', 'nêu bài học']);
add(XH, 2, 'Dẫn chứng tốt trong bài nghị luận xã hội cần…', ['tiêu biểu, chính xác, gần gũi và phục vụ đúng luận điểm', 'càng dài càng tốt', 'là chuyện tưởng tượng', 'lấy từ một bài văn mẫu']);
add(XH, 3, '"Phản đề" trong bài nghị luận xã hội là…', ['xem xét ý kiến trái chiều hoặc biểu hiện sai lệch để bác bỏ, làm vấn đề sâu sắc hơn', 'nhắc lại mở bài', 'viết sai đề', 'kể chuyện bản thân']);
add(XH, 3, 'Phần "bài học" nên gồm…', ['nhận thức đúng và hành động cụ thể của bản thân', 'lời khuyên chung chung cho mọi người', 'một câu ca dao', 'tóm tắt dẫn chứng']);
add(XH, 4, 'Đề: "Suy nghĩ về việc tự học". Luận điểm nào lạc đề?', ['Cách chọn trường đại học có học phí thấp', 'Tự học giúp chủ động và hiểu sâu kiến thức', 'Nhiều người thành công nhờ tự học', 'Tự học không có nghĩa là học một mình, không hỏi ai']);
add(XH, 4, 'Câu nào là câu chủ đề phù hợp cho đoạn văn bàn về tác hại của việc nghiện mạng xã hội?', ['Nghiện mạng xã hội đang lấy đi của người trẻ thời gian, sức khoẻ và những mối quan hệ thật.', 'Mạng xã hội ra đời từ đầu thế kỉ XXI.', 'Em có tài khoản mạng xã hội.', 'Có rất nhiều mạng xã hội khác nhau.']);
add(XH, 5, 'Để bài nghị luận thuyết phục, cách nào hiệu quả nhất?', ['Kết hợp lí lẽ chặt chẽ với dẫn chứng cụ thể và thái độ khách quan', 'Dùng nhiều câu cảm thán', 'Viết thật dài', 'Chỉ nêu cảm xúc cá nhân']);

// ── Lập luận (thêm cho chủ đề có sẵn) ──────────────────
const AR = 'lit.argument';
add(AR, 2, 'Trong một đoạn nghị luận, câu nêu ý kiến chính thường được gọi là…', ['câu chủ đề (luận điểm của đoạn)', 'câu dẫn chứng', 'câu cảm thán', 'câu hỏi tu từ']);
add(AR, 3, 'Thao tác "chứng minh" là…', ['dùng dẫn chứng xác thực để làm sáng tỏ luận điểm', 'giải thích nghĩa của từ', 'kể lại câu chuyện', 'nêu ý kiến trái chiều']);
add(AR, 3, 'Thao tác "bác bỏ" được dùng khi…', ['chỉ ra cái sai của một ý kiến để khẳng định ý kiến đúng', 'muốn kể chuyện hài', 'tóm tắt bài', 'giới thiệu tác giả']);
add(AR, 4, 'Một lập luận chặt chẽ cần…', ['luận điểm rõ ràng, lí lẽ hợp lí, dẫn chứng phù hợp và sắp xếp mạch lạc', 'nhiều từ Hán Việt', 'câu thật dài', 'càng nhiều cảm xúc càng tốt']);

// ── Nghị luận văn học ─────────────────────────────────
const VH = 'lit.nlvh';
add(VH, 1, 'Câu mở đoạn của đoạn văn phân tích một khổ thơ nên…', ['nêu tác giả, tác phẩm và nhận xét khái quát về khổ thơ', 'chép lại cả bài thơ', 'kể tiểu sử tác giả thật dài', 'nêu bài học cuộc sống']);
add(VH, 2, 'Lỗi thường gặp nhất khi viết nghị luận văn học là…', ['kể lại / diễn xuôi nội dung mà không phân tích', 'trích dẫn thơ', 'nhận xét về nghệ thuật', 'dùng từ Hán Việt']);
add(VH, 3, 'Khi phân tích một hình ảnh thơ, cần chỉ ra…', ['từ ngữ, biện pháp nghệ thuật và hiệu quả biểu đạt, cảm xúc mà nó gợi ra', 'số chữ của câu thơ', 'năm sinh của tác giả', 'tên nhà xuất bản']);
add(VH, 3, 'Câu nào là câu nhận xét về NGHỆ THUẬT?', ['Từ láy "tẻo teo" gợi chiếc thuyền nhỏ bé, làm không gian như rộng thêm.', 'Bài thơ viết về mùa thu.', 'Tác giả sinh ra ở Hà Nam.', 'Bài thơ có 8 câu.']);
add(VH, 4, 'Trình tự hợp lí trong phần thân đoạn nghị luận văn học là…', ['dẫn chứng → phân tích → đánh giá', 'đánh giá → kể chuyện → kết', 'tiểu sử → hoàn cảnh sáng tác → kết', 'cảm xúc → câu hỏi → kết']);
add(VH, 5, 'Câu kết đoạn hay nên…', ['khẳng định giá trị của đoạn thơ và để lại ấn tượng, liên hệ ngắn gọn', 'mở ra một vấn đề hoàn toàn mới', 'xin lỗi người chấm', 'nhắc lại nguyên văn câu mở đoạn']);

// ── Đọc hiểu văn bản (theo cụm câu hỏi như đề thi) ──────────────
const CO = 'lit.comprehension';

const CA_DAO = 'Công cha như núi Thái Sơn,\nNghĩa mẹ như nước trong nguồn chảy ra.\nMột lòng thờ mẹ kính cha,\nCho tròn chữ hiếu mới là đạo con.\n(Ca dao)';
const cd = { passage: CA_DAO, setId: 'lit-cadao' };
add(CO, 1, 'Bài ca dao được viết theo thể thơ nào?', ['Lục bát', 'Song thất lục bát', 'Thất ngôn tứ tuyệt', 'Thơ tự do'], cd);
add(CO, 2, 'Biện pháp tu từ chủ yếu trong hai câu đầu là…', ['So sánh', 'Nhân hoá', 'Hoán dụ', 'Nói quá'], cd);
add(CO, 2, 'Hai hình ảnh "núi Thái Sơn" và "nước trong nguồn" gợi điều gì về công cha nghĩa mẹ?', ['To lớn, vững chắc và dạt dào, không bao giờ cạn', 'Xa xôi, khó gặp', 'Lạnh lùng, nghiêm khắc', 'Nhỏ bé, bình dị'], cd);
add(CO, 3, 'Lời khuyên của bài ca dao là…', ['con cái phải hiếu thảo, kính yêu cha mẹ', 'phải đi leo núi', 'phải học thật giỏi', 'phải tiết kiệm nước'], cd);
add(CO, 4, '"Đạo con" trong câu cuối có nghĩa là…', ['bổn phận, đạo lí làm con', 'con đường đi học', 'một tôn giáo', 'người con trai'], cd);

const KIEU = 'Ngày xuân con én đưa thoi,\nThiều quang chín chục đã ngoài sáu mươi.\nCỏ non xanh tận chân trời,\nCành lê trắng điểm một vài bông hoa.\n(Nguyễn Du, Truyện Kiều)';
const kk = { passage: KIEU, setId: 'lit-kieu-xuan' };
add(CO, 2, '"Thiều quang chín chục" là…', ['ánh sáng đẹp của chín mươi ngày mùa xuân', 'chín mươi con chim én', 'chín mươi tuổi', 'chín mươi bông hoa'], kk);
add(CO, 3, 'Câu "Ngày xuân con én đưa thoi" gợi điều gì?', ['Thời gian mùa xuân trôi nhanh, chim én bay qua lại như con thoi', 'Mùa xuân rất dài', 'Chim én đang làm tổ', 'Trời sắp mưa'], kk);
add(CO, 3, 'Hai câu cuối nổi bật với gam màu nào?', ['Xanh của cỏ non và trắng của hoa lê', 'Đỏ và vàng', 'Đen và trắng', 'Tím và hồng'], kk);
add(CO, 4, 'Bức tranh xuân trong đoạn thơ mang vẻ đẹp…', ['tươi mới, trong trẻo, khoáng đạt và tràn đầy sức sống', 'u buồn, hiu quạnh', 'dữ dội, náo động', 'già cỗi, tàn úa'], kk);
add(CO, 5, 'Từ "điểm" trong "Cành lê trắng điểm một vài bông hoa" có tác dụng…', ['làm bức tranh sinh động, hài hoà, như có bàn tay hoạ sĩ chấm phá', 'chỉ số lượng hoa', 'chỉ thời gian', 'không có tác dụng gì'], kk);

const THU = 'Ao thu lạnh lẽo nước trong veo,\nMột chiếc thuyền câu bé tẻo teo.\nSóng biếc theo làn hơi gợn tí,\nLá vàng trước gió khẽ đưa vèo.\n(Nguyễn Khuyến, Thu điếu — bốn câu đầu)';
const th = { passage: THU, setId: 'lit-thu-dieu' };
add(CO, 2, 'Bài "Thu điếu" thuộc thể thơ…', ['Thất ngôn bát cú Đường luật', 'Lục bát', 'Thất ngôn tứ tuyệt', 'Thơ tự do'], th);
add(CO, 2, 'Không gian mùa thu trong đoạn thơ là…', ['làng quê đồng bằng Bắc Bộ, với ao thu nhỏ', 'núi rừng Tây Bắc', 'thành phố đông vui', 'biển cả mênh mông'], th);
add(CO, 3, 'Các từ "lạnh lẽo", "tẻo teo" là…', ['từ láy', 'từ ghép Hán Việt', 'thành ngữ', 'từ mượn'], th);
add(CO, 4, 'Các chuyển động "hơi gợn tí", "khẽ đưa vèo" cho thấy…', ['cảnh thu rất tĩnh, chuyển động nhẹ nhàng, khẽ khàng', 'cảnh thu ồn ào, dữ dội', 'trời sắp có bão', 'người câu cá rất vội vàng'], th);
add(CO, 5, 'Bốn câu thơ gợi tâm trạng gì của nhà thơ?', ['một nỗi buồn, cô quạnh, man mác trước cảnh thu', 'niềm vui rộn ràng', 'sự giận dữ', 'sự sợ hãi'], th);

const BANH_TROI = 'Thân em vừa trắng lại vừa tròn,\nBảy nổi ba chìm với nước non.\nRắn nát mặc dầu tay kẻ nặn,\nMà em vẫn giữ tấm lòng son.\n(Hồ Xuân Hương, Bánh trôi nước)';
const bt = { passage: BANH_TROI, setId: 'lit-banh-troi' };
add(CO, 2, 'Bài thơ được viết theo thể…', ['Thất ngôn tứ tuyệt', 'Thất ngôn bát cú', 'Lục bát', 'Ngũ ngôn'], bt);
add(CO, 3, 'Bài thơ có mấy lớp nghĩa?', ['Hai: tả chiếc bánh trôi và nói về thân phận, phẩm chất người phụ nữ', 'Một: chỉ tả chiếc bánh', 'Ba: tả bánh, tả nước, tả bếp', 'Không có nghĩa nào'], bt);
add(CO, 3, '"Bảy nổi ba chìm" là…', ['thành ngữ chỉ cuộc đời lênh đênh, nhiều vất vả', 'cách nấu bánh', 'tên một trò chơi', 'số lượng bánh'], bt);
add(CO, 4, '"Tấm lòng son" thể hiện…', ['phẩm chất son sắt, thuỷ chung, trong sáng của người phụ nữ', 'màu đỏ của nhân bánh', 'sự giàu có', 'tình yêu quê hương'], bt);
add(CO, 5, 'Cách xưng "em" kết hợp với thành ngữ dân gian cho thấy giọng thơ…', ['vừa mộc mạc gần gũi, vừa đầy bản lĩnh, tự tin', 'trang trọng, xa cách', 'lạnh lùng', 'vui đùa, chế giễu'], bt);

const STORY = `Mỗi sáng mùa đông, bà tôi dậy từ khi trời còn tối. Tiếng chổi tre quét sân xào xạc như một bài hát quen thuộc. Bà nấu nồi cháo nhỏ, để phần tôi một bát rồi úp cái đĩa lên cho khỏi nguội.

Hồi ấy tôi chỉ nghĩ đó là chuyện bình thường. Phải đến năm tôi đi học xa, sáng đầu tiên thức dậy trong căn phòng trọ lạnh tanh, không có tiếng chổi, không có bát cháo úp đĩa, tôi mới hiểu: có những yêu thương lặng lẽ đến mức ta chỉ nhận ra khi đã thiếu nó.

Tối hôm ấy, tôi gọi điện về. Bà chỉ hỏi: "Ăn sáng chưa con?"`;
const st = { passage: STORY, setId: 'lit-story-ba' };
add(CO, 1, 'Văn bản được kể theo ngôi thứ mấy?', ['Ngôi thứ nhất', 'Ngôi thứ hai', 'Ngôi thứ ba', 'Không có người kể'], st);
add(CO, 2, 'Chi tiết nào lặp lại để thể hiện tình yêu thương của bà?', ['Bát cháo được úp đĩa cho khỏi nguội', 'Căn phòng trọ', 'Cuộc điện thoại', 'Mùa đông'], st);
add(CO, 3, '"Tiếng chổi tre quét sân xào xạc như một bài hát quen thuộc" sử dụng biện pháp…', ['So sánh', 'Nhân hoá', 'Ẩn dụ', 'Liệt kê'], st);
add(CO, 4, 'Câu hỏi "Ăn sáng chưa con?" ở cuối truyện có ý nghĩa gì?', ['Cho thấy tình thương của bà giản dị nhưng luôn thường trực', 'Bà muốn kiểm tra cháu', 'Bà không biết nói gì', 'Bà trách cháu'], st);
add(CO, 5, 'Thông điệp của văn bản là…', ['hãy trân trọng những yêu thương giản dị quanh mình trước khi phải thiếu nó', 'nên ăn cháo vào buổi sáng', 'đi học xa rất vất vả', 'mùa đông rất lạnh'], st);

const ESSAY = `Có người nghĩ rằng tự học là ngồi một mình với sách vở, không cần ai giúp. Thật ra, tự học trước hết là tự đặt ra mục tiêu và tự tìm cách đạt được nó: biết mình chưa hiểu điều gì, chủ động hỏi thầy cô, tra cứu, luyện tập cho đến khi hiểu.

Người biết tự học không chờ ai thúc giục. Nhà bác học Lê Quý Đôn đọc sách từ nhỏ và ghi chép tỉ mỉ suốt đời, để lại hàng chục bộ sách quý. Ngày nay, với Internet, cơ hội tự học rộng mở hơn bao giờ hết, nhưng cũng dễ bị cuốn vào những thứ vô bổ nếu thiếu kỉ luật.

Vì vậy, tự học không chỉ là một phương pháp, mà là một năng lực cần rèn luyện mỗi ngày.`;
const es = { passage: ESSAY, setId: 'lit-essay-tuhoc' };
add(CO, 2, 'Phương thức biểu đạt chính của văn bản là…', ['Nghị luận', 'Tự sự', 'Miêu tả', 'Biểu cảm'], es);
add(CO, 2, 'Vấn đề được bàn luận là…', ['ý nghĩa và cách hiểu đúng về việc tự học', 'tiểu sử Lê Quý Đôn', 'tác hại của Internet', 'cách chọn sách'], es);
add(CO, 3, 'Ví dụ về Lê Quý Đôn đóng vai trò là…', ['bằng chứng cho luận điểm', 'luận điểm chính', 'phản đề', 'câu kết'], es);
add(CO, 4, 'Câu "Có người nghĩ rằng tự học là ngồi một mình với sách vở…" được tác giả nêu ra để…', ['nêu một cách hiểu chưa đúng rồi bác bỏ', 'đồng ý hoàn toàn', 'kể chuyện', 'giới thiệu nhân vật'], es);
add(CO, 5, 'Từ "Vì vậy" ở đầu đoạn cuối thể hiện phép liên kết…', ['nối', 'lặp', 'thế', 'đối'], es);

const INFO = `HỒ GƯƠM — TRÁI TIM HÀ NỘI

Hồ Hoàn Kiếm (Hồ Gươm) nằm ở trung tâm Hà Nội, rộng khoảng 12 héc-ta. Tên hồ gắn với truyền thuyết vua Lê Lợi trả gươm thần cho Rùa Vàng sau khi đánh thắng giặc Minh.

Giữa hồ có Tháp Rùa. Phía bắc là đền Ngọc Sơn với cầu Thê Húc sơn màu đỏ. Vào cuối tuần, các tuyến phố quanh hồ trở thành phố đi bộ, thu hút đông đảo người dân và du khách.

(Ảnh: Tháp Rùa giữa hồ; Sơ đồ: vị trí đền Ngọc Sơn, cầu Thê Húc)`;
const inf = { passage: INFO, setId: 'lit-info-hoguom' };
add(CO, 1, 'Văn bản trên thuộc loại văn bản nào?', ['Văn bản thông tin', 'Văn bản nghị luận', 'Truyện ngắn', 'Thơ'], inf);
add(CO, 2, 'Mục đích chính của văn bản là…', ['cung cấp thông tin về Hồ Gươm', 'kể một câu chuyện cảm động', 'thuyết phục người đọc đổi ý', 'bày tỏ cảm xúc buồn'], inf);
add(CO, 3, 'Ảnh và sơ đồ đi kèm là…', ['phương tiện phi ngôn ngữ giúp thông tin trực quan, dễ hiểu', 'phần trang trí không cần thiết', 'dẫn chứng nghị luận', 'lời dẫn trực tiếp'], inf);
add(CO, 3, 'Thông tin nào được trình bày theo trật tự không gian?', ['Giữa hồ có Tháp Rùa; phía bắc là đền Ngọc Sơn', 'Hồ rộng khoảng 12 héc-ta', 'Tên hồ gắn với truyền thuyết', 'Cuối tuần là phố đi bộ'], inf);
add(CO, 4, 'Nhan đề "Hồ Gươm — trái tim Hà Nội" sử dụng biện pháp…', ['Ẩn dụ', 'Hoán dụ', 'Nói giảm', 'Liệt kê'], inf);

export const grade9Questions = list;
