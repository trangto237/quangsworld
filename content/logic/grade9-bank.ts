import { makeBank } from '../helpers';

/**
 * More grade 9 (thi vào 10 Hà Nội) level questions, difficulty 3–5.
 * Olympiad-flavoured but fair. Every puzzle has exactly one answer (ordering and
 * knights-and-knaves puzzles were checked by brute force over all cases).
 * Each item carries its own Vietnamese prompt and explanation, since the rule-based
 * translator only knows the generator prompt patterns.
 */
const { add, list } = makeBank('Atlas grade 9 bank', 'g9-');

function q(conceptId: string, difficulty: number, prompt: string, promptVi: string, choices: string[], explanation: string, explanationVi: string) {
  add(conceptId, difficulty, prompt, choices, { explanation });
  const item = list[list.length - 1];
  item.promptVi = promptVi;
  item.explanationVi = explanationVi;
}

// ── Patterns ────────────────────────────────────────────
const P = 'logic.patterns';
q(P, 3, 'What comes next? 5, 8, 13, 20, 29, ?', 'Số tiếp theo là gì? 5, 8, 13, 20, 29, ?', ['40', '38', '41', '39'],
  'Differences 3, 5, 7, 9, so next difference is 11: 29 + 11 = 40. (Also n² + 4.)', 'Hiệu: 3, 5, 7, 9 → hiệu tiếp theo là 11: 29 + 11 = 40. (Cũng là n² + 4.)');
q(P, 3, 'What comes next? 2, 3, 5, 9, 17, ?', 'Số tiếp theo là gì? 2, 3, 5, 9, 17, ?', ['33', '25', '34', '31'],
  'Differences double: 1, 2, 4, 8, 16. So 17 + 16 = 33.', 'Hiệu gấp đôi: 1, 2, 4, 8, 16. Vậy 17 + 16 = 33.');
q(P, 3, 'What comes next? 1, 8, 27, 64, ?', 'Số tiếp theo là gì? 1, 8, 27, 64, ?', ['125', '100', '81', '216'],
  'Cubes: 1³, 2³, 3³, 4³, so 5³ = 125.', 'Lập phương: 1³, 2³, 3³, 4³ → 5³ = 125.');
q(P, 3, 'What comes next? 3, 4, 7, 11, 18, 29, ?', 'Số tiếp theo là gì? 3, 4, 7, 11, 18, 29, ?', ['47', '40', '45', '58'],
  'Each term is the sum of the two before it (like Fibonacci): 18 + 29 = 47.', 'Mỗi số bằng tổng hai số đứng trước (giống dãy Fibonacci): 18 + 29 = 47.');
q(P, 3, 'What comes next? 7, 10, 9, 12, 11, 14, ?', 'Số tiếp theo là gì? 7, 10, 9, 12, 11, 14, ?', ['13', '17', '15', '16'],
  'Alternately +3 and −1: 14 − 1 = 13.', 'Xen kẽ +3 rồi −1: 14 − 1 = 13.');
q(P, 3, 'What comes next? 2, 5, 10, 17, 26, ?', 'Số tiếp theo là gì? 2, 5, 10, 17, 26, ?', ['37', '35', '36', '39'],
  'Each term is n² + 1: 1+1, 4+1, 9+1, 16+1, 25+1, so 36 + 1 = 37.', 'Mỗi số bằng n² + 1: 1+1, 4+1, 9+1, 16+1, 25+1 → 36 + 1 = 37.');
q(P, 4, 'What comes next? 2, 10, 4, 20, 6, 30, ?', 'Số tiếp theo là gì? 2, 10, 4, 20, 6, 30, ?', ['8', '40', '36', '7'],
  'Two sequences take turns: 2, 4, 6, 8 … and 10, 20, 30 … The next term belongs to the first one: 8.', 'Hai dãy đan xen: 2, 4, 6, 8… và 10, 20, 30… Số tiếp theo thuộc dãy thứ nhất: 8.');
q(P, 4, 'What comes next? A, C, F, J, O, ?', 'Chữ cái tiếp theo là gì? A, C, F, J, O, ?', ['U', 'T', 'V', 'S'],
  'Positions 1, 3, 6, 10, 15: the jumps are 2, 3, 4, 5, so next is 15 + 6 = 21 → U.', 'Vị trí trong bảng chữ cái: 1, 3, 6, 10, 15; bước nhảy 2, 3, 4, 5 → tiếp theo 15 + 6 = 21 → U.');
q(P, 4, 'What comes next? 0, 3, 8, 15, 24, ?', 'Số tiếp theo là gì? 0, 3, 8, 15, 24, ?', ['35', '33', '36', '48'],
  'Each term is n² − 1: 1−1, 4−1, 9−1, 16−1, 25−1, so 36 − 1 = 35.', 'Mỗi số bằng n² − 1 → 36 − 1 = 35.');
q(P, 4, 'What comes next? 2, 5, 11, 23, 47, ?', 'Số tiếp theo là gì? 2, 5, 11, 23, 47, ?', ['95', '94', '71', '96'],
  'Each term is double the previous plus 1: 47 × 2 + 1 = 95.', 'Mỗi số bằng số trước nhân 2 cộng 1: 47 × 2 + 1 = 95.');
q(P, 4, 'What comes next? 1, 4, 13, 40, ?', 'Số tiếp theo là gì? 1, 4, 13, 40, ?', ['121', '120', '160', '81'],
  'Each term is three times the previous plus 1: 40 × 3 + 1 = 121.', 'Mỗi số bằng số trước nhân 3 cộng 1: 40 × 3 + 1 = 121.');
q(P, 5, 'What comes next? 1, 3, 8, 17, 31, ?', 'Số tiếp theo là gì? 1, 3, 8, 17, 31, ?', ['51', '45', '49', '52'],
  'Differences 2, 5, 9, 14; their differences are 3, 4, 5. Next difference is 14 + 6 = 20, so 31 + 20 = 51.', 'Hiệu: 2, 5, 9, 14; hiệu của các hiệu: 3, 4, 5. Hiệu tiếp theo là 14 + 6 = 20 → 31 + 20 = 51.');
q(P, 5, 'What comes next? 1, 2, 3, 6, 11, 20, 37, ?', 'Số tiếp theo là gì? 1, 2, 3, 6, 11, 20, 37, ?', ['68', '57', '74', '64'],
  'Each term is the sum of the three before it: 11 + 20 + 37 = 68.', 'Mỗi số bằng tổng ba số đứng trước: 11 + 20 + 37 = 68.');
