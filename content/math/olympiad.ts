/**
 * TIMO / FIMO-style olympiad problems (toán nâng cao) for a strong grade-9 student: the topics and tricks of
 * the contests popular in Vietnam (TIMO, FIMO, SASMO, HKIMO, AMC 8/10). Every problem is original — same
 * ideas, new numbers and stories — and every answer was checked by computer (brute force or simulation).
 * choices[0] is the answer; the app shuffles the options.
 */
import type { ConceptSeed } from '../helpers';
import { makeBank } from '../helpers';

const LOGIC = 'math.olympiad.logic';

export const olympiadConcepts: ConceptSeed[] = [
  {
    id: LOGIC,
    domain: 'Advanced',
    skill: 'Olympiad',
    name: 'Olympiad logic',
    missionName: 'Riddle Gate',
    description: 'Truth-tellers and liars, ages, weighing, clocks and calendars, working backwards.',
    lesson:
      'Knights and liars: suppose one person is a knight, follow the consequences, and throw out any case that contradicts itself. Clocks: the minute hand turns 6° a minute and the hour hand 0.5°, so the gap changes by 5.5° a minute; calendars: 7 days later is the same weekday, so count days mod 7. Working backwards: start from the end and undo each step in reverse order (halve ↔ double, +2 ↔ −2).',
    examRefs: ['TIMO / FIMO style'],
  },
];

export const olympiadLessonsVi: Record<string, string> = {
  [LOGIC]:
    'Người nói thật – kẻ nói dối: giả sử một người nói thật, suy ra hệ quả và loại mọi trường hợp tự mâu thuẫn. Đồng hồ: kim phút quay 6° mỗi phút, kim giờ 0,5°, nên khoảng cách đổi 5,5° mỗi phút; lịch: sau 7 ngày lại là thứ cũ, nên đếm số ngày chia dư cho 7. Tính ngược: đi từ cuối lên, làm phép ngược từng bước theo thứ tự ngược lại (chia đôi ↔ nhân đôi, +2 ↔ −2).',
};

const { add, list } = makeBank('Atlas olympiad bank', 'oly-');

