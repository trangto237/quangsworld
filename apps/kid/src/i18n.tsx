import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@atlas/ui';

/**
 * Language help for a Vietnamese learner.
 * - `help` (default): English UI; every phrase has a dotted underline — hover (laptop) or tap (phone) shows Vietnamese.
 *   Buttons show a small Vietnamese line underneath. Immersion with a safety net.
 * - `vi`: Vietnamese UI, English on hover — for when English is still a big barrier.
 * - `en`: English only.
 */
export type LangMode = 'help' | 'vi' | 'en';

export const LangContext = createContext<LangMode>('help');
export const useLang = () => useContext(LangContext);

const VI: Record<string, string> = {
  // Profile picker
  "Who's playing?": 'Ai sẽ chơi hôm nay?',
  'Your adventure is almost ready!': 'Cuộc phiêu lưu sắp sẵn sàng rồi!',
  'Ask a parent to create your hero profile first.': 'Hãy nhờ bố mẹ tạo hồ sơ anh hùng cho em trước nhé.',
  'Open parent setup →': 'Mở phần cài đặt cho phụ huynh →',
  'Parent dashboard': 'Trang dành cho phụ huynh',
  'Hi {name}! Enter your PIN': 'Chào {name}! Nhập mã PIN của em',
  'Not quite — try again.': 'Chưa đúng — thử lại nhé.',
  // Hub
  "Today's quest · {n} min": 'Nhiệm vụ hôm nay · {n} phút',
  'Quest complete! 🏆': 'Hoàn thành nhiệm vụ! 🏆',
  'Your path for today': 'Hành trình hôm nay của em',
  '{m} / {n} min played today': 'Hôm nay đã chơi {m} / {n} phút',
  '▶ Play: {title}': '▶ Chơi: {title}',
  Worlds: 'Các thế giới',
  '📕 Mistake Book': '📕 Sổ lỗi sai',
  '🛒 Armoury': '🛒 Kho vũ khí',
  '{d} min': '{d} phút',
  Vocabulary: 'Từ vựng',
  Grammar: 'Ngữ pháp',
  Listening: 'Nghe',
  Reading: 'Đọc hiểu',
  Number: 'Số học',
  Algebra: 'Đại số',
  Geometry: 'Hình học',
  Statistics: 'Thống kê',
  Combinatorics: 'Tổ hợp',
  'Mathematical Reasoning': 'Tư duy toán học',
  'Pattern recognition': 'Nhận biết quy luật',
  Deduction: 'Suy luận',
  'Spatial reasoning': 'Tư duy không gian',
  'Chess puzzles': 'Câu đố cờ vua',
  Sequence: 'Sắp xếp thứ tự',
  'Boss Battle': 'Đánh trùm',
  'Word Forest': 'Rừng Từ Vựng',
  'Grammar Forge': 'Lò Rèn Ngữ Pháp',
  'Echo Caves': 'Hang Tiếng Vọng',
  'Reading Ruins': 'Tàn Tích Đọc Hiểu',
  'Number Citadel': 'Thành Trì Con Số',
  'Algebra Peaks': 'Đỉnh Núi Đại Số',
  'Geometry Isles': 'Quần Đảo Hình Học',
  'Logic Labyrinth': 'Mê Cung Logic',
  'Story Library': 'Thư Viện Truyện',
  'Hunt rare words among the ancient trees.': 'Săn những từ hiếm giữa rừng cây cổ thụ.',
  'Hammer sentences into shape.': 'Rèn câu cho thật chuẩn.',
  'Listen closely — the caves whisper answers.': 'Lắng nghe kỹ — hang động thì thầm đáp án.',
  'Decode the tablets of a lost civilisation.': 'Giải mã phiến đá của một nền văn minh đã mất.',
  'Defend the walls with the power of numbers.': 'Bảo vệ tường thành bằng sức mạnh của con số.',
  'Climb by balancing the unknown.': 'Leo lên bằng cách cân bằng ẩn số.',
  'Chart islands of angles and shapes.': 'Vẽ bản đồ những hòn đảo góc và hình.',
  'A maze only the sharpest minds escape.': 'Mê cung chỉ những bộ óc sắc bén nhất mới thoát ra được.',
  'Every book hides a guardian.': 'Mỗi cuốn sách đều có một người canh giữ.',
  // World
  '📖 Scroll of wisdom': '📖 Cuộn giấy thông thái',
  '⚡ Quick (3 min)': '⚡ Nhanh (3 phút)',
  '⚔️ Battle (6 min)': '⚔️ Chiến đấu (6 phút)',
  '⚔️ Play (6 min)': '⚔️ Chơi (6 phút)',
  Review: 'Ôn tập',
  // Battle
  'Summoning the battlefield…': 'Đang triệu hồi chiến trường…',
  '♛ Checkmate Strike! 5 in a row!': '♛ Đòn Chiếu Hết! Đúng 5 câu liên tiếp!',
  'A Glitch reached the castle!': 'Một con Glitch đã tới lâu đài!',
  'A tower is out of ammo — answer to resupply!': 'Một tháp đã hết đạn — trả lời đúng để nạp đạn!',
  'The Glitches surge forward!': 'Bọn Glitch lao lên phía trước!',
  'Tap a square to build · tap a tower to upgrade · correct answers reload ➶ ammo': 'Chạm ô để xây · chạm tháp để nâng cấp · trả lời đúng để nạp ➶ đạn',
  'Keyboard: 1–4 to answer': 'Bàn phím: phím 1–4 để trả lời',
  ' · R to replay': ' · phím R để nghe lại',
  'Hold the line — finish off the Glitches!': 'Giữ vững phòng tuyến — tiêu diệt nốt bọn Glitch!',
  'Leave the battle?': 'Rời trận đấu?',
  'Keep fighting': 'Chiến tiếp',
  Leave: 'Rời đi',
  'Your answers so far are saved and still count.': 'Các câu trả lời đến giờ đã được lưu và vẫn được tính.',
  "Your answers so far are saved and still count. You'll get a smaller reward.": 'Các câu trả lời đến giờ đã được lưu và vẫn được tính. Em sẽ nhận phần thưởng ít hơn.',
  'Your progress in this realm is saved. You can continue later.': 'Tiến độ ở vương quốc này đã được lưu. Em có thể chơi tiếp sau.',
  'Answer challenges to earn ⚡ energy, then tap the board to build towers. Correct answers also reload their ammo!':
    'Trả lời thử thách để nhận ⚡ năng lượng, rồi chạm vào bàn cờ để xây tháp. Trả lời đúng còn nạp lại đạn cho tháp!',
  "Answer challenges to earn ⚡ energy, then tap the board to build towers. The Oracle protects your castle here — it can't fall!":
    'Trả lời thử thách để nhận ⚡ năng lượng, rồi chạm vào bàn cờ để xây tháp. Nhà tiên tri bảo vệ lâu đài — ở đây lâu đài không thể thất thủ!',
  "📕 Saved — you'll review it after the battle": '📕 Đã lưu — em sẽ xem lại sau trận',
  'Realm freed': 'Giải phóng vương quốc',
  'Pawn Archer': 'Tốt Cung Thủ',
  'Rook Wall': 'Tường Thành Xe',
  'Knight Lancer': 'Mã Kỵ Sĩ',
  'Bishop Frost': 'Tượng Băng Giá',
  'Queen Storm': 'Hậu Bão Tố',
  // Question card
  '📜 Ancient tablet': '📜 Phiến đá cổ',
  '🔊 Play echo': '🔊 Nghe tiếng vọng',
  Next: 'Tiếp',
  '✗ You chose:': '✗ Em đã chọn:',
  '✓ Answer:': '✓ Đáp án:',
  '🔊 What was said:': '🔊 Nội dung đã nghe:',
  'play slowly': 'nghe chậm',
  // Review
  '📕 Mistake review': '📕 Xem lại lỗi sai',
  '← Back': '← Quay lại',
  'Done ✓': 'Xong ✓',
  'Got it →': 'Đã hiểu →',
  'Missed {n} times — it stays in your Mistake Book until you get it right there.': 'Sai {n} lần — câu này sẽ ở trong Sổ lỗi sai cho tới khi em làm đúng.',
  // Results
  'Strategic retreat': 'Rút lui chiến thuật',
  'Victory!': 'Chiến thắng!',
  'The castle fell…': 'Lâu đài đã thất thủ…',
  'Out of breath…': 'Hết hơi rồi…',
  'The Glitch king escaped…': 'Vua Glitch đã trốn thoát…',
  'The boss won this time…': 'Lần này trùm đã thắng…',
  'The rocket ran out of fuel…': 'Tên lửa hết nhiên liệu rồi…',
  'The city took too many hits…': 'Thành phố bị trúng quá nhiều thiên thạch…',
  'Lost on penalties…': 'Thua trên chấm phạt đền…',
  'Off the podium this time…': 'Lần này chưa lên được bục…',
  'The case went cold…': 'Vụ án đã bế tắc…',
  '{name}, the realm is safe!': '{name}, vương quốc đã an toàn!',
  'Rest up, hero. The Glitches will be back.': 'Nghỉ ngơi đi, anh hùng. Bọn Glitch sẽ quay lại.',
  'Every hero loses sometimes. You still grew stronger.': 'Anh hùng nào cũng có lúc thua. Em vẫn mạnh lên rồi.',
  '⬆ LEVEL UP! Level {n}': '⬆ LÊN CẤP! Cấp {n}',
  Accuracy: 'Độ chính xác',
  Challenges: 'Thử thách',
  'Best streak': 'Chuỗi đúng dài nhất',
  Powers: 'Sức mạnh',
  'NEW ★': '★ MỚI',
  '📕 {n} to review': '📕 {n} câu cần xem lại',
  "No time to read during battle — let's look at them together now. They're also saved in your Mistake Book.":
    'Trong trận không có thời gian đọc — giờ mình cùng xem lại nhé. Các câu này cũng đã được lưu trong Sổ lỗi sai.',
  'Review my mistakes →': 'Xem lại lỗi sai →',
  "Later (they'll wait in the Mistake Book)": 'Để sau (các câu sẽ chờ trong Sổ lỗi sai)',
  '✓ Reviewed. Fix them for good in the Mistake Book to earn coins.': '✓ Đã xem lại. Sửa hẳn trong Sổ lỗi sai để nhận xu nhé.',
  'Continue →': 'Tiếp tục →',
  // Mistake Book
  'Every challenge you missed in battle. Get it right here to fix it — and earn 🪙 {n} each.': 'Mọi thử thách em làm sai trong trận. Làm đúng ở đây để sửa lỗi — và nhận 🪙 {n} mỗi câu.',
  'Fix them ({n}) →': 'Sửa lỗi ({n}) →',
  '✨ {n} fixed this week': '✨ Tuần này đã sửa {n} lỗi',
  'Your Mistake Book is empty!': 'Sổ lỗi sai trống trơn!',
  'Mistakes from battles will appear here.': 'Lỗi sai trong các trận đấu sẽ hiện ở đây.',
  'Fix these ({n})': 'Sửa các câu này ({n})',
  new: 'mới',
  Mistake: 'Lỗi sai',
  'Got it': 'Đã hiểu',
  'Stop for now': 'Dừng tại đây',
  'Fixed {f} of {n}!': 'Đã sửa {f}/{n} câu!',
  'The rest stay in your book for another try.': 'Các câu còn lại vẫn trong sổ để thử lần sau.',
  'Your book is lighter already.': 'Sổ của em đã nhẹ bớt rồi.',
  Done: 'Xong',
  // Placement
  'The Trial of Five Realms': 'Thử thách Năm Vương Quốc',
  "Glitches have taken over five realms, and each realm is a different game: a race, a castle siege, two boss duels and a chess hunt. Answer the challenges to free each realm — every realm you free reveals one of your hidden powers. Some challenges are easy, some are very tricky. That's how the Oracle discovers what you can do!":
    'Bọn Glitch đã chiếm năm vương quốc, và mỗi vương quốc là một trò chơi khác nhau: một cuộc đua, một trận thủ thành, hai trận đấu trùm và một cuộc săn trên bàn cờ. Hãy trả lời các thử thách để giải phóng từng vương quốc — mỗi vương quốc được giải phóng sẽ hé lộ một sức mạnh tiềm ẩn của em. Có thử thách dễ, có thử thách rất khó. Đó là cách Nhà tiên tri khám phá khả năng của em!',
  'Show me the realms →': 'Xem các vương quốc →',
  'The Five Realms': 'Năm Vương Quốc',
  'Free them one by one. You can rest between realms — your progress is saved.': 'Giải phóng từng vương quốc một. Em có thể nghỉ giữa các vương quốc — tiến độ đã được lưu.',
  '🔒 Free the realm before it': '🔒 Hãy giải phóng vương quốc trước đó',
  'challenges done': 'thử thách đã xong',
  'Enter ▶': 'Vào ▶',
  'Close': 'Đóng',
  'Practice papers for the grade-10 entrance exam.': 'Đề luyện thi vào lớp 10.',
  'Every rule explained, with practice.': 'Giải thích mọi quy tắc, kèm bài luyện.',
  'Your hero: powers, badges and settings.': 'Anh hùng của em: sức mạnh, huy hiệu và cài đặt.',
  'All done for today! 🏆': 'Xong hết nhiệm vụ hôm nay! 🏆',
  'All worlds': 'Tất cả thế giới',
  'Answer 500 questions.': 'Trả lời 500 câu hỏi.',
  'Answer your first quest question.': 'Trả lời câu hỏi nhiệm vụ đầu tiên.',
  'Apprentice': 'Tập sự',
  'Armoury': 'Kho vũ khí',
  'Back': 'Quay lại',
  'Champion': 'Nhà vô địch',
  'Cloud sync problem': 'Lỗi đồng bộ đám mây',
  'Coins and gems': 'Xu và đá quý',
  'Connect': 'Kết nối',
  'Day / night': 'Ngày / đêm',
  'Done!': 'Xong!',
  'Exam Ready': 'Sẵn sàng thi',
  'Explorer': 'Nhà thám hiểm',
  'Finish 3 practice exams.': 'Làm xong 3 đề thi thử.',
  'First Quest': 'Nhiệm vụ đầu tiên',
  'Fix 20 mistakes in the Mistake Book.': 'Sửa 20 lỗi trong Sổ lỗi sai.',
  "Fix the questions you got wrong — they come back until you've got them.": 'Sửa các câu đã làm sai — chúng sẽ quay lại cho đến khi em làm đúng.',
  'Get 3 stars in 10 topics.': 'Đạt 3 sao ở 10 chủ đề.',
  'Hero profile': 'Hồ sơ anh hùng',
  'Legend': 'Huyền thoại',
  'Mistake Book': 'Sổ lỗi sai',
  'Mistake Fixer': 'Thợ sửa lỗi',
  'Offline — saving on this device for now': 'Ngoại tuyến — tạm lưu trên thiết bị này',
  'On Fire': 'Bùng cháy',
  'Play': 'Chơi',
  'Play 3 days in a row.': 'Chơi 3 ngày liên tiếp.',
  'Play 7 days in a row.': 'Chơi 7 ngày liên tiếp.',
  'Play in 6 different worlds.': 'Chơi ở 6 thế giới khác nhau.',
  'Practise word stress and reach 80 mastery.': 'Luyện trọng âm và đạt 80 điểm thành thạo.',
  "Progress made here stays on this device and won't show on your other devices. Connect with your email or the family code.": 'Tiến độ trên thiết bị này chỉ lưu ở đây và không hiện trên các thiết bị khác. Hãy kết nối bằng email hoặc mã gia đình.',
  'Quests': 'Nhiệm vụ',
  'Ranger': 'Kiểm lâm',
  'Reach level 5.': 'Đạt cấp 5.',
  'Rules & tips': 'Quy tắc & mẹo',
  'Saved to the family cloud': 'Đã lưu lên đám mây gia đình',
  'Shop': 'Cửa hàng',
  'Star Collector': 'Nhà sưu tầm sao',
  'Stress Master': 'Bậc thầy trọng âm',
  'They grow as you master the topics behind them. The mark shows where you started in the trial.': 'Chúng tăng khi em thành thạo các chủ đề liên quan. Vạch đen là điểm xuất phát ở bài thử thách.',
  "This device isn't connected to the family": 'Thiết bị này chưa kết nối với gia đình',
  "Today's quest": 'Nhiệm vụ hôm nay',
  'Trial': 'Thử thách',
  'Unstoppable': 'Không thể cản',
  'Veteran': 'Lão luyện',
  'day streak': 'ngày liên tiếp',
  'just now': 'vừa xong',
  'last synced {t}': 'đồng bộ lần cuối {t}',
  'minutes this week': 'phút tuần này',
  'never': 'chưa bao giờ',
  'questions answered': 'câu đã trả lời',
  'right answers': 'trả lời đúng',
  '{a} / {b} XP to level {n}': '{a} / {b} XP để lên cấp {n}',
  '{n} changes waiting': '{n} thay đổi đang chờ',
  '{n} exams done': 'đã làm {n} đề',
  '⇄ Switch player': '⇄ Đổi người chơi',
  '▶ Play': '▶ Chơi',
  '⚡ Powers': '⚡ Sức mạnh',
  '🏅 Badges': '🏅 Huy hiệu',
  '👑 Outfit': '👑 Trang phục',
  '🔄 Sync now': '🔄 Đồng bộ ngay',
  '✨ The Oracle restores your health!': '✨ Nhà Tiên Tri hồi phục máu cho bạn!',
  '✨ The Oracle restores your hearts!': '✨ Nhà Tiên Tri hồi phục tim cho bạn!',
  'Enter →': 'Vào →',
  'Rest for now (come back later)': 'Nghỉ một lát (quay lại sau)',
  '{title} is free!': '{title} đã được giải phóng!',
  'A power awakens…': 'Một sức mạnh thức tỉnh…',
  'Quests will make this power grow.': 'Làm nhiệm vụ sẽ giúp sức mạnh này lớn lên.',
  'Back to the realms →': 'Về bản đồ vương quốc →',
  'Hero card unlocked': 'Mở khoá thẻ anh hùng',
  'Signature power:': 'Sức mạnh đặc trưng:',
  'Every quest you finish makes these powers grow.': 'Mỗi nhiệm vụ hoàn thành giúp các sức mạnh này lớn lên.',
  'Start my adventure →': 'Bắt đầu phiêu lưu →',
  'Word Hunter': 'Thợ Săn Từ Vựng',
  'Sentence Forge': 'Lò Rèn Câu',
  'Echo Cave': 'Hang Tiếng Vọng',
  'Reading Puzzle': 'Câu Đố Đọc Hiểu',
  'Math Logic': 'Toán Tư Duy',
  'Glitches have stolen the words of the forest. Race through the right gates to win them back!':
    'Bọn Glitch đã đánh cắp các từ của khu rừng. Hãy chạy qua đúng cổng để giành lại!',
  'The forge has gone cold. Rebuild sentences to relight it.': 'Lò rèn đã nguội lạnh. Hãy ghép lại các câu để nhóm lửa.',
  'A guardian lurks in the dark cave. Listen closely to defeat it — you can replay each echo.':
    'Một người canh giữ ẩn nấp trong hang tối. Lắng nghe kỹ để đánh bại nó — em có thể nghe lại mỗi tiếng vọng.',
  'A mystery hides in the ancient ruins. Read the tablets carefully, collect clues and name the culprit — there is no rush.':
    'Một bí ẩn ẩn giấu trong tàn tích cổ. Đọc kỹ các phiến đá, thu thập manh mối và chỉ ra thủ phạm — không cần vội.',
  'The Glitch king hides in the citadel behind number puzzles. Hunt him down with your knight!':
    'Vua Glitch trốn trong thành trì sau những câu đố con số. Hãy dùng quân mã săn lùng hắn!',
  'Word Power': 'Sức mạnh Từ vựng',
  'Sentence Craft': 'Tay nghề Ngữ pháp',
  'Echo Sense': 'Giác quan Nghe',
  'Tablet Reading': 'Kỹ năng Đọc',
  'Number & Logic Might': 'Sức mạnh Toán & Logic',
  'Number Might': 'Sức mạnh Số học',
  'Algebra Arcana': 'Phép thuật Đại số',
  'Shape Sight': 'Mắt Hình học',
  'Logic Mind': 'Trí tuệ Logic',
  // Shop
  '🛒 The Armoury': '🛒 Kho vũ khí',
  'Spend the coins and gems you earn in battle.': 'Tiêu xu và đá quý kiếm được trong trận.',
  '♜ Towers': '♜ Tháp',
  '✨ Skins': '✨ Giao diện',
  '🌙 Battlefields': '🌙 Chiến trường',
  '👑 Avatar': '👑 Nhân vật',
  '♔ Chess sets': '♔ Bộ cờ',
  '✓ Owned': '✓ Đã có',
  Equip: 'Trang bị',
  Unequip: 'Tháo ra',
  Unlock: 'Mở khoá',
  '🔒 Level {n}': '🔒 Cấp {n}',
  'Cheap and steady. Shoots straight down its lane.': 'Rẻ và bền bỉ. Bắn thẳng dọc làn của mình.',
  'A sturdy wall that blocks enemies and fires slowly.': 'Bức tường vững chắc chặn kẻ thù và bắn chậm.',
  'Hits its own lane and both neighbouring lanes.': 'Bắn làn của mình và hai làn bên cạnh.',
  'Slows every enemy it hits.': 'Làm chậm mọi kẻ thù trúng đạn.',
  'Rapid fire. The most powerful piece on the board.': 'Bắn liên thanh. Quân mạnh nhất trên bàn cờ.',
  'Glowing neon tower skins.': 'Giao diện tháp phát sáng neon.',
  'Solid gold. Very shiny.': 'Vàng ròng. Rất lấp lánh.',
  'Battle under the stars.': 'Chiến đấu dưới bầu trời sao.',
  'A frozen battlefield.': 'Chiến trường băng giá.',
  'Show off in the Logic Labyrinth.': 'Khoe dáng trong Mê Cung Logic.',
  'For true champions.': 'Dành cho nhà vô địch thực thụ.',
  'Knowledge is magic.': 'Tri thức là phép thuật.',
  'Beep boop, correct answer.': 'Bíp bíp, trả lời đúng.',
  'Neon Towers': 'Tháp Neon',
  'Golden Towers': 'Tháp Vàng',
  'Night Battlefield': 'Chiến trường Đêm',
  'Snow Battlefield': 'Chiến trường Tuyết',
  'Marble Chess Set': 'Bộ cờ Cẩm thạch',
  Crown: 'Vương miện',
  'Wizard Hat': 'Mũ Phù thuỷ',
  'Robot Visor': 'Kính Robot',
  '{name} unlocked!': 'Đã mở khoá {name}!',
  // Game modes
  'Castle Defense': 'Phòng Thủ Lâu Đài',
  'Word Runner': 'Chạy Đua Từ Vựng',
  "Knight's Quest": 'Hành Trình Kỵ Sĩ',
  'Boss Duel': 'Đấu Trùm',
  'Answers power your chess towers.': 'Câu trả lời tiếp sức cho các tháp cờ của em.',
  'Steer into the right gate before it reaches you!': 'Lái vào đúng cổng trước khi cổng tới chỗ em!',
  'Every right answer earns a knight move. Hunt the Glitch king.': 'Mỗi câu đúng được đi một nước mã. Săn vua Glitch!',
  'Turn-based duel — take your time, every answer is an attack.': 'Đấu theo lượt — cứ từ từ, mỗi câu trả lời là một đòn tấn công.',
  'Play as': 'Chơi kiểu',
  'recommended': 'gợi ý',
  'Finish line': 'Vạch đích',
  '← → or 1–4 to steer · Space to dash through now': '← → hoặc 1–4 để lái · phím Cách để lao qua ngay',
  'Right answers attack · 3 in a row = critical · 5 = checkmate': 'Trả lời đúng để tấn công · 3 câu liên tiếp = chí mạng · 5 câu = chiếu hết',
  'Click a green square to move your knight.': 'Bấm vào ô xanh để di chuyển quân mã.',
  'Answer correctly to earn a knight move.': 'Trả lời đúng để được đi một nước mã.',
  '♟ Glitch captured!': '♟ Đã bắt được Glitch!',
  '♚ The king is unshielded — capture him!': '♚ Vua đã mất khiên — bắt vua ngay!',
  '♚ Checkmate!': '♚ Chiếu hết!',
  '♚ Checkmate! A new Glitch army appears…': '♚ Chiếu hết! Một đội quân Glitch mới xuất hiện…',
  'A Glitch strikes your knight!': 'Glitch tấn công quân mã của em!',
  'Sound Temple': 'Đền Âm Thanh',
  'Ring the bells — stress, sounds and endings.': 'Rung chuông — trọng âm, âm đọc và đuôi từ.',
  Pronunciation: 'Ngữ âm',
  '🔊 Hear the words:': '🔊 Nghe các từ:',
  Check: 'Kiểm tra',
  '📄 Show the transcript': '📄 Xem lời thoại',
  "Scholar's Academy": 'Học Viện Thi Cử',
  'Train for the grade-10 entrance exam.': 'Luyện thi vào lớp 10.',
  'IELTS Tower': 'Tháp IELTS',
  'Climb toward band 6.5 — long reads and real listening.': 'Leo lên band 6.5 — bài đọc dài và nghe thật.',
  'Exam skills': 'Kỹ năng thi',
  // Top bar
  Streak: 'Chuỗi ngày học',
  Coins: 'Xu',
  Gems: 'Đá quý',
  'Switch player': 'Đổi người chơi',
  'Vietnamese help': 'Trợ giúp tiếng Việt',
  // Exam Hall
  'Exam Hall': 'Phòng thi',
  '🏛️ Exam Hall': '🏛️ Phòng thi',
  'Real exam format, real timer. No game — just you and the paper. Your mistakes go to the Mistake Book afterwards.': 'Đúng dạng đề thi, tính giờ thật. Không có trò chơi — chỉ có em và bài thi. Câu sai sẽ được lưu vào Sổ lỗi sai.',
  'Last result': 'Kết quả gần nhất',
  taken: 'lần thi',
  'Not taken yet': 'Chưa thi lần nào',
  'Continue paper →': 'Làm tiếp bài →',
  'Start paper →': 'Bắt đầu làm bài →',
  "The Hà Nội paper follows the usual structure of recent entrance exams for regular public schools. Check your school's official sample paper (đề minh họa) for this year's exact format.": 'Đề Hà Nội theo cấu trúc thường gặp của đề thi vào lớp 10 công lập những năm gần đây. Hãy xem đề minh họa chính thức của năm nay để biết cấu trúc chính xác.',
  'Your results': 'Kết quả của em',
  Date: 'Ngày',
  Paper: 'Đề thi',
  Score: 'Điểm',
  Correct: 'Số câu đúng',
  Time: 'Thời gian',
  'The timer starts when you press Start and keeps running if you leave.': 'Đồng hồ bắt đầu khi em bấm Bắt đầu và vẫn chạy nếu em rời đi.',
  'You can change answers and flag questions until you submit.': 'Em có thể đổi đáp án và đánh dấu câu hỏi cho đến khi nộp bài.',
  'No hints or translations of the questions — like the real exam. Instructions have Vietnamese.': 'Không có gợi ý hay dịch câu hỏi — giống như thi thật. Phần hướng dẫn có tiếng Việt.',
  'Exam conditions: each recording plays only once': 'Điều kiện thi thật: mỗi đoạn ghi âm chỉ nghe một lần',
  'Start — the timer begins': 'Bắt đầu — tính giờ',
  answered: 'đã trả lời',
  Submit: 'Nộp bài',
  'Recording played': 'Đã nghe xong',
  '▶ Play recording': '▶ Nghe đoạn ghi âm',
  'Answer sheet': 'Phiếu trả lời',
  flagged: 'đã đánh dấu',
  'Submit your paper?': 'Nộp bài nhé?',
  'You have {n} unanswered questions. Unanswered questions score zero.': 'Em còn {n} câu chưa trả lời. Câu bỏ trống được 0 điểm.',
  'All questions answered.': 'Đã trả lời tất cả các câu.',
  '{n} flagged for review.': '{n} câu đã đánh dấu để xem lại.',
  'Keep working': 'Làm tiếp',
  'Only my mistakes': 'Chỉ câu sai',
  'Show passage': 'Xem bài đọc',
  'Estimated band (mini test scaled to a full test). Real IELTS uses a full paper.': 'Band ước tính (bài mini quy đổi ra bài đầy đủ). IELTS thật dùng đề đầy đủ.',
  correct: 'đúng',
  'Wrong answers are saved in your Mistake Book.': 'Câu sai đã được lưu vào Sổ lỗi sai.',
  'Review answers →': 'Xem lại đáp án →',
  // Family code
  'Sign in': 'Đăng nhập',
  'Sign out': 'Đăng xuất',
  'Something went wrong': 'Đã xảy ra lỗi',
  'The last answers may not have been saved. Reload to continue.': 'Vài câu trả lời gần nhất có thể chưa được lưu. Tải lại để chơi tiếp.',
  Reload: 'Tải lại',
  Dismiss: 'Đóng',
  Parent: 'Phụ huynh',
  'Install the app': 'Cài ứng dụng',
  '📲 Install the app': '📲 Cài ứng dụng',
  'Put Atlas on your home screen': 'Đưa Atlas ra màn hình chính',
  'In Safari, tap the Share button (the square with an arrow) at the bottom of the screen.': 'Trong Safari, chạm nút Chia sẻ (hình vuông có mũi tên) ở cuối màn hình.',
  'Scroll down and tap “Add to Home Screen”, then “Add”.': 'Kéo xuống, chạm “Thêm vào MH chính”, rồi chạm “Thêm”.',
  'Open Atlas from its new icon — it works like an app, even offline.': 'Mở Atlas từ biểu tượng mới — nó chạy như một ứng dụng, kể cả khi không có mạng.',
  'Restart the trial': 'Làm lại thử thách từ đầu',
  'Restart the Trial of Five Realms from the beginning?': 'Làm lại Thử thách Năm Vương quốc từ đầu?',
  'Your answers in the trial and the coins you won in it are cleared. Nothing else changes.': 'Các câu trả lời trong thử thách và số xu em giành được sẽ bị xoá. Những thứ khác giữ nguyên.',
  'Sign out of this device?': 'Đăng xuất khỏi máy này?',
  'Your progress is saved in the cloud. Sign in again any time to continue.': 'Tiến độ của em đã được lưu trên mạng. Đăng nhập lại bất cứ lúc nào để chơi tiếp.',
  'Sign out anyway? Progress since the last sync on this device will be lost.': 'Vẫn đăng xuất? Phần chơi trên máy này từ lần đồng bộ trước sẽ bị mất.',
  'New account': 'Tạo tài khoản mới',
  'Code only': 'Chỉ dùng mã',
  Email: 'Email',
  Password: 'Mật khẩu',
  'Create my account →': 'Tạo tài khoản →',
  'Sign in →': 'Đăng nhập →',
  'Connect to my family': 'Kết nối với gia đình',
  'Sign in with your own email, or use the family code from your parent.': 'Đăng nhập bằng email của em, hoặc dùng mã gia đình bố mẹ đưa.',
  'No code? Set up on this device instead': 'Không có mã? Cài đặt trên máy này',
  'Family code': 'Mã gia đình',
  "Ask your parent: it's in the parent app, Settings → Cloud sync.": 'Hỏi bố mẹ: mã nằm trong ứng dụng phụ huynh, Cài đặt → Đồng bộ đám mây.',
  'Connecting…': 'Đang kết nối…',
  'Connect →': 'Kết nối →',
  "Downloading your family's adventure…": 'Đang tải cuộc phiêu lưu của gia đình…',
  // Coach stars
  'No hints used — full marks for remembering!': 'Không dùng gợi ý — điểm tối đa vì em nhớ bài!',
  'Hints used: {n}. Try the next round without hints for more stars.': 'Đã dùng {n} gợi ý — lượt sau thử không dùng gợi ý để được nhiều sao hơn nhé.',
  // Coach
  'Coach Owl': 'Thầy Cú',
  "Coach Owl's corner": 'Góc học cùng Thầy Cú',
  '🦉 Coach': '🦉 Thầy Cú',
  'Explain step by step with Coach Owl': 'Thầy Cú giảng từng bước',
  'Learn the rules with Coach Owl': 'Học quy tắc cùng Thầy Cú',
  "Let's solve it together, step by step.": 'Mình cùng giải từng bước nhé.',
  'Next step →': 'Bước tiếp →',
  'Show all': 'Xem hết',
  'Why not your answer?': 'Sao đáp án của em chưa đúng?',
  '💪 Try some like this': '💪 Làm thử vài câu tương tự',
  '💪 Practise this': '💪 Luyện phần này',
  '💪 Practise with Coach': '💪 Luyện cùng Thầy Cú',
  'Tap the stressed syllable.': 'Chạm vào âm tiết mang trọng âm.',
  'Next →': 'Tiếp →',
  'Perfect!': 'Hoàn hảo!',
  'Good — keep going!': 'Tốt lắm — tiếp tục nhé!',
  "Let's practise a bit more.": 'Mình luyện thêm chút nữa nhé.',
  '🔁 Again': '🔁 Làm lại',
  '🔊 Play again': '🔊 Nghe lại',
  Practice: 'Luyện tập',
  Hint: 'Gợi ý',
  'The rules behind the answers — with examples you can hear, and practice for each one.': 'Quy tắc đằng sau mỗi đáp án — có ví dụ để nghe và bài luyện cho từng quy tắc.',
  'Your weak spots (from the Mistake Book)': 'Điểm yếu của em (từ Sổ lỗi sai)',
  'Word stress': 'Trọng âm',
  '-ed / -s endings': 'Đuôi -ed / -s',
  'Letter sounds': 'Cách đọc chữ cái',
  'Sound twins': 'Cặp âm dễ nhầm',
  'Grammar & exam skills': 'Ngữ pháp & kỹ năng thi',
  // Game modes (worktree)
  'Sentence Sprint': 'Xếp câu tốc độ',
  'Build sentences against the clock to launch your rocket.': 'Xếp câu thật nhanh để phóng tên lửa của em.',
  'Meteor Defense': 'Bảo vệ thành phố',
  'Blast the right meteor before it hits the city!': 'Bắn trúng thiên thạch đúng trước khi nó rơi xuống thành phố!',
  'Penalty Shootout': 'Đá luân lưu',
  'Pick the right corner to score — then save their kicks.': 'Chọn đúng góc để ghi bàn — rồi cản phá cú sút của đối thủ.',
  'Grand Prix': 'Đua xe Grand Prix',
  'Right answers boost, 3 in a row fire nitro. Reach the podium!': 'Trả lời đúng để tăng tốc, đúng 3 câu liền để bật nitro. Hãy lên bục vinh quang!',
  'Word Detective': 'Thám tử chữ',
  'Every right answer is a clue. Unmask the culprit!': 'Mỗi câu đúng là một manh mối. Hãy tìm ra thủ phạm!',
  'good fit': 'phù hợp',
  ready: 'sẵn sàng',
  // Comeback cards
  'Comeback card!': 'Thẻ lội ngược dòng!',
  'Second Wind': 'Hồi sức',
  'Heal 40 HP.': 'Hồi 40 máu.',
  'Power Surge': 'Tăng sức mạnh',
  'Your next attack hits twice as hard.': 'Đòn đánh tiếp theo mạnh gấp đôi.',
  'Iron Guard': 'Khiên sắt',
  'Block the next hit completely.': 'Chặn hoàn toàn đòn đánh tiếp theo.',
  'Frost Bomb': 'Bom băng',
  'Freeze every Glitch for 8 seconds.': 'Đóng băng mọi Glitch trong 8 giây.',
  'Castle Repair': 'Sửa lâu đài',
  'Win back one castle heart.': 'Lấy lại một trái tim cho lâu đài.',
  'Rare Queen': 'Hậu hiếm',
  'A free Queen Storm tower joins the most dangerous lane.': 'Một tháp Hậu Bão miễn phí xuất hiện ở hàng nguy hiểm nhất.',
  '🃏 Comeback card! Tap it to play.': '🃏 Thẻ lội ngược dòng! Chạm để dùng.',
  '❄️ The Glitches are frozen!': '❄️ Các Glitch bị đóng băng!',
  '🧱 The castle is repaired!': '🧱 Lâu đài đã được sửa!',
  // Sentence Sprint
  'Rocket built': 'Tên lửa đã xây',
  'Tap the words in order (or press their numbers)…': 'Chạm vào các từ theo đúng thứ tự (hoặc bấm số của từ)…',
  '↩ Undo': '↩ Hoàn tác',
  'Launch stage! (Enter)': 'Phóng tầng! (Enter)',
  '✓ Stage added!': '✓ Thêm một tầng!',
  "⏰ Time's up!": '⏰ Hết giờ!',
  '✗ Not quite.': '✗ Chưa đúng.',
  '1–9 place a word · Backspace undo · Esc clear · Enter launch': '1–9 đặt từ · Backspace hoàn tác · Esc xoá · Enter phóng',
  // Meteor Defense
  'Showers survived': 'Đợt thiên thạch đã vượt qua',
  '🛰️ Radar lock — answer to fire the laser': '🛰️ Đã khoá mục tiêu — trả lời để bắn laser',
  'Sky cleared!': 'Bầu trời sạch bóng!',
  '💥 Impact!': '💥 Trúng thành phố!',
  '🛡️ The shield held!': '🛡️ Khiên đã đỡ được!',
  'Click a meteor or press 1–4 to fire · R to replay audio': 'Bấm vào thiên thạch hoặc phím 1–4 để bắn · R để nghe lại',
  // Penalty Shootout
  'Your team': 'Đội của em',
  'Sudden death': 'Loạt sút cân não',
  '⚽ Your kick — pick the right corner!': '⚽ Lượt em sút — chọn đúng góc!',
  '🧤 Their kick — pick the right answer to save it!': '🧤 Lượt đối thủ sút — chọn đúng đáp án để cản phá!',
  'GOAL!': 'VÀO!',
  'Saved!': 'Bị cản phá!',
  'They score…': 'Đối thủ ghi bàn…',
  'WHAT A SAVE!': 'CẢN PHÁ XUẤT SẮC!',
  'Click a corner or press 1–4 · R to replay audio': 'Bấm vào một góc hoặc phím 1–4 · R để nghe lại',
  // Grand Prix
  Race: 'Cuộc đua',
  You: 'Em',
  'Boost!': 'Tăng tốc!',
  '🔥 NITRO!': '🔥 NITRO!',
  '💨 Slipstream!': '💨 Bám đuôi tăng tốc!',
  '🌀 Spin-out!': '🌀 Trượt bánh!',
  'You finished {place}!': 'Em về đích ở vị trí số {n}!',
  'The race is over!': 'Cuộc đua kết thúc!',
  'Right = boost · 3 in a row = nitro · far behind = slipstream · top 3 = podium': 'Đúng = tăng tốc · 3 câu liền = nitro · bị bỏ xa = bám đuôi · top 3 = lên bục',
  // Word Detective
  'Cases solved': 'Vụ án đã phá',
  'Case file': 'Hồ sơ vụ án',
  Clues: 'Manh mối',
  'Answer questions to find clues.': 'Trả lời câu hỏi để tìm manh mối.',
  CLEARED: 'VÔ TỘI',
  'Case solved!': 'Phá án thành công!',
  'It was {name}!': 'Thủ phạm là {name}!',
  'The trail went cold…': 'Dấu vết đã mất…',
  '{name} got away this time. New case!': '{name} đã trốn thoát lần này. Vụ án mới!',
  'All the clues are in!': 'Đã đủ manh mối!',
  'Only one suspect is left. Accuse them to close the case.': 'Chỉ còn một nghi phạm. Hãy buộc tội người đó để khép lại vụ án.',
  '👉 Accuse {name}!': '👉 Buộc tội {name}!',
  'Hint (costs a star)': 'Gợi ý (mất một sao)',
  // Textbook import (worktree)
  'My Textbook': 'Sách giáo khoa của em',
  'Missions made from your school book — unit by unit.': 'Nhiệm vụ làm từ sách giáo khoa của em — từng unit một.',
};