q(P, 5, 'What comes next? Z, X, U, Q, L, ?', 'Chữ cái tiếp theo là gì? Z, X, U, Q, L, ?', ['F', 'G', 'E', 'H'],
  'Positions 26, 24, 21, 17, 12: going back 2, 3, 4, 5, so next is 12 − 6 = 6 → F.', 'Vị trí: 26, 24, 21, 17, 12; lùi 2, 3, 4, 5 → tiếp theo 12 − 6 = 6 → F.');
q(P, 5, 'What comes next? 1, 4, 27, 256, ?', 'Số tiếp theo là gì? 1, 4, 27, 256, ?', ['3125', '625', '1024', '3025'],
  'The terms are 1¹, 2², 3³, 4⁴, so next is 5⁵ = 3125.', 'Các số là 1¹, 2², 3³, 4⁴ → tiếp theo 5⁵ = 3125.');
q(P, 5, 'What comes next? 1, 11, 21, 1211, 111221, ?', 'Số tiếp theo là gì? 1, 11, 21, 1211, 111221, ?', ['312211', '1112221', '211221', '311221'],
  '"Look and say": each term describes the one before. 111221 is "three 1s, two 2s, one 1" → 31 22 11 = 312211.', 'Dãy "nhìn và đọc": mỗi số mô tả số trước. 111221 có "ba chữ 1, hai chữ 2, một chữ 1" → 31 22 11 = 312211.');

// ── Deduction ───────────────────────────────────────────
const D = 'logic.deduction';
q(D, 3, 'Some members of the chess club are musicians. Every musician practises every day. Which MUST be true?', 'Một số thành viên câu lạc bộ cờ vua là nhạc công. Mọi nhạc công đều luyện tập hằng ngày. Điều nào CHẮC CHẮN đúng?',
  ['Some members of the chess club practise every day.', 'All members of the chess club practise every day.', 'Everyone who practises every day is a musician.', 'No member of the chess club practises every day.'],
  'The members who are musicians must practise every day, so at least some club members do.', 'Những thành viên là nhạc công chắc chắn luyện tập hằng ngày, nên ít nhất một số thành viên câu lạc bộ luyện tập hằng ngày.');
q(D, 3, 'If Lan wins the race, she gets a medal. Lan did not get a medal. Which MUST be true?', 'Nếu Lan thắng cuộc đua thì Lan được huy chương. Lan không được huy chương. Điều nào CHẮC CHẮN đúng?',
  ['Lan did not win the race.', 'Lan won the race.', 'Someone else got a medal.', 'Nothing can be concluded.'],
  'If winning always gives a medal, then no medal means no win.', 'Nếu thắng thì chắc chắn có huy chương; không có huy chương nghĩa là không thắng.');
q(D, 3, 'If it is Sunday, the shop is closed. The shop is closed today. Which MUST be true?', 'Nếu là Chủ nhật thì cửa hàng đóng cửa. Hôm nay cửa hàng đóng cửa. Điều nào CHẮC CHẮN đúng?',
  ['Nothing certain — it may or may not be Sunday.', 'Today is Sunday.', 'Today is not Sunday.', 'The shop is closed every day.'],
  'The shop could be closed for another reason. "If A then B" does not mean "if B then A".', 'Cửa hàng có thể đóng cửa vì lí do khác. "Nếu A thì B" không có nghĩa là "nếu B thì A".');
q(D, 3, 'No reptiles have fur. All snakes are reptiles. Which MUST be true?', 'Không loài bò sát nào có lông mao. Mọi loài rắn đều là bò sát. Điều nào CHẮC CHẮN đúng?',
  ['No snakes have fur.', 'Some snakes have fur.', 'All reptiles are snakes.', 'Some animals with fur are snakes.'],
  'Snakes are inside the group of reptiles, and no reptile has fur, so no snake has fur.', 'Rắn nằm trong nhóm bò sát, mà không bò sát nào có lông mao, nên không con rắn nào có lông mao.');
q(D, 3, 'Every student who passed the test studied for it. Minh did not study. Which MUST be true?', 'Mọi học sinh qua bài kiểm tra đều đã ôn bài. Minh không ôn bài. Điều nào CHẮC CHẮN đúng?',
  ['Minh did not pass the test.', 'Minh passed the test.', 'Everyone who studied passed.', 'Nothing can be concluded.'],
  'Passing needs studying. Minh did not study, so he cannot be among those who passed.', 'Qua bài thì chắc chắn đã ôn. Minh không ôn nên Minh không thể qua bài.');
q(D, 4, 'Knights always tell the truth, knaves always lie. A says: "At least one of us is a knave." What are A and B?', 'Hiệp sĩ luôn nói thật, kẻ gian luôn nói dối. A nói: "Ít nhất một trong hai chúng tôi là kẻ gian." A và B là ai?',
  ['A is a knight, B is a knave.', 'A is a knave, B is a knight.', 'Both are knaves.', 'Both are knights.'],
  'If A were a knave, the statement would be true (A is a knave) — but knaves cannot say true things. So A is a knight, the statement is true, and B must be the knave.',
  'Nếu A là kẻ gian thì câu nói đúng (vì A là kẻ gian) — mâu thuẫn. Vậy A là hiệp sĩ, câu nói đúng, nên B là kẻ gian.');
q(D, 4, 'Knights always tell the truth, knaves always lie. A says: "We are both knaves." What are A and B?', 'Hiệp sĩ luôn nói thật, kẻ gian luôn nói dối. A nói: "Cả hai chúng tôi đều là kẻ gian." A và B là ai?',
  ['A is a knave, B is a knight.', 'A is a knight, B is a knave.', 'Both are knaves.', 'Both are knights.'],
  'A knight could never say "I am a knave", so A is a knave and the statement is false. "Both are knaves" is false, so B is a knight.',
  'Hiệp sĩ không thể tự nhận là kẻ gian, nên A là kẻ gian và câu nói sai. "Cả hai là kẻ gian" sai → B là hiệp sĩ.');
