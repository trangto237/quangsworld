/**
 * TIMO / FIMO-style olympiad problems (toán nâng cao) for a strong grade-9 student: the topics and tricks of
 * the contests popular in Vietnam (TIMO, FIMO, SASMO, HKIMO, AMC 8/10). Every problem is original — same
 * ideas, new numbers and stories — and every answer was checked by computer (brute force or simulation).
 * choices[0] is the answer; the app shuffles the options.
 */
import type { ConceptSeed } from '../helpers';
import { makeBank } from '../helpers';

const LOGIC = 'math.olympiad.logic';
const ARITH = 'math.olympiad.arithmetic';
const NT = 'math.olympiad.number-theory';
const COMB = 'math.olympiad.combinatorics';
const GEO = 'math.olympiad.geometry';

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
  {
    id: ARITH,
    domain: 'Advanced',
    skill: 'Olympiad',
    name: 'Olympiad arithmetic',
    missionName: 'Clever Counting House',
    description: 'Telescoping sums, 1 + 2 + … + n, number patterns, repeating digits, fraction tricks and averages.',
    lesson:
      'Telescoping: split each term, e.g. 1/(n(n + 1)) = 1/n − 1/(n + 1), and almost everything cancels; products like (1 + 1/2)(1 + 1/3)… cancel the same way. Gauss: 1 + 2 + … + n = n(n + 1)/2, and any arithmetic sequence sums to (first + last) × number of terms ÷ 2. Averages: work with totals (average × count), and for repeating decimals or digits, find the period and use the remainder.',
    examRefs: ['TIMO / FIMO style'],
  },
  {
    id: NT,
    domain: 'Advanced',
    skill: 'Olympiad',
    name: 'Olympiad number theory',
    missionName: 'Prime Vault',
    description: 'Divisibility, remainders, last digits, primes, factors, digit sums, and LCM / GCD word problems.',
    lesson:
      "Last digits and remainders repeat in cycles: find the cycle length and use the remainder of the exponent (7, 9, 3, 1 for powers of 7). Divisibility tests: by 4 look at the last two digits, by 3 or 9 at the digit sum; and remainders multiply and add, so replace a number by its remainder. Factorise into primes: n = pᵃqᵇ… has (a + 1)(b + 1)… divisors; 'together again' means LCM, 'split into equal groups' means GCD.",
    examRefs: ['TIMO / FIMO style'],
  },
  {
    id: COMB,
    domain: 'Advanced',
    skill: 'Olympiad',
    name: 'Olympiad counting',
    missionName: 'Maze of Ways',
    description: 'Grid paths, arrangements with conditions, handshakes, the pigeonhole principle, and counting shapes in a figure.',
    lesson:
      "Count with the multiplication rule (choices for each step multiply) and divide out repeats: 6 people shaking hands make 6 × 5 ÷ 2 handshakes, and a grid path of a rights and b ups is a choice of C(a + b, a). For 'not next to each other' or 'at least one', count everything and subtract the opposite case. Pigeonhole: imagine the worst luck (one of each, or all of the wrong kind first), then add one.",
    examRefs: ['TIMO / FIMO style'],
  },
  {
    id: GEO,
    domain: 'Advanced',
    skill: 'Olympiad',
    name: 'Olympiad geometry',
    missionName: 'Star Compass',
    description: 'Angles in polygons and stars, shaded and composite areas, similar triangles and Pythagoras tricks.',
    lesson:
      "Angles: the exterior angles of any convex polygon add up to 360°, so a regular n-gon has exterior angle 360°/n and interior angle 180° − 360°/n; look for isosceles triangles and chase equal angles. Areas: split a shape into pieces you know, or take the whole and subtract the corners. Lengths: Pythagoras (remember 3-4-5, 5-12-13, 7-24-25, 20-21-29), and a line parallel to a side cuts off a similar triangle — lengths scale by k and areas by k².",
    examRefs: ['TIMO / FIMO style'],
  },
];