const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? `{${k}}`)) : s);

/** Plain string in the primary language (for title attributes, toasts, aria labels). */
export function tr(mode: LangMode, en: string, vars?: Record<string, string | number>): string {
  const vi = VI[en];
  return fill(mode === 'vi' && vi ? vi : en, vars);
}

export const hasVi = (en: string) => en in VI;
export const viOf = (en: string, vars?: Record<string, string | number>) => (VI[en] ? fill(VI[en], vars) : null);

/** A small tooltip that opens on hover (laptop) and on tap (phone). */
export function Tip({ tip, children, className, underline = true }: { tip: ReactNode; children: ReactNode; className?: string; underline?: boolean }) {
  const [open, setOpen] = useState(false);
  // Flip below the text when there isn't room above (e.g. in a header).
  const [below, setBelow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const measure = () => setBelow((ref.current?.getBoundingClientRect().top ?? 100) < 72);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <span
      ref={ref}
      className={cx('group/tip relative inline', underline && 'cursor-help underline decoration-dotted decoration-1 underline-offset-4', className)}
      onClick={(e) => {
        // Inside a button, a tap must still press the button (hover still shows the tip).
        if ((e.currentTarget as HTMLElement).parentElement?.closest('button')) return;
        e.stopPropagation();
        measure();
        setOpen((o) => !o);
      }}
      onMouseEnter={measure}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-[16rem] -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-left text-sm font-semibold normal-case leading-snug tracking-normal text-white shadow-lg ring-1 ring-white/10 dark:bg-white dark:text-slate-900',
          below ? 'top-full mt-1.5' : 'bottom-full mb-1.5',
          open ? 'visible' : 'invisible group-hover/tip:visible',
        )}
      >
        {tip}
      </span>
    </span>
  );
}