q(D, 4, 'All squares are rectangles. Some rectangles are not squares. Shape K is not a rectangle. Which MUST be true?', 'Mọi hình vuông đều là hình chữ nhật. Có hình chữ nhật không phải hình vuông. Hình K không phải hình chữ nhật. Điều nào CHẮC CHẮN đúng?',
  ['Shape K is not a square.', 'Shape K is a square.', 'Shape K is a triangle.', 'Nothing can be concluded.'],
  'Every square is a rectangle, so something that is not a rectangle cannot be a square. We do not know what K actually is.', 'Hình vuông nào cũng là hình chữ nhật, nên K không phải hình chữ nhật thì không thể là hình vuông. Ta không biết K cụ thể là hình gì.');
q(D, 4, 'If the alarm rings, Huy wakes up. If Huy wakes up, he eats breakfast. Huy did not eat breakfast. Which MUST be true?', 'Nếu chuông báo thức reo thì Huy thức dậy. Nếu Huy thức dậy thì Huy ăn sáng. Huy không ăn sáng. Điều nào CHẮC CHẮN đúng?',
  ['The alarm did not ring.', 'The alarm rang.', 'Huy woke up.', 'Nothing can be concluded.'],
  'No breakfast → Huy did not wake up → the alarm did not ring (each step goes backwards along the chain).', 'Không ăn sáng → Huy không thức dậy → chuông không reo (suy ngược từng bước).');
q(D, 4, 'One of three boxes holds a prize. Red: "The prize is in the blue box." Blue: "The prize is not here." Green: "The prize is here." Exactly ONE label is false. Where is the prize?', 'Một trong ba hộp có phần thưởng. Hộp đỏ: "Phần thưởng ở hộp xanh dương." Hộp xanh dương: "Phần thưởng không ở đây." Hộp xanh lá: "Phần thưởng ở đây." Có đúng MỘT nhãn sai. Phần thưởng ở đâu?',
  ['Green box', 'Red box', 'Blue box', 'Cannot tell'],
  'Prize in green: only Red is false (one false). Prize in red: Red and Green false (two). Prize in blue: Blue and Green false (two).', 'Ở hộp xanh lá: chỉ nhãn đỏ sai (một nhãn). Ở hộp đỏ: nhãn đỏ và xanh lá sai (hai). Ở hộp xanh dương: nhãn xanh dương và xanh lá sai (hai).');
q(D, 4, 'In a class of 30, every student likes football or badminton (or both). 18 like football and 15 like badminton. How many like both?', 'Lớp có 30 học sinh, ai cũng thích bóng đá hoặc cầu lông (hoặc cả hai). 18 bạn thích bóng đá, 15 bạn thích cầu lông. Bao nhiêu bạn thích cả hai?',
  ['3', '33', '12', '15'],
  '18 + 15 = 33 counts the "both" students twice. 33 − 30 = 3.', '18 + 15 = 33 đã đếm hai lần những bạn thích cả hai. 33 − 30 = 3.');
q(D, 4, 'A drawer has 10 red and 10 blue socks. In the dark, how many socks must you take to be SURE of a matching pair?', 'Ngăn kéo có 10 chiếc tất đỏ và 10 chiếc tất xanh. Trong bóng tối, phải lấy ít nhất bao nhiêu chiếc để CHẮC CHẮN có một đôi cùng màu?',
  ['3', '2', '11', '4'],
  'With 2 socks you might get one of each colour. A 3rd sock must match one of them (pigeonhole principle).', 'Lấy 2 chiếc có thể ra mỗi màu một chiếc. Chiếc thứ 3 chắc chắn trùng màu với một trong hai (nguyên lí Dirichlet).');
q(D, 5, 'A drawer has 10 red and 10 blue socks. In the dark, how many socks must you take to be SURE of getting two RED socks?', 'Ngăn kéo có 10 chiếc tất đỏ và 10 chiếc tất xanh. Trong bóng tối, phải lấy ít nhất bao nhiêu chiếc để CHẮC CHẮN có hai chiếc tất ĐỎ?',
  ['12', '3', '11', '20'],
  'In the worst case you first take all 10 blue socks. Then 2 more are needed: 10 + 2 = 12.', 'Trường hợp xấu nhất: lấy hết 10 chiếc xanh trước. Sau đó cần thêm 2 chiếc: 10 + 2 = 12.');
q(D, 5, 'Knights always tell the truth, knaves always lie. A says: "B is a knight." B says: "A and I are different types." What are A and B?', 'Hiệp sĩ luôn nói thật, kẻ gian luôn nói dối. A nói: "B là hiệp sĩ." B nói: "A và tôi khác loại nhau." A và B là ai?',
  ['Both are knaves.', 'Both are knights.', 'A is a knight, B is a knave.', 'A is a knave, B is a knight.'],
  'If A is a knight, B is a knight too — but then B\'s claim "we are different" is false. So A is a knave, B is not a knight, so B is a knave; B\'s claim is then false, which fits.',
  'Nếu A là hiệp sĩ thì B cũng là hiệp sĩ — nhưng khi đó câu "chúng tôi khác loại" của B sai, mâu thuẫn. Vậy A là kẻ gian, B không phải hiệp sĩ → B là kẻ gian; câu của B sai, phù hợp.');
q(D, 5, 'Knights always tell the truth, knaves always lie. A says: "B is a knave." B says: "C is a knave." C says: "A and B are both knaves." Who is a knight?', 'Hiệp sĩ luôn nói thật, kẻ gian luôn nói dối. A nói: "B là kẻ gian." B nói: "C là kẻ gian." C nói: "A và B đều là kẻ gian." Ai là hiệp sĩ?',
  ['Only B', 'Only A', 'Only C', 'A and C'],
  'If A is a knight: B is a knave, so C is a knight, but C says A is a knave — contradiction. So A is a knave, B is a knight, C is a knave (and C\'s claim is false, since B is a knight).',
  'Nếu A là hiệp sĩ: B là kẻ gian → C là hiệp sĩ, nhưng C lại nói A là kẻ gian — mâu thuẫn. Vậy A là kẻ gian, B là hiệp sĩ, C là kẻ gian (câu của C sai vì B là hiệp sĩ).');