export const olympiadLessonsVi: Record<string, string> = {
  [LOGIC]:
    'Người nói thật – kẻ nói dối: giả sử một người nói thật, suy ra hệ quả và loại mọi trường hợp tự mâu thuẫn. Đồng hồ: kim phút quay 6° mỗi phút, kim giờ 0,5°, nên khoảng cách đổi 5,5° mỗi phút; lịch: sau 7 ngày lại là thứ cũ, nên đếm số ngày chia dư cho 7. Tính ngược: đi từ cuối lên, làm phép ngược từng bước theo thứ tự ngược lại (chia đôi ↔ nhân đôi, +2 ↔ −2).',
  [ARITH]:
    'Rút gọn kiểu "triệt tiêu": tách mỗi số hạng, ví dụ 1/(n(n + 1)) = 1/n − 1/(n + 1), gần như mọi thứ tự triệt tiêu; tích dạng (1 + 1/2)(1 + 1/3)… cũng triệt tiêu như vậy. Gauss: 1 + 2 + … + n = n(n + 1)/2, và tổng một dãy cách đều = (số đầu + số cuối) × số số hạng : 2. Trung bình cộng: làm việc với tổng (trung bình × số lượng); với số thập phân tuần hoàn hay chữ số lặp, tìm chu kì rồi dùng số dư.',
  [NT]:
    "Chữ số tận cùng và số dư lặp theo chu kì: tìm độ dài chu kì rồi dùng số dư của số mũ (lũy thừa của 7 tận cùng 7, 9, 3, 1). Dấu hiệu chia hết: cho 4 xét hai chữ số cuối, cho 3 hoặc 9 xét tổng các chữ số; số dư cộng và nhân được, nên có thể thay một số bằng số dư của nó. Phân tích ra thừa số nguyên tố: n = pᵃqᵇ… có (a + 1)(b + 1)… ước; 'lại gặp nhau cùng lúc' là BCNN, 'chia đều thành các nhóm' là ƯCLN.",
  [COMB]:
    "Đếm bằng quy tắc nhân (số cách ở mỗi bước nhân với nhau) rồi chia bớt các lần đếm lặp: 6 người bắt tay có 6 × 5 : 2 cái bắt tay, và đường đi trên lưới gồm a bước phải, b bước lên là một cách chọn C(a + b, a). Với 'không đứng cạnh nhau' hay 'ít nhất một', đếm tất cả rồi trừ trường hợp ngược lại. Nguyên lí Dirichlet: hình dung trường hợp xui nhất (mỗi loại một cái, hoặc lấy hết loại không cần trước), rồi cộng thêm một.",
  [GEO]:
    "Góc: tổng các góc ngoài của mọi đa giác lồi là 360°, nên đa giác đều n cạnh có góc ngoài 360°/n và góc trong 180° − 360°/n; hãy tìm các tam giác cân và lần theo các góc bằng nhau. Diện tích: chia hình thành các phần đã biết, hoặc lấy cả hình trừ đi các phần ở góc. Độ dài: định lí Py-ta-go (nhớ bộ 3-4-5, 5-12-13, 7-24-25, 20-21-29), và đường thẳng song song với một cạnh tạo ra tam giác đồng dạng — độ dài nhân k thì diện tích nhân k².",
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

// ── Arithmetic ───────────────────────────────────────────────────────────
add(ARITH, 3, 'Calculate: 1/(1·2) + 1/(2·3) + 1/(3·4) + … + 1/(2024·2025)', ['2024/2025', '1/2025', '2025/2026', '2023/2024'], {
  promptVi: 'Tính: 1/(1·2) + 1/(2·3) + 1/(3·4) + … + 1/(2024·2025)',
  explanation: '1/(n(n + 1)) = 1/n − 1/(n + 1), so the sum telescopes to 1 − 1/2025 = 2024/2025.',
  explanationVi: '1/(n(n + 1)) = 1/n − 1/(n + 1), nên tổng triệt tiêu còn 1 − 1/2025 = 2024/2025.',
});
add(ARITH, 4, 'Calculate: 1/(1·3) + 1/(3·5) + 1/(5·7) + … + 1/(99·101)', ['50/101', '100/101', '49/101', '50/99'], {
  promptVi: 'Tính: 1/(1·3) + 1/(3·5) + 1/(5·7) + … + 1/(99·101)',
  explanation: '1/(n(n + 2)) = ½(1/n − 1/(n + 2)), so the sum is ½(1 − 1/101) = ½ · 100/101 = 50/101.',
  explanationVi: '1/(n(n + 2)) = ½(1/n − 1/(n + 2)), nên tổng bằng ½(1 − 1/101) = ½ · 100/101 = 50/101.',
});
add(ARITH, 3, 'Calculate: (2 + 4 + 6 + … + 200) − (1 + 3 + 5 + … + 199)', ['100', '200', '50', '1'], {
  promptVi: 'Tính: (2 + 4 + 6 + … + 200) − (1 + 3 + 5 + … + 199)',
  explanation: 'Pair them up: (2 − 1) + (4 − 3) + … + (200 − 199) is 100 differences of 1, so 100.',
  explanationVi: 'Ghép cặp: (2 − 1) + (4 − 3) + … + (200 − 199) gồm 100 hiệu bằng 1, nên kết quả là 100.',
});
add(ARITH, 3, 'Calculate: 1 − 2 + 3 − 4 + 5 − 6 + … − 2024 + 2025', ['1013', '−1013', '1012', '2025'], {
  promptVi: 'Tính: 1 − 2 + 3 − 4 + 5 − 6 + … − 2024 + 2025',
  explanation: 'The 1012 pairs (1 − 2), (3 − 4), …, (2023 − 2024) each give −1, total −1012; then + 2025 gives 1013.',
  explanationVi: '1012 cặp (1 − 2), (3 − 4), …, (2023 − 2024) mỗi cặp bằng −1, tổng −1012; cộng thêm 2025 được 1013.',
});
add(ARITH, 4, '1/7 = 0.142857142857… What is the 2026th digit after the decimal point?', ['8', '5', '2', '4'], {
  promptVi: '1/7 = 0,142857142857… Chữ số thứ 2026 sau dấu phẩy là chữ số nào?',
  explanation: 'The digits repeat in blocks of 6: 142857. 2026 = 6 × 337 + 4, so it is the 4th digit of the block: 8.',
  explanationVi: 'Các chữ số lặp theo nhóm 6 chữ số: 142857. 2026 = 6 × 337 + 4, nên đó là chữ số thứ 4 của nhóm: 8.',
});
add(ARITH, 4, 'The odd numbers are written in rows: row 1 is "1", row 2 is "3 5", row 3 is "7 9 11", row 4 is "13 15 17 19", and so on (row n has n numbers). What is the sum of the numbers in row 12?', ['1728', '1584', '144', '1872'], {
  promptVi: 'Các số lẻ được viết thành hàng: hàng 1 là "1", hàng 2 là "3 5", hàng 3 là "7 9 11", hàng 4 là "13 15 17 19", … (hàng n có n số). Tổng các số ở hàng 12 là bao nhiêu?',
  explanation: 'Row sums are 1, 8, 27, 64, … = n³ (the first n rows hold the first n(n + 1)/2 odd numbers). Row 12: 12³ = 1728.',
  explanationVi: 'Tổng các hàng là 1, 8, 27, 64, … = n³ (n hàng đầu chứa n(n + 1)/2 số lẻ đầu tiên). Hàng 12: 12³ = 1728.',
});
add(ARITH, 3, 'The average of five numbers is 18. When one number is removed, the average of the other four is 16. Which number was removed?', ['26', '2', '17', '34'], {
  promptVi: 'Trung bình cộng của năm số là 18. Bỏ đi một số thì trung bình cộng của bốn số còn lại là 16. Số bị bỏ đi là bao nhiêu?',
  explanation: 'Totals: 5 × 18 = 90 and 4 × 16 = 64, so the removed number is 90 − 64 = 26.',
  explanationVi: 'Tổng: 5 × 18 = 90 và 4 × 16 = 64, nên số bị bỏ là 90 − 64 = 26.',
});
add(ARITH, 4, 'After 4 tests Quang\'s average mark is 7.5. What mark must he get in the 5th test to raise his average to 8?', ['10', '8.5', '9.5', '9'], {
  promptVi: 'Sau 4 bài kiểm tra, điểm trung bình của Quang là 7,5. Bài thứ 5 Quang phải được bao nhiêu điểm để điểm trung bình tăng lên 8?',
  explanation: 'He needs a total of 5 × 8 = 40 and has 4 × 7.5 = 30, so he needs 10.',
  explanationVi: 'Cần tổng 5 × 8 = 40 điểm, đã có 4 × 7,5 = 30, nên bài thứ 5 cần 10 điểm.',
});
add(ARITH, 4, 'Calculate: (1 − 1/4)(1 − 1/9)(1 − 1/16) … (1 − 1/100)', ['11/20', '1/10', '9/10', '11/100'], {
  promptVi: 'Tính: (1 − 1/4)(1 − 1/9)(1 − 1/16) … (1 − 1/100)',
  explanation: '1 − 1/k² = (k − 1)(k + 1)/k². Multiplying for k = 2 to 10, the fractions cancel to (1/2) × (11/10) = 11/20.',
  explanationVi: '1 − 1/k² = (k − 1)(k + 1)/k². Nhân với k = 2 đến 10, các phân số triệt tiêu còn (1/2) × (11/10) = 11/20.',
});
add(ARITH, 3, 'Calculate: (1 + 1/2)(1 + 1/3)(1 + 1/4) … (1 + 1/99)', ['50', '100', '99/2', '49'], {
  promptVi: 'Tính: (1 + 1/2)(1 + 1/3)(1 + 1/4) … (1 + 1/99)',
  explanation: 'The product is 3/2 × 4/3 × 5/4 × … × 100/99; everything cancels except 100/2 = 50.',
  explanationVi: 'Tích bằng 3/2 × 4/3 × 5/4 × … × 100/99; mọi thừa số triệt tiêu, còn 100/2 = 50.',
});
add(ARITH, 5, 'Calculate: 1·2 + 2·3 + 3·4 + … + 20·21', ['3080', '2870', '3290', '1540'], {
  promptVi: 'Tính: 1·2 + 2·3 + 3·4 + … + 20·21',
  explanation: 'Since 3k(k + 1) = k(k + 1)(k + 2) − (k − 1)k(k + 1), the sum telescopes to 20·21·22 ÷ 3 = 3080.',
  explanationVi: 'Vì 3k(k + 1) = k(k + 1)(k + 2) − (k − 1)k(k + 1), tổng triệt tiêu còn 20·21·22 : 3 = 3080.',
});
add(ARITH, 4, 'Given 1² + 2² + … + n² = n(n + 1)(2n + 1)/6, calculate 11² + 12² + 13² + … + 20².', ['2485', '2870', '385', '2255'], {
  promptVi: 'Biết 1² + 2² + … + n² = n(n + 1)(2n + 1)/6, tính 11² + 12² + 13² + … + 20².',
  explanation: '(1² + … + 20²) − (1² + … + 10²) = 2870 − 385 = 2485.',
  explanationVi: '(1² + … + 20²) − (1² + … + 10²) = 2870 − 385 = 2485.',
});
add(ARITH, 5, 'Calculate: 1/(1 + 2) + 1/(1 + 2 + 3) + 1/(1 + 2 + 3 + 4) + … + 1/(1 + 2 + … + 20)', ['19/21', '20/21', '19/42', '10/21'], {
  promptVi: 'Tính: 1/(1 + 2) + 1/(1 + 2 + 3) + 1/(1 + 2 + 3 + 4) + … + 1/(1 + 2 + … + 20)',
  explanation: '1 + 2 + … + n = n(n + 1)/2, so each term is 2/(n(n + 1)) = 2(1/n − 1/(n + 1)). For n = 2 to 20: 2(1/2 − 1/21) = 19/21.',
  explanationVi: '1 + 2 + … + n = n(n + 1)/2, nên mỗi số hạng là 2/(n(n + 1)) = 2(1/n − 1/(n + 1)). Với n = 2 đến 20: 2(1/2 − 1/21) = 19/21.',
});
add(ARITH, 4, 'How many digits are used to write all the whole numbers from 1 to 200?', ['492', '600', '489', '200'], {
  promptVi: 'Cần dùng bao nhiêu chữ số để viết tất cả các số tự nhiên từ 1 đến 200?',
  explanation: '1–9: 9 digits; 10–99: 90 × 2 = 180; 100–200: 101 × 3 = 303. Total 9 + 180 + 303 = 492.',
  explanationVi: '1–9: 9 chữ số; 10–99: 90 × 2 = 180; 100–200: 101 × 3 = 303. Tổng 9 + 180 + 303 = 492.',
});
add(ARITH, 3, 'In the sequence 3, 7, 11, 15, …, which term is 403?', ['the 101st', 'the 100th', 'the 102nd', 'the 400th'], {
  promptVi: 'Trong dãy số 3, 7, 11, 15, …, số 403 là số hạng thứ bao nhiêu?',
  explanation: 'The terms go up by 4: the nth term is 3 + 4(n − 1). 3 + 4(n − 1) = 403 gives n − 1 = 100, n = 101.',
  explanationVi: 'Dãy tăng đều 4: số hạng thứ n là 3 + 4(n − 1). 3 + 4(n − 1) = 403 cho n − 1 = 100, n = 101.',
});
add(ARITH, 5, 'The pages of a book are numbered 1, 2, 3, … and 1392 digits are used in total. How many pages does the book have?', ['500', '464', '501', '499'], {
  promptVi: 'Các trang sách được đánh số 1, 2, 3, … và dùng tất cả 1392 chữ số. Quyển sách có bao nhiêu trang?',
  explanation: 'Pages 1–99 use 9 + 180 = 189 digits. The remaining 1392 − 189 = 1203 digits are 1203 ÷ 3 = 401 three-digit pages, from 100 to 500.',
  explanationVi: 'Trang 1–99 dùng 9 + 180 = 189 chữ số. Còn 1392 − 189 = 1203 chữ số, ứng với 1203 : 3 = 401 trang có ba chữ số, từ 100 đến 500.',
});
add(ARITH, 4, 'What is the sum of the digits of 11111 × 11111?', ['25', '10', '20', '45'], {
  promptVi: 'Tổng các chữ số của 11111 × 11111 là bao nhiêu?',
  explanation: '11 × 11 = 121, 111 × 111 = 12321, … so 11111 × 11111 = 123454321, whose digits add up to 25.',
  explanationVi: '11 × 11 = 121, 111 × 111 = 12321, … nên 11111 × 11111 = 123454321, tổng các chữ số là 25.',
});
add(ARITH, 3, 'Calculate: 2025 × 2027 − 2026²', ['−1', '1', '0', '−2'], {
  promptVi: 'Tính: 2025 × 2027 − 2026²',
  explanation: '2025 × 2027 = (2026 − 1)(2026 + 1) = 2026² − 1, so the answer is −1.',
  explanationVi: '2025 × 2027 = (2026 − 1)(2026 + 1) = 2026² − 1, nên kết quả là −1.',
});
add(ARITH, 4, 'Calculate: 1 + 1/2 + 1/4 + 1/8 + … + 1/1024', ['2047/1024', '2', '1023/1024', '2049/1024'], {
  promptVi: 'Tính: 1 + 1/2 + 1/4 + 1/8 + … + 1/1024',
  explanation: 'Adding 1/1024 would complete the sum to 2 (each term fills half of the gap to 2), so the sum is 2 − 1/1024 = 2047/1024.',
  explanationVi: 'Thêm 1/1024 thì tổng tròn thành 2 (mỗi số hạng lấp một nửa khoảng còn thiếu tới 2), nên tổng bằng 2 − 1/1024 = 2047/1024.',
});
add(ARITH, 4, 'The sum of 15 consecutive whole numbers is 2025. What is the largest of them?', ['142', '135', '149', '143'], {
  promptVi: 'Tổng của 15 số tự nhiên liên tiếp là 2025. Số lớn nhất trong đó là bao nhiêu?',
  explanation: 'The middle (8th) number is the average: 2025 ÷ 15 = 135. The largest is 7 more: 142.',
  explanationVi: 'Số ở giữa (số thứ 8) bằng trung bình cộng: 2025 : 15 = 135. Số lớn nhất hơn nó 7: 142.',
});
add(ARITH, 4, 'Write the repeating decimal 0.363636… as a fraction in lowest terms.', ['4/11', '9/25', '36/100', '6/11'], {
  promptVi: 'Viết số thập phân vô hạn tuần hoàn 0,363636… dưới dạng phân số tối giản.',
  explanation: 'If x = 0.3636…, then 100x = 36.3636…, so 99x = 36 and x = 36/99 = 4/11.',
  explanationVi: 'Đặt x = 0,3636…, thì 100x = 36,3636…, nên 99x = 36 và x = 36/99 = 4/11.',
});
add(ARITH, 4, 'A car drives from A to B at 60 km/h and returns from B to A along the same road at 40 km/h. What is its average speed for the whole trip?', ['48 km/h', '50 km/h', '45 km/h', '52 km/h'], {
  promptVi: 'Một ô tô đi từ A đến B với vận tốc 60 km/h rồi quay về từ B đến A trên cùng con đường với vận tốc 40 km/h. Vận tốc trung bình cả đi lẫn về là bao nhiêu?',
  explanation: 'Take AB = 120 km: going takes 2 h, returning 3 h, so 240 km in 5 h = 48 km/h (not the plain average 50).',
  explanationVi: 'Lấy AB = 120 km: đi hết 2 giờ, về hết 3 giờ, nên 240 km trong 5 giờ = 48 km/h (không phải trung bình 50).',
});

// ── Number theory ────────────────────────────────────────────────────────
add(NT, 3, 'What is the last digit of 7²⁰²⁶?', ['9', '7', '3', '1'], {
  promptVi: 'Chữ số tận cùng của 7²⁰²⁶ là chữ số nào?',
  explanation: 'Last digits of 7, 7², 7³, 7⁴, … repeat 7, 9, 3, 1. 2026 = 4 × 506 + 2, so the last digit is the 2nd in the cycle: 9.',
  explanationVi: 'Chữ số tận cùng của 7, 7², 7³, 7⁴, … lặp lại 7, 9, 3, 1. 2026 = 4 × 506 + 2, nên chữ số tận cùng là số thứ 2 trong chu kì: 9.',
});
add(NT, 4, 'What is the last digit of 2²⁰²⁶ + 3²⁰²⁶?', ['3', '5', '7', '1'], {
  promptVi: 'Chữ số tận cùng của 2²⁰²⁶ + 3²⁰²⁶ là chữ số nào?',
  explanation: 'Both cycles have length 4 and 2026 leaves remainder 2 when divided by 4: 2²⁰²⁶ ends in 4 and 3²⁰²⁶ ends in 9. 4 + 9 = 13, so the last digit is 3.',
  explanationVi: 'Cả hai chu kì dài 4 và 2026 chia 4 dư 2: 2²⁰²⁶ tận cùng 4, 3²⁰²⁶ tận cùng 9. 4 + 9 = 13, nên chữ số tận cùng là 3.',
});
add(NT, 4, 'What is the remainder when 2¹⁰⁰ is divided by 7?', ['2', '1', '4', '3'], {
  promptVi: 'Số dư khi chia 2¹⁰⁰ cho 7 là bao nhiêu?',
  explanation: '2³ = 8 ≡ 1 (mod 7). 100 = 3 × 33 + 1, so 2¹⁰⁰ = (2³)³³ × 2 ≡ 2 (mod 7).',
  explanationVi: '2³ = 8 ≡ 1 (mod 7). 100 = 3 × 33 + 1, nên 2¹⁰⁰ = (2³)³³ × 2 ≡ 2 (mod 7).',
});
add(NT, 4, 'Find the smallest positive whole number that leaves remainder 1 when divided by 2, 3, 4, 5 or 6, and is divisible by 7.', ['301', '61', '121', '421'], {
  promptVi: 'Tìm số nguyên dương nhỏ nhất chia cho 2, 3, 4, 5, 6 đều dư 1 và chia hết cho 7.',
  explanation: 'The number is 1 more than a multiple of LCM(2, 3, 4, 5, 6) = 60: 61, 121, 181, 241, 301, … The first divisible by 7 is 301 = 7 × 43.',
  explanationVi: 'Số đó bằng một bội của BCNN(2, 3, 4, 5, 6) = 60 cộng 1: 61, 121, 181, 241, 301, … Số đầu tiên chia hết cho 7 là 301 = 7 × 43.',
});
add(NT, 3, 'How many positive divisors does 360 have?', ['24', '12', '18', '36'], {
  promptVi: 'Số 360 có bao nhiêu ước nguyên dương?',
  explanation: '360 = 2³ × 3² × 5, so it has (3 + 1)(2 + 1)(1 + 1) = 24 divisors.',
  explanationVi: '360 = 2³ × 3² × 5, nên có (3 + 1)(2 + 1)(1 + 1) = 24 ước.',
});
add(NT, 4, 'How many whole numbers from 1 to 1000 are divisible by 3 or by 5 (or both)?', ['467', '533', '400', '466'], {
  promptVi: 'Từ 1 đến 1000 có bao nhiêu số chia hết cho 3 hoặc cho 5 (hoặc cả hai)?',
  explanation: 'Inclusion–exclusion: 333 multiples of 3 + 200 multiples of 5 − 66 multiples of 15 = 467.',
  explanationVi: 'Bao hàm – loại trừ: 333 bội của 3 + 200 bội của 5 − 66 bội của 15 = 467.',
});
add(NT, 4, 'The four-digit number a74b (digits a, 7, 4, b) is divisible by 36. How many such numbers are there?', ['3', '2', '1', '4'], {
  promptVi: 'Số có bốn chữ số a74b (các chữ số a, 7, 4, b) chia hết cho 36. Có bao nhiêu số như vậy?',
  explanation: 'Divisible by 4: 4b ∈ {40, 44, 48}, so b = 0, 4 or 8. Divisible by 9: a + 11 + b is a multiple of 9. That gives 7740, 3744 and 8748: 3 numbers.',
  explanationVi: 'Chia hết cho 4: 4b ∈ {40, 44, 48}, nên b = 0, 4 hoặc 8. Chia hết cho 9: a + 11 + b chia hết cho 9. Được 7740, 3744 và 8748: 3 số.',
});
add(NT, 3, 'How many zeros are at the end of 100! = 1 × 2 × 3 × … × 100?', ['24', '20', '25', '11'], {
  promptVi: '100! = 1 × 2 × 3 × … × 100 có bao nhiêu chữ số 0 tận cùng?',
  explanation: 'Each zero needs a factor 5 (there are plenty of 2s): ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24.',
  explanationVi: 'Mỗi chữ số 0 cần một thừa số 5 (thừa số 2 thì dư thừa): ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24.',
});
add(NT, 4, 'How many zeros are at the end of 2026! = 1 × 2 × 3 × … × 2026?', ['505', '405', '486', '502'], {
  promptVi: '2026! = 1 × 2 × 3 × … × 2026 có bao nhiêu chữ số 0 tận cùng?',
  explanation: 'Count factors of 5: ⌊2026/5⌋ + ⌊2026/25⌋ + ⌊2026/125⌋ + ⌊2026/625⌋ = 405 + 81 + 16 + 3 = 505.',
  explanationVi: 'Đếm thừa số 5: ⌊2026/5⌋ + ⌊2026/25⌋ + ⌊2026/125⌋ + ⌊2026/625⌋ = 405 + 81 + 16 + 3 = 505.',
});
add(NT, 3, 'Three lighthouses flash every 12, 18 and 30 seconds. They all flash together at exactly 8:00:00. When do they next all flash together?', ['8:03:00', '8:01:30', '8:06:00', '8:01:00'], {
  promptVi: 'Ba ngọn hải đăng chớp sáng cứ 12 giây, 18 giây và 30 giây một lần. Chúng cùng chớp lúc đúng 8:00:00. Lần tiếp theo cả ba cùng chớp là lúc mấy giờ?',
  explanation: 'LCM(12, 18, 30) = 180 seconds = 3 minutes, so at 8:03:00.',
  explanationVi: 'BCNN(12, 18, 30) = 180 giây = 3 phút, nên lúc 8:03:00.',
});
add(NT, 3, 'A florist has 84 red roses and 126 white roses and makes identical bouquets using all of them (each bouquet has the same number of red and the same number of white roses). What is the largest number of bouquets?', ['42', '21', '14', '210'], {
  promptVi: 'Một cửa hàng hoa có 84 bông hồng đỏ và 126 bông hồng trắng, bó thành các bó giống hệt nhau và dùng hết số hoa (mỗi bó có số hồng đỏ như nhau, số hồng trắng như nhau). Có thể bó được nhiều nhất bao nhiêu bó?',
  explanation: 'The number of bouquets divides both 84 and 126, so the most is GCD(84, 126) = 42 (2 red and 3 white each).',
  explanationVi: 'Số bó phải là ước chung của 84 và 126, nên nhiều nhất là ƯCLN(84, 126) = 42 (mỗi bó 2 đỏ, 3 trắng).',
});
add(NT, 5, 'What is the sum of the digits of 10²⁵ − 25?', ['219', '225', '216', '228'], {
  promptVi: 'Tổng các chữ số của 10²⁵ − 25 là bao nhiêu?',
  explanation: '10²⁵ − 25 = 99…975 with 23 nines followed by 7 and 5. Sum: 23 × 9 + 7 + 5 = 219.',
  explanationVi: '10²⁵ − 25 = 99…975 gồm 23 chữ số 9 rồi đến 7 và 5. Tổng: 23 × 9 + 7 + 5 = 219.',
});
add(NT, 3, 'How many prime numbers are there between 50 and 100?', ['10', '9', '11', '12'], {
  promptVi: 'Có bao nhiêu số nguyên tố nằm giữa 50 và 100?',
  explanation: '53, 59, 61, 67, 71, 73, 79, 83, 89, 97 — ten primes.',
  explanationVi: '53, 59, 61, 67, 71, 73, 79, 83, 89, 97 — mười số nguyên tố.',
});
add(NT, 4, 'p and q are prime numbers with p + q = 103. What is p × q?', ['202', '2650', '206', '101'], {
  promptVi: 'p và q là hai số nguyên tố có p + q = 103. Tính p × q.',
  explanation: '103 is odd, so one prime is even, i.e. 2; the other is 101 (prime). p × q = 202.',
  explanationVi: '103 lẻ nên một trong hai số là số nguyên tố chẵn, tức là 2; số kia là 101 (nguyên tố). p × q = 202.',
});
add(NT, 4, 'What is the remainder when 1! + 2! + 3! + … + 100! is divided by 12?', ['9', '0', '3', '6'], {
  promptVi: 'Số dư khi chia 1! + 2! + 3! + … + 100! cho 12 là bao nhiêu?',
  explanation: 'From 4! = 24 on, every factorial is a multiple of 12. So the remainder is that of 1 + 2 + 6 = 9.',
  explanationVi: 'Từ 4! = 24 trở đi, mọi giai thừa đều chia hết cho 12. Nên số dư bằng số dư của 1 + 2 + 6 = 9.',
});
add(NT, 5, 'For how many positive whole numbers n is (2n + 21)/(n + 3) a whole number?', ['2', '4', '3', '1'], {
  promptVi: 'Có bao nhiêu số nguyên dương n để (2n + 21)/(n + 3) là số nguyên?',
  explanation: '(2n + 21)/(n + 3) = 2 + 15/(n + 3), so n + 3 divides 15. With n + 3 ≥ 4: n + 3 = 5 or 15, giving n = 2 or 12.',
  explanationVi: '(2n + 21)/(n + 3) = 2 + 15/(n + 3), nên n + 3 là ước của 15. Vì n + 3 ≥ 4: n + 3 = 5 hoặc 15, được n = 2 hoặc 12.',
});
add(NT, 4, 'What is the smallest positive whole number whose digits add up to 30?', ['3999', '6888', '39999', '5799'], {
  promptVi: 'Số nguyên dương nhỏ nhất có tổng các chữ số bằng 30 là số nào?',
  explanation: 'Three digits give at most 27, so it has 4 digits. Make the last three digits 9s and the first digit as small as possible: 30 − 27 = 3, so 3999.',
  explanationVi: 'Ba chữ số có tổng tối đa 27, nên cần 4 chữ số. Cho ba chữ số cuối là 9 và chữ số đầu nhỏ nhất: 30 − 27 = 3, được 3999.',
});
add(NT, 5, 'How many divisors of 3600 are perfect squares (count 1 as a perfect square)?', ['12', '45', '6', '8'], {
  promptVi: 'Số 3600 có bao nhiêu ước là số chính phương (tính cả 1)?',
  explanation: '3600 = 2⁴ × 3² × 5². A square divisor has even exponents: 2 ∈ {0, 2, 4}, 3 ∈ {0, 2}, 5 ∈ {0, 2}, so 3 × 2 × 2 = 12.',
  explanationVi: '3600 = 2⁴ × 3² × 5². Ước chính phương có số mũ chẵn: của 2 ∈ {0, 2, 4}, của 3 ∈ {0, 2}, của 5 ∈ {0, 2}, nên có 3 × 2 × 2 = 12.',
});
add(NT, 3, 'A number leaves remainder 7 when divided by 9. What remainder does 5 times that number leave when divided by 9?', ['8', '7', '35', '5'], {
  promptVi: 'Một số chia cho 9 dư 7. Hỏi 5 lần số đó chia cho 9 dư bao nhiêu?',
  explanation: 'The remainder of 5n is that of 5 × 7 = 35, and 35 = 3 × 9 + 8, so 8.',
  explanationVi: 'Số dư của 5n bằng số dư của 5 × 7 = 35, mà 35 = 3 × 9 + 8, nên dư 8.',
});
add(NT, 5, 'What are the last two digits of 7²⁰²⁶?', ['49', '43', '01', '07'], {
  promptVi: 'Hai chữ số tận cùng của 7²⁰²⁶ là gì?',
  explanation: '7⁴ = 2401 ends in 01, so powers of 7 repeat their last two digits every 4 steps. 2026 = 4 × 506 + 2, so 7²⁰²⁶ ends like 7² = 49.',
  explanationVi: '7⁴ = 2401 tận cùng 01, nên hai chữ số tận cùng của lũy thừa 7 lặp lại sau mỗi 4 bước. 2026 = 4 × 506 + 2, nên 7²⁰²⁶ tận cùng giống 7² = 49.',
});
add(NT, 4, 'How many three-digit numbers have digits that add up to 5?', ['15', '21', '10', '12'], {
  promptVi: 'Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng 5?',
  explanation: 'The first digit a is 1 to 5, and the other two digits add up to 5 − a, which can be done in 6 − a ways: 5 + 4 + 3 + 2 + 1 = 15.',
  explanationVi: 'Chữ số đầu a từ 1 đến 5, hai chữ số còn lại có tổng 5 − a, có 6 − a cách: 5 + 4 + 3 + 2 + 1 = 15.',
});
add(NT, 5, 'What is the greatest common divisor of 2¹² − 1 and 2¹⁸ − 1?', ['63', '4095', '3', '7'], {
  promptVi: 'Ước chung lớn nhất của 2¹² − 1 và 2¹⁸ − 1 là bao nhiêu?',
  explanation: 'GCD(2ᵃ − 1, 2ᵇ − 1) = 2^GCD(a, b) − 1. GCD(12, 18) = 6, so the answer is 2⁶ − 1 = 63.',
  explanationVi: 'ƯCLN(2ᵃ − 1, 2ᵇ − 1) = 2^ƯCLN(a, b) − 1. ƯCLN(12, 18) = 6, nên kết quả là 2⁶ − 1 = 63.',
});

// ── Combinatorics ────────────────────────────────────────────────────────
add(COMB, 3, 'An ant walks along the lines of a grid from the point (0; 0) to the point (4; 3), each step going one unit right or one unit up. How many different routes are there?', ['35', '12', '7', '70'], {
  promptVi: 'Một con kiến đi theo các đường lưới từ điểm (0; 0) đến điểm (4; 3), mỗi bước đi sang phải một đơn vị hoặc lên trên một đơn vị. Có bao nhiêu đường đi khác nhau?',
  explanation: 'Every route is 7 steps, 4 of them "right". Choose which 3 are "up": C(7, 3) = 35.',
  explanationVi: 'Mỗi đường đi gồm 7 bước, trong đó 4 bước "phải". Chọn 3 bước "lên": C(7, 3) = 35.',
});
add(COMB, 4, 'Moving only one unit right or one unit up along grid lines, how many routes go from (0; 0) to (4; 4) without passing through the point (2; 2)?', ['34', '70', '36', '32'], {
  promptVi: 'Chỉ đi sang phải hoặc lên trên một đơn vị theo các đường lưới, có bao nhiêu đường đi từ (0; 0) đến (4; 4) mà không đi qua điểm (2; 2)?',
  explanation: 'All routes: C(8, 4) = 70. Routes through (2; 2): C(4, 2) × C(4, 2) = 36. So 70 − 36 = 34.',
  explanationVi: 'Tất cả: C(8, 4) = 70. Đi qua (2; 2): C(4, 2) × C(4, 2) = 36. Vậy 70 − 36 = 34.',
});
add(COMB, 3, 'At a party, each of 12 guests shakes hands once with every other guest. How many handshakes are there?', ['66', '132', '144', '78'], {
  promptVi: 'Trong một bữa tiệc, mỗi người trong 12 khách bắt tay đúng một lần với mỗi người khác. Có tất cả bao nhiêu cái bắt tay?',
  explanation: 'Each handshake is a pair of guests: 12 × 11 ÷ 2 = 66.',
  explanationVi: 'Mỗi cái bắt tay ứng với một cặp khách: 12 × 11 : 2 = 66.',
});
add(COMB, 4, 'In a chess tournament every two players met exactly once, and 45 games were played. How many players were there?', ['10', '9', '15', '45'], {
  promptVi: 'Trong một giải cờ vua, hai kì thủ bất kì gặp nhau đúng một lần, và có tất cả 45 ván đấu. Giải có bao nhiêu kì thủ?',
  explanation: 'n players play n(n − 1)/2 games. n(n − 1) = 90 = 10 × 9, so n = 10.',
  explanationVi: 'n kì thủ đấu n(n − 1)/2 ván. n(n − 1) = 90 = 10 × 9, nên n = 10.',
});
add(COMB, 3, 'How many diagonals does a convex 12-sided polygon have?', ['54', '66', '108', '48'], {
  promptVi: 'Một đa giác lồi 12 cạnh có bao nhiêu đường chéo?',
  explanation: 'Each vertex joins 12 − 3 = 9 others by a diagonal, and each diagonal is counted twice: 12 × 9 ÷ 2 = 54.',
  explanationVi: 'Mỗi đỉnh nối với 12 − 3 = 9 đỉnh khác bằng đường chéo, mỗi đường chéo được đếm hai lần: 12 × 9 : 2 = 54.',
});
add(COMB, 4, 'How many different "words" (any order of letters) can be made by rearranging all six letters of BANANA?', ['60', '720', '120', '36'], {
  promptVi: 'Có thể tạo được bao nhiêu "từ" khác nhau (thứ tự chữ cái bất kì) bằng cách sắp xếp lại cả sáu chữ cái của BANANA?',
  explanation: 'There are 6! orders, but swapping the three A\'s or the two N\'s gives the same word: 720 ÷ (3! × 2!) = 60.',
  explanationVi: 'Có 6! cách xếp, nhưng đổi chỗ ba chữ A hoặc hai chữ N cho cùng một từ: 720 : (3! × 2!) = 60.',
});
add(COMB, 4, 'In how many ways can 5 friends, including An and Binh, stand in a row so that An and Binh stand next to each other?', ['48', '24', '120', '72'], {
  promptVi: 'Có bao nhiêu cách xếp 5 bạn, trong đó có An và Bình, đứng thành một hàng sao cho An và Bình đứng cạnh nhau?',
  explanation: 'Glue An and Binh into one block: 4 items give 4! = 24 orders, and the block can be An–Binh or Binh–An: 24 × 2 = 48.',
  explanationVi: 'Gộp An và Bình thành một khối: 4 phần tử có 4! = 24 cách xếp, khối có 2 cách (An–Bình hoặc Bình–An): 24 × 2 = 48.',
});
add(COMB, 5, 'In how many ways can 5 friends, including An and Binh, stand in a row so that An and Binh are NOT next to each other?', ['72', '48', '96', '60'], {
  promptVi: 'Có bao nhiêu cách xếp 5 bạn, trong đó có An và Bình, đứng thành một hàng sao cho An và Bình KHÔNG đứng cạnh nhau?',
  explanation: 'All orders: 5! = 120. Orders with them together: 2 × 4! = 48. So 120 − 48 = 72.',
  explanationVi: 'Tất cả: 5! = 120. Hai bạn đứng cạnh nhau: 2 × 4! = 48. Vậy 120 − 48 = 72.',
});
add(COMB, 3, 'A drawer holds 6 red, 8 blue and 10 white socks. In the dark, what is the smallest number of socks you must take to be sure of getting two of the same colour?', ['4', '3', '11', '2'], {
  promptVi: 'Một ngăn kéo có 6 chiếc tất đỏ, 8 chiếc xanh và 10 chiếc trắng. Trong bóng tối, phải lấy ra ít nhất bao nhiêu chiếc để chắc chắn có hai chiếc cùng màu?',
  explanation: 'With 3 socks you might get one of each colour; a 4th sock must repeat a colour (pigeonhole principle).',
  explanationVi: 'Lấy 3 chiếc có thể được mỗi màu một chiếc; chiếc thứ 4 chắc chắn trùng màu (nguyên lí Dirichlet).',
});
add(COMB, 4, 'A drawer holds 6 red, 8 blue and 10 white socks. In the dark, what is the smallest number of socks you must take to be sure of getting three of the same colour?', ['7', '9', '6', '4'], {
  promptVi: 'Một ngăn kéo có 6 chiếc tất đỏ, 8 chiếc xanh và 10 chiếc trắng. Trong bóng tối, phải lấy ra ít nhất bao nhiêu chiếc để chắc chắn có ba chiếc cùng màu?',
  explanation: 'The worst case is 2 of each colour, 6 socks; the 7th sock makes three of one colour.',
  explanationVi: 'Trường hợp xấu nhất là mỗi màu 2 chiếc, tức 6 chiếc; chiếc thứ 7 tạo ra ba chiếc cùng màu.',
});
add(COMB, 4, 'A drawer holds 6 red, 8 blue and 10 white socks. In the dark, what is the smallest number of socks you must take to be sure of getting two RED socks?', ['20', '4', '19', '8'], {
  promptVi: 'Một ngăn kéo có 6 chiếc tất đỏ, 8 chiếc xanh và 10 chiếc trắng. Trong bóng tối, phải lấy ra ít nhất bao nhiêu chiếc để chắc chắn có hai chiếc màu ĐỎ?',
  explanation: 'In the worst case you first take all 8 + 10 = 18 blue and white socks; then 2 more are red: 20.',
  explanationVi: 'Trường hợp xấu nhất là lấy hết 8 + 10 = 18 chiếc xanh và trắng trước; thêm 2 chiếc nữa là đỏ: 20.',
});
add(COMB, 5, 'A year can have 366 days (including 29 February). What is the smallest number of students a school must have to be sure that at least 3 of them share a birthday?', ['733', '367', '732', '1099'], {
  promptVi: 'Một năm có thể có 366 ngày (tính cả ngày 29/2). Trường phải có ít nhất bao nhiêu học sinh để chắc chắn có ít nhất 3 bạn trùng ngày sinh nhật?',
  explanation: 'With 2 × 366 = 732 students, each day could have exactly 2. One more student forces a third on some day: 733.',
  explanationVi: 'Với 2 × 366 = 732 học sinh, có thể mỗi ngày đúng 2 bạn. Thêm một bạn nữa thì có ngày có 3 bạn: 733.',
});
add(COMB, 4, 'A rectangle is divided into a grid of unit squares with 3 rows and 4 columns. How many rectangles (of any size, squares included) can be seen in the grid?', ['60', '12', '30', '72'], {
  promptVi: 'Một hình chữ nhật được chia thành lưới ô vuông đơn vị gồm 3 hàng và 4 cột. Trong hình có bao nhiêu hình chữ nhật (mọi kích thước, kể cả hình vuông)?',
  explanation: 'A rectangle is fixed by 2 of the 4 horizontal lines and 2 of the 5 vertical lines: C(4, 2) × C(5, 2) = 6 × 10 = 60.',
  explanationVi: 'Mỗi hình chữ nhật được xác định bởi 2 trong 4 đường ngang và 2 trong 5 đường dọc: C(4, 2) × C(5, 2) = 6 × 10 = 60.',
});
add(COMB, 4, 'How many squares of any size are there in a 4 × 4 grid of unit squares?', ['30', '16', '20', '25'], {
  promptVi: 'Trong một lưới ô vuông 4 × 4 có bao nhiêu hình vuông (mọi kích thước)?',
  explanation: '1 × 1: 16, 2 × 2: 9, 3 × 3: 4, 4 × 4: 1. Total 16 + 9 + 4 + 1 = 30.',
  explanationVi: '1 × 1: 16, 2 × 2: 9, 3 × 3: 4, 4 × 4: 1. Tổng 16 + 9 + 4 + 1 = 30.',
});
add(COMB, 5, 'In triangle ABC, four segments are drawn from vertex A to four different points on side BC. How many triangles are there in the figure?', ['15', '5', '10', '20'], {
  promptVi: 'Trong tam giác ABC, kẻ bốn đoạn thẳng từ đỉnh A đến bốn điểm khác nhau trên cạnh BC. Trong hình có bao nhiêu tam giác?',
  explanation: 'Every triangle has vertex A and two of the 6 points on BC (B, C and the four new points) as its base: C(6, 2) = 15.',
  explanationVi: 'Mỗi tam giác có đỉnh A và đáy là hai trong 6 điểm trên BC (B, C và bốn điểm mới): C(6, 2) = 15.',
});
add(COMB, 5, 'How many four-digit numbers have four different digits?', ['4536', '5040', '3024', '9000'], {
  promptVi: 'Có bao nhiêu số có bốn chữ số mà bốn chữ số đôi một khác nhau?',
  explanation: 'First digit: 9 choices (not 0); then 9, 8 and 7 choices for the others: 9 × 9 × 8 × 7 = 4536.',
  explanationVi: 'Chữ số đầu: 9 cách (khác 0); các chữ số sau lần lượt 9, 8, 7 cách: 9 × 9 × 8 × 7 = 4536.',
});
add(COMB, 3, 'Using the digits 1, 2, 3, 4, 5, each at most once, how many even three-digit numbers can be made?', ['24', '60', '48', '12'], {
  promptVi: 'Dùng các chữ số 1, 2, 3, 4, 5, mỗi chữ số dùng nhiều nhất một lần, lập được bao nhiêu số chẵn có ba chữ số?',
  explanation: 'The last digit is 2 or 4 (2 ways); then 4 and 3 choices for the other two digits: 2 × 4 × 3 = 24.',
  explanationVi: 'Chữ số cuối là 2 hoặc 4 (2 cách); hai chữ số còn lại có 4 và 3 cách: 2 × 4 × 3 = 24.',
});
add(COMB, 5, 'A team of 3 is chosen from 5 boys and 4 girls. How many teams have at least one girl?', ['74', '84', '40', '80'], {
  promptVi: 'Chọn một đội 3 người từ 5 bạn nam và 4 bạn nữ. Có bao nhiêu cách chọn đội có ít nhất một bạn nữ?',
  explanation: 'All teams: C(9, 3) = 84. All-boy teams: C(5, 3) = 10. So 84 − 10 = 74.',
  explanationVi: 'Tất cả: C(9, 3) = 84. Đội toàn nam: C(5, 3) = 10. Vậy 84 − 10 = 74.',
});
add(COMB, 4, 'Mai climbs a staircase of 8 steps, going up 1 or 2 steps at a time. In how many different ways can she reach the top?', ['34', '21', '55', '16'], {
  promptVi: 'Mai leo cầu thang 8 bậc, mỗi lần bước lên 1 hoặc 2 bậc. Có bao nhiêu cách khác nhau để Mai lên đến bậc trên cùng?',
  explanation: 'Ways(n) = Ways(n − 1) + Ways(n − 2), depending on the last stride: 1, 2, 3, 5, 8, 13, 21, 34.',
  explanationVi: 'Số cách(n) = Số cách(n − 1) + Số cách(n − 2), tùy bước cuối: 1, 2, 3, 5, 8, 13, 21, 34.',
});
add(COMB, 5, 'Nine points are arranged in a 3 × 3 square grid (3 rows of 3 equally spaced points). How many triangles have all three vertices among these points?', ['76', '84', '72', '80'], {
  promptVi: 'Chín điểm xếp thành lưới vuông 3 × 3 (3 hàng, mỗi hàng 3 điểm cách đều). Có bao nhiêu tam giác có cả ba đỉnh là các điểm này?',
  explanation: 'C(9, 3) = 84 triples, minus the 8 collinear ones (3 rows, 3 columns, 2 diagonals): 84 − 8 = 76.',
  explanationVi: 'Có C(9, 3) = 84 bộ ba điểm, bớt 8 bộ thẳng hàng (3 hàng, 3 cột, 2 đường chéo): 84 − 8 = 76.',
});
add(COMB, 4, 'In how many ways can 6 people sit around a round table, if two seatings that differ only by a rotation count as the same?', ['120', '720', '60', '360'], {
  promptVi: 'Có bao nhiêu cách xếp 6 người ngồi quanh một bàn tròn, nếu hai cách chỉ khác nhau bởi một phép xoay được coi là như nhau?',
  explanation: 'Fix one person\'s seat to remove rotations; the other 5 can be arranged in 5! = 120 ways.',
  explanationVi: 'Cố định chỗ của một người để bỏ các phép xoay; 5 người còn lại có 5! = 120 cách xếp.',
});
add(COMB, 5, 'How many ways are there to write 10 = a + b + c with a, b, c positive whole numbers, where the order matters (so 1 + 2 + 7 and 7 + 2 + 1 are different)?', ['36', '8', '45', '28'], {
  promptVi: 'Có bao nhiêu cách viết 10 = a + b + c với a, b, c là các số nguyên dương, có kể thứ tự (1 + 2 + 7 và 7 + 2 + 1 là khác nhau)?',
  explanation: 'Stars and bars: put 2 dividers in the 9 gaps between 10 stars: C(9, 2) = 36.',
  explanationVi: 'Phương pháp "chia kẹo": đặt 2 vách ngăn vào 9 khe giữa 10 ngôi sao: C(9, 2) = 36.',
});

// ── Geometry ─────────────────────────────────────────────────────────────
add(GEO, 3, 'What is the size of each interior angle of a regular 12-sided polygon?', ['150°', '144°', '160°', '30°'], {
  promptVi: 'Mỗi góc trong của một đa giác đều 12 cạnh bằng bao nhiêu độ?',
  explanation: 'Each exterior angle is 360° ÷ 12 = 30°, so each interior angle is 180° − 30° = 150°.',
  explanationVi: 'Mỗi góc ngoài bằng 360° : 12 = 30°, nên mỗi góc trong bằng 180° − 30° = 150°.',
});
add(GEO, 3, 'What is the sum of the interior angles of a convex 9-sided polygon?', ['1260°', '1620°', '1440°', '1080°'], {
  promptVi: 'Tổng các góc trong của một đa giác lồi 9 cạnh là bao nhiêu độ?',
  explanation: 'A polygon with n sides splits into n − 2 triangles from one vertex: (9 − 2) × 180° = 1260°.',
  explanationVi: 'Từ một đỉnh, đa giác n cạnh chia được thành n − 2 tam giác: (9 − 2) × 180° = 1260°.',
});
add(GEO, 4, 'Each interior angle of a regular polygon is 156°. How many sides does it have?', ['15', '12', '18', '24'], {
  promptVi: 'Mỗi góc trong của một đa giác đều bằng 156°. Đa giác đó có bao nhiêu cạnh?',
  explanation: 'Each exterior angle is 180° − 156° = 24°, and the exterior angles add up to 360°: 360 ÷ 24 = 15 sides.',
  explanationVi: 'Mỗi góc ngoài bằng 180° − 156° = 24°, và tổng các góc ngoài là 360°: 360 : 24 = 15 cạnh.',
});
add(GEO, 4, 'A five-pointed star is drawn with five straight segments, each joining every second point of five points on a circle (the points need not be evenly spaced). What is the sum of the five angles at the tips of the star?', ['180°', '360°', '540°', '300°'], {
  promptVi: 'Một ngôi sao năm cánh được vẽ bằng năm đoạn thẳng, mỗi đoạn nối cách một điểm trong năm điểm trên một đường tròn (các điểm không nhất thiết cách đều). Tổng năm góc ở năm đỉnh ngôi sao bằng bao nhiêu?',
  explanation: 'Each tip angle is an inscribed angle standing on one of the five arcs between neighbouring points, i.e. half that arc. The arcs add up to 360°, so the tips add up to 180°.',
  explanationVi: 'Mỗi góc ở đỉnh là góc nội tiếp chắn một trong năm cung giữa hai điểm kề nhau, nên bằng nửa cung đó. Năm cung có tổng 360°, nên tổng năm góc là 180°.',
});
add(GEO, 4, 'Square ABCD and equilateral triangle ABE share the side AB, and E lies outside the square. What is angle AED?', ['15°', '30°', '45°', '75°'], {
  promptVi: 'Hình vuông ABCD và tam giác đều ABE có chung cạnh AB, điểm E nằm ngoài hình vuông. Tính góc AED.',
  explanation: 'AD = AB = AE, so triangle ADE is isosceles with angle DAE = 90° + 60° = 150°. Its base angles are (180° − 150°) ÷ 2 = 15°.',
  explanationVi: 'AD = AB = AE nên tam giác ADE cân tại A, với góc DAE = 90° + 60° = 150°. Hai góc đáy bằng (180° − 150°) : 2 = 15°.',
});
add(GEO, 5, 'Square ABCD and equilateral triangle ABE share the side AB, and E lies inside the square. What is angle DEC?', ['150°', '120°', '135°', '160°'], {
  promptVi: 'Hình vuông ABCD và tam giác đều ABE có chung cạnh AB, điểm E nằm trong hình vuông. Tính góc DEC.',
  explanation: 'AD = AE and angle DAE = 90° − 60° = 30°, so angle AED = 75°; likewise angle BEC = 75°. Around E: 360° − 75° − 75° − 60° = 150°.',
  explanationVi: 'AD = AE và góc DAE = 90° − 60° = 30°, nên góc AED = 75°; tương tự góc BEC = 75°. Quanh điểm E: 360° − 75° − 75° − 60° = 150°.',
});
add(GEO, 3, 'A right triangle has legs of 20 cm and 21 cm. How long is its hypotenuse?', ['29 cm', '41 cm', '30 cm', '28 cm'], {
  promptVi: 'Một tam giác vuông có hai cạnh góc vuông dài 20 cm và 21 cm. Cạnh huyền dài bao nhiêu?',
  explanation: '20² + 21² = 400 + 441 = 841 = 29², so the hypotenuse is 29 cm.',
  explanationVi: '20² + 21² = 400 + 441 = 841 = 29², nên cạnh huyền dài 29 cm.',
});
add(GEO, 4, 'A rectangle has a diagonal of 25 cm and one side of 7 cm. What is its area?', ['168 cm²', '175 cm²', '84 cm²', '336 cm²'], {
  promptVi: 'Một hình chữ nhật có đường chéo dài 25 cm và một cạnh dài 7 cm. Tính diện tích hình chữ nhật.',
  explanation: 'The other side is √(25² − 7²) = √576 = 24 cm, so the area is 7 × 24 = 168 cm².',
  explanationVi: 'Cạnh còn lại bằng √(25² − 7²) = √576 = 24 cm, nên diện tích là 7 × 24 = 168 cm².',
});
add(GEO, 4, 'In triangle ABC, D is on AB and E is on AC with DE parallel to BC. AD = 4 cm, DB = 6 cm and BC = 15 cm. How long is DE?', ['6 cm', '10 cm', '9 cm', '7.5 cm'], {
  promptVi: 'Trong tam giác ABC, D thuộc AB và E thuộc AC sao cho DE song song với BC. AD = 4 cm, DB = 6 cm, BC = 15 cm. Tính DE.',
  explanation: 'Triangles ADE and ABC are similar with ratio AD/AB = 4/10, so DE = 15 × 4/10 = 6 cm.',
  explanationVi: 'Tam giác ADE đồng dạng với tam giác ABC theo tỉ số AD/AB = 4/10, nên DE = 15 × 4/10 = 6 cm.',
});
add(GEO, 5, 'In triangle ABC, DE is parallel to BC with D on AB and E on AC, and AD : DB = 2 : 3. The area of triangle ADE is 8 cm². What is the area of the trapezoid DBCE?', ['42 cm²', '50 cm²', '12 cm²', '18 cm²'], {
  promptVi: 'Trong tam giác ABC, DE song song với BC (D thuộc AB, E thuộc AC) và AD : DB = 2 : 3. Diện tích tam giác ADE là 8 cm². Tính diện tích hình thang DBCE.',
  explanation: 'AD : AB = 2 : 5, so areas are in ratio 4 : 25 and triangle ABC has area 8 × 25/4 = 50 cm². The trapezoid is 50 − 8 = 42 cm².',
  explanationVi: 'AD : AB = 2 : 5, nên tỉ số diện tích là 4 : 25 và tam giác ABC có diện tích 8 × 25/4 = 50 cm². Hình thang có diện tích 50 − 8 = 42 cm².',
});
add(GEO, 3, 'A circle is drawn inside a square of side 10 cm, touching all four sides. What is the area of the part of the square outside the circle?', ['100 − 25π cm²', '100 − 100π cm²', '100 − 10π cm²', '25π cm²'], {
  promptVi: 'Vẽ một hình tròn bên trong hình vuông cạnh 10 cm, tiếp xúc với cả bốn cạnh. Tính diện tích phần hình vuông nằm ngoài hình tròn.',
  explanation: 'The circle has diameter 10, so radius 5 and area 25π. The remaining part is 100 − 25π cm².',
  explanationVi: 'Hình tròn có đường kính 10, bán kính 5, diện tích 25π. Phần còn lại là 100 − 25π cm².',
});
add(GEO, 3, 'ABCD is a square of side 12 cm and M is the midpoint of BC. What is the area of quadrilateral AMCD?', ['108 cm²', '72 cm²', '36 cm²', '96 cm²'], {
  promptVi: 'ABCD là hình vuông cạnh 12 cm, M là trung điểm của BC. Tính diện tích tứ giác AMCD.',
  explanation: 'Cut off triangle ABM, which has area ½ × 12 × 6 = 36 cm²: 144 − 36 = 108 cm².',
  explanationVi: 'Bỏ đi tam giác ABM có diện tích ½ × 12 × 6 = 36 cm²: 144 − 36 = 108 cm².',
});
add(GEO, 5, 'ABCD is a square of side 10 cm (vertices in order). E is on AB with AE = 4 cm, and F is on BC with BF = 6 cm. What is the area of triangle DEF?', ['42 cm²', '50 cm²', '38 cm²', '58 cm²'], {
  promptVi: 'ABCD là hình vuông cạnh 10 cm (các đỉnh theo thứ tự). E thuộc AB với AE = 4 cm, F thuộc BC với BF = 6 cm. Tính diện tích tam giác DEF.',
  explanation: 'Subtract the three corner triangles from the square: ADE = 20, EBF = ½ × 6 × 6 = 18, FCD = ½ × 4 × 10 = 20. 100 − 58 = 42 cm².',
  explanationVi: 'Lấy hình vuông trừ ba tam giác ở góc: ADE = 20, EBF = ½ × 6 × 6 = 18, FCD = ½ × 4 × 10 = 20. 100 − 58 = 42 cm².',
});
add(GEO, 4, 'A 13 m ladder leans against a vertical wall with its foot 5 m from the wall. The foot slides 7 m further away from the wall. How far down the wall does the top slide?', ['7 m', '5 m', '12 m', '8 m'], {
  promptVi: 'Một chiếc thang dài 13 m dựa vào bức tường thẳng đứng, chân thang cách tường 5 m. Chân thang trượt ra xa tường thêm 7 m. Đầu thang trượt xuống bao nhiêu mét?',
  explanation: 'At first the top is √(13² − 5²) = 12 m high. With the foot 12 m away, the top is √(13² − 12²) = 5 m high. It slides 12 − 5 = 7 m.',
  explanationVi: 'Lúc đầu đầu thang cao √(13² − 5²) = 12 m. Khi chân thang cách tường 12 m, đầu thang cao √(13² − 12²) = 5 m. Nó trượt xuống 12 − 5 = 7 m.',
});
add(GEO, 4, 'A right triangle has hypotenuse 10 cm and area 24 cm². What is its perimeter?', ['24 cm', '28 cm', '22 cm', '34 cm'], {
  promptVi: 'Một tam giác vuông có cạnh huyền 10 cm và diện tích 24 cm². Tính chu vi tam giác.',
  explanation: 'With legs a, b: a² + b² = 100 and ab = 48, so (a + b)² = 100 + 96 = 196 and a + b = 14. Perimeter 14 + 10 = 24 cm.',
  explanationVi: 'Gọi hai cạnh góc vuông là a, b: a² + b² = 100 và ab = 48, nên (a + b)² = 100 + 96 = 196, a + b = 14. Chu vi 14 + 10 = 24 cm.',
});
add(GEO, 5, 'Triangle ABC has AB = AC and angle A = 20°. Point D lies on side AC with BD = BC. What is angle ABD?', ['60°', '20°', '40°', '50°'], {
  promptVi: 'Tam giác ABC có AB = AC và góc A = 20°. Điểm D nằm trên cạnh AC sao cho BD = BC. Tính góc ABD.',
  explanation: 'Angles B and C are 80°. In isosceles triangle BDC, angle BDC = angle C = 80°, so angle DBC = 20°. Then angle ABD = 80° − 20° = 60°.',
  explanationVi: 'Góc B = góc C = 80°. Trong tam giác cân BDC, góc BDC = góc C = 80°, nên góc DBC = 20°. Vậy góc ABD = 80° − 20° = 60°.',
});
add(GEO, 5, 'Each exterior angle of a regular polygon is 24°. How many diagonals does it have?', ['90', '105', '15', '75'], {
  promptVi: 'Mỗi góc ngoài của một đa giác đều bằng 24°. Đa giác đó có bao nhiêu đường chéo?',
  explanation: 'It has 360 ÷ 24 = 15 sides, so 15 × (15 − 3) ÷ 2 = 90 diagonals.',
  explanationVi: 'Đa giác có 360 : 24 = 15 cạnh, nên có 15 × (15 − 3) : 2 = 90 đường chéo.',
});
add(GEO, 3, 'The angles of a triangle are in the ratio 2 : 3 : 4. What is the largest angle?', ['80°', '90°', '60°', '100°'], {
  promptVi: 'Ba góc của một tam giác tỉ lệ với 2 : 3 : 4. Góc lớn nhất bằng bao nhiêu?',
  explanation: '2 + 3 + 4 = 9 parts make 180°, so one part is 20° and the largest angle is 4 × 20° = 80°.',
  explanationVi: '2 + 3 + 4 = 9 phần ứng với 180°, mỗi phần 20°, góc lớn nhất là 4 × 20° = 80°.',
});
add(GEO, 3, 'What is the area of an equilateral triangle with side 6 cm?', ['9√3 cm²', '18√3 cm²', '18 cm²', '36√3 cm²'], {
  promptVi: 'Tính diện tích tam giác đều có cạnh 6 cm.',
  explanation: 'The height is √(6² − 3²) = √27 = 3√3, so the area is ½ × 6 × 3√3 = 9√3 cm² (in general a²√3/4).',
  explanationVi: 'Chiều cao bằng √(6² − 3²) = √27 = 3√3, nên diện tích là ½ × 6 × 3√3 = 9√3 cm² (tổng quát a²√3/4).',
});
add(GEO, 4, 'A chord of length 8 cm is drawn in a circle of radius 5 cm. How far is the chord from the centre?', ['3 cm', '4 cm', '√41 cm', '1 cm'], {
  promptVi: 'Một dây cung dài 8 cm trong đường tròn bán kính 5 cm. Khoảng cách từ tâm đến dây cung là bao nhiêu?',
  explanation: 'The perpendicular from the centre bisects the chord, giving a right triangle with hypotenuse 5 and leg 4: the distance is √(25 − 16) = 3 cm.',
  explanationVi: 'Đường vuông góc từ tâm chia đôi dây cung, tạo tam giác vuông có cạnh huyền 5 và một cạnh 4: khoảng cách là √(25 − 16) = 3 cm.',
});
add(GEO, 4, 'A right triangle has legs of 15 cm and 20 cm. How long is the altitude drawn to the hypotenuse?', ['12 cm', '25 cm', '10 cm', '17.5 cm'], {
  promptVi: 'Một tam giác vuông có hai cạnh góc vuông 15 cm và 20 cm. Đường cao ứng với cạnh huyền dài bao nhiêu?',
  explanation: 'The hypotenuse is 25. Twice the area is 15 × 20 = 300 = 25 × h, so h = 12 cm.',
  explanationVi: 'Cạnh huyền bằng 25. Hai lần diện tích là 15 × 20 = 300 = 25 × h, nên h = 12 cm.',
});
add(GEO, 4, 'ABCDEF is a regular hexagon. What is angle ACD?', ['90°', '120°', '60°', '30°'], {
  promptVi: 'ABCDEF là một lục giác đều. Tính góc ACD.',
  explanation: 'Angle BCD = 120° and triangle ABC is isosceles with apex angle 120°, so angle BCA = 30°. Then angle ACD = 120° − 30° = 90° (AD is a diameter of the circumcircle).',
  explanationVi: 'Góc BCD = 120°, tam giác ABC cân có góc ở đỉnh 120°, nên góc BCA = 30°. Vậy góc ACD = 120° − 30° = 90° (AD là đường kính đường tròn ngoại tiếp).',
});
add(GEO, 4, 'In a square of side 8 cm, a quarter circle of radius 4 cm is drawn at each corner, centred at that corner. What is the area of the part of the square not covered by the quarter circles?', ['64 − 16π cm²', '64 − 4π cm²', '64 − 64π cm²', '16π cm²'], {
  promptVi: 'Trong hình vuông cạnh 8 cm, tại mỗi đỉnh vẽ một phần tư hình tròn bán kính 4 cm có tâm là đỉnh đó. Tính diện tích phần hình vuông không bị các phần tư hình tròn che phủ.',
  explanation: 'The four quarter circles do not overlap (radius 4 is half the side) and together make one full circle of area 16π. 64 − 16π cm².',
  explanationVi: 'Bốn phần tư hình tròn không chồng lên nhau (bán kính 4 bằng nửa cạnh) và ghép lại thành một hình tròn diện tích 16π. Kết quả 64 − 16π cm².',
});

export const olympiadQuestions = list;