/** Inline UI text: English with Vietnamese on hover/tap (help mode), Vietnamese with English on hover (vi mode). */
export function T({ en, vars, block }: { en: string; vars?: Record<string, string | number>; block?: boolean }) {
  const mode = useLang();
  const vi = viOf(en, vars);
  const english = fill(en, vars);
  if (!vi || mode === 'en') return <>{english}</>;
  if (block) {
    // Long text: show both, the second language smaller underneath.
    const [main, sub] = mode === 'vi' ? [vi, english] : [english, vi];
    return (
      <>
        {main}
        <span className="mt-1.5 block text-[0.85em] opacity-75" lang={mode === 'vi' ? 'en' : 'vi'}>
          {mode === 'vi' ? '🇬🇧' : '🇻🇳'} {sub}
        </span>
      </>
    );
  }
  if (mode === 'vi') return <Tip tip={<span lang="en">🇬🇧 {english}</span>}>{vi}</Tip>;
  return <Tip tip={<span lang="vi">🇻🇳 {vi}</span>}>{english}</Tip>;
}

/**
 * Button label: tapping a button must run its action, so instead of a tooltip the other
 * language appears as a small second line.
 */
export function TB({ en, vars }: { en: string; vars?: Record<string, string | number> }) {
  const mode = useLang();
  const vi = viOf(en, vars);
  const english = fill(en, vars);
  if (!vi || mode === 'en') return <>{english}</>;
  const [main, sub] = mode === 'vi' ? [vi, english] : [english, vi];
  return (
    <span className="inline-flex flex-col items-center leading-tight">
      <span>{main}</span>
      <span className="text-[0.7em] font-semibold opacity-75" lang={mode === 'vi' ? 'en' : 'vi'}>
        {sub}
      </span>
    </span>
  );
}