q(D, 5, 'One of four friends broke a vase. An: "Binh did it." Binh: "Dung did it." Chi: "I didn\'t do it." Dung: "Binh is lying." Exactly ONE of them tells the truth. Who broke the vase?', 'Một trong bốn bạn làm vỡ bình hoa. An: "Bình làm vỡ." Bình: "Dung làm vỡ." Chi: "Tớ không làm vỡ." Dung: "Bình nói dối." Có đúng MỘT bạn nói thật. Ai làm vỡ bình?',
  ['Chi', 'An', 'Binh', 'Dung'],
  'Test each person. If Chi did it, only Dung is telling the truth — exactly one. Any other culprit makes two or three statements true.', 'Thử từng người. Nếu Chi làm vỡ thì chỉ có Dung nói thật — đúng một người. Nếu là người khác thì có hai hoặc ba câu đúng.');

// ── Ordering ────────────────────────────────────────────
const S = 'logic.sequence';
q(S, 3, 'Four runners: Hoa beat Khoa. Linh beat Hoa. Minh finished last. Who won?', 'Bốn người chạy: Hoa về trước Khoa. Linh về trước Hoa. Minh về cuối cùng. Ai về nhất?',
  ['Linh', 'Hoa', 'Khoa', 'Minh'], 'Order: Linh, Hoa, Khoa, Minh.', 'Thứ tự: Linh, Hoa, Khoa, Minh.');
q(S, 3, 'Five friends stand in a line. Chi is in the middle. An is at the far left. Binh is next to An. Dung is not at the far right. Who is at the far right? (The fifth friend is Em.)', 'Năm bạn đứng thành hàng. Chi đứng giữa. An đứng ngoài cùng bên trái. Bình đứng cạnh An. Dung không đứng ngoài cùng bên phải. Ai đứng ngoài cùng bên phải? (Bạn thứ năm là Em.)',
  ['Em', 'Dung', 'Binh', 'Chi'], 'An, Binh, Chi fill places 1–3. Dung cannot be 5th, so Dung is 4th and Em is 5th.', 'An, Bình, Chi ở vị trí 1–3. Dung không ở vị trí 5 nên Dung ở vị trí 4, Em ở vị trí 5.');
q(S, 3, 'Son is older than Phuong. Quan is younger than Phuong but older than Tam. Who is the second youngest?', 'Sơn lớn tuổi hơn Phương. Quân nhỏ tuổi hơn Phương nhưng lớn tuổi hơn Tâm. Ai nhỏ tuổi thứ hai?',
  ['Quan', 'Phuong', 'Tam', 'Son'], 'Oldest to youngest: Son, Phuong, Quan, Tam.', 'Từ lớn đến nhỏ: Sơn, Phương, Quân, Tâm.');
q(S, 3, 'In a queue, Minh is 7th from the front and 5th from the back. How many people are in the queue?', 'Trong một hàng, Minh đứng thứ 7 tính từ đầu và thứ 5 tính từ cuối. Hàng có bao nhiêu người?',
  ['11', '12', '13', '10'], '6 people in front of Minh, 4 behind, plus Minh: 6 + 4 + 1 = 11.', 'Có 6 người trước Minh, 4 người sau Minh, cộng Minh: 6 + 4 + 1 = 11.');
q(S, 4, 'A building has floors 1 (bottom) to 5 (top), one friend per floor. Tuan lives on the top floor. Hai lives directly below Tuan. Lan lives above Mai. Nga lives directly above Mai. Who lives on floor 3?', 'Toà nhà có các tầng 1 (dưới cùng) đến 5 (trên cùng), mỗi tầng một bạn. Tuấn ở tầng trên cùng. Hải ở ngay dưới Tuấn. Lan ở trên Mai. Nga ở ngay trên Mai. Ai ở tầng 3?',
  ['Lan', 'Nga', 'Mai', 'Hai'], 'Tuan 5, Hai 4. Mai, Nga, Lan share floors 1–3 with Nga right above Mai and Lan above Mai: Mai 1, Nga 2, Lan 3.', 'Tuấn tầng 5, Hải tầng 4. Mai, Nga, Lan ở tầng 1–3; Nga ngay trên Mai, Lan cũng trên Mai → Mai 1, Nga 2, Lan 3.');
q(S, 4, 'Five friends A, B, C, D, E. A is taller than B. C is shorter than D but taller than A. E is the tallest. Who is in the middle (3rd tallest)?', 'Năm bạn A, B, C, D, E. A cao hơn B. C thấp hơn D nhưng cao hơn A. E cao nhất. Ai đứng giữa (cao thứ ba)?',
  ['C', 'A', 'D', 'B'], 'Order: E > D > C > A > B.', 'Thứ tự: E > D > C > A > B.');
q(S, 4, 'Four friends — An, Binh, Chi and Dung — sit around a square table, one on each side, all facing the centre. An sits opposite Binh. Chi sits on An\'s left. Who sits on Binh\'s left?', 'Bốn bạn An, Bình, Chi, Dung ngồi quanh một bàn vuông, mỗi bạn một cạnh, đều quay mặt vào giữa. An ngồi đối diện Bình. Chi ngồi bên trái An. Ai ngồi bên trái Bình?',
  ['Dung', 'Chi', 'An', 'Nobody'],
  'Put An on the south side facing north: An\'s left is west, so Chi is west and Dung east. Binh sits north facing south, so Binh\'s left is east — Dung.',
  'Đặt An ở cạnh phía nam, quay mặt lên bắc: bên trái An là phía tây → Chi ở phía tây, Dung ở phía đông. Bình ở phía bắc quay mặt xuống nam, bên trái Bình là phía đông → Dung.');
q(S, 4, 'Four exams take place Monday to Thursday, one per day: Maths, Literature, English, Science. English is the day after Maths. Literature is not on Monday. Science is on Thursday. On which day is Literature?', 'Bốn môn thi diễn ra từ thứ Hai đến thứ Năm, mỗi ngày một môn: Toán, Ngữ văn, Tiếng Anh, Khoa học. Tiếng Anh thi ngay sau ngày thi Toán. Ngữ văn không thi thứ Hai. Khoa học thi thứ Năm. Ngữ văn thi ngày nào?',
  ['Wednesday', 'Monday', 'Tuesday', 'Thursday'],
  'Monday cannot be Literature, Science, or English (English needs Maths the day before), so Maths is Monday, English Tuesday, Literature Wednesday.',
  'Thứ Hai không thể là Ngữ văn, Khoa học hay Tiếng Anh (Tiếng Anh cần Toán ngay trước), nên Toán thứ Hai, Tiếng Anh thứ Ba, Ngữ văn thứ Tư.');