// ── Logic ────────────────────────────────────────────────────────────────
add(LOGIC, 3, 'On an island, knights always tell the truth and liars always lie. A says: "B is a knight." B says: "C is a liar." C says: "Exactly one of A and B is a knight." How many of the three are knights?', ['2', '1', '0', '3'], {
  promptVi: 'Trên một hòn đảo, hiệp sĩ luôn nói thật, kẻ nói dối luôn nói dối. A nói: "B là hiệp sĩ." B nói: "C là kẻ nói dối." C nói: "Trong A và B có đúng một hiệp sĩ." Trong ba người có bao nhiêu hiệp sĩ?',
  explanation: 'A and B are the same type (A vouches for B). If both are liars, C is a knight but then C\'s claim "exactly one" is false — impossible. So A and B are knights and C is a liar: 2 knights.',
  explanationVi: 'A và B cùng loại (A khẳng định B nói thật). Nếu cả hai nói dối thì C nói thật, nhưng câu "đúng một" của C lại sai — vô lí. Vậy A, B là hiệp sĩ, C nói dối: 2 hiệp sĩ.',
});
add(LOGIC, 4, 'Four islanders are knights (always truthful) or liars (always lying). The first says "Exactly one of us is a liar", the second "Exactly two of us are liars", the third "Exactly three of us are liars", the fourth "All four of us are liars". How many knights are there?', ['1', '0', '2', '3'], {
  promptVi: 'Bốn người trên đảo, mỗi người là hiệp sĩ (luôn nói thật) hoặc kẻ nói dối. Người thứ nhất nói "Đúng 1 người trong chúng ta nói dối", người thứ hai "Đúng 2 người nói dối", người thứ ba "Đúng 3 người nói dối", người thứ tư "Cả 4 chúng ta đều nói dối". Có bao nhiêu hiệp sĩ?',
  explanation: 'The four claims contradict each other, so at most one is true. If none were true, all four would be liars and the fourth claim would be true. So exactly one is true — 1 knight and 3 liars, which is the third claim.',
  explanationVi: 'Bốn câu mâu thuẫn nhau nên nhiều nhất một câu đúng. Nếu không câu nào đúng thì cả 4 nói dối và câu thứ tư lại đúng. Vậy đúng một câu đúng — 1 hiệp sĩ, 3 kẻ nói dối (chính là câu thứ ba).',
});
add(LOGIC, 3, 'A mother is 4 times as old as her son. In 20 years she will be twice as old as him. How old is the son now?', ['10', '20', '5', '15'], {
  promptVi: 'Tuổi mẹ gấp 4 lần tuổi con. Sau 20 năm nữa, tuổi mẹ gấp đôi tuổi con. Hiện nay con bao nhiêu tuổi?',
  explanation: 'Let the son be s: 4s + 20 = 2(s + 20), so 2s = 20 and s = 10.',
  explanationVi: 'Gọi tuổi con là s: 4s + 20 = 2(s + 20), nên 2s = 20, s = 10.',
});
add(LOGIC, 4, 'A clock strikes once at 1 o\'clock, twice at 2 o\'clock, …, 12 times at 12 o\'clock, and also strikes once at every half hour. How many strikes does it make in 24 hours?', ['180', '156', '204', '168'], {
  promptVi: 'Một chiếc đồng hồ đánh 1 tiếng lúc 1 giờ, 2 tiếng lúc 2 giờ, …, 12 tiếng lúc 12 giờ, và đánh thêm 1 tiếng vào mỗi lúc rưỡi. Trong 24 giờ đồng hồ đánh bao nhiêu tiếng?',
  explanation: 'In 12 hours the hours give 1 + 2 + … + 12 = 78 strikes and the half hours 12 more: 90. In 24 hours: 2 × 90 = 180.',
  explanationVi: 'Trong 12 giờ: các giờ đánh 1 + 2 + … + 12 = 78 tiếng, các lúc rưỡi thêm 12 tiếng: 90. Trong 24 giờ: 2 × 90 = 180.',
});
add(LOGIC, 4, 'A father is 41 and his three children are 11, 9 and 5. In how many years will the father\'s age equal the sum of his children\'s ages?', ['8', '16', '5', '11'], {
  promptVi: 'Bố 41 tuổi, ba người con lần lượt 11, 9 và 5 tuổi. Sau bao nhiêu năm nữa tuổi bố bằng tổng số tuổi của ba con?',
  explanation: 'Now the gap is 41 − 25 = 16. Each year the children\'s total grows by 3 and the father\'s age by 1, closing the gap by 2: 16 ÷ 2 = 8 years.',
  explanationVi: 'Hiện nay hiệu là 41 − 25 = 16. Mỗi năm tổng tuổi các con tăng 3, tuổi bố tăng 1, hiệu giảm 2: 16 : 2 = 8 năm.',
});
add(LOGIC, 4, 'There are 25 identical-looking coins; one is fake and heavier. Using a balance scale with no weights, what is the smallest number of weighings that always finds the fake?', ['3', '2', '4', '5'], {
  promptVi: 'Có 25 đồng xu giống hệt nhau, trong đó một đồng giả nặng hơn. Dùng cân đĩa không có quả cân, cần ít nhất bao nhiêu lần cân để chắc chắn tìm ra đồng giả?',
  explanation: 'Each weighing has 3 outcomes (left heavy, right heavy, balance), so k weighings separate at most 3ᵏ coins. 3² = 9 < 25 ≤ 27 = 3³, so 3 weighings (split into 9, 9, 7 first).',
  explanationVi: 'Mỗi lần cân có 3 kết quả (lệch trái, lệch phải, cân bằng), nên k lần cân phân biệt được tối đa 3ᵏ đồng. 3² = 9 < 25 ≤ 27 = 3³, nên cần 3 lần (lần đầu chia 9, 9, 7).',
});
add(LOGIC, 4, 'What is the smaller angle between the hour hand and the minute hand of a clock at 3:40?', ['130°', '120°', '140°', '110°'], {
  promptVi: 'Lúc 3 giờ 40 phút, góc nhỏ hơn tạo bởi kim giờ và kim phút là bao nhiêu độ?',
  explanation: 'Minute hand: 40 × 6° = 240°. Hour hand: 3 × 30° + 40 × 0.5° = 110°. The difference is 130°.',
  explanationVi: 'Kim phút: 40 × 6° = 240°. Kim giờ: 3 × 30° + 40 × 0,5° = 110°. Hiệu là 130°.',
});
add(LOGIC, 5, 'How many times in one full day (from 00:00 to 23:59) are the hour and minute hands of a clock exactly at a right angle?', ['44', '48', '24', '22'], {
  promptVi: 'Trong một ngày (từ 00:00 đến 23:59), kim giờ và kim phút vuông góc với nhau đúng bao nhiêu lần?',
  explanation: 'The minute hand gains one full turn on the hour hand 22 times in 24 hours, and in each lap the hands are at 90° twice: 22 × 2 = 44.',
  explanationVi: 'Trong 24 giờ, kim phút vượt kim giờ trọn một vòng 22 lần, và mỗi vòng hai kim vuông góc 2 lần: 22 × 2 = 44.',
});
add(LOGIC, 3, '1 January 2027 is a Friday. 2027 is not a leap year. What day of the week is 1 January 2028?', ['Saturday', 'Friday', 'Sunday', 'Thursday'], {
  promptVi: 'Ngày 1/1/2027 là thứ Sáu. Năm 2027 không nhuận. Ngày 1/1/2028 là thứ mấy?',
  explanation: '365 = 52 × 7 + 1, so one year later the weekday moves on by 1: Saturday.',
  explanationVi: '365 = 52 × 7 + 1, nên sau một năm thứ trong tuần tiến thêm 1: thứ Bảy.',
});
add(LOGIC, 4, 'A month with 31 days has five Fridays, five Saturdays and five Sundays. What day of the week is the 1st of that month?', ['Friday', 'Saturday', 'Sunday', 'Thursday'], {
  promptVi: 'Một tháng có 31 ngày có năm ngày thứ Sáu, năm ngày thứ Bảy và năm ngày Chủ nhật. Ngày mùng 1 của tháng đó là thứ mấy?',
  explanation: '31 = 4 × 7 + 3: the three weekdays of the 1st, 2nd and 3rd appear five times. They are Friday, Saturday, Sunday, so the 1st is a Friday.',
  explanationVi: '31 = 4 × 7 + 3: ba thứ của ngày 1, 2, 3 xuất hiện năm lần. Đó là thứ Sáu, thứ Bảy, Chủ nhật, nên ngày 1 là thứ Sáu.',
});
add(LOGIC, 4, 'Lan had some sweets. She gave An half of them plus 2 more, then gave Binh half of what was left plus 1 more. She had 5 sweets left. How many did she have at the start?', ['28', '24', '26', '32'], {
  promptVi: 'Lan có một số kẹo. Lan cho An một nửa số kẹo và thêm 2 cái, rồi cho Bình một nửa số còn lại và thêm 1 cái. Lan còn 5 cái. Lúc đầu Lan có bao nhiêu cái kẹo?',
  explanation: 'Work backwards: before Binh, (5 + 1) × 2 = 12; before An, (12 + 2) × 2 = 28.',
  explanationVi: 'Tính ngược: trước khi cho Bình có (5 + 1) × 2 = 12; trước khi cho An có (12 + 2) × 2 = 28.',
});
add(LOGIC, 3, 'Think of a number. Double it and subtract 3. Do this twice more (double, subtract 3; double, subtract 3). The result is 67. What was the number?', ['11', '35', '10', '9'], {
  promptVi: 'Nghĩ một số. Nhân đôi rồi trừ 3. Làm như vậy thêm hai lần nữa (nhân đôi, trừ 3; nhân đôi, trừ 3). Kết quả là 67. Số đã nghĩ là bao nhiêu?',
  explanation: 'Undo each step from the end: (67 + 3) ÷ 2 = 35, (35 + 3) ÷ 2 = 19, (19 + 3) ÷ 2 = 11.',
  explanationVi: 'Làm ngược từ cuối: (67 + 3) : 2 = 35, (35 + 3) : 2 = 19, (19 + 3) : 2 = 11.',
});
add(LOGIC, 3, 'A snail is at the bottom of a 20 m well. Each day it climbs up 5 m and each night it slides back 3 m. On which day does it first reach the top?', ['Day 9', 'Day 10', 'Day 8', 'Day 7'], {
  promptVi: 'Một con ốc sên ở đáy giếng sâu 20 m. Mỗi ngày nó bò lên 5 m, mỗi đêm lại tụt xuống 3 m. Đến ngày thứ mấy nó lên tới miệng giếng lần đầu?',
  explanation: 'After 8 days and nights it is at 8 × 2 = 16 m. On day 9 it climbs 5 m to 21 m ≥ 20 m — out, before sliding back.',
  explanationVi: 'Sau 8 ngày đêm nó ở độ cao 8 × 2 = 16 m. Ngày thứ 9 nó bò thêm 5 m lên 21 m ≥ 20 m — ra khỏi giếng trước khi kịp tụt.',
});
add(LOGIC, 4, 'Exactly one of A, B, C broke the vase, and exactly one of them tells the truth. A says: "B did it." B says: "I didn\'t do it." C says: "I didn\'t do it." Who broke the vase?', ['C', 'A', 'B', 'Cannot tell'], {
  promptVi: 'Đúng một trong ba bạn A, B, C làm vỡ bình, và đúng một bạn nói thật. A nói: "B làm vỡ." B nói: "Mình không làm vỡ." C nói: "Mình không làm vỡ." Ai làm vỡ bình?',
  explanation: 'A and B contradict each other, so one of them is the truth-teller and C must be lying: C did it. Check: then A lies, B is truthful — exactly one truth.',
  explanationVi: 'A và B nói ngược nhau nên một trong hai người nói thật, vậy C nói dối: C làm vỡ. Kiểm tra: khi đó A sai, B đúng — đúng một người nói thật.',
});
add(LOGIC, 4, 'Five runners A, B, C, D, E finished a race with no ties. C finished before A, and A before B. D finished immediately after B. E finished before A but was not first. Who finished third?', ['A', 'E', 'B', 'C'], {
  promptVi: 'Năm bạn A, B, C, D, E chạy thi, không ai về cùng lúc. C về trước A, A về trước B. D về ngay sau B. E về trước A nhưng không về nhất. Ai về thứ ba?',
  explanation: 'E is before A but not first, so C is first and E second: C, E, A, B, D. A is third.',
  explanationVi: 'E về trước A nhưng không về nhất, nên C nhất, E nhì: C, E, A, B, D. A về thứ ba.',
});
add(LOGIC, 5, '10 people sit around a round table; each is a knight (always truthful) or a liar (always lying). Each one says: "Both of my neighbours are liars." What is the smallest possible number of knights?', ['4', '3', '5', '2'], {
  promptVi: '10 người ngồi quanh một bàn tròn, mỗi người là hiệp sĩ (luôn nói thật) hoặc kẻ nói dối. Ai cũng nói: "Cả hai người ngồi cạnh tôi đều nói dối." Số hiệp sĩ ít nhất có thể là bao nhiêu?',
  explanation: 'No two knights sit together, and every liar needs a knight neighbour, so there are never 3 liars in a row. Each knight "covers" itself and two neighbours, so at least ⌈10 ÷ 3⌉ = 4 knights; K L L K L L K L K L works.',
  explanationVi: 'Không có hai hiệp sĩ ngồi cạnh nhau, và mỗi kẻ nói dối phải có một hàng xóm là hiệp sĩ, nên không có 3 kẻ nói dối liền nhau. Mỗi hiệp sĩ "phủ" mình và hai người cạnh, nên cần ít nhất ⌈10 : 3⌉ = 4 hiệp sĩ; cách xếp H D D H D D H D H D thỏa mãn.',
});
add(LOGIC, 4, 'Three years ago the average age of a family of 4 was 24. Since then a baby has been born, and now the average age of the 5 family members is 22. How old is the baby?', ['2', '3', '1', '10'], {
  promptVi: 'Ba năm trước, tuổi trung bình của gia đình 4 người là 24. Từ đó đến nay gia đình sinh thêm một em bé, và hiện nay tuổi trung bình của 5 người là 22. Em bé bao nhiêu tuổi?',
  explanation: 'Three years ago the 4 ages added to 96, so now they add to 96 + 12 = 108. The 5 ages add to 5 × 22 = 110, so the baby is 2.',
  explanationVi: 'Ba năm trước tổng tuổi 4 người là 96, nên nay là 96 + 12 = 108. Tổng tuổi 5 người là 5 × 22 = 110, nên em bé 2 tuổi.',
});
add(LOGIC, 3, 'A clock gains 3 minutes every hour. It is set to the correct time at 8:00 a.m. What does it show when the correct time is 4:00 p.m. the same day?', ['4:24 p.m.', '4:21 p.m.', '4:27 p.m.', '3:36 p.m.'], {
  promptVi: 'Một chiếc đồng hồ chạy nhanh 3 phút mỗi giờ. Nó được chỉnh đúng giờ lúc 8 giờ sáng. Khi giờ đúng là 4 giờ chiều cùng ngày, đồng hồ chỉ mấy giờ?',
  explanation: 'From 8 a.m. to 4 p.m. is 8 hours, so it gains 8 × 3 = 24 minutes: 4:24 p.m.',
  explanationVi: 'Từ 8 giờ sáng đến 4 giờ chiều là 8 giờ, đồng hồ nhanh thêm 8 × 3 = 24 phút: 4 giờ 24 phút chiều.',
});
add(LOGIC, 5, '1 January 2028 is a Saturday, and 2028 is a leap year (366 days). How many Sundays are there in 2028?', ['53', '52', '54', '51'], {
  promptVi: 'Ngày 1/1/2028 là thứ Bảy, năm 2028 là năm nhuận (366 ngày). Năm 2028 có bao nhiêu ngày Chủ nhật?',
  explanation: '366 = 52 × 7 + 2: every weekday occurs 52 times, and the two extra days are the first two weekdays of the year, Saturday and Sunday. So there are 53 Sundays.',
  explanationVi: '366 = 52 × 7 + 2: mỗi thứ xuất hiện 52 lần, hai ngày dư là hai thứ đầu năm, thứ Bảy và Chủ nhật. Vậy có 53 ngày Chủ nhật.',
});
add(LOGIC, 5, 'Tom lies on Mondays, Tuesdays and Wednesdays and tells the truth on the other days. Jerry lies on Thursdays, Fridays and Saturdays and tells the truth on the other days. One day both of them say: "Yesterday I lied." What day is it?', ['Thursday', 'Monday', 'Sunday', 'Wednesday'], {
  promptVi: 'Tom nói dối vào thứ Hai, thứ Ba, thứ Tư và nói thật các ngày khác. Jerry nói dối vào thứ Năm, thứ Sáu, thứ Bảy và nói thật các ngày khác. Một hôm cả hai cùng nói: "Hôm qua tôi đã nói dối." Hôm đó là thứ mấy?',
  explanation: 'The sentence is said only on a day when today and yesterday are of different types. For Tom that is Monday or Thursday; for Jerry, Thursday or Sunday. Both: Thursday.',
  explanationVi: 'Câu này chỉ được nói vào ngày mà hôm nay và hôm qua khác kiểu (thật/dối). Với Tom: thứ Hai hoặc thứ Năm; với Jerry: thứ Năm hoặc Chủ nhật. Chung: thứ Năm.',
});

export const olympiadQuestions = list;
