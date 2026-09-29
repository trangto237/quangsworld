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
  "Glitches have taken over five realms. Defend each castle and answer the challenges to free the realm — every realm you free reveals one of your hidden powers. Some challenges are easy, some are very tricky. That's how the Oracle discovers what you can do!":
    'Bọn Glitch đã chiếm năm vương quốc. Hãy bảo vệ lâu đài và trả lời các thử thách để giải phóng từng vương quốc — mỗi vương quốc được giải phóng sẽ hé lộ một sức mạnh tiềm ẩn của em. Có thử thách dễ, có thử thách rất khó. Đó là cách Nhà tiên tri khám phá khả năng của em!',
  'Show me the realms →': 'Xem các vương quốc →',
  'The Five Realms': 'Năm Vương Quốc',
  'Free them one by one. You can rest between realms — your progress is saved.': 'Giải phóng từng vương quốc một. Em có thể nghỉ giữa các vương quốc — tiến độ đã được lưu.',
  '🔒 Free the realm before it': '🔒 Hãy giải phóng vương quốc trước đó',
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
  'Glitches have stolen the words of the forest. Win them back!': 'Bọn Glitch đã đánh cắp các từ của khu rừng. Hãy giành lại!',
  'The forge has gone cold. Rebuild sentences to relight it.': 'Lò rèn đã nguội lạnh. Hãy ghép lại các câu để nhóm lửa.',
  'Voices echo in the dark. Listen closely — you can replay each echo.': 'Có tiếng vọng trong bóng tối. Lắng nghe kỹ — em có thể nghe lại mỗi tiếng vọng.',
  'Ancient tablets hold the secrets of the ruins.': 'Những phiến đá cổ giữ bí mật của tàn tích.',
  'The citadel is locked by number puzzles. Crack them all!': 'Thành trì bị khoá bằng câu đố con số. Hãy giải hết!',
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
  // Top bar
  Streak: 'Chuỗi ngày học',
  Coins: 'Xu',
  Gems: 'Đá quý',
  'Switch player': 'Đổi người chơi',
  'Vietnamese help': 'Trợ giúp tiếng Việt',
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