q(S, 4, 'In a row of 20 students, Nam is 8th from the left. Lan is 3 places to the right of Nam. What is Lan\'s position from the right?', 'Một hàng có 20 học sinh, Nam đứng thứ 8 từ trái sang. Lan đứng cách Nam 3 vị trí về bên phải. Lan đứng thứ mấy tính từ phải sang?',
  ['10th', '9th', '11th', '12th'], 'Lan is 11th from the left. From the right: 20 − 11 + 1 = 10th.', 'Lan đứng thứ 11 từ trái. Từ phải sang: 20 − 11 + 1 = 10.');
q(S, 4, 'Seven people stand in a queue. Hoa is 3rd from the front. Khoa is behind Hoa with exactly two people between them. How many people are behind Khoa?', 'Bảy người xếp hàng. Hoa đứng thứ 3 từ đầu hàng. Khoa đứng sau Hoa, giữa hai người có đúng hai người khác. Có bao nhiêu người đứng sau Khoa?',
  ['1', '2', '3', '0'], 'Khoa is 3 + 3 = 6th, so only the 7th person is behind him.', 'Khoa đứng thứ 3 + 3 = 6, nên chỉ có người thứ 7 đứng sau Khoa.');
q(S, 4, 'An scored more than Bao. Cuong scored less than Bao but more than Diep. Diep did not score the lowest of the five friends (An, Bao, Cuong, Diep, Giang). Who scored the highest?', 'An được điểm cao hơn Bảo. Cường thấp hơn Bảo nhưng cao hơn Diệp. Diệp không phải người thấp điểm nhất trong năm bạn (An, Bảo, Cường, Diệp, Giang). Ai điểm cao nhất?',
  ['An', 'Bao', 'Giang', 'Cuong'], 'An > Bao > Cuong > Diep, and Diep is not last, so Giang is last. An is the highest.', 'An > Bảo > Cường > Diệp, mà Diệp không thấp nhất nên Giang thấp nhất. An cao điểm nhất.');
q(S, 5, 'Five runners: Hung, Kien, Long, Nhat, Phat. Hung finished ahead of Long but behind Nhat. Kien finished right after Long. Phat finished right after Hung, and was neither first nor last. Who finished third?', 'Năm người chạy: Hùng, Kiên, Long, Nhật, Phát. Hùng về trước Long nhưng sau Nhật. Kiên về ngay sau Long. Phát về ngay sau Hùng, không về nhất cũng không về cuối. Ai về thứ ba?',
  ['Phat', 'Hung', 'Long', 'Nhat'], 'Order: Nhat, Hung, Phat, Long, Kien.', 'Thứ tự: Nhật, Hùng, Phát, Long, Kiên.');
q(S, 5, 'Five students sit in seats 1–5 from left to right. Lam is in seat 3. Ha sits directly to the right of Lam. Quy is not next to Lam. Ky sits at one end but not next to Ha. Nu sits to the left of Lam. Who is in seat 2?', 'Năm học sinh ngồi ghế 1–5 từ trái sang phải. Lâm ngồi ghế 3. Hà ngồi ngay bên phải Lâm. Quý không ngồi cạnh Lâm. Kỳ ngồi ở một đầu và không cạnh Hà. Nữ ngồi bên trái Lâm. Ai ngồi ghế 2?',
  ['Nu', 'Ky', 'Quy', 'Ha'], 'Lam 3, Ha 4. Ky is at an end but not next to Ha, so Ky is in seat 1. Quy cannot be in seat 2 (next to Lam), so Quy is in seat 5 and Nu in seat 2.', 'Lâm ghế 3, Hà ghế 4. Kỳ ở đầu hàng nhưng không cạnh Hà → ghế 1. Quý không được ngồi ghế 2 (cạnh Lâm) → ghế 5, Nữ ghế 2.');
q(S, 5, 'Five friends live on floors 1–5, one per floor. Bao lives two floors above Cuong. Dao lives directly above Bao. Em lives below Cuong. Who lives on floor 3? (The fifth friend is Giang.)', 'Năm bạn ở các tầng 1–5, mỗi tầng một bạn. Bảo ở trên Cường hai tầng. Đào ở ngay trên Bảo. Em ở dưới Cường. Ai ở tầng 3? (Bạn thứ năm là Giang.)',
  ['Giang', 'Cuong', 'Bao', 'Em'], 'Dao = Bao + 1 ≤ 5 and Bao = Cuong + 2, so Cuong ≤ 2; Em is below Cuong, so Cuong = 2, Em 1, Bao 4, Dao 5 — Giang gets floor 3.', 'Đào = Bảo + 1 ≤ 5 và Bảo = Cường + 2 nên Cường ≤ 2; Em ở dưới Cường nên Cường = 2, Em 1, Bảo 4, Đào 5 — Giang ở tầng 3.');

// ── Chess ───────────────────────────────────────────────
const C = 'logic.chess';
q(C, 3, 'On an empty board, how many squares does a rook on d4 attack?', 'Trên bàn cờ trống, quân Xe ở d4 kiểm soát bao nhiêu ô?', ['14', '16', '8', '13'],
  '7 squares along the 4th rank plus 7 along the d-file = 14. A rook controls 14 squares from any square on an empty board.', '7 ô trên hàng 4 cộng 7 ô trên cột d = 14. Trên bàn cờ trống, Xe ở ô nào cũng kiểm soát 14 ô.');
q(C, 3, 'A white bishop starts on c1. Which square can it NEVER reach?', 'Tượng trắng xuất phát ở c1. Ô nào nó KHÔNG BAO GIỜ đi tới được?', ['d1', 'h6', 'a3', 'f4'],
  'A bishop stays on one colour. c1 is a dark square; d1 is light. h6, a3 and f4 are all dark.', 'Tượng luôn đi trên một màu ô. c1 là ô đen; d1 là ô trắng. h6, a3, f4 đều là ô đen.');
q(C, 3, 'A knight stands in the corner on a1 of an empty board. How many squares can it move to?', 'Mã đứng ở góc a1 trên bàn cờ trống. Nó có thể đi tới bao nhiêu ô?', ['2', '8', '4', '3'],
  'Only b3 and c2. In the corner a knight has just 2 moves; in the centre it has 8.', 'Chỉ có b3 và c2. Ở góc Mã chỉ có 2 nước đi; ở trung tâm có 8.');
