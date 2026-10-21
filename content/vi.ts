import { ieltsTopicLessonsVi } from './english/ielts-topics';
/**
 * Vietnamese help for question instructions, explanations and lessons.
 * Only the *instruction* is translated for English items (the English being tested stays English);
 * maths and logic prompts are translated in full, so English never blocks those subjects.
 */

const ORD_VI: Record<string, string> = { '1st': 'nhất', '2nd': 'hai', '3rd': 'ba', '4th': 'tư' };

const DIR: Record<string, string> = { North: 'Bắc', South: 'Nam', East: 'Đông', West: 'Tây' };
const TURN: Record<string, string> = { 'turn right': 'rẽ phải', 'turn left': 'rẽ trái', 'turn around': 'quay ngược lại' };

type Rule = [RegExp, string | ((...m: string[]) => string)];

const RULES: Rule[] = [
  // ── English instructions ──
  [/^What does "(.+)" mean\?$/, 'Từ "$1" nghĩa là gì?'],
  [/^Choose the word closest in meaning to "([^"]+)"/, 'Chọn từ GẦN NGHĨA nhất với "$1".'],
  [/^Which word means "?([^"]+?)"?\?$/, 'Từ nào có nghĩa là: "$1"?'],
  [/^Choose the passive: (.+)$/, 'Chọn câu BỊ ĐỘNG tương ứng với câu: $1'],
  [/^Which sentence is correct\?$/, 'Câu nào đúng?'],
  [/^Choose the OPPOSITE of "(.+)"\.$/, 'Chọn từ TRÁI NGHĨA với "$1".'],
  [/^Complete with the right form of "(.+)": (.+)$/, 'Điền dạng đúng của từ "$1" vào chỗ trống: $2'],
  [/^Complete: (.+)$/, 'Điền từ đúng vào chỗ trống: $1'],
  [/^Which phrase means "(.+)"\?$/, 'Cụm từ nào có nghĩa là "$1"?'],
  [/^Put the words in the right order\.$/, 'Sắp xếp các từ theo đúng thứ tự để tạo thành câu.'],
  [/^Choose the word whose underlined part is pronounced differently from the others\.$/, 'Chọn từ có phần gạch chân được PHÁT ÂM KHÁC với các từ còn lại.'],
  [/^Choose the word whose main stress is placed differently from the others\.$/, 'Chọn từ có TRỌNG ÂM CHÍNH rơi vào vị trí khác với các từ còn lại.'],
  [/^Listen\. Which word do you hear\?$/, 'Nghe và chọn từ em nghe được.'],
  // Hà Nội exam skills
  [/^[^:\n]+: ".*"\n[^:\n]+: "___"$/s, 'Chọn câu đáp lại phù hợp nhất để hoàn thành đoạn hội thoại.'],
  [/^What does the sign or notice mean\?$/, 'Biển báo / thông báo này có nghĩa là gì?'],
  [/^Choose the sentence closest in meaning to: "(.+)"$/, 'Chọn câu GẦN NGHĨA nhất với câu: "$1"'],
  [/^Choose the sentence that best combines: "(.+)"$/, 'Chọn câu KẾT HỢP tốt nhất hai câu: "$1"'],
  [/^Choose the correct order to make a meaningful (dialogue|letter|paragraph)\.$/, (_m, k) => `Chọn thứ tự đúng để tạo thành ${{ dialogue: 'một đoạn hội thoại', letter: 'một lá thư', paragraph: 'một đoạn văn' }[k]} có nghĩa.`],
  [/^Choose the word that best fits gap \((\d)\)\.$/, 'Đọc đoạn văn và chọn từ phù hợp nhất cho chỗ trống ($1).'],
  // IELTS
  [/^Choose the correct heading for paragraph (\w)\.$/, 'Chọn tiêu đề đúng cho đoạn $1.'],
  [/^Complete with NO MORE THAN TWO WORDS from the passage: (.+)$/, 'Điền KHÔNG QUÁ HAI TỪ lấy từ bài đọc: $1'],
  [/^Complete with ONE WORD from the passage: (.+)$/, 'Điền MỘT TỪ lấy từ bài đọc: $1'],
  [/^Complete with a NUMBER: (.+)$/, 'Điền một CON SỐ: $1'],
  [/^(Booking|Membership) form — (.+)$/, 'Nghe và điền vào phiếu (gõ câu trả lời, chú ý chính tả): $2'],
  [/^What number did you hear\?$/, 'Bạn nghe thấy số nào?'],
  [/^What time did you hear\?$/, 'Bạn nghe thấy mấy giờ?'],
  [/^How much is the ticket\?$/, 'Vé giá bao nhiêu?'],
  [/^How much does the ticket cost\?$/, 'Vé giá bao nhiêu?'],
  [/^What date did you hear\?$/, 'Bạn nghe thấy ngày nào?'],
  [/^What is the date of the party\?$/, 'Bữa tiệc vào ngày nào?'],
  [/^How is the surname spelled\?$/, 'Họ được đánh vần thế nào?'],
  [/^What is the phone number\?$/, 'Số điện thoại là gì?'],
  [/^How many people came in total\?$/, 'Tổng cộng có bao nhiêu người đến?'],
  [/^How many students joined in total\?$/, 'Tổng cộng có bao nhiêu học sinh tham gia?'],
  [/^How many visitors came in total\?$/, 'Tổng cộng có bao nhiêu khách đến?'],
  [/^How many more (\w+) (?:signed up|were sold) this year than last year\?$/, 'Năm nay nhiều hơn năm ngoái bao nhiêu?'],
  [/^What time will it start now\?$/, 'Bây giờ mấy giờ thì bắt đầu?'],
  [/^Which day did they finally choose\?$/, 'Cuối cùng họ chọn ngày nào?'],
  [/^Where will they meet\?$/, 'Họ sẽ gặp nhau ở đâu?'],
  [/^Who will (.+)\?$/, 'Ai sẽ làm việc đó?'],
  [/^Which thing do the students NOT need to bring\?$/, 'Học sinh KHÔNG cần mang theo thứ gì?'],
  [/^Why was (.+) cancelled\?$/, 'Vì sao sự kiện bị hủy?'],
  [/^How does the speaker feel\?$/, 'Người nói cảm thấy thế nào?'],
  [/^What is the main purpose of the talk\?$/, 'Mục đích chính của bài nói là gì?'],
  [/^Why is the speaker talking\?$/, 'Người nói nói để làm gì?'],
  [/^What is the passage mainly about\?$/, 'Đoạn văn chủ yếu nói về điều gì?'],
  [/^Choose the best heading\.$/, 'Chọn tiêu đề phù hợp nhất cho đoạn văn.'],
  [/True, False or Not Given\?$/, 'Theo đoạn văn, câu này Đúng (True), Sai (False) hay Không có thông tin (Not Given)?'],
  [/^What can we infer/, 'Ta có thể suy ra điều gì từ đoạn văn?'],
  [/^The writer's attitude/, 'Thái độ của tác giả là gì?'],
  // ── Maths ──
  [/^Solve: (.+)$/, 'Giải: $1'],
  [/^Simplify: (.+)$/, 'Rút gọn: $1'],
  [/^Expand: (.+)$/, 'Khai triển: $1'],
  [/^If x = (.+), find (.+)$/, 'Với x = $1, tính $2'],
  [/^What is (\d+)% of (\d+)\?$/, '$1% của $2 là bao nhiêu?'],
  [/^A price of (\d+) is increased by (\d+)%\. What is the new price\?$/, 'Giá $1 tăng thêm $2%. Giá mới là bao nhiêu?'],
  [/^A price of (\d+) is decreased by (\d+)%\. What is the new price\?$/, 'Giá $1 giảm $2%. Giá mới là bao nhiêu?'],
  [/^After a (\d+)% increase, a bike costs ([\d.]+)\. What was the original price\?$/, 'Sau khi tăng $1%, xe đạp có giá $2. Giá ban đầu là bao nhiêu?'],
  [/^Two angles of a triangle are (\d+)° and (\d+)°\. Find the third angle \(in degrees\)\.$/, 'Hai góc của một tam giác là $1° và $2°. Tìm góc thứ ba (độ).'],
  [/^Angles on a straight line: one is (\d+)°\. Find the other \(in degrees\)\.$/, 'Hai góc kề bù trên một đường thẳng: một góc là $1°. Tìm góc còn lại (độ).'],
  [/^What is the sum of interior angles of a (\d+)-sided polygon \(in degrees\)\?$/, 'Tổng các góc trong của đa giác $1 cạnh là bao nhiêu độ?'],
  [/^Each interior angle of a regular (\d+)-gon is how many degrees\?.*$/, 'Mỗi góc trong của đa giác đều $1 cạnh bằng bao nhiêu độ? (làm tròn 1 chữ số thập phân nếu cần)'],
  [/^A rectangle is (\d+) cm by (\d+) cm\. Find its area \(cm²\)\.$/, 'Hình chữ nhật có kích thước $1 cm × $2 cm. Tính diện tích (cm²).'],
  [/^A rectangle is (\d+) cm by (\d+) cm\. Find its perimeter \(cm\)\.$/, 'Hình chữ nhật có kích thước $1 cm × $2 cm. Tính chu vi (cm).'],
  [/^A triangle has base (\d+) cm and height (\d+) cm\. Find its area \(cm²\)\.$/, 'Tam giác có đáy $1 cm và chiều cao $2 cm. Tính diện tích (cm²).'],
  [/^A trapezium has parallel sides (\d+) cm and (\d+) cm, and height (\d+) cm\. Find its area \(cm²\)\.$/, 'Hình thang có hai đáy $1 cm và $2 cm, chiều cao $3 cm. Tính diện tích (cm²).'],
  [/^A right triangle has legs (\d+) and (\d+)\. How long is the hypotenuse\?$/, 'Tam giác vuông có hai cạnh góc vuông $1 và $2. Cạnh huyền dài bao nhiêu?'],
  [/^A right triangle has hypotenuse (\d+) and one leg (\d+)\. How long is the other leg\?$/, 'Tam giác vuông có cạnh huyền $1 và một cạnh góc vuông $2. Cạnh góc vuông còn lại dài bao nhiêu?'],
  [/^Circumference of a circle with radius (\d+) \(use π = 3\.14\)\?$/, 'Chu vi hình tròn bán kính $1 (lấy π = 3,14)?'],
  [/^Area of a circle with radius (\d+) \(use π = 3\.14\)\?$/, 'Diện tích hình tròn bán kính $1 (lấy π = 3,14)?'],
  [/^Find the mean of: (.+)$/, 'Tìm trung bình cộng của: $1'],
  [/^Find the median of: (.+)$/, 'Tìm trung vị của: $1'],
  [/^A bag has (\d+) red and (\d+) blue balls\. P\(red\) = \?$/, 'Túi có $1 quả bóng đỏ và $2 quả bóng xanh. Xác suất lấy được bóng đỏ = ?'],
  [/^Two fair coins are tossed\. P\(two heads\) = \?$/, 'Tung hai đồng xu cân đối. Xác suất cả hai mặt ngửa = ?'],
  [/^Two dice are rolled\. P\(sum = (\d+)\) = \?$/, 'Gieo hai con xúc xắc. Xác suất tổng bằng $1 = ?'],
  [/^You have (\d+) shirts and (\d+) pairs of trousers\. How many different outfits\?$/, 'Bạn có $1 áo và $2 quần. Có bao nhiêu cách phối đồ khác nhau?'],
  [/^In how many ways can (\d+) friends stand in a line\?$/, 'Có bao nhiêu cách xếp $1 người bạn thành một hàng?'],
  [/^(\d+) players each shake hands once with every other player\. How many handshakes\?$/, '$1 người chơi, mỗi người bắt tay mỗi người khác đúng một lần. Có bao nhiêu cái bắt tay?'],
  [/^Lan buys (\d+) pens at ([\d,]+) VND each\. How much does she pay \(VND\)\?$/, 'Lan mua $1 cây bút, mỗi cây $2 đồng. Lan phải trả bao nhiêu (đồng)?'],
  [/^Minh is (\d+) times as old as his sister\. Together they are (\d+) years old\. How old is the sister\?$/, 'Tuổi Minh gấp $1 lần tuổi em gái. Tổng tuổi hai người là $2. Em gái bao nhiêu tuổi?'],
  [/^A train travels at (\d+) km\/h for (\d+) hours and then (\d+) km\/h for 1 hour\. Total distance \(km\)\?$/, 'Tàu chạy $1 km/h trong $2 giờ, rồi $3 km/h trong 1 giờ. Tổng quãng đường (km)?'],
  [/^A rectangle's length is (\d+) cm more than its width\. Its perimeter is (\d+) cm\. Find the width \(cm\)\.$/, 'Chiều dài hình chữ nhật hơn chiều rộng $1 cm. Chu vi là $2 cm. Tìm chiều rộng (cm).'],
  // ── Logic ──
  [/^What comes next\? (.+)$/, 'Số tiếp theo là gì? $1'],
  [/^You face (\w+)\. You (.+)\. Which way are you facing now\?$/, (_m, d, turns) =>
    `Bạn đang quay mặt về hướng ${DIR[d] ?? d}. Bạn ${turns.split(', then ').map((t) => TURN[t] ?? t).join(', rồi ')}. Bây giờ bạn quay về hướng nào?`],
  [/^((?:\w+ is taller than \w+\. )+)Who is the (tallest|shortest|second tallest)\?$/, (_m, clues, ask) =>
    `${clues.trim().replace(/(\w+) is taller than (\w+)\./g, '$1 cao hơn $2.')} Ai ${ask === 'tallest' ? 'cao nhất' : ask === 'shortest' ? 'thấp nhất' : 'cao thứ hai'}?`],
  [/Which MUST be true\?$/, 'Điều nào CHẮC CHẮN đúng?'],
];

/** Vietnamese version of a prompt's instruction, or null when there is nothing useful to add. */
export function translatePrompt(prompt: string, conceptId: string): string | null {
  if (conceptId.startsWith('lit.') || conceptId.startsWith('custom.lit.')) return null; // already Vietnamese
  for (const [re, out] of RULES) {
    const m = prompt.match(re);
    if (m) return typeof out === 'string' ? out.replace(/\$(\d)/g, (_x, i) => m[+i] ?? '') : out(...m);
  }
  if (prompt.includes('___')) {
    if (conceptId.startsWith('en.grammar')) return 'Chọn dạng đúng để điền vào chỗ trống (chú ý thì, chủ ngữ và dấu hiệu thời gian).';
    return 'Chọn đáp án đúng để điền vào chỗ trống.';
  }
  if (conceptId.startsWith('en.listening')) return 'Nghe đoạn âm thanh và chọn đáp án đúng. Có thể nghe lại (phím R).';
  if (conceptId.startsWith('en.reading')) return 'Đọc đoạn văn trên phiến đá và chọn đáp án đúng.';
  if (conceptId === 'en.ielts.listening') return 'Nghe đoạn ghi âm và chọn đáp án đúng.';
  if (conceptId === 'en.ielts.reading') return 'Đọc bài và chọn đáp án đúng.';
  return null;
}

/** Vietnamese versions of the templated explanations used by the generators. */
const EXPLAIN: Rule[] = [
  [/^"(.+)" is a finished time → past simple\.$/, '"$1" là thời điểm đã kết thúc → dùng thì quá khứ đơn.'],
  [/^Have\/has \+ past participle \(present perfect\) for life experience\.$/, 'Kinh nghiệm sống ("đã từng") → hiện tại hoàn thành: have/has + quá khứ phân từ (V3).'],
  [/^already \+ present perfect: have\/has \+ past participle\.$/, '"already" → hiện tại hoàn thành: have/has + V3.'],
  [/^"yet" in negatives → present perfect: (.+?) \+ past participle\.(.*)$/, (_m, h, s3) => `"yet" trong câu phủ định → hiện tại hoàn thành: ${h} + V3.${s3 ? ' Chủ ngữ số ít → hasn\'t.' : ''}`],
  [/^An action finished before another past action → past perfect/, 'Hành động xảy ra TRƯỚC một hành động khác trong quá khứ → quá khứ hoàn thành (had + V3).'],
  [/^"By \+ future time" → future perfect/, '"By + thời điểm tương lai" → tương lai hoàn thành: will have + V3.'],
  [/^Passive = be \((.+)\) \+ past participle/, 'Câu bị động = be ($1) + quá khứ phân từ (V3). Chủ ngữ không tự thực hiện hành động.'],
  [/^"who" is for people\.$/, '"who" dùng cho người.'],
  [/^"which" is for things\.$/, '"which" dùng cho vật.'],
  [/^"where" is for places/, '"where" dùng cho nơi chốn (= in which).'],
  [/^"whose" shows possession/, '"whose" chỉ sự sở hữu (của ai).'],
  [/^With commas \(extra information\) we never use "that"\.$/, 'Mệnh đề có dấu phẩy (thông tin thêm) không bao giờ dùng "that".'],
  [/^First conditional/, 'Câu điều kiện loại 1 (có thể xảy ra): If + hiện tại, will + V.'],
  [/^Second conditional/, 'Câu điều kiện loại 2 (không có thật ở hiện tại): If + quá khứ, would + V.'],
  [/^Third conditional/, 'Câu điều kiện loại 3 (không có thật trong quá khứ): If + had + V3, would have + V3.'],
  [/^as \+ adjective \+ as/, 'as + tính từ nguyên mẫu + as (không thêm -er / more).'],
  [/^Long adjective → more \+ adjective\.$/, 'Tính từ dài → more + tính từ.'],
  [/^Short adjective → (.+)\.$/, 'Tính từ ngắn → thêm -er: $1.'],
  [/^the \+ superlative: (.+)\.$/, 'So sánh nhất: the + $1.'],
  [/^The gap needs a (noun|verb|adjective|adverb)\.$/, (_m, p) => `Chỗ trống cần một ${{ noun: 'danh từ', verb: 'động từ', adjective: 'tính từ', adverb: 'trạng từ' }[p]}.`],
  [/^"(.+)" ≈ "(.+)"\. IELTS often paraphrases like this\.$/, '"$1" ≈ "$2". Bài thi IELTS thường diễn đạt lại (paraphrase) như vậy.'],
  [/^We say "(.+)"$/, 'Cụm từ đúng: "$1"'],
  [/^Brackets first, then the power/, 'Làm trong ngoặc trước, rồi luỹ thừa, rồi nhân, cuối cùng là trừ.'],
  [/^Use a common denominator before adding\.$/, 'Quy đồng mẫu số trước khi cộng.'],
  [/^Dividing by a fraction/, 'Chia cho một phân số = nhân với phân số đảo ngược.'],
  [/^Multiply numerators and denominators\.$/, 'Nhân tử với tử, mẫu với mẫu.'],
  [/^Collect the x terms on one side/, 'Chuyển các hạng tử chứa x về một vế, các số về vế kia.'],
  [/^Dividing by a negative number flips/, 'Chia cho số âm thì phải đổi chiều bất đẳng thức.'],
  [/^Sort first, then take the middle value\.$/, 'Sắp xếp các số trước, rồi lấy số ở giữa.'],
  [/^"All A are B" does not mean "all B are A"\.$/, '"Mọi A là B" không có nghĩa là "mọi B là A".'],
  [/^Order: (.+)$/, 'Thứ tự: $1'],
  [/^(.+?) has stress on the (\w+) syllable; (.+) on the (\w+)\.$/, (_m, odd, a, rest, b) => `${odd} có trọng âm ở âm tiết thứ ${ORD_VI[a] ?? a}; ${rest} ở âm tiết thứ ${ORD_VI[b] ?? b}. (Chữ IN HOA là âm tiết được nhấn.)`],
  [/^(-ed|-s\/-es): (.+) → (\S+); (\S+) → (\S+)\.$/, '$1: $2 đọc là $3; $4 đọc là $5.'],
  [/^"(\w+)": (.+) → (.+); (\S+) → (.+)\.$/, (_m, l, same, a, odd, b) => `"${l}": ${same} đọc là ${a.replace('silent (not pronounced)', 'âm câm (không đọc)')}; ${odd} đọc là ${b.replace('silent (not pronounced)', 'âm câm (không đọc)')}.`],
  [/^You heard "(\w+)", not "(\w+)": (.+)\.$/, 'Em đã nghe "$1", không phải "$2": $3.'],
];

export function translateExplanation(text: string | undefined): string | null {
  if (!text) return null;
  for (const [re, out] of EXPLAIN) {
    const m = text.match(re);
    if (m) return typeof out === 'string' ? out.replace(/\$(\d)/g, (_x, i) => m[+i] ?? '') : out(...m);
  }
  return null;
}

/** Lessons in Vietnamese (shown with the English lesson as a teaching note). */
export const LESSONS_VI: Record<string, string> = {
  ...ieltsTopicLessonsVi,
  'en.grammar.word-order':
    'Trật tự câu tiếng Anh: Chủ ngữ + Động từ + Tân ngữ + Nơi chốn + Thời gian ("I met Lan at school yesterday"). Trạng từ tần suất đứng trước động từ thường nhưng sau "be" ("She often walks", "He is always late"). Câu hỏi: (Từ để hỏi) + trợ động từ + chủ ngữ + động từ ("Where do you live?"). Tính từ chỉ quan điểm đứng trước kích cỡ, tuổi, màu sắc ("a lovely small old house").',
  'en.vocab.everyday': 'Học từ theo nhóm chủ đề (đồ ăn, du lịch, trường học). Đặt câu với mỗi từ về chính cuộc sống của em.',
  'en.vocab.synonyms': 'Đề IELTS hiếm khi lặp lại đúng từ trong bài. "Rapid" trong câu hỏi có thể là "fast" trong bài đọc.',
  'en.vocab.academic': 'Từ học thuật như "significant", "evidence", "impact" xuất hiện trong hầu hết bài đọc IELTS.',
  'en.vocab.collocations': 'Ta nói "make a decision" nhưng "do homework". Hãy học động từ đi kèm với danh từ.',
  'en.vocab.word-forms': 'Hậu tố cho biết loại từ: -tion (danh từ), -ive/-ful (tính từ), -ly (trạng từ), -ise/-ify (động từ).',
  'en.grammar.tenses': 'Thời điểm đã kết thúc (yesterday, in 2020) → quá khứ đơn. Kinh nghiệm hoặc "since/for/yet/already" → hiện tại hoàn thành.',
  'en.grammar.passive': 'Bị động = be (chia đúng thì) + V3. Dùng khi hành động quan trọng hơn người làm.',
  'en.grammar.relative': 'who = người, which = vật, whose = sở hữu, where = nơi chốn. Có dấu phẩy thì không dùng "that".',
  'en.grammar.conditionals': 'Loại 1: If + hiện tại, will. Loại 2: If + quá khứ, would. Loại 3: If + had V3, would have V3.',
  'en.grammar.modals': 'Suy đoán: must (chắc chắn đúng), might/could (có thể), can\'t (chắc chắn không). Sau động từ khuyết thiếu là động từ nguyên mẫu.',
  'en.grammar.comparatives': 'Tính từ ngắn: -er / -est. Tính từ dài: more / the most. Bất quy tắc: good–better–best, bad–worse–worst.',
  'en.listening.numbers': 'Nghe trọng âm: thirTEEN và THIRty. Viết số bằng chữ số khi nghe.',
  'en.listening.details': 'Người nói hay đổi ý: "Tuesday… no, actually Wednesday". Đáp án thường là ý cuối cùng.',
  'en.listening.main-idea': 'Tự hỏi: người nói nói để làm gì? Phàn nàn, giải thích, thuyết phục hay khuyên?',
  'en.reading.main-idea': 'Đọc câu đầu và câu cuối đoạn trước. Ý chính bao quát cả đoạn, không phải một chi tiết.',
  'en.reading.paraphrase': 'So nghĩa, không so từ. "Numbers fell sharply" = "there was a significant decline".',
  'en.reading.inference': 'Suy luận phải dựa vào manh mối trong bài — không dựa vào ý kiến riêng.',
  'en.reading.tfng': 'FALSE = bài nói ngược lại. NOT GIVEN = bài không nhắc tới. Không dùng kiến thức bên ngoài.',
  'math.number.integers': 'Ngoặc → Luỹ thừa → Nhân, chia (trái sang phải) → Cộng, trừ (trái sang phải).',
  'math.number.fractions': 'Cộng phân số: quy đồng mẫu số. Nhân: tử nhân tử, mẫu nhân mẫu.',
  'math.number.percent': 'x% của N = N × x ÷ 100. Tăng 20% nghĩa là nhân 1,2.',
  'math.number.powers': 'aᵐ × aⁿ = aᵐ⁺ⁿ. √(n²) = n.',
  'math.algebra.expressions': 'Chỉ cộng được các hạng tử đồng dạng: 3x + 2x = 5x, còn 3x + 2y giữ nguyên.',
  'math.algebra.linear': 'Làm cùng một phép tính ở cả hai vế. Chuyển cộng/trừ trước, rồi đến nhân/chia.',
  'math.algebra.inequalities': 'Giải như phương trình, nhưng đổi chiều < / > khi nhân hoặc chia cho số âm.',
  'math.algebra.systems': 'Cộng hoặc trừ hai phương trình để khử một ẩn, rồi thế lại.',
  'math.algebra.quadratics': 'Tìm hai số có tích bằng c và tổng bằng b. Rồi (x + p)(x + q) = 0.',
  'math.geometry.angles': 'Tổng ba góc tam giác: 180°. Góc bẹt: 180°. Quanh một điểm: 360°. Tổng góc trong đa giác: (n − 2) × 180°.',
  'math.geometry.area': 'Tam giác = ½ × đáy × cao. Hình thang = ½ × (a + b) × h.',
  'math.geometry.pythagoras': 'Cạnh huyền là cạnh dài nhất, đối diện góc vuông: c² = a² + b².',
  'math.geometry.circles': 'C = 2πr, S = πr². Lấy π ≈ 3,14.',
  'math.stats.average': 'Trung bình cộng = tổng ÷ số lượng. Trung vị = số ở giữa sau khi sắp xếp.',
  'math.stats.probability': 'Xác suất = số kết quả thuận lợi ÷ tổng số kết quả. Hai biến cố độc lập: nhân.',
  'math.combinatorics.counting': 'Lựa chọn thứ nhất có m cách, thứ hai có n cách → tổng cộng m × n cách.',
  'math.reasoning.word-problems': 'Gọi ẩn (đặt x = …), lập phương trình, giải, rồi kiểm tra đáp án có hợp lý không.',
  'en.pron.stress': 'Danh từ và tính từ 2 âm tiết thường nhấn âm thứ nhất (HAP-py, TA-ble); động từ 2 âm tiết thường nhấn âm thứ hai (be-GIN, de-CIDE). Từ tận cùng -tion, -sion, -ic: nhấn âm ngay trước đuôi (in-for-MA-tion). Đuôi -ee, -eer, -oo nhận trọng âm (vol-un-TEER). Đuôi -ity, -logy, -graphy: nhấn âm thứ 3 từ cuối lên (a-BIL-i-ty).',
  'en.pron.endings': 'Đuôi -ed: đọc /ɪd/ sau t, d (want-ed); đọc /t/ sau âm vô thanh p, k, f, s, sh, ch, x (watch-ed); còn lại đọc /d/ (play-ed). Đuôi -s/-es: đọc /ɪz/ sau s, z, sh, ch, ge, x (watch-es); đọc /s/ sau p, t, k, f, th (book-s); còn lại đọc /z/ (dog-s).',
  'en.pron.sounds': 'Chữ viết và âm đọc trong tiếng Anh không phải lúc nào cũng khớp. Nhớ các mẫu thường gặp: ch = /tʃ/ (church) nhưng /k/ trong từ khoa học (chemistry, school); ea = /iː/ (meat) nhưng /e/ trong bread, head, heavy; oo = /uː/ (food) nhưng /ʊ/ trong book, look, good; th = /θ/ (think) hoặc /ð/ (this). Hãy đọc to các từ — tai em sẽ giúp em.',
  'en.pron.pairs': 'Các cặp như ship/sheep chỉ khác nhau một âm. /iː/ dài, miệng cười; /ɪ/ ngắn và thả lỏng. Phụ âm cuối rất quan trọng: bike ≠ bite ≠ bye. /θ/ (think): đặt lưỡi giữa hai hàm răng.',
  'en.exam.communication': 'Chọn theo chức năng câu nói, không chỉ theo từ. Cảm ơn → "You\'re welcome." Lời mời → "That\'s a great idea / I\'d love to." Nhờ vả "Could you…?" → "Sure." Chú ý: "Do you mind…?" / "Would you mind…?" → trả lời "No / Not at all" nghĩa là ĐỒNG Ý.',
  'en.exam.signs': 'Biển báo dùng rất ít từ. "NO + -ing" = không được phép. "KEEP OFF" = không giẫm lên. "STAFF ONLY" = chỉ nhân viên. Chọn câu diễn đạt cùng ý bằng một câu đầy đủ.',
  'en.exam.transformation': 'Kiểm tra cả NGHĨA và NGỮ PHÁP. Các cặp hay gặp: "started … ago" = "have … for"; "too … to" = "not … enough to"; "It\'s a pity …" = "I wish …"; "although + mệnh đề" = "despite + danh từ / V-ing"; "If … not" = "Unless …".',
  'en.exam.combination': 'Trước hết xác định quan hệ giữa hai ý: tương phản (although), nguyên nhân (because), kết quả (so … that), điều kiện (if) hay bổ sung thông tin (who/which/whose). Sau đó kiểm tra ngữ pháp — không lặp lại đại từ sau which/who.',
  'en.exam.arrange': 'Tìm câu mở đầu: lời chào, câu hỏi hoặc câu chủ đề. Rồi lần theo mối nối — câu hỏi đi trước câu trả lời; các từ "Firstly, Then, However, Finally" cho biết thứ tự; đại từ (it, they, there) chỉ lại điều đã nhắc trước đó.',
  'en.exam.cloze': 'Đọc cả câu, không chỉ chỗ trống. Hỏi: cần loại từ gì? Có giới từ hay từ nối nào quyết định đáp án không? Sau đó đọc lại câu với đáp án của em.',
  'en.reading.detail': 'Gạch chân từ khoá trong câu hỏi (số, tên, ngày tháng) rồi dò tìm trong bài. Câu hỏi "it / they / this" chỉ gì: xem câu ngay trước đó. Câu "NOT mentioned": kiểm tra từng đáp án với bài đọc.',
  'en.ielts.reading': 'Đọc câu hỏi trước, rồi đọc lướt bài. Với câu chọn tiêu đề, đọc hai câu đầu mỗi đoạn. Với câu điền từ, chép đúng từ trong bài và tuân thủ giới hạn số từ ("NO MORE THAN TWO WORDS").',
  'en.ielts.listening': 'Đọc câu hỏi trước khi nghe và đoán loại đáp án (con số? tên riêng?). Đáp án xuất hiện theo thứ tự. Chính tả rất quan trọng — tên riêng thường được đánh vần từng chữ cái. Cẩn thận khi người nói đổi ý.',
  'logic.patterns': 'Xem hiệu giữa các số. Nếu hiệu không đều, xét tỉ số hoặc hiệu của các hiệu.',
  'logic.deduction': '"Mọi A là B" không có nghĩa là "mọi B là A". Chỉ kết luận điều chắc chắn đúng.',
  'logic.spatial': 'Xoay từng bước một. Rẽ phải 90° bốn lần sẽ quay về hướng ban đầu.',
  'logic.chess': 'Ưu tiên các nước ép buộc: chiếu, ăn quân, đe doạ.',
  'logic.sequence': 'Vẽ một đường thẳng và đặt các dữ kiện chắc chắn trước, rồi thử các khả năng còn lại.',
};