q(C, 3, 'White castles kingside (O-O). Where do the king and rook end up?', 'Trắng nhập thành cánh Vua (O-O). Vua và Xe đứng ở đâu?', ['King g1, rook f1', 'King f1, rook g1', 'King h1, rook g1', 'King g1, rook h1'],
  'In kingside castling the king moves two squares (e1 → g1) and the rook jumps over it (h1 → f1).', 'Khi nhập thành cánh Vua, Vua đi hai ô (e1 → g1), Xe nhảy qua sang f1.');
q(C, 3, 'After 1.f3 e5 2.g4, Black can checkmate at once. Which move?', 'Sau 1.f3 e5 2.g4, Đen có thể chiếu hết ngay. Nước nào?', ['Qh4#', 'Qf6', 'Bc5', 'Qg5'],
  'This is the "Fool\'s mate": the queen checks along h4–e1, and White\'s own pawns block every escape.', 'Đây là "thế chiếu hết của kẻ ngốc": Hậu chiếu theo đường chéo h4–e1, các tốt của Trắng tự chặn đường thoát.');
q(C, 3, 'A rook checks the king; the king must move, and the rook then captures a more valuable piece behind it on the same line. This tactic is…', 'Xe chiếu Vua; Vua phải tránh, rồi Xe ăn quân đứng sau Vua trên cùng đường thẳng. Đòn chiến thuật này gọi là…', ['a skewer', 'a fork', 'a pin', 'stalemate'],
  'A skewer attacks the more valuable piece first; when it moves, the piece behind is lost. (A pin is the reverse: the piece in front cannot move.)', 'Đòn "xiên" tấn công quân giá trị hơn ở phía trước; khi nó tránh đi, quân phía sau bị ăn. (Đòn ghim thì ngược lại: quân phía trước không dám đi.)');
q(C, 4, 'A white pawn is on e5. Black plays d7–d5, landing right next to it. White captures en passant. Where does the white pawn land?', 'Tốt trắng ở e5. Đen đi d7–d5, đứng ngay cạnh nó. Trắng bắt tốt qua đường. Tốt trắng đứng ở ô nào?', ['d6', 'd5', 'e6', 'd4'],
  'En passant: the pawn captures as if Black had moved only one square, so it lands on d6 and the pawn on d5 is removed.', 'Bắt tốt qua đường: ăn như thể tốt đen chỉ đi một ô, nên tốt trắng đứng ở d6 và tốt đen ở d5 bị loại.');
q(C, 4, 'A pawn reaches the last rank and becomes a knight instead of a queen. This is called…', 'Tốt đến hàng cuối và phong thành Mã thay vì Hậu. Việc này gọi là…', ['underpromotion', 'castling', 'en passant', 'a discovered check'],
  'Promoting to anything other than a queen is underpromotion — sometimes a knight gives a check or fork that a queen cannot.', 'Phong cấp thành quân khác Hậu gọi là phong cấp thấp — đôi khi Mã chiếu hoặc bắt đôi được mà Hậu không làm được.');
q(C, 4, 'White knight on d5. Black king on e8, black rook on a8. White plays Nc7+. Why is this strong?', 'Mã trắng ở d5. Vua đen ở e8, Xe đen ở a8. Trắng đi Mc7+. Vì sao nước này mạnh?',
  ['It checks the king and attacks the rook at once — a fork.', 'It is checkmate.', 'It pins the rook to the king.', 'It threatens to promote a pawn.'],
  'From c7 the knight attacks both e8 and a8. The king must move, then Nxa8 wins the rook.', 'Từ c7, Mã tấn công cả e8 và a8. Vua phải tránh, rồi Mã ăn Xe ở a8.');
q(C, 4, 'Black king on e8, black knight on e5, white rook on e1, nothing else on the e-file. The black knight is…', 'Vua đen ở e8, Mã đen ở e5, Xe trắng ở e1, cột e không còn quân nào khác. Mã đen đang bị…',
  ['pinned — moving it would expose the king to check', 'forked', 'free to move anywhere', 'giving check'],
  'The knight stands between the rook and its own king. Moving it would put the king in check, which is illegal — an absolute pin.', 'Mã đứng giữa Xe trắng và Vua của mình. Nếu Mã đi, Vua bị chiếu — luật không cho phép. Đây là đòn ghim tuyệt đối.');
q(C, 4, 'After 1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6??, what is White\'s best move?', 'Sau 1.e4 e5 2.Tc4 Mc6 3.Hh5 Mf6??, nước tốt nhất của Trắng là gì?', ['Qxf7#', 'Qxe5+', 'Bxf7+', 'Qh4'],
  '"Scholar\'s mate": the queen takes on f7, protected by the bishop on c4. The king cannot take it or escape.', '"Thế chiếu hết học trò": Hậu ăn tốt f7, được Tượng c4 bảo vệ. Vua không ăn được và không có đường thoát.');
q(C, 4, 'White: Kb6, Rh1. Black: Kb8. White to move. Which move is checkmate?', 'Trắng: Vb6, Xh1. Đen: Vb8. Trắng đi. Nước nào chiếu hết?', ['Rh8#', 'Rb1', 'Kc6', 'Rh7'],
  'Rh8 checks along the 8th rank. The white king on b6 covers a7, b7 and c7, and the rook covers a8 and c8.', 'Xh8 chiếu theo hàng 8. Vua trắng ở b6 khống chế a7, b7, c7; Xe khống chế a8 và c8.');
q(C, 4, 'White rook on e1, white bishop on e4, black king on e8, and nothing else on the e-file. White moves the bishop off the e-file. This is…', 'Xe trắng ở e1, Tượng trắng ở e4, Vua đen ở e8, cột e không còn quân nào khác. Trắng đi Tượng ra khỏi cột e. Đây là…',
  ['a discovered check', 'a fork', 'castling', 'stalemate'],
  'The bishop was blocking the rook. Moving it "discovers" the rook\'s check — and the bishop is free to attack something else at the same time.', 'Tượng đang chắn đường Xe. Khi Tượng đi, Xe chiếu Vua ("chiếu mở") — và Tượng còn có thể tấn công quân khác cùng lúc.');
q(C, 5, 'Black: Kh8, Rg8, pawns g7 and h7 (no other black pieces). White knight on g5. White plays Nf7. What is the result?', 'Đen: Vh8, Xg8, tốt g7 và h7 (không còn quân đen nào khác). Mã trắng ở g5. Trắng đi Mf7. Kết quả là gì?',
  ['Checkmate — a "smothered mate"', 'Only a check — the king escapes to g8', 'The rook captures the knight', 'Stalemate'],
  'The knight checks h8. The king is boxed in by its own rook and pawns, and nothing can capture the knight on f7.', 'Mã chiếu ô h8. Vua bị chính Xe và tốt của mình vây kín, không quân nào ăn được Mã ở f7 — "chiếu hết ngộp".');
q(C, 5, 'White: Kc6, Qb6. Black: Ka8 (only the king). It is Black\'s move. What is the position?', 'Trắng: Vc6, Hb6. Đen: chỉ còn Va8. Đến lượt Đen đi. Thế cờ này là gì?',
  ['Stalemate — a draw', 'Checkmate — White wins', 'Black is in check', 'Black can move to b7'],
  'The king on a8 is not in check, but a7, b7 and b8 are all attacked. Black has no legal move, so it is stalemate.', 'Vua a8 không bị chiếu, nhưng a7, b7, b8 đều bị khống chế. Đen không có nước đi hợp lệ → hết nước (hoà).');
q(C, 5, 'White: Kc6, Qb6. Black: Ka8 (only the king). It is White\'s move. Which move is checkmate?', 'Trắng: Vc6, Hb6. Đen: chỉ còn Va8. Đến lượt Trắng đi. Nước nào chiếu hết?', ['Qb7#', 'Qa6+', 'Qa7+', 'Kb5'],
  'Qb7 checks a8, is protected by the king on c6, and covers a7 and b8. (Qa7+ fails: Kxa7. Qa6+ fails: Kb8.)', 'Hb7 chiếu a8, được Vua c6 bảo vệ, và khống chế a7, b8. (Ha7+ không được vì Vua ăn Hậu; Ha6+ thì Vua chạy b8.)');

// ── Spatial ─────────────────────────────────────────────
const Sp = 'logic.spatial';
q(Sp, 3, 'What is the smaller angle between the hands of a clock at 4:00?', 'Lúc 4 giờ đúng, góc nhỏ hơn tạo bởi hai kim đồng hồ là bao nhiêu độ?', ['120°', '90°', '100°', '150°'],
  'Each hour mark is 30° apart: 4 × 30° = 120°.', 'Mỗi khoảng giữa hai số trên mặt đồng hồ là 30°: 4 × 30° = 120°.');
q(Sp, 3, 'Which capital letter looks the same in a vertical mirror (left–right flip)?', 'Chữ in hoa nào trông không đổi khi soi gương dựng đứng (lật trái – phải)?', ['A', 'F', 'N', 'S'],
  'A has a vertical line of symmetry. F, N and S do not.', 'Chữ A có trục đối xứng thẳng đứng. F, N, S thì không.');
q(Sp, 3, 'Opposite faces of a standard die add up to 7. The die shows 2 on top. Which number is on the bottom?', 'Trên con xúc xắc chuẩn, hai mặt đối diện có tổng bằng 7. Mặt trên là 2. Mặt dưới là số mấy?', ['5', '4', '6', '3'],
  '2 + 5 = 7.', '2 + 5 = 7.');
q(Sp, 3, 'You face North and turn 135° clockwise. Which way are you facing?', 'Bạn quay mặt về hướng Bắc rồi xoay 135° theo chiều kim đồng hồ. Bạn quay về hướng nào?', ['South-East', 'South-West', 'East', 'North-East'],
  '90° clockwise gives East; another 45° gives South-East.', 'Xoay 90° được hướng Đông; thêm 45° nữa được hướng Đông Nam.');
q(Sp, 3, 'You walk 3 km north, then 4 km east. How far are you from the start in a straight line?', 'Bạn đi 3 km về phía bắc, rồi 4 km về phía đông. Bạn cách điểm xuất phát bao xa (theo đường thẳng)?', ['5 km', '7 km', '6 km', '1 km'],
  'The path makes a right angle: √(3² + 4²) = √25 = 5 km.', 'Đường đi tạo thành góc vuông: √(3² + 4²) = √25 = 5 km.');
q(Sp, 4, 'What is the smaller angle between the hands of a clock at 2:20?', 'Lúc 2 giờ 20 phút, góc nhỏ hơn tạo bởi hai kim đồng hồ là bao nhiêu độ?', ['50°', '60°', '40°', '70°'],
  'Minute hand: 20 × 6° = 120°. Hour hand: 2 × 30° + 20 × 0.5° = 70°. Difference 50°.', 'Kim phút: 20 × 6° = 120°. Kim giờ: 2 × 30° + 20 × 0,5° = 70°. Hiệu: 50°.');
q(Sp, 4, 'An analogue clock shows 2:15. What time does its image in a vertical mirror appear to show?', 'Đồng hồ kim chỉ 2 giờ 15. Ảnh của nó trong gương dựng đứng trông như chỉ mấy giờ?', ['9:45', '10:15', '2:45', '3:15'],
  'A mirror time adds with the real time to 12:00: 12:00 − 2:15 = 9:45.', 'Giờ trong gương cộng với giờ thật bằng 12:00: 12:00 − 2:15 = 9:45.');
q(Sp, 4, 'A cube net: four squares in a row, numbered 1, 2, 3, 4. Square 5 is attached above square 2, and square 6 below square 2. When folded, which square is opposite square 1?', 'Một hình khai triển của hình lập phương: bốn ô vuông thành một hàng, đánh số 1, 2, 3, 4. Ô 5 gắn phía trên ô 2, ô 6 gắn phía dưới ô 2. Khi gấp lại, ô nào đối diện ô 1?', ['3', '2', '5', '4'],
  'The row of four wraps around the cube like a belt, so squares two apart are opposite: 1–3 and 2–4. Squares 5 and 6 are the top and bottom.', 'Hàng bốn ô cuộn quanh hình lập phương như một vòng đai, nên hai ô cách nhau một ô thì đối diện: 1–3 và 2–4. Ô 5 và ô 6 là nắp trên và đáy.');
q(Sp, 4, 'A cube net: four squares in a row, 1, 2, 3, 4. Square 5 is attached above square 1, and square 6 below square 4. When folded, which square is opposite square 5?', 'Hình khai triển hình lập phương: bốn ô thành một hàng 1, 2, 3, 4. Ô 5 gắn phía trên ô 1, ô 6 gắn phía dưới ô 4. Khi gấp lại, ô nào đối diện ô 5?', ['6', '1', '3', '4'],
  'The row of four forms the belt around the cube. 5 and 6 close the two open ends, so they are opposite, whichever belt square they are attached to.', 'Hàng bốn ô tạo thành vòng đai. Ô 5 và ô 6 đậy hai đầu còn hở, nên chúng đối diện nhau, dù gắn vào ô nào của vòng đai.');
q(Sp, 4, 'Which capital letter looks exactly the same after a 180° rotation?', 'Chữ in hoa nào trông y hệt sau khi xoay 180°?', ['S', 'E', 'A', 'T'],
  'S has point symmetry (like N, Z, H, O). E, A and T turn upside-down.', 'Chữ S có tâm đối xứng (như N, Z, H, O). E, A, T bị lộn ngược.');
q(Sp, 4, 'You face South-West and turn 135° clockwise. Which way are you facing?', 'Bạn quay mặt về hướng Tây Nam rồi xoay 135° theo chiều kim đồng hồ. Bạn quay về hướng nào?', ['North', 'East', 'North-West', 'South'],
  'South-West → (45°) West → (90°) North-West → (135°) North.', 'Tây Nam → (45°) Tây → (90°) Tây Bắc → (135°) Bắc.');
q(Sp, 4, 'Start facing North. Walk 2 m, turn right, walk 2 m, turn right, walk 4 m, turn right, walk 2 m. How far are you from the start?', 'Bắt đầu quay mặt về hướng Bắc. Đi 2 m, rẽ phải, đi 2 m, rẽ phải, đi 4 m, rẽ phải, đi 2 m. Bạn cách điểm xuất phát bao xa?', ['2 m', '0 m', '4 m', '10 m'],
  'Positions: (0, 2) → (2, 2) → (2, −2) → (0, −2). You end 2 m due south of the start.', 'Vị trí: (0; 2) → (2; 2) → (2; −2) → (0; −2). Bạn ở cách điểm xuất phát 2 m về phía nam.');
q(Sp, 4, 'How many squares of any size are there in a 3 × 3 grid of squares?', 'Một lưới 3 × 3 ô vuông có tất cả bao nhiêu hình vuông (mọi kích cỡ)?', ['14', '9', '13', '10'],
  '9 small (1×1) + 4 medium (2×2) + 1 large (3×3) = 14.', '9 hình 1×1 + 4 hình 2×2 + 1 hình 3×3 = 14.');
q(Sp, 4, 'An arrow points up. Rotate it 90° clockwise, then reflect it in a vertical mirror. Which way does it point now?', 'Một mũi tên chỉ lên trên. Xoay nó 90° theo chiều kim đồng hồ, rồi lấy đối xứng qua gương dựng đứng. Bây giờ mũi tên chỉ hướng nào?', ['Left', 'Right', 'Up', 'Down'],
  'Up → rotate 90° clockwise → right → left–right mirror → left.', 'Lên → xoay 90° theo chiều kim đồng hồ → phải → lật trái – phải → trái.');
q(Sp, 5, 'What is the smaller angle between the hands of a clock at 10:10?', 'Lúc 10 giờ 10 phút, góc nhỏ hơn tạo bởi hai kim đồng hồ là bao nhiêu độ?', ['115°', '120°', '110°', '125°'],
  'Minute hand: 60°. Hour hand: 300° + 5° = 305°. Difference 245°, so the smaller angle is 360° − 245° = 115°.', 'Kim phút: 60°. Kim giờ: 300° + 5° = 305°. Hiệu 245°, góc nhỏ hơn là 360° − 245° = 115°.');
q(Sp, 5, 'A 4×4×4 cube is painted on the outside, then cut into 64 small cubes. How many small cubes have exactly ONE painted face?', 'Một khối lập phương 4×4×4 được sơn mặt ngoài rồi cắt thành 64 khối nhỏ. Bao nhiêu khối nhỏ có đúng MỘT mặt được sơn?', ['24', '8', '36', '16'],
  'Only the inner 2×2 part of each face has one painted side: 6 faces × 4 = 24.', 'Chỉ phần 2×2 ở giữa mỗi mặt có đúng một mặt sơn: 6 mặt × 4 = 24.');
q(Sp, 5, 'How many rectangles (squares count too) are there in a 2 × 2 grid of squares?', 'Một lưới 2 × 2 ô vuông có bao nhiêu hình chữ nhật (tính cả hình vuông)?', ['9', '5', '4', '8'],
  'Choose 2 of the 3 vertical lines and 2 of the 3 horizontal lines: 3 × 3 = 9.', 'Chọn 2 trong 3 đường dọc và 2 trong 3 đường ngang: 3 × 3 = 9.');
q(Sp, 5, 'A die has 2 on top and 3 at the front. Opposite faces add up to 7. What is the sum of the bottom face and the back face?', 'Con xúc xắc có mặt trên là 2, mặt trước là 3. Hai mặt đối diện có tổng bằng 7. Tổng của mặt dưới và mặt sau bằng bao nhiêu?', ['9', '5', '7', '14'],
  'Bottom = 7 − 2 = 5, back = 7 − 3 = 4, so 5 + 4 = 9.', 'Mặt dưới = 7 − 2 = 5, mặt sau = 7 − 3 = 4 → 5 + 4 = 9.');
q(Sp, 5, 'An arrow points to the right. Reflect it in a horizontal mirror line, then rotate it 90° anticlockwise. Which way does it point now?', 'Một mũi tên chỉ sang phải. Lấy đối xứng qua một đường thẳng nằm ngang, rồi xoay 90° ngược chiều kim đồng hồ. Bây giờ mũi tên chỉ hướng nào?', ['Up', 'Down', 'Left', 'Right'],
  'A horizontal mirror flips up and down, so a right-pointing arrow still points right. Rotating 90° anticlockwise turns right into up.', 'Đối xứng qua đường nằm ngang chỉ lật trên – dưới, mũi tên vẫn chỉ sang phải. Xoay 90° ngược chiều kim đồng hồ: phải → lên.');

export const logicGrade9Bank = list;
